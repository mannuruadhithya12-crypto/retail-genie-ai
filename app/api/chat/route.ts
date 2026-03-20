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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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
- Be highly sophisticated, poetic, and elevated in your tone (like a Vogue editor or a luxury personal shopper).
- DO NOT use generic bullet points like "The Swimsuit", "The Cover-up". Avoid simple numerical lists.
- Instead, use elegant markdown components: blockquotes, italicized styling, or thematic section headers (e.g., *The Silhouette*, *The Palette*, *The Finishes*).
- Describe textures, silhouettes, and color harmony poetically and precisely. Your recommendations must feel "advanced" and highly curated.
- Never give basic or boring advice. Push the boundaries while respecting the user's climate and body type.`

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

    return NextResponse.json({
      success: true,
      message: responseText,
      products: [],
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
