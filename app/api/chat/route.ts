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
    const systemPrompt = `You are an elite fashion stylist for Retail-Genie.
    
    ONLINE SEARCH CONTEXT:
    ${context || "No real-time results. Use fashion knowledge."}

    USER PREFERENCES:
    ${JSON.stringify(preferences || {})}

    TASK:
    Analyze the user's message and the search results. Suggest 2 real products.
    
    RETURN ONLY PURE JSON:
    {
      "message": "Stylist advice string",
      "products": [
        {
          "id": "item-1",
          "name": "Product Name",
          "brand": "Store",
          "imageUrl": "valid_url_or_placeholder",
          "priceMin": 49.99,
          "priceMax": 49.99,
          "currency": "USD",
          "verdict": "strong-buy",
          "verdictReasons": ["Reason why this is a strong buy"],
          "retailers": [{"name": "Site", "price": 49.99, "url": "link", "inStock": true}]
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

