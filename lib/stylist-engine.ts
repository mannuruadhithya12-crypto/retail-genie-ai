import { LiveProductSearch } from './live-search';
import { chatOllama } from './ollama';

export class StylistEngine {
  static async processRequest(query: string, history: any[] = []): Promise<any> {
    try {
      console.log(`[StylistEngine] Processing: "${query}"`);

      // 1. LIVE SEARCH: Fetch real products from the web in real-time
      const liveProducts = await LiveProductSearch.searchProducts(query, 5);
      console.log(`[StylistEngine] Found ${liveProducts.length} live products`);

      // 2. AI REASONING: Generate expert stylist advice using Ollama
      let stylistAdvice = '';
      try {
        const productSummary = liveProducts.map((p, i) =>
          `[${i + 1}] ${p.name} by ${p.brand} - $${p.price} - ${p.verdict}: ${p.verdictReasons.join(', ')}`
        ).join('\n');

        const prompt = `You are a senior AI fashion stylist. A user asked: "${query}"

I found these real products from top fashion stores:
${productSummary}

Give expert styling advice in 2-3 sentences. Be specific, confident, and helpful. Do not list prices again.`;

        stylistAdvice = await chatOllama('llama3', [
          { role: 'system', content: 'You are a professional AI fashion stylist who gives concise, expert advice.' },
          ...history.slice(-3),
          { role: 'user', content: prompt }
        ]);
      } catch (aiError) {
        console.error('[StylistEngine] Ollama error, using fallback advice');
        stylistAdvice = `Here are my top picks for "${query}" from across the web! I've curated these based on price, quality signals, and style. Check each item's details and use the Buy Now link to shop directly.`;
      }

      return {
        stylist_advice: stylistAdvice,
        products: liveProducts
      };
    } catch (error: any) {
      console.error('[StylistEngine] CRITICAL Error:', error.message);
      return {
        stylist_advice: `I encountered an error fetching products: ${error.message}. Please ensure your internet connection is active.`,
        products: []
      };
    }
  }
}
