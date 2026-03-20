import { NextResponse } from 'next/server'
import { chatOllama } from '@/lib/ollama'
import { TavilySearch } from '@/lib/search'
import { RecommendationEngine } from '@/lib/recommendation'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, messages = [], preferences } = body

    // 1. Perform Real-Time Online Search
    const searchResults = await TavilySearch.searchFashion(message);
    const context = TavilySearch.formatResultsForAI(searchResults);

    const systemPrompt = `You are an elite, avant-garde fashion stylist for the premium luxury brand Retail-Genie.

ONLINE BROWSER MODE:
I have browsed the internet for your request. Use these real-time results to suggest ACTUAL products with real links and prices:
${context || "No real-time results found. Falling back to fashion principles."}

The user has the following preferences:
- Style: ${preferences?.stylePreferences?.join(', ') || 'casual'}
- Climate: ${preferences?.climate || 'temperate'}
- Budget Currency: ${preferences?.currency || 'USD'}

CRITICAL: You MUST output ONLY a pure, valid JSON object with REAL DATA from the results.
Schema:
{
  "message": "Your styling advice based on the browsing results.",
  "products": [
    {
      "id": "unique-id",
      "name": "REAL PRODUCT NAME",
      "brand": "ZARA / H&M / ASOS",
      "imageUrl": "REAL_IMAGE_FROM_SEARCH_OR_PLACEHOLDER",
      "priceMin": 85.00,
      "priceMax": 85.00,
      "currency": "USD",
      "verdict": "strong-buy",
      "retailers": [{"name": "Site Name", "price": 85.0, "url": "HTML_LINK_TO_PRODUCT", "inStock": true}]
    }
  ]
}
IMPORTANT: Suggest 2 products. Return ONLY raw JSON.`

    const formattedHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content || '',
    }))

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: message }
    ]

    // 2. AI Synthesis using Recommendation Engine
    const recommendation = await RecommendationEngine.getOutfitRecommendation(message, preferences);

    return NextResponse.json({
      success: true,
      message: recommendation.recommendation || 'Here are my curated recommendations.',
      products: recommendation.outfit.map((o: any) => ({
        id: o.productId,
        name: o.name,
        brand: o.brand,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
        priceMin: 85.00,
        priceMax: 85.00,
        currency: 'USD',
        verdict: o.verdict,
        verdictReasons: [o.reason],
        retailers: [{"name": o.brand, "price": 85.0, "url": o.shopUrl, "inStock": true}]
      })),
    })
  } catch (error: any) {
    console.error('Ollama Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message. Ensure Ollama is running.' },
      { status: 500 }
    )
  }
}
