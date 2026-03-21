import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';
import { LiveProductSearch } from '@/lib/live-search';

export async function POST(req: Request) {
  try {
    const { events } = await req.json();

    const prompt = `Act as a "Calendar Outfit Planner". 
    Suggest practical, stylish outfits for these exact events: ${JSON.stringify(events)}.
    
    Return ONLY JSON:
    {
      "itinerarySuggestion": "Brief 1 sentence overview of the stylistic transitions needed for this schedule.",
      "dailyOutfits": [
        {
          "outfitName": "Business Casual Power Look",
          "outfitQuery": "business casual blazer and slacks",
          "reasoning": "Perfect for the morning presentation without being too stiff for lunch."
        }
      ]
    }
    Make sure outfitQuery is a clean search string (no quotes, max 5 words).`;

    const response = await chatOllama('llama3', [
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch(e) {
      data = { itinerarySuggestion: "Here are some flexible picks.", dailyOutfits: [] };
    }

    if (data.dailyOutfits && Array.isArray(data.dailyOutfits)) {
      await Promise.all(data.dailyOutfits.map(async (piece: any) => {
        try {
          // Add "fashion" to improve search accuracy
          const results = await LiveProductSearch.searchProducts(`${piece.outfitQuery} fashion`, 1);
          if (results && results.length > 0) {
            piece.scrapedProduct = results[0];
          }
        } catch(e) {
          console.error(`Scraping failed for ${piece.outfitQuery}:`, e);
        }
      }));
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

