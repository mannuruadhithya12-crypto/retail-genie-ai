import { chatOllama } from './ollama';
import { ClothingService } from './clothing-service';

export class TrendAnalysisAgent {
  static async getTrendingOutfits() {
    console.log('[TrendAgent] Analyzing global fashion trends...');
    
    // In production, this would scrape social media or trend reports
    const trendPrompt = `Identify 3 top global fashion trends for March 2026. 
    Examples: Techwear, "Quiet Luxury", Boho-Chic. 
    RETURN ONLY JSON: {"trends": [{"name": "...", "description": "..."}]}`;
    
    const raw = await chatOllama('llama3', [{ role: 'user', content: trendPrompt }]);
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      const data = JSON.parse(match ? match[0] : '{"trends": []}');
      
      // Fetch products that match these trends
      const trendingResults = await Promise.all(data.trends.map(async (trend: any) => {
        const products = await ClothingService.getProducts(trend.name, 2);
        return { ...trend, products };
      }));
      
      return trendingResults;
    } catch {
      return [];
    }
  }
}
