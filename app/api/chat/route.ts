import { NextResponse } from 'next/server'
import { chatOllama } from '@/lib/ollama'
import { TavilySearch } from '@/lib/search'
import { ProductExtractor } from '@/lib/extractor'
import { ClothingService } from '@/lib/clothing-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, messages = [], preferences } = body
    const query = message

    // 1. Semantic search for relevant products in our DB
    const dbProducts = await ClothingService.getProducts(query, 5);
    
    // 2. Deep Extraction for Top 2 Results from Web (for "Live" feel)
    const deepResults = [];
    const webResults = await TavilySearch.searchFashion(query);
    for (const res of webResults.slice(0, 2)) {
      console.log(`Deep extracting: ${res.url}`);
      const deepData = await ProductExtractor.deepExtract(res.url);
      const finaleImage = deepData.imageUrl || res.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400';
      
      deepResults.push({
        title: deepData.name || res.title,
        url: res.url,
        imageUrl: finaleImage,
        price: deepData.price || "See site",
        snippet: res.content
      });
    }

    // 3. Combine DB and Web products for the Stylist context
    const context = [
      ...dbProducts.map((p: any) => `[DB PRODUCT] Name: ${p.name}, Price: ${p.priceMin}, Tags: ${p.verdictReasons?.join(', ') || ''}`),
      ...deepResults.map((r: any) => `[WEB PRODUCT] Name: ${r.title}, Price: ${r.price}, URL: ${r.url}, Image: ${r.imageUrl}`)
    ].join('\n');

    // 3. AI Synthesis
    const systemPrompt = `You are a real-time fashion personal shopper for Retail-Genie.
    
    CONTEXT:
    ${context || "No live products found. Advise based on fashion principles."}

    USER PREFERENCES:
    ${JSON.stringify(preferences || {})}

    TASK:
    Suggest 2 EXACT items from the context above.
    
    FORMAT: ONLY JSON
    {
      "message": "Stylist advice string.",
      "products": [
        {
          "id": "item-1",
          "name": "PRODUCT NAME",
          "brand": "Store",
          "imageUrl": "IMAGE_URL",
          "priceMin": 0,
          "priceMax": 0,
          "currency": "USD",
          "verdict": "strong-buy",
          "verdictReasons": ["Reason"],
          "retailers": [{"name": "Store", "price": 0.0, "url": "URL", "inStock": true}]
        }
      ]
    }`;

    const chatItems = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-3).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: query }
    ];

    const responseText = await chatOllama('llama3', chatItems);
    
    let replyData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      replyData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (e) {
      replyData = { message: responseText, products: [] };
    }

    return NextResponse.json({
      success: true,
      message: replyData.message,
      products: replyData.products || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
