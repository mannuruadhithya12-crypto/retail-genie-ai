import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { image, productName, timeframe } = await req.json();

    const prompt = `Act as a material science and textile expert. 
    Analyze the durability and molecular degradation of a clothing item: "${productName || 'unknown garment'}".
    Assess how it will visually and structurally degrade given the specific timeframe: "${timeframe}".
    
    GUIDELINES:
    - If "10-washes": Focus on initial color fastness and seam tension.
    - If "6-months": Focus on micro-fiber breakdown, pilling in high-friction areas (underarms, thighs), and structural sag.
    - If "1-year": Focus on significant mechanical wear, thinning of the fabric, and 20%+ color saturation loss.
    
    Return ONLY JSON matching this exact structure:
    {
      "durabilityScore": 65,
      "analysis": "Scientific summary of how THIS specific material (cotton/poly/denim/etc) breaks down over ${timeframe}."
    }
    
    The durabilityScore must be an integer between 1 and 100, where 100 is pristine and 1 is destroyed.`;

    const response = await chatOllama('llama3', [
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch(e) {
      // Fallback matrix based on timeframe string if AI fails
      let score = 85; 
      if (timeframe.includes('6-months')) score = 65;
      if (timeframe.includes('1-year')) score = 40;

      data = { durabilityScore: score, analysis: "Standard expected mechanical wear and tear over time." };
    }

    if (typeof data.durabilityScore !== 'number' || data.durabilityScore < 0 || data.durabilityScore > 100) {
       data.durabilityScore = 70;
    }

    // Small simulated delay for dramatic AI effect on the frontend progress bar
    await new Promise(r => setTimeout(r, 800));

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
