import { LiveProductSearch } from './live-search';
import { chatOllama } from './ollama';

export class StylistEngine {
  static async processRequest(query: string, history: any[] = []): Promise<any> {
    try {
      console.log(`[StylistEngine] Processing: "${query}"`);

      // 0. AI EXTRACTION: Extract only the product keywords from the user query
      const extractPrompt = `Extract Search Keywords.
      Rule: Return ONLY 1 line of concise keywords to search for clothing online. Ignore conversational fluff. Do not wrap in quotes. Keep budget or brand if mentioned (e.g. "under 50", "asos").
      Query: "${query}"`;
      
      let searchQuery = query;
      try {
        const extracted = await chatOllama('llama3', [{ role: 'user', content: extractPrompt }]);
        searchQuery = extracted.trim().replace(/^"|"$|^\*|\*$/g, '');
        console.log(`[StylistEngine] Extracted precise search query: "${searchQuery}"`);
      } catch (err) {
        console.error('[StylistEngine] Query extraction failed, reverting to basic query', err);
      }

      // 1. LIVE SEARCH: Fetch real products from the web in real-time
      const liveProducts = await LiveProductSearch.searchProducts(searchQuery, 4);
      console.log(`[StylistEngine] Found ${liveProducts.length} live products`);

      // 2. AI REASONING: Generate expert stylist advice using Ollama
      let stylistAdvice = '';
      try {
        const productSummary = liveProducts.map((p, i) =>
          `[${i + 1}] ${p.name} by ${p.brand} - $${p.price} - ${p.verdict}: ${p.verdictReasons.join(', ')}`
        ).join('\n');

        const prompt = `You are a senior AI fashion stylist. The user requested: "${query}"

        We automatically searched the web and found these REAL items you can recommend:
        ${productSummary}

        Give expert styling advice incorporating these items in 2-3 sentences. Do not list prices again. Do not hallucinate items that aren't on this list. Tell them to click the direct product links on the cards below.`;

        stylistAdvice = await chatOllama('llama3', [
          { role: 'system', content: 'You are a professional AI fashion stylist who gives concise, expert advice.' },
          ...history.slice(-3),
          { role: 'user', content: prompt }
        ]);
      } catch (aiError) {
        console.error('[StylistEngine] Ollama error, using fallback advice');
        stylistAdvice = `Here are my top picks for "${query}" from across the web! I've curated these based on price, quality signals, and style. Use the View Item direct links on the cards below to shop!`;
      }

      return {
        stylist_advice: stylistAdvice,
        products: liveProducts
      };
    } catch (error: any) {
      console.error('[StylistEngine] CRITICAL Error:', error.message);
      return {
        stylist_advice: `I gathered some ideas, but hit a snag fetching live data. Let's adjust the search!`,
        products: []
      };
    }
  }
}
