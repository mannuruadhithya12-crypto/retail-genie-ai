import { LiveProductSearch } from './live-search';
import { chatOllama } from './ollama';

export class StylistEngine {
  static async processRequest(query: string, history: any[] = []): Promise<any> {
    try {
      console.log(`[StylistEngine] Processing: "${query}"`);

      // 0. AI EXTRACTION: Bypassed to massively improve system latency.
      let searchQuery = query.replace(/[^\w\s-]/gi, '').trim().substring(0, 50);
      console.log(`[StylistEngine] Fast Extracted search query: "${searchQuery}"`);

      // 1. LIVE SEARCH: Fetch real products from the web in real-time
      let liveProducts: any[] = [];
      try {
        const [liveProductsM, liveProductsF] = await Promise.all([
          LiveProductSearch.searchProducts(`${searchQuery} mens clothing`, 2).catch(() => []),
          LiveProductSearch.searchProducts(`${searchQuery} womens clothing`, 2).catch(() => [])
        ]);
        liveProducts = [...liveProductsM, ...liveProductsF].sort(() => Math.random() - 0.5);
        console.log(`[StylistEngine] Found ${liveProducts.length} mixed live products (${liveProductsM.length}M / ${liveProductsF.length}F)`);
      } catch(err) {
        console.error("Live Search failed", err);
      }

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
