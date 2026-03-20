import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params;

    const prompt = `Act as a "Social Sentiment Fashion Critic". 
    Analyze public sentiment for this product: "${productId}".
    
    Return ONLY JSON:
    {
      "sentimentScore": 0-100,
      "commonComments": ["comment1", "comment2"],
      "socialVerdict": "Buy/Consider/Skip",
      "breakdown": {"positive": "80%", "negative": "20%"}
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
