import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { images } = await req.json();

    const prompt = `Analyze these ${images.length} people's styles and colors for "Group Coordination".
    Identify dominant colors and styles. Suggest a theme that coordinates everyone.
    
    Return ONLY JSON:
    {
      "themeName": "Theme title",
      "coordinationTips": ["tip1", "tip2"],
      "suggestedColors": ["#hex1", "#hex2"],
      "stylingVerdict": "summary text"
    }`;

    // Use the first image for vision analysis in this demo
    const response = await generateOllama({
      model: 'llava',
      prompt,
      images: [images[0].split(',')[1]],
      format: 'json'
    });

    return NextResponse.json(JSON.parse(response));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
