import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';

export async function POST(request: Request) {
  try {
    const { productName, reviews } = await request.json();

    const prompt = `Perform a deep sentiment analysis for "${productName}" based on these reviews:
    ${reviews.join('\n')}
    
    TASK: Extract Pros, Cons, and a Sentiment Score (0-100).
    Provide a specific "AI Verdict" (BUY, CONSIDER, or SKIP).
    
    RETURN ONLY JSON:
    {
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"],
      "sentimentScore": 85,
      "verdict": "BUY",
      "summary": "Overall expert opinion."
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are a critical fashion product reviewer.' },
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = { pros: [], cons: [], sentimentScore: 50, verdict: "CONSIDER", summary: response };
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
