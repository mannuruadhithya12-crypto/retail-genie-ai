import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { recentOutfits, recentHistory } = await req.json();

    const prompt = `Act as a "Future Style Predictor". 
    Analyze this history: ${JSON.stringify({ recentOutfits, recentHistory })}
    Predict the next logical evolution of their style and suggest 2 investment pieces.
    
    Return ONLY JSON:
    {
      "predictedTrend": "Trend name",
      "reasoning": "stylist analysis",
      "investmentPieces": [
        {"name": "Item Name", "reason": "why buy this"}
      ]
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
