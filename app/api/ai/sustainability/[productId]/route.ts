import { NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';
import { ClothingItem } from '@/lib/models';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    await connectToDatabase();
    const { productId } = params;
    const item = await ClothingItem.findById(productId);

    if (!item) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const prompt = `Act as a "Sustainability Fashion Expert". 
    Analyze this product: ${JSON.stringify(item)}.
    Provide eco-score, CO2 impact, and durability.
    
    Return ONLY JSON:
    {
      "ecoScore": 0-100,
      "co2Estimate": "e.g. 5.2kg",
      "durabilityWashes": number,
      "materialAnalysis": "short text"
    }`;

    const response = await generateOllama({
      model: 'phi',
      prompt,
      format: 'json'
    });

    const result = JSON.parse(response);
    
    // Cache the result in MongoDB if needed
    item.sustainability = {
      ecoScore: result.ecoScore,
      co2Estimate: result.co2Estimate,
      durabilityWashes: result.durabilityWashes
    };
    await item.save();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
