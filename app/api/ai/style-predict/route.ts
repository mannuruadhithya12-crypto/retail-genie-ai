import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import { SavedOutfit, AIHistory } from '@/lib/models';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await dbConnect();
    
    // Fetch user context
    const recentOutfits = await SavedOutfit.find({ userId }).limit(5).populate('outfitId');
    const recentHistory = await AIHistory.find({ userId }).limit(10);
    
    const userContext = JSON.stringify({ recentOutfits, recentHistory });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Act as a "Future Style Predictor". 
    Based on this user's history: ${userContext}.
    Predict their fashion evolution over the next 6 months.
    1. Identify a style trend they are moving toward.
    2. Suggest 3 items for a "Long-term Investment Wardrobe".
    
    Return JSON:
    {
      "trendForecast": "Description of trend",
      "evolutionReasoning": "Why this trend fits",
      "investmentPieces": [
        { "item": "...", "priority": "high", "reason": "..." }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text().match(/\{[\s\S]*\}/)![0]);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
