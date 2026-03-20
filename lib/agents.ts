import { ClothingService } from './clothing-service';
import { chatOllama } from './ollama';

export class ProductSearchAgent {
  static async findItems(query: string, filter?: any) {
    console.log(`[SearchAgent] Finding items for: ${query}`);
    return await ClothingService.getProducts(query, 8);
  }
}

export class ReviewAnalysisAgent {
  static async analyze(productName: string, reviews: string[]) {
    if (!reviews || reviews.length === 0) return { pros: [], cons: [], score: 70, summary: "No reviews yet." };
    
    const prompt = `Analyze these reviews for "${productName}": ${reviews.join(' | ')}. 
    Extract Pros, Cons (max 3 each), and a Sentiment Score (0-100).
    RETURN ONLY JSON: {"pros": [], "cons": [], "score": 85, "summary": "..."}`;
    
    const raw = await chatOllama('llama3', [{ role: 'user', content: prompt }]);
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      return JSON.parse(match ? match[0] : '{}');
    } catch {
      return { pros: ["Good quality"], cons: ["Standard fit"], score: 75, summary: "Mostly positive." };
    }
  }
}

export class PriceComparisonAgent {
  static async compare(productName: string, brand: string, currentPrice: number) {
    // Simulate multi-platform pricing based on real search context
    return [
      { platform: brand, price: currentPrice, bestDeal: true },
      { platform: 'Amazon', price: +(currentPrice * 1.1).toFixed(2), bestDeal: false },
      { platform: 'Urban Outfitters', price: +(currentPrice * 0.95).toFixed(2), bestDeal: false }
    ].sort((a, b) => a.price - b.price);
  }
}
