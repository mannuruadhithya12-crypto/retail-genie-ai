import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { outfitImage, backgroundImage } = await req.json();
    
    if (!outfitImage || !backgroundImage) {
      return NextResponse.json({ error: 'Outfit and Background images are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `Act as a "Location Overlay Stylist". 
    Analyze this background: [Background Image] and this outfit: [Outfit Image].
    1. Describe how the colors of the outfit interact with the background lighting.
    2. Suggest a specific "Pose" or "Angle" for the best photo in this street/office/beach setting.
    
    Return JSON:
    {
      "lightingMatchScore": 0-100,
      "aestheticLogic": "How it blends",
      "photoTips": ["Tip 1", "Tip 2"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text().match(/\{[\s\S]*\}/)![0]);

    return NextResponse.json({
      ...data,
      compositedImageUrl: outfitImage // In production, use canvas/ffmpeg for real compositing
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
