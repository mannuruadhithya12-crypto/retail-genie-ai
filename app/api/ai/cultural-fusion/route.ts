import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';
import { LiveProductSearch } from '@/lib/live-search';

export async function POST(request: Request) {
  try {
    const { styles } = await request.json(); // Array of styles

    const prompt = `Blend these fashion styles: ${Array.isArray(styles) ? styles.join(' and ') : styles}.
    Create a highly specific 'Fusion Look' and suggest 2-3 key clothing items that make up this look.
    
    RETURN ONLY VALID JSON EXACTLY MATCHING THIS STRUCTURE:
    {
      "lookName": "Creative Fusion Name",
      "description": "Exquisite description of the blend.",
      "keyFeatures": ["detail1", "detail2"],
      "pieces": [
        { "name": "Item Name (e.g., Embroidered Kimono Jacket)", "reason": "Why it fits the fusion" }
      ]
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are a global fashion fusion expert. Return only JSON.' },
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = { lookName: "Fusion Look", description: response, keyFeatures: [], pieces: [] };
    }

    // Enhance pieces with real products from live search
    if (data.pieces && Array.isArray(data.pieces)) {
      data.pieces = await Promise.all(data.pieces.map(async (piece: any) => {
        try {
          const matchedProducts = await LiveProductSearch.searchProducts(piece.name, 1);
          return {
             ...piece,
             scrapedProduct: matchedProducts.length > 0 ? matchedProducts[0] : null
          };
        } catch(e) {
          return piece;
        }
      }));
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Cultural Fusion Error", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
