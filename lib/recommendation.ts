import { ClothingItem } from './models';
import { generateOllama } from './ollama';
import { connectToDatabase } from './mongodb';

export class RecommendationEngine {
  static async getOutfitRecommendation(userPrompt: string, preferences: any) {
    await connectToDatabase();

    // 1. Semantic Search (Simplified keyword search for this phase)
    const keywords = userPrompt.split(' ');
    const products = await ClothingItem.find({
      $or: [
        { styleTags: { $in: keywords } },
        { category: { $regex: keywords[0], $options: 'i' } }
      ]
    }).limit(6);

    // 2. AI Synthesis using Ollama
    const prompt = `You are an elite fashion AI. User wants: "${userPrompt}". 
    Here are available real products: ${JSON.stringify(products.map(p => ({ name: p.name, brand: p.brand, price: p.price })))}.
    
    Synthesize a cohesive outfit and provide a verdict for each item (BUY/CONSIDER/SKIP).
    
    Return ONLY JSON:
    {
      "recommendation": "Stylist summary advice",
      "outfit": [
        {"name": "Product Name", "verdict": "BUY", "reason": "why this matches user vibe"}
      ]
    }`;

    const response = await generateOllama({
      model: 'mistral',
      prompt,
      format: 'json'
    });

    return JSON.parse(response);
  }

  static async getProductVerdict(productId: string) {
    await connectToDatabase();
    const product = await ClothingItem.findById(productId);
    if (!product) throw new Error('Product not found');

    const prompt = `Analyze these real customer reviews for "${product.name}": ${JSON.stringify(product.reviews)}.
    Provide a final verdict (BUY, CONSIDER, or SKIP) based on quality, sentiment, and price ($${product.price}).
    
    Return ONLY JSON:
    {
      "verdict": "BUY",
      "pros": ["good thing"],
      "cons": ["bad thing"],
      "sentimentScore": 85
    }`;

    const response = await generateOllama({
      model: 'llama3',
      prompt,
      format: 'json'
    });

    return JSON.parse(response);
  }
}
