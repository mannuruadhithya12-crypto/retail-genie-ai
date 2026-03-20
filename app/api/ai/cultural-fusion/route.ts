import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { styles } = await req.json(); // e.g., 'Indian + Korean'
    
    if (!styles) {
      return NextResponse.json({ error: 'Styles to fuse are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `Act as a "Cultural Fusion Fashion Creator". 
    Fuse these cultures: "${styles}".
    Describe a signature hybrid outfit and explain the fusion elements.
    Return JSON:
    {
      "fusionName": "...",
      "outfitDescription": "...",
      "keyElements": ["Element 1", "Element 2"],
      "colorPalette": ["#hex1", "#hex2"],
      "visualDescriptionForAI": "A text description to generate an image from"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text().match(/\{[\s\S]*\}/)![0]);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
