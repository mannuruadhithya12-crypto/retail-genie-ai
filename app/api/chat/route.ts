import { NextResponse } from 'next/server'
import { chatOllama } from '@/lib/ollama'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, messages = [], preferences } = body

    const systemPrompt = `You are an elite, avant-garde fashion stylist for the premium luxury brand Retail-Genie.
The user has the following preferences:
- Style: ${preferences?.stylePreferences?.join(', ') || 'casual'}
- Climate: ${preferences?.climate || 'temperate'}
- Budget Currency: ${preferences?.currency || 'USD'}
- Body Type: ${preferences?.bodyType || 'average'}
- Skin Tone: ${preferences?.skinTone || 'medium'}

CRITICAL INSTRUCTIONS:
You MUST output ONLY a pure, valid JSON object following this exact schema:
{
  "message": "Your short styling advice.",
  "products": [
    {
      "id": "unique-id",
      "name": "Product Name",
      "brand": "Store Name",
      "imageUrl": "PLACEHOLDER_URL",
      "priceMin": 85.00,
      "priceMax": 85.00,
      "currency": "USD",
      "verdict": "strong-buy",
      "verdictReasons": ["reason1"],
      "retailers": [{"name": "Store", "price": 85.0, "url": "#", "inStock": true}]
    }
  ]
}
IMAGE PLACEHOLDERS:
- Shirts: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400"
- Jackets: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400"
- Pants: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400"
- Shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400"

IMPORTANT: Only suggest 2 products. Return ONLY the JSON object.`

    const formattedHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content || '',
    }))

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: message }
    ]

    const responseText = await chatOllama('llama3', chatMessages);

    let replyData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        replyData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON object found in Ollama response.');
      }
    } catch (error: any) {
      console.error('JSON Parse error:', responseText);
      throw new Error('AI returned malformed data. Please try again.');
    }

    return NextResponse.json({
      success: true,
      message: replyData.message || 'Here are my curated recommendations.',
      products: replyData.products || [],
    })
  } catch (error: any) {
    console.error('Ollama Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message. Ensure Ollama is running.' },
      { status: 500 }
    )
  }
}
