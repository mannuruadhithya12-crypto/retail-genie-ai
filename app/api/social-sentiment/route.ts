import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { productId } = body

  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock sentiment data
  return NextResponse.json({
    success: true,
    productId,
    overallSentiment: 78 + Math.floor(Math.random() * 15),
    totalMentions: 1200 + Math.floor(Math.random() * 800),
    platforms: [
      { name: 'X (Twitter)', sentiment: 82, mentions: 450 },
      { name: 'Reddit', sentiment: 76, mentions: 320 },
      { name: 'Instagram', sentiment: 85, mentions: 280 },
      { name: 'TikTok', sentiment: 79, mentions: 350 },
    ],
    highlights: {
      positive: ['Breathable fabric', 'True to size', 'Great for layering', 'Premium feel'],
      negative: ['Runs small in arms', 'Limited color options'],
    },
    trending: Math.random() > 0.5 ? 'up' : 'stable',
    lastUpdated: new Date().toISOString(),
  })
}
