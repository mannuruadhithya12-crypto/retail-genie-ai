import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { members, occasion } = body

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 4000))

  // Mock coordinated outfit recommendations
  const colorPalettes: Record<string, string[]> = {
    wedding: ['Navy', 'Champagne', 'Blush', 'Silver'],
    photo: ['White', 'Denim', 'Beige', 'Sage'],
    travel: ['Black', 'White', 'Olive', 'Tan'],
    party: ['Black', 'Gold', 'Burgundy', 'Emerald'],
    formal: ['Navy', 'Black', 'White', 'Burgundy'],
  }

  const palette = colorPalettes[occasion] || colorPalettes.photo

  return NextResponse.json({
    success: true,
    coordinationStyle: 'Complementary',
    colorPalette: palette,
    recommendations: members.map((member: { id: string; name: string }, index: number) => ({
      memberId: member.id,
      primaryColor: palette[index % palette.length],
      accentColor: palette[(index + 1) % palette.length],
      styleNotes: `Coordinated with ${palette[index % palette.length]} as primary tone`,
    })),
  })
}
