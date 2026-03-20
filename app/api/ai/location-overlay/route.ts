import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { outfitImage, backgroundImage } = await req.json();

    const prompt = `Act as a "Location Overlay Stylist". 
    Analyze this background: [Background Image] and this outfit: [Outfit Image].
    Predict how the lighting and vibe match.
    
    Return ONLY JSON:
    {
      "lightingMatchScore": 0-100,
      "styleVerdict": "how it fits the location",
      "compositedImageUrl": "USE_THE_OUTFIT_IMAGE_URL_AS_RESULT"
    }`;

    const response = await generateOllama({
      model: 'llava',
      prompt,
      images: [outfitImage.split(',')[1], backgroundImage.split(',')[1]],
      format: 'json'
    });

    return NextResponse.json(JSON.parse(response));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
