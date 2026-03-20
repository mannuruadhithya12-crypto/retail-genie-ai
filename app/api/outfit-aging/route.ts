import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { imageUrl, agingOption } = body

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock aging analysis
  const agingData: Record<string, { colorFading: number; fabricWear: number; pillingLevel: number }> = {
    '10-washes': { colorFading: 15, fabricWear: 10, pillingLevel: 12 },
    '6-months': { colorFading: 25, fabricWear: 18, pillingLevel: 28 },
    '1-year': { colorFading: 38, fabricWear: 30, pillingLevel: 45 },
  }

  const result = agingData[agingOption] || agingData['6-months']

  return NextResponse.json({
    success: true,
    originalImageUrl: imageUrl,
    agedImageUrl: imageUrl, // In production, this would be the processed image
    agingDetails: result,
    recommendation: result.colorFading < 25
      ? 'This garment maintains excellent quality over time. A great investment!'
      : 'Consider washing inside-out and air drying to preserve quality.',
  })
}
