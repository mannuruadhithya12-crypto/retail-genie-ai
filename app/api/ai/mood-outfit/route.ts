import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import { AIHistory } from '@/lib/models';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { moodText, userId } = await req.json();
    
    if (!moodText) {
      return NextResponse.json({ error: 'Mood description is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `You are an expert fashion stylist. A client says they feel: "${moodText}".
    Analyze this emotion and provide:
    1. A color palette (list of hex codes or color names).
    2. Style suggestions (e.g., "Minimalist", "Bold Streetwear").
    3. Exactly 2 complete outfit recommendations (JSON format).
    
    Return ONLY a JSON object with this structure:
    {
      "emotionAnalysis": "Brief summary",
      "colors": ["#hex", "color"],
      "style": "Style Name",
      "outfits": [
        { "name": "Outfit 1", "items": ["Item A", "Item B"] },
        { "name": "Outfit 2", "items": ["Item C", "Item D"] }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!data) throw new Error('Failed to parse AI response');

    // Save to history
    await dbConnect();
    if (userId) {
      await AIHistory.create({
        userId,
        feature: 'mood-outfit',
        input: { moodText },
        output: data
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Mood API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
