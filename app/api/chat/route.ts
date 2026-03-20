import { NextResponse } from 'next/server'
import { chatOllama } from '@/lib/ollama'
import { TavilySearch } from '@/lib/search'
import { ProductExtractor } from '@/lib/extractor'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, messages = [], preferences } = body

    // 1. Initial Discovery Search
    const searchResults = await TavilySearch.searchFashion(message);
    
    // 2. Deep Extraction for Top 2 Results (Sequential for stability)
    const deepResults = [];
    for (const res of searchResults.slice(0, 2)) {
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
      console.log(`Extracted Image: ${finaleImage}`);
    }

    const context = deepResults.map(r => 
      `Product: ${r.title}\nURL: ${r.url}\nImage: ${r.imageUrl}\nPrice: ${r.price}\nSnippet: ${r.snippet}`
    ).join('\n---\n');

    // 3. AI Synthesis - Use the deep-extracted context
    const systemPrompt = `You are a real-time fashion personal shopper for Retail-Genie.
    
    DEEP BROWSING CONTEXT (VERIFIED):
    ${context || "No live products found. Advise based on fashion principles."}

    USER PREFERENCES:
    ${JSON.stringify(preferences || {})}

    TASK:
    Suggest 2 EXACT items from the VERIFIED context above.
    
    CRITICAL: 
    - You MUST use the "Image" URL provided in the context for EACH item.
    - Copy the "URL" exactly for the retailer link.
    - Mention the "Price" if available.
    
    FORMAT: ONLY JSON
    {
      "message": "Personal styling advice based on these exact finds.",
      "products": [
        {
          "id": "find-1",
          "name": "EXACT PRODUCT NAME",
          "brand": "Store Name",
          "imageUrl": "VERIFIED_IMAGE_URL",
          "priceMin": 49.00,
          "priceMax": 49.00,
          "currency": "USD",
          "verdict": "strong-buy",
          "verdictReasons": ["Verified fit and style from recent browsing"],
          "retailers": [{"name": "Store", "price": 49.0, "url": "DIRECT_LINK", "inStock": true}]
        }
      ]
    }`;

    const chatItems = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-3).map((m: any) => ({ role: m.role, content: m.content })), // Limit history for speed
      { role: 'user', content: message }
    ];

    const responseText = await chatOllama('llama3', chatItems);
    
    let replyData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      replyData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (e) {
      console.error('JSON Error:', responseText);
      replyData = { message: responseText.slice(0, 200), products: [] };
    }

    return NextResponse.json({
      success: true,
      message: replyData.message,
      products: replyData.products || [],
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

