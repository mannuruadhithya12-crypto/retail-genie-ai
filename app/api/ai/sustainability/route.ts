import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';

export async function POST(request: Request) {
  try {
    const { itemName, material } = await request.json();

    const prompt = `Perform a deep sustainability analysis for: "${itemName}" made of ${material || "standard fabrics"}.
    Calculate CO2 footprint, water usage estimates, and an overall Sustainability Score (0-100).
    Provide 3 eco-friendly washing tips.
    
    RETURN ONLY JSON:
    {
      "score": 85,
      "co2Estimate": "12.5 kg CO2",
      "waterUsage": "2700 Liters",
      "impactSummary": "Description of environmental impact.",
      "ecoTips": ["tip1", "tip2"]
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are an environmental scientist specializing in textile sustainability.' },
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = { impactSummary: response, ecoTips: [] };
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
