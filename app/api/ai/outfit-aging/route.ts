import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { image, timeframe } = await req.json();

    const prompt = `Analyze this garment for an "Outfit Aging Simulator". 
    Describe how it would look after ${timeframe.replace('_', ' ')}.
    Include fading, fraying, and texture changes.
    
    Return ONLY JSON:
    {
      "agingSummary": "prediction text",
      "durabilityScore": 0-100,
      "careAdvice": "how to prevent this"
    }`;

    const response = await generateOllama({
      model: 'llava',
      prompt,
      images: [image.split(',')[1]],
      format: 'json'
    });

    return NextResponse.json(JSON.parse(response));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
