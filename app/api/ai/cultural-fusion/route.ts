import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { styles } = await req.json();

    const prompt = `Fuse these cultures: "${styles}". 
    Design a hybrid outfit that blends both aesthetics.
    
    Return ONLY JSON:
    {
      "conceptName": "Name of the fusion",
      "description": "stylist design notes",
      "keyElements": ["element1", "element2"]
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
