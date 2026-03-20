import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    const prompt = `As a Voice Stylist, the user just said: "${transcript}".
    Provide a concise styling recommendation (max 3 sentences) in a helpful, conversational tone.
    
    Return ONLY JSON:
    {
      "advice": "text content",
      "detectedPreferences": ["pref1", "pref2"]
    }`;

    const response = await generateOllama({
      model: 'llama3',
      prompt,
      format: 'json'
    });

    return NextResponse.json(JSON.parse(response));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
