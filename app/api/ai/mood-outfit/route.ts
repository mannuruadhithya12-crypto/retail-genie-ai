import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';

export async function POST(request: Request) {
  try {
    const { mood, preferences } = await request.json();

    const prompt = `User mood: "${mood}". 
    User preferences: ${JSON.stringify(preferences)}.
    
    TASK: Translate this mood into a high-fashion, specialized outfit recommendation.
    Explain the psychology of the color palette and fabric choices.
    
    RETURN ONLY JSON:
    {
      "advice": "Stylist reasoning string",
      "styleTags": ["tag1", "tag2"],
      "colorPalette": ["#hex1", "#hex2"],
      "pieces": [
        {"name": "Item Description", "reason": "Why this fits the mood"}
      ]
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are a luxury fashion mood translator.' },
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = { advice: response, styleTags: [], colorPalette: [], pieces: [] };
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
