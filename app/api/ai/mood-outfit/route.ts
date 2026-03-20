import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { moodText } = await req.json();

    if (!moodText) {
      return NextResponse.json({ error: 'Mood description is required' }, { status: 400 });
    }

    const prompt = `You are an expert fashion stylist. A client says they feel: "${moodText}".
    Analyze this emotion and recommend a complete outfit (colors, textures, styles).
    
    Return ONLY a JSON object:
    {
      "moodAnalysis": "short emotional style analysis",
      "colorPalette": ["#hex1", "#hex2"],
      "outfitDescription": "detailed description",
      "accessories": ["item1", "item2"]
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
