import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import { ClothingItem } from '@/lib/models';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params;
    
    await dbConnect();
    const item = await ClothingItem.findById(productId);
    
    if (!item) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    const prompt = `Act as a "Sustainability Fashion Expert". 
    Analyze this product: ${JSON.stringify(item)}.
    Provide:
    1. An eco-score out of 100 based on materials and brand.
    2. Estimated CO2 footprint in kg.
    3. Estimated durability in washes.
    
    Return JSON:
    {
      "ecoScore": 0-100,
      "co2Estimate": "...",
      "durabilityWashes": 0,
      "sustainabilityReport": "..."
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text().match(/\{[\s\S]*\}/)![0]);

    // Update item if score is missing
    if (!item.sustainability?.score) {
      item.sustainability = {
        score: data.ecoScore,
        co2: data.co2Estimate,
        durability: data.durabilityWashes
      };
      await item.save();
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// Next.js requirement for dynamic route segment
export const dynamic = 'force-dynamic';
