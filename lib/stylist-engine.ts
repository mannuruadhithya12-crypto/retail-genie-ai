import { ClothingService } from './clothing-service';
import { chatOllama } from './ollama';
import { Product } from './types';

export interface StylistResponse {
  advice: string;
  recommendedOutfit: Product[];
  verdicts: Record<string, { verdict: 'strong-buy' | 'consider' | 'skip'; reason: string }>;
  priceComparison?: Record<string, { platform: string; price: number }[]>;
}

export class StylistEngine {
  static async processRequest(query: string, history: any[] = []): Promise<StylistResponse> {
    // 1. Intent Detection & Keyword Extraction
    const intentPrompt = `Extract fashion intent from: "${query}". 
    Identify: occasion, budget, style (e.g. dark academia), and items needed.
    RETURN ONLY JSON: {"occasion": "...", "budget": 0, "style": "...", "items": ["..."]}`;
    
    const intentRaw = await chatOllama('llama3', [{ role: 'user', content: intentPrompt }]);
    const intent = JSON.parse(intentRaw.match(/\{[\s\S]*\}/)?.[0] || '{}');

    // 2. Multi-Source Search (DB + Live Web)
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
    2. Select a complete, matching outfit (Top, Bottom, Shoes).
    3. Generate a BUY/CONSIDER/SKIP verdict for each item based on price and review sentiment.
    
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

    const result = JSON.parse(stylistRaw.match(/\{[\s\S]*\}/)?.[0] || '{"advice": "I found some great options for you.", "outfitIds": []}');

    const recommendedOutfit = products.filter(p => result.outfitIds.includes(p.id));

    return {
      advice: result.advice,
      recommendedOutfit: recommendedOutfit.length > 0 ? recommendedOutfit : products.slice(0, 3),
      verdicts: result.verdicts || {}
    };
  }
}
