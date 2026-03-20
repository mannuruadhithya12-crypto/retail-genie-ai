import { ClothingService } from './clothing-service';
import { chatOllama } from './ollama';
import { Product } from './types';

export interface StylistResponse {
  advice: string;
  recommendedOutfit: Product[];
  verdicts: Record<string, { verdict: 'strong-buy' | 'consider' | 'skip'; reason: string }>;
}

export class StylistEngine {
  static async processRequest(query: string, history: any[] = []): Promise<StylistResponse> {
    // 1. Intent Detection
    const intentPrompt = `Extract fashion intent from: "${query}". Identify: occasion, style. RETURN ONLY JSON: {"style": "..."}`;
    const intentRaw = await chatOllama('llama3', [{ role: 'user', content: intentPrompt }]);
    const intent = this.parseJson(intentRaw);

    // 2. Multi-Source Search
    const products = await ClothingService.getProducts(query, 10);

    // 3. Review Sentiment & Verdict Generation
    const context = products.map(p => 
      `PRODUCT: ${p.name} | BRAND: ${p.brand} | PRICE: ${p.priceMin} | REVIEWS: ${p.reviewSentiment}`
    ).join('\n');

    const stylistPrompt = `You are a professional Senior Fashion Stylist for Retail-Genie.
    USER REQUEST: ${query}
    AVAILABLE PRODUCTS:
    ${context}
    
    TASK:
    1. Provide sophisticated stylist advice.
    2. Select exact outfit matching item IDs from provided list.
    3. Generate BUY/CONSIDER/SKIP verdict for each item.
    
    RETURN ONLY JSON:
    {
      "advice": "...",
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
    const recommendedOutfit = products.filter(p => result.outfitIds?.includes(p.id));

    return {
      advice: result.advice || "I found some great options for you.",
      recommendedOutfit: recommendedOutfit.length > 0 ? recommendedOutfit : products.slice(0, 3),
      verdicts: result.verdicts || {}
    };
  }

  private static parseJson(text: string): any {
    try {
      // Find the first and last curly brace to extract the JSON object
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) return {};
      
      const jsonStr = text.substring(start, end + 1);
      
      // Clean up common Ollama JSON quirks (trailing commas, unquoted keys, etc.)
      let cleaned = jsonStr
        .replace(/\\n/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
        
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON Parse Error in StylistEngine Logic:', text);
      return {};
    }
  }
}
