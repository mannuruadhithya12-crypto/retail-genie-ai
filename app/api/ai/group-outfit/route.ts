import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';
import { LiveProductSearch } from '@/lib/live-search';

export async function POST(req: Request) {
  try {
    const { occasion, members } = await req.json();

    if (!members || !Array.isArray(members)) {
      return NextResponse.json({ error: "Missing members array" }, { status: 400 });
    }

    const memberDescriptions = members.map((m: any) => m.name).join(', ');

    const prompt = `A user wants to style a group of people for a "${occasion}".
    The group members are: ${memberDescriptions}.
    
    1. Define a cohesive overarching style theme for the whole group.
    2. Suggest a specific outfit for each person by their name. Make it easy to search online.
    
    RETURN ONLY JSON:
    {
      "themeName": "Theme title",
      "coordinationLogic": "Why this theme works and how it complements everyone",
      "pieces": [
        { "memberId": "1", "memberName": "You", "outfitQuery": "navy blue evening gown dress" },
        { "memberId": "2", "memberName": "Person 2", "outfitQuery": "mens charcoal grey tailored suit" }
      ]
    }`;

    // Note: To keep latency reasonable, we use text generation for group theming
    // instead of running heavy multimodal vision on 4 large base64 images.
    const response = await chatOllama('llama3', [
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch(e) {
      data = { themeName: "Coordinated Elegance", coordinationLogic: "Matching color families.", pieces: [] };
    }

    // Run live scraper against each assigned outfit concept in parallel
    if (data.pieces && Array.isArray(data.pieces)) {
      await Promise.all(data.pieces.map(async (piece: any) => {
        try {
          // ensure the right memberId matches the input
          const matchingMember = members.find(m => m.name === piece.memberName);
          if (matchingMember) piece.memberId = matchingMember.id;

          const results = await LiveProductSearch.searchProducts(`${piece.outfitQuery} fashion clothing`, 1);
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

