import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { outfitImage, backgroundImage } = await req.json();

    if (!outfitImage || !backgroundImage) {
        return NextResponse.json({ error: 'Missing images for composite processing' }, { status: 400 });
    }

    // AI Analysis of the background lighting and scenario
    const prompt = `Analyze the lighting and environment of this background: "${backgroundImage.length > 100 ? 'Custom Background' : backgroundImage}".
    
    1. Calculate a realistic "Lighting Match Score" (0-100) for a standard studio-lit outfit photo placed here.
    2. Suggest 2 specific color grading or filter adjustments (e.g. "Increase warmth by 10%", "Add soft blue tint").
    3. Provide a one-sentence "vibe check" for the outfit in this location.
    
    RETURN ONLY JSON:
    {
      "matchScore": 88,
      "adjustments": ["Increase warmth", "Soft shadows"],
      "vibeCheck": "Perfectly suited for a chic urban setting."
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are an expert fashion photographer and lighting specialist.' },
      { role: 'user', content: prompt }
    ]);

    let aiData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      aiData = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      aiData = { matchScore: 85, adjustments: [], vibeCheck: "Looking great in this setting!" };
    }

    return NextResponse.json({
      compositedImageUrl: outfitImage, // Subject image to be blended by frontend
      lightingMatchScore: aiData.matchScore,
      adjustments: aiData.adjustments,
      vibeCheck: aiData.vibeCheck,
      success: true
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
