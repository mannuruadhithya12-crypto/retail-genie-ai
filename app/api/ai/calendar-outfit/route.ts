import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { events } = await req.json();

    const prompt = `Act as a "Calendar Outfit Planner". 
    Suggest outfits for these events: ${JSON.stringify(events)}.
    
    Return ONLY JSON:
    {
      "suggestions": [
        {"event": "Title", "outfit": "Description", "vibe": "Professional/Casual"}
      ]
    }`;

    const response = await generateOllama({
      model: 'mistral',
      prompt,
      format: 'json'
    });

    return NextResponse.json(JSON.parse(response));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
