import { NextRequest, NextResponse } from 'next/server'
import { chatOllama } from '@/lib/ollama';

export async function POST(request: NextRequest) {
  try {
    const { productId, productName } = await request.json()

    const prompt = `Analyze social media sentiment for the product: "${productName || 'this clothing item'}".
    Provide a realistic sentiment breakdown including overall score (1-100), platform-specific scores, and key positive/negative highlights based on typical customer feedback for this type of garment.
    
    Return ONLY VALID JSON:
    {
      "overallSentiment": 85,
      "totalMentions": 1450,
      "platforms": [{"name": "X (Twitter)", "sentiment": 82, "mentions": 500}, ...],
      "highlights": {"positive": ["list", "of", "4", "strings"], "negative": ["list", "of", "2", "strings"]},
      "trending": "up"
    }`;

    const response = await chatOllama('llama3', [{ role: 'user', content: prompt }]);
    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = { overallSentiment: 80, highlights: { positive: ['Premium feel'], negative: ['Size runs small'] }, platforms: [], trending: 'stable' };
    }

    return NextResponse.json({
      success: true,
      productId,
      ...data,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'AI Sentiment Failed' }, { status: 500 });
  }
}
