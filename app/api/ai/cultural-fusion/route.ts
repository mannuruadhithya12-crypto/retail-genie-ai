import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';

export async function POST(request: Request) {
  try {
    const { styles } = await request.json(); // Array of 2 styles, e.g., ["Japanese Minimalist", "Bohemian"]

    const prompt = `Blend these two distinct fashion styles: ${styles.join(' and ')}.
    Create a unique 'Fusion Look' that respects both heritages while being modern.
    
    RETURN ONLY JSON:
    {
      "lookName": "Fusion Name",
      "description": "Exquisite description of the blend.",
      "keyFeatures": ["detail1", "detail2"],
      "stylingTips": ["tip1", "tip2"]
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are a global fashion fusion expert.' },
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = { description: response, keyFeatures: [], stylingTips: [] };
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
