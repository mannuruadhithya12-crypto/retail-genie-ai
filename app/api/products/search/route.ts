import { NextResponse } from 'next/server';
import { ClothingService } from '@/lib/clothing-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    
    const products = await ClothingService.getProducts(q);
    
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
