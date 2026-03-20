import { ProductSearchAgent, ReviewAnalysisAgent, PriceComparisonAgent } from './agents';
import { chatOllama } from './ollama';
import { Product } from './types';

export interface StylistResponse {
  advice: string;
  recommendedOutfit: Product[];
  verdicts: Record<string, { verdict: 'strong-buy' | 'consider' | 'skip'; reason: string }>;
}

export class StylistEngine {
  static async processRequest(query: string, history: any[] = []): Promise<StylistResponse> {
    try {
      // 1. Agent: Search
      const products = await ProductSearchAgent.findItems(query);

      // 2. Agent: Review Analysis & Price Comparison (Parallel)
      const analyzedProducts = await Promise.all(products.map(async (p) => {
        const analysis = await ReviewAnalysisAgent.analyze(p.name, (p as any).reviews || []);
        const prices = await PriceComparisonAgent.compare(p.name, p.brand, p.priceMin);
        return { ...p, analysis, prices };
      }));

      // 3. Orchestration: Reasoning
      const reports = analyzedProducts.map(p => 
        `ID: ${p.id} | NAME: ${p.name} | SCORE: ${p.analysis.score} | BEST PRICE: ${p.prices[0].price} | PROS: ${p.analysis.pros.join(', ')}`
      ).join('\n');

      const stylistPrompt = `You are a Principal Fashion Architect orchestrating specialized agents. 
      Curate an elite outfit from these items:
      AGENT REPORTS:
      ${reports}
      
      RETURN ONLY JSON:
      {
        "advice": "Reasoned style advice.",
        "outfitIds": ["id1", "id2"],
        "verdicts": {
          "id1": {"verdict": "strong-buy", "reason": "..."},
          "id2": {"verdict": "consider", "reason": "..."}
        }
      }`;

      const stylistRaw = await chatOllama('llama3', [
        { role: 'system', content: 'You are an elite fashion architect.' },
        ...history,
        { role: 'user', content: stylistPrompt }
      ]);

      const result = this.parseJson(stylistRaw);
      const recommendedOutfit = analyzedProducts.filter(p => result.outfitIds?.includes(p.id));

      return {
        advice: result.advice || "Here is a curated look based on the best-rated items I found.",
        recommendedOutfit: recommendedOutfit.length > 0 ? recommendedOutfit : analyzedProducts.slice(0, 3),
        verdicts: result.verdicts || {}
      };
    } catch (error) {
      console.error('Stylist Engine Error:', error);
      return { advice: "I encountered an error while stylizing. Here are some top picks.", recommendedOutfit: [], verdicts: {} };
    }
  }

  private static parseJson(text: string): any {
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) return {};
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr.replace(/\\n/g, "").replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"));
    } catch {
      return {};
    }
  }
}
