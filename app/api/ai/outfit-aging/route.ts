import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';

export async function POST(req: Request) {
  try {
    const { image, productName, timeframe } = await req.json();

    const prompt = `Act as a material science and textile expert. 
    Analyze the durability of clothing item: "${productName || 'unknown garment'}".
    Assess how it will degrade given the timeframe: "${timeframe}".
    
    Return ONLY JSON matching this exact structure:
    {
      "durabilityScore": 65,
      "analysis": "Brief scientific summary of how this specific fabric breaks down."
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
