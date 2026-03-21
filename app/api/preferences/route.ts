import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const preferences = await req.json();
    // In a full implementation, persist to DB here.
    // Preferences are already persisted to localStorage via Zustand.
    console.log('[API] Preferences saved:', preferences);
    return NextResponse.json({ success: true, message: 'Preferences saved successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save preferences' }, { status: 500 });
  }
}

export async function GET() {
  // Return default or fetched preferences
  return NextResponse.json({ success: true, preferences: {} });
}
