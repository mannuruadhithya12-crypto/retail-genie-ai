import { NextResponse } from 'next/server';
import { RecommendationEngine } from '@/lib/recommendation';

export async function POST(req: Request) {
  try {
    const { prompt, preferences } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const recommendation = await RecommendationEngine.getOutfitRecommendation(prompt, preferences);

    return NextResponse.json({ success: true, ...recommendation });
  } catch (error: any) {
    console.error('Recommendation API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
