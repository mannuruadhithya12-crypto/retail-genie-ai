import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ClothingItem } from '@/lib/models';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');

    let filter: any = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { styleTags: { $in: [query.toLowerCase()] } }
      ];
    }
    if (category) {
      filter.category = category;
    }

    const products = await ClothingItem.find(filter).limit(50).sort({ rating: -1 });

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
