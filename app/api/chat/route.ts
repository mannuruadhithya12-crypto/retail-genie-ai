import { NextResponse } from 'next/server';
import { StylistEngine } from '@/lib/stylist-engine';

export async function POST(request: Request) {
  try {
    const { message, messages = [] } = await request.json();

    const response = await StylistEngine.processRequest(
      message, 
      messages.slice(-5).map((m: any) => ({ role: m.role, content: m.content }))
    );

    // Map verdicts back to the product objects for frontend rendering
    const products = response.recommendedOutfit.map(p => ({
      ...p,
      verdict: response.verdicts[p.id]?.verdict || p.verdict,
      verdictReasons: [response.verdicts[p.id]?.reason || 'Expert selection']
    }));

    return NextResponse.json({
      success: true,
      message: response.advice,
      products: products
    });
  } catch (error: any) {
    console.error('Stylist Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
