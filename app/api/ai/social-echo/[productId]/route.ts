import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    const prompt = `Act as a "Social Sentiment Fashion Critic". 
    Fetch simulated public sentiment for product ID: "${productId}".
    Aggregate data from reviews and social mentions.
    
    Return JSON:
    {
      "sentimentScore": 0-100,
      "breakdown": { "positive": "...", "neutral": "...", "negative": "..." },
      "commonComments": ["...", "..."],
      "socialVerdict": "Buy / Wait / Skip"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text().match(/\{[\s\S]*\}/)![0]);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// Next.js requirement for dynamic route segment
export const dynamic = 'force-dynamic';
