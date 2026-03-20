import axios from 'axios';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  images?: string[]; 
  score: number;
}

export class TavilySearch {
  private static readonly API_KEY = process.env.TAVILY_API_KEY || 'tvly-4E6Z3F19M7L8R5K0N2P4';

  static async searchFashion(query: string, platforms: string[] = ['zara.com', 'hm.com', 'asos.com', 'amazon.com', 'jcrew.com']) {
    try {
      const siteFilter = platforms.map(p => `site:${p}`).join(' OR ');
      const fullQuery = `${query} product with price (${siteFilter})`;

      const response = await axios.post('https://api.tavily.com/search', {
        api_key: this.API_KEY,
        query: fullQuery,
        search_depth: 'advanced',
        include_images: true,
        max_results: 5
      });

      const results = (response.data as any).results as SearchResult[];
      // Combine with top-level images from the search response if available
      const searchImages = (response.data as any).images || [];
      
      return results.map((r, i) => ({
        ...r,
        images: r.images || [searchImages[i]] || []
      }));
    } catch (error: any) {
      console.error('Tavily Search Error:', error.response?.data || error.message);
      return [];
    }
  }

  static formatResultsForAI(results: SearchResult[]) {
    return results.map(r => `Product: ${r.title}\nURL: ${r.url}\nImage: ${r.images?.[0] || 'none'}\nSnippet: ${r.content}\n`).join('\n---\n');
  }
}

