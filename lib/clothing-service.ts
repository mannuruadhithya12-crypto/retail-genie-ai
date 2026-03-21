import { ClothingItem } from './models';
import { VectorSearch } from './vector-search';
import dbConnect from './mongodb';
import { LiveProductSearch } from './live-search';
import type { Product } from './types';

export class ClothingService {
  static async getProducts(query?: string, limit: number = 20): Promise<Product[]> {
    try {
      await dbConnect();
      if (query) {
        const items = await VectorSearch.search(query, limit);
        if (items && items.length > 0) return items.map(i => this.mapToProduct(i));
        
        // Fallback to Live Search if DB empty for this query
        const liveHits = await LiveProductSearch.searchProducts(query, limit);
        return liveHits.map(hit => this.mapLiveToProduct(hit));
      }
      
      const items = await ClothingItem.find().limit(limit).sort({ createdAt: -1 });
      if (items && items.length > 0) return items.map(i => this.mapToProduct(i));

      // Ultimate Fallback if DB is completely empty and no query is specified
      const ultimateHits = await LiveProductSearch.searchProducts("latest trending fashion", limit);
      return ultimateHits.map(hit => this.mapLiveToProduct(hit));
    } catch (e) {
      console.warn("ClothingService DB Error, falling back to Live Search:", e);
      const errHits = await LiveProductSearch.searchProducts(query || "latest trending fashion", limit);
      return errHits.map(hit => this.mapLiveToProduct(hit));
    }
  }

  private static mapLiveToProduct(item: any): Product {
    return {
      id: crypto.randomUUID(),
      name: item.name,
      brand: item.brand || 'ASOS',
      imageUrl: item.imageUrl,
      priceMin: item.price,
      priceMax: item.price + 20,
      currency: item.currency || 'USD',
      verdict: 'strong-buy',
      verdictReasons: ['Trending live product', 'Matches search query'],
      sustainabilityScore: 75,
      retailers: [{ name: item.brand || 'ASOS', price: item.price, url: item.productUrl, inStock: true }]
    };
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
