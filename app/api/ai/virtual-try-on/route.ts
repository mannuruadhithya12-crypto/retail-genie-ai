import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { product, preferences } = await req.json();

    const prefsText = preferences 
      ? `User attributes: ${preferences.bodyType || 'average'} body type, ${preferences.skinTone || 'medium'} skin tone, prefers ${preferences.stylePreferences?.join(', ') || 'general'} styles.` 
      : `User attributes: standard body type.`;

    const prompt = `Act as an expert Virtual Fitting Assistant and Master Tailor.
    Analyze how this garment would fit the user based on their attributes.
    
    Garment: ${product.name} by ${product.brand}
    Description/Features: ${product.description || 'A stylish clothing piece'}
    
    ${prefsText}
    
    Provide expert reasoning on the fit, color harmony, and styling recommendations.
    
    Return ONLY VALID JSON EXACTLY MATCHING THIS STRUCTURE:
    {
      "fitScore": 88,
      "styleAnalysis": "Explain why this garment compliments their attributes, focusing on silhouette and color theory.",
      "recommendations": ["Suggest how to style it", "Suggest what to pair it with"]
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are an elite virtual fitting AI. Output only JSON.' },
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = {
        fitScore: 85,
        styleAnalysis: "This garment offers a versatile fit that flatters your body type, with colors that harmonize well with your complexion.",
        recommendations: ["Pair with neutral accessories", "Wear tailored footwear"]
      };
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Virtual Try-On Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
