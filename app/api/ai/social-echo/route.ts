import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';

export async function POST(request: Request) {
  try {
    const { style } = await request.json();

    const prompt = `Analyze the "Social Echo" for the style: "${style}".
    Simulate real-time sentiment from platforms like TikTok, Instagram, and Pinterest.
    
    RETURN ONLY JSON:
    {
      "trendingScore": 95,
      "sentiment": "Positive/Bullish",
      "buzzwords": ["aesthetic", "trending", "must-have"],
      "socialForecast": "Prediction for next 3 months"
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are a social media trend analyst for premium fashion.' },
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = { sentiment: response, buzzwords: [], socialForecast: "" };
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
