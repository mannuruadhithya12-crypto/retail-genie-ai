import { ClothingItem } from './models';
import { VectorSearch } from './vector-search';
import dbConnect from './mongodb';
import type { Product } from './types';

export class ClothingService {
  static async getProducts(query?: string, limit: number = 20): Promise<Product[]> {
    await dbConnect();
    if (query) {
      const items = await VectorSearch.search(query, limit);
      return items.map(this.mapToProduct);
    }
    
    const items = await ClothingItem.find().limit(limit).sort({ createdAt: -1 });
    return items.map(this.mapToProduct);
  }

  private static mapToProduct(item: any): Product {
    return {
      id: item._id.toString(),
      name: item.name,
      brand: item.brand,
      imageUrl: item.imageUrl,
      priceMin: item.price,
      priceMax: item.price + 50, // Estimate range
      currency: 'USD',
      verdict: item.aiVerdict || 'consider',
      verdictReasons: item.styleTags,
      sustainabilityScore: Math.floor(Math.random() * 40) + 60, // Fallback
      co2Estimate: '10kg',
      durabilityWashes: 100,
      reviewSentiment: 'Positive',
      retailers: [{ name: item.brand, price: item.price, url: item.productUrl, inStock: true }]
    };
  }
}
