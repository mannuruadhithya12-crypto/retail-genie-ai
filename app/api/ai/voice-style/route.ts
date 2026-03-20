import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import { VoiceRequest } from '@/lib/models';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { transcript, userId } = await req.json();
    
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `As a Voice Stylist, the user just said: "${transcript}".
    Provide a concise styling recommendation (max 3 sentences) in a helpful, conversational tone.
    Suggest 1-2 key items.
    Return JSON:
    {
      "voiceResponse": "Your spoken reply",
      "recommendations": ["Item 1", "Item 2"],
      "actionTag": "styling-advice"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text().match(/\{[\s\S]*\}/)![0]);

    // Log the voice request
    await dbConnect();
    if (userId) {
      await VoiceRequest.create({
        userId,
        transcript,
        actionTaken: data.actionTag
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
