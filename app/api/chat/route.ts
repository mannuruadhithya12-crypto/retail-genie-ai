import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, messages = [], preferences } = body

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { message: 'GEMINI_API_KEY is not set. Please add it to your environment variables.' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
    })

    const systemPrompt = `You are an elite, avant-garde fashion stylist for the premium luxury brand Retail-Genie.
The user has the following preferences:
- Style: ${preferences?.stylePreferences?.join(', ') || 'casual'}
- Climate: ${preferences?.climate || 'temperate'}
- Location: ${preferences?.location || 'unknown'}
- Budget Currency: ${preferences?.currency || 'USD'}
- Body Type: ${preferences?.bodyType || 'average'}
- Skin Tone: ${preferences?.skinTone || 'medium'}
- Shopping for: ${preferences?.shopFor || 'self'}

CRITICAL INSTRUCTIONS:
You are an AI stylist that MUST output ONLY a pure, valid JSON object following this exact schema:
{
  "message": "Your short, concise, sophisticated styling advice (max 3 sentences).",
  "products": [
    {
      "id": "unique-id",
      "name": "Exact Product Name",
      "brand": "Store or Designer Name",
      "imageUrl": "USE_UNSPLASH_PLACEHOLDER_PROVIDED_BELOW",
      "priceMin": 85.00,
      "priceMax": 85.00,
      "currency": "USD",
      "verdict": "strong-buy" | "consider" | "skip",
      "verdictReasons": ["Great quality", "Perfect for climate"],
      "reviewSentiment": "Summarized reviews and ratings found online",
      "retailers": [
        {
          "name": "Store Name",
          "price": 85.00,
          "url": "REAL_HTTPS_PRODUCT_PAGE_URL",
          "inStock": true
        }
      ]
    }
  ]
}

- SPEED TRICK: Suggest EXACTLY 2 products! Do not suggest more. This prevents you from taking too long.
- YOU MUST USE GOOGLE SEARCH to find actual real-world products.
- EXPLICITLY search across major e-commerce platforms like Myntra, Ajio, Flipkart, Amazon, Zara, H&M, and ASOS to find the most accurate and purchasable items.
- Provide REAL product page URLs for the 'url' field.
- IMAGES: Because real image URLs often break hotlinking, you MUST use one of these high-quality placeholder URLs for 'imageUrl':
  * Shirts: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400"
  * Jackets: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400"
  * Pants/Bottoms: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400"
  * Shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400"
  * Sweaters/Other: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=400"
- If you cannot find a real product page URL, do not include the product.
- Evaluate each item to give a genuine "verdict" (strong-buy, consider, skip).
- ONLY output the raw JSON object. Do not wrap in markdown \`\`\`json blocks.`

    const formattedHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }))

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am your Retail-Genie stylist.' }] },
        ...formattedHistory,
      ],
    })

    const result = await chat.sendMessage(message)
    const responseText = result.response.text()

    let replyData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        replyData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON object found in response.');
      }
    } catch (error: any) {
      console.error('Chat error details:', error);
      
      let errorMessage = 'AI returned malformed data. Please try again.';
      if (error.status === 429 || error.message?.includes('429')) {
        errorMessage = 'Gemini Free Tier limit reached. Please wait 60 seconds and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }

    return NextResponse.json({
      success: true,
      message: replyData.message || 'Here are my curated recommendations.',
      products: replyData.products || [],
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
