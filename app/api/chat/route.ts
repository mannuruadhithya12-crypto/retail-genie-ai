import { NextResponse } from 'next/server';
import { StylistEngine } from '@/lib/stylist-engine';
import dbConnect from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    try {
      await dbConnect();
    } catch (dbError) {
      console.warn('MongoDB connection failed (IP might not be whitelisted). Falling back to memory-only mode.');
    }

    const { message, messages = [] } = await request.json();

    const response = await StylistEngine.processRequest(
      message, 
      messages.slice(-5).map((m: any) => ({ role: m.role, content: m.content }))
    );

    return NextResponse.json({
      success: true,
      message: response.stylist_advice,
      products: response.products
    });
  } catch (error: any) {
    console.error('Stylist Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

