import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { images } = await req.json(); // Array of up to 4 images
    
    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze these ${images.length} people's styles and colors for "Group Coordination".
    Create a harmonious group outfit theme.
    Return JSON:
    {
      "themeName": "...",
      "coordinationLogic": "Why these work together",
      "individualSuggestions": [
        { "person": 1, "recommendation": "..." },
        { "person": 2, "recommendation": "..." }
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
