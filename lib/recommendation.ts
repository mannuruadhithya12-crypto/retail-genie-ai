import { ClothingItem } from './models';
import { generateOllama } from './ollama';
import dbConnect from './mongodb';

export class RecommendationEngine {
  static async getOutfitRecommendation(userPrompt: string, preferences: any) {
    await dbConnect();

    // 1. Semantic Search using style tags and categories
    const keywords = userPrompt.toLowerCase().split(' ');
    const products = await ClothingItem.find({
      $or: [
        { styleTags: { $in: keywords } },
        { category: { $regex: keywords[0], $options: 'i' } },
        { name: { $regex: keywords[0], $options: 'i' } }
      ]
    }).limit(6);

    // 2. AI Synthesis using Ollama (Llama3)
    const prompt = `You are an elite, avant-garde fashion stylist for Retail-Genie.
    User request: "${userPrompt}"
    User Preferences: ${JSON.stringify(preferences)}
    
    Here are real products available in our database:
    ${JSON.stringify(products.map(p => ({ id: p._id, name: p.name, brand: p.brand, price: p.price, shopUrl: p.productUrl })))}
    
    Task: Create a cohesive outfit from these real products. Provide a "BUY" verdict for the best matches.
    
    Return ONLY JSON:
    {
      "recommendation": "Expert stylist summary",
      "outfit": [
        {
          "productId": "mongo-id",
          "name": "Product Name",
          "brand": "Brand",
          "verdict": "BUY",
          "reason": "Why this matches the user vibe",
          "shopUrl": "real-url"
        }
      ]
    }`;

    const response = await generateOllama({
      model: 'mistral',
      prompt,
      format: 'json'
    });

    return JSON.parse(response);
  }

  static async getSentimentVerdict(productId: string) {
    await dbConnect();
    const product = await ClothingItem.findById(productId);
    if (!product) throw new Error('Product not found');

    const prompt = `Analyze these real customer reviews for "${product.name}": 
    ${JSON.stringify(product.reviews || ["No reviews found. Handle gracefully with default insight."])}.
    
    Provide a final verdict (BUY, CONSIDER, or SKIP) based on quality, sentiment, and price ($${product.price}).
    
    Return ONLY JSON:
    {
      "verdict": "BUY",
      "summary": "Consolidated opinion",
      "pros": ["good trait"],
      "cons": ["bad trait"],
      "sentimentScore": 0-100
    }`;

    const response = await generateOllama({
      model: 'llama3',
      prompt,
      format: 'json'
    });

    return JSON.parse(response);
  }
}
