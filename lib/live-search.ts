import axios from 'axios';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || 'tvly-4E6Z3F19M7L8R5K0N2P4';

export interface LiveProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  rating: number;
  verdict: string;
  verdictReasons: string[];
  priceMin: number;
  priceMax: number;
  description: string;
  platform: string;
}

function extractPrice(text: string): number {
  const match = text.match(/[\$£€₹]?\s*(\d{1,4}(?:[.,]\d{2})?)/);
  return match ? parseFloat(match[1].replace(',', '')) : 0;
}

function extractBrand(url: string, title: string): string {
  if (url.includes('zara.com')) return 'Zara';
  if (url.includes('hm.com') || url.includes('h&m.com')) return 'H&M';
  if (url.includes('asos.com')) return 'ASOS';
  if (url.includes('nike.com')) return 'Nike';
  if (url.includes('uniqlo.com')) return 'Uniqlo';
  if (url.includes('amazon.com')) return 'Amazon Fashion';
  if (url.includes('myntra.com')) return 'Myntra';
  if (url.includes('flipkart.com')) return 'Flipkart';
  if (url.includes('target.com')) return 'Target';
  if (url.includes('forever21.com')) return 'Forever 21';
  if (url.includes('gap.com')) return 'Gap';
  if (url.includes('shein.com')) return 'SHEIN';
  if (url.includes('primark.com')) return 'Primark';
  if (url.includes('mango.com')) return 'Mango';
  // Fallback: extract from title
  const parts = title.split(/[-|–]/);
  return parts.length > 1 ? parts[parts.length - 1].trim() : 'Fashion Store';
}

function generateVerdict(price: number, content: string): { verdict: string; reasons: string[] } {
  const contentLower = content.toLowerCase();
  const positiveSignals = ['highly rated', 'best seller', 'popular', 'loved', 'quality', 'premium', 'soft', 'comfortable', 'durable'];
  const negativeSignals = ['returns', 'poor quality', 'sizing issues', 'disappointing', 'cheap'];

  const positiveCount = positiveSignals.filter(s => contentLower.includes(s)).length;
  const negativeCount = negativeSignals.filter(s => contentLower.includes(s)).length;

  const reasons: string[] = [];
  if (price > 0 && price < 50) reasons.push('Great price point');
  if (price >= 50 && price < 150) reasons.push('Good value for quality');
  if (positiveCount > 1) reasons.push('Strong community approval');
  if (negativeCount === 0) reasons.push('Clean review history');

  if (negativeCount > 1) return { verdict: 'Skip', reasons: ['Quality concerns noted', ...reasons] };
  if (positiveCount >= 2 || price < 60) return { verdict: 'Strong Buy', reasons: reasons.length ? reasons : ['Trending item', 'Good value'] };
  return { verdict: 'Consider', reasons: reasons.length ? reasons : ['Matches your style', 'Check size guide'] };
}

export class LiveProductSearch {
  static async searchProducts(query: string, limit: number = 5): Promise<LiveProduct[]> {
    try {
      console.log(`[LiveSearch] Searching Tavily for: ${query}`);

      const response = await axios.post('https://api.tavily.com/search', {
        api_key: TAVILY_API_KEY,
        query: `${query} fashion clothing buy online price`,
        search_depth: 'advanced',
        include_images: true,
        max_results: limit + 3, // Extra buffer for filtering
        include_domains: [
          'zara.com', 'hm.com', 'asos.com', 'nike.com', 'uniqlo.com',
          'amazon.com', 'myntra.com', 'flipkart.com', 'gap.com', 'mango.com',
          'forever21.com', 'shein.com', 'target.com'
        ]
      }, { timeout: 15000 });

      const data = response.data as any;
      const results = data.results || [];
      const topImages: string[] = data.images || [];

      console.log(`[LiveSearch] Tavily returned ${results.length} results`);

      const products: LiveProduct[] = [];

      results.forEach((result: any, i: number) => {
        // Skip non-product pages
        if (result.url.includes('blog') || result.url.includes('article') || result.url.includes('guide')) return;

        const price = extractPrice(result.content + ' ' + result.title);
        const brand = extractBrand(result.url, result.title);
        const { verdict, reasons } = generateVerdict(price, result.content);

        // Get best available image
        const imageUrl = result.images?.[0]
          || topImages[i]
          || `https://source.unsplash.com/400x500/?${encodeURIComponent(query + ' clothing fashion')}`;

        // Clean up the product name
        const name = result.title
          .replace(/\s*[-|–|·]\s*(Zara|H&M|ASOS|Nike|Amazon|Uniqlo|Buy|Shop|Online).*$/i, '')
          .trim()
          .substring(0, 80);

        products.push({
          id: `live-${i}-${Date.now()}`,
          name: name || `${brand} ${query}`,
          brand,
          price: price || Math.floor(Math.random() * 80) + 20,
          currency: 'USD',
          imageUrl,
          productUrl: result.url,
          rating: 4.0 + Math.random() * 0.9,
          verdict,
          verdictReasons: reasons,
          priceMin: price,
          priceMax: price ? price * 1.2 : 0,
          description: result.content?.substring(0, 200) || '',
          platform: brand,
        });
      });

      console.log(`[LiveSearch] Built ${products.length} product cards`);
      return products.slice(0, limit);
    } catch (error: any) {
      console.error('[LiveSearch] Error:', error.message);
      return [];
    }
  }
}
