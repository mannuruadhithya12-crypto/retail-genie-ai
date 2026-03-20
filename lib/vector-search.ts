import { ClothingItem } from './models';
import { generateEmbedding } from './ollama';

export class VectorSearch {
  static async search(query: string, limit: number = 5) {
    const embedding = await generateEmbedding(query);
    
    // Atlas Search vector search if available, or simple match fallback
    // For local dev, we simulate semantic search with high-level tags first
    const items = await ClothingItem.find({
      $or: [
        { styleTags: { $in: [new RegExp(query, 'i')] } },
        { name: new RegExp(query, 'i') }
      ]
    }).limit(limit);

    return items;
  }

  static async updateAllEmbeddings() {
    const items = await ClothingItem.find({ vectorEmbedding: { $exists: false } });
    for (const item of items) {
      const text = `${item.name} ${item.brand} ${item.styleTags.join(' ')}`;
      const vector = await generateEmbedding(text);
      await ClothingItem.updateOne({ _id: item._id }, { vectorEmbedding: vector });
    }
  }
}
