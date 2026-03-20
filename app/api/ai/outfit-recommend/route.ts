import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';
import { ClothingService } from '@/lib/clothing-service';

export async function POST(request: Request) {
  try {
    const { occasion, preferences } = await request.json();

    // 1. Fetch real candidate products
    const candidates = await ClothingService.getProducts(occasion, 10);
    const candidateContext = candidates.map(p => `${p.name} from ${p.brand} ($${p.priceMin})`).join(', ');

    const prompt = `Create a complete outfit for a "${occasion}" using these available items: ${candidateContext}.
    Select: 1 Top, 1 Bottom, 1 Shoe, and 1 Accessory.
    Provide a detailed "Stylist Reasoning" for the combination.
    
    RETURN ONLY JSON:
    {
      "outfitName": "The Name",
      "reasoning": "Why this works together.",
      "items": [
        {"name": "Item Name", "type": "Top/Bottom/etc", "why": "Reason"}
      ],
      "colorTheory": "Color analysis"
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are an elite personal stylist.' },
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = { items: [], reasoning: response };
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
