import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { audioData } = body

  // Simulate transcription time
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock transcription results
  const mockTranscripts = [
    "I need something casual for a coffee date this weekend",
    "Show me professional outfits for my new job interview",
    "I want to look effortlessly chic for a gallery opening",
    "Find me comfortable travel clothes for my trip to Tokyo",
    "Looking for sustainable fashion options in earth tones",
  ]

  return NextResponse.json({
    success: true,
    transcript: mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)],
    confidence: 0.92 + Math.random() * 0.07,
    language: 'en',
    processingTime: '1.2s',
  })
}
