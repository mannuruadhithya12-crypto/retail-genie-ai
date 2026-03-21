import { ProductSearchAgent, ReviewAnalysisAgent, PriceComparisonAgent } from './agents';
import { chatOllama } from './ollama';
import { Product } from './types';

export interface StylistResponse {
  advice: string;
  recommendedOutfit: Product[];
  verdicts: Record<string, { verdict: 'strong-buy' | 'consider' | 'skip'; reason: string }>;
}

export class StylistEngine {
  static async processRequest(query: string, history: any[] = []): Promise<any> {
    try {
      // 1. Agent: Search (Real Data only)
      const products = await ProductSearchAgent.findItems(query);
      
      if (!products || products.length === 0) {
        return { 
          stylist_advice: "I couldn't find exact matches in our database right now, but here is some general styling advice for your request.",
          products: [] 
        };
      }

      // 2. Agent: Review Analysis & Price Comparison
      const analyzedProducts = await Promise.all(products.map(async (p) => {
        try {
          const analysis = await ReviewAnalysisAgent.analyze(p.name, (p as any).reviews || []);
          const prices = await PriceComparisonAgent.compare(p.name, p.brand, p.priceMin);
          return { ...p, analysis, prices };
        } catch (e) {
          return { ...p, analysis: { score: 70, pros: [], cons: [] }, prices: [{ platform: p.brand, price: p.priceMin }] };
        }
      }));

      // 3. Orchestration
      const reports = analyzedProducts.map(p => 
        `ID: ${p.id} | NAME: ${p.name} | SCORE: ${p.analysis.score} | BEST PRICE: ${p.prices[0].price} | PROS: ${p.analysis.pros.join(', ')}`
      ).join('\n');

      const stylistPrompt = `You are a Senior AI Fashion Stylist. 
      Using ONLY the real items listed below, curate a specific recommendation.
      REAL ITEMS:
      ${reports}
      
      RETURN ONLY JSON:
      {
        "stylist_advice": "Elite fashion reasoning string.",
        "products": [
          {
            "id": "item-id",
            "name": "Exact Name",
            "brand": "Exact Brand",
            "price": 0,
            "currency": "USD",
            "rating": 4.5,
            "image_url": "IMAGE_URL",
            "product_url": "PRODUCT_URL",
            "verdict": "Strong Buy",
            "reason": "Why this item?"
          }
        ]
      }`;

      const stylistRaw = await chatOllama('llama3', [
        { role: 'system', content: 'You are a professional fashion shoppers assistant.' },
        ...history,
        { role: 'user', content: stylistPrompt }
      ]);

      const result = this.parseJson(stylistRaw);
      
      // Map the AI's preferred items back to the full product objects
      const finalProducts = (result.products || []).map((p: any) => {
        const original = analyzedProducts.find(orig => orig.id === p.id);
        return original ? {
          ...original,
          verdict: p.verdict || 'Consider',
          verdictReasons: [p.reason || 'Matches your style profile']
        } : null;
      }).filter(Boolean);

      return {
        stylist_advice: result.stylist_advice || "I found these items that perfectly match your request.",
        products: finalProducts.length > 0 ? finalProducts : analyzedProducts.slice(0, 3)
      };
    } catch (error) {
      console.error('Stylist Engine Error:', error);
      return { stylist_advice: "Error generating recommendation.", products: [] };
    }
  }

  private static parseJson(text: string): any {
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) return {};
      const jsonStr = text.substring(start, end + 1);
      // Robust repair for common Ollama issues (trailing commas, escaped quotes)
      const cleaned = jsonStr
        .replace(/\\n/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      return JSON.parse(cleaned);
    } catch {
      return {};
    }
  }
}
