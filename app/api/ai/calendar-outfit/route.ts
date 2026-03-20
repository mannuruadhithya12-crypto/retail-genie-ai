import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { events } = await req.json(); // [{ id, title, date }]
    
    if (!events || events.length === 0) {
      return NextResponse.json({ error: 'Events are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Act as a "Calendar Outfit Planner". 
    Suggest outfits for these ${events.length} events: ${JSON.stringify(events)}.
    Return results in JSON:
    {
      "itinerarySuggestion": "Overall theme for the period",
      "dailyOutfits": [
        { "eventId": "...", "outfitName": "...", "items": ["...", "..."], "reasoning": "..." }
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
