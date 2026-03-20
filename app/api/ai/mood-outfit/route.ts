import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { moodText } = await req.json();

    if (!moodText) {
      return NextResponse.json({ error: 'Mood description is required' }, { status: 400 });
    }

    const prompt = `You are an expert fashion stylist. A client says they feel: "${moodText}".
    Analyze this emotion and recommend a complete outfit.
    
    Return ONLY a JSON object:
    {
      "emotionAnalysis": "short emotional style analysis",
      "colors": ["#hex1", "#hex2"],
      "style": "detailed style name",
      "outfits": [
        {
          "name": "Outfit Name",
          "items": ["item1", "item2"]
        }
      ]
    }`;

    const response = await generateOllama({
      model: 'llama3',
      prompt,
      format: 'json'
    });

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      console.error('Mood JSON Parse error:', response);
      throw new Error('Malformed AI response');
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
