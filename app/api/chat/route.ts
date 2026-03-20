import { NextResponse } from 'next/server'
import { chatOllama } from '@/lib/ollama'
import { TavilySearch } from '@/lib/search'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, messages = [], preferences } = body

    // 1. Perform Real-Time Online Search (Fast search)
    const searchResults = await TavilySearch.searchFashion(message);
    const context = TavilySearch.formatResultsForAI(searchResults);

    // 2. Single Reasoning Pass - Use Llama3 to synthesize everything
    const systemPrompt = `You are an elite, real-time fashion scout for Retail-Genie.
    
    REAL-TIME BROwsing CONTEXT:
    ${context || "No real-time results. Use fashion knowledge."}

    USER PREFERENCES:
    ${JSON.stringify(preferences || {})}

    TASK:
    Analyze the user's message and the search results. Suggest 2 real products.
    
    CRITICAL: 
    - Use the REAL product names, brands, AND Image URLs from the context provided above.
    - NEVER use placeholder images if an image URL is available in the context.
    - If a result has an 'Image: http...', you MUST use that in the "imageUrl" field.
    
    RETURN ONLY PURE JSON:
    {
      "message": "Stylist advice string including specific prices seen in search.",
      "products": [
        {
          "id": "item-1",
          "name": "REAL PRODUCT NAME",
          "brand": "Actual Store (e.g. Zara)",
          "imageUrl": "REAL_IMAGE_URL_FROM_CONTEXT",
          "priceMin": 49.99,
          "priceMax": 49.99,
          "currency": "USD",
          "verdict": "strong-buy",
          "verdictReasons": ["Actual reason based on search snippets"],
          "retailers": [{"name": "Store", "price": 49.99, "url": "REAL_PRODUCT_URL", "inStock": true}]
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

