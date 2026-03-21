import { NextResponse } from 'next/server';
import { chatOllama } from '@/lib/ollama';
import { LiveProductSearch } from '@/lib/live-search';

export async function POST(req: Request) {
  try {
    const { recentOutfits, recentHistory, preferences } = await req.json();

    const prefsText = preferences?.stylePreferences ? `User usually likes: ${preferences.stylePreferences.join(', ')}` : '';

    const prompt = `Act as an expert Future Style Predictor and Fashion Analyst. 
    Analyze this context: ${JSON.stringify({ recentOutfits, recentHistory })}. ${prefsText}
    Predict the next chronological evolution of their style (from "Current" to "Predicted").
    Suggest 3 hyper-specific "Future-Proof" lifetime investment clothing pieces that bridge this gap.
    
    Return ONLY JSON:
    {
      "currentStyle": "Short descriptive name (e.g. Casual Contemporary)",
      "predictedStyle": "Short descriptive name (e.g. Minimalist Luxury)",
      "timeline": "e.g. 6-12 months",
      "confidence": 85,
      "influences": ["Trend 1", "Shift 2", "Preference 3", "Growth 4"],
      "investmentPieces": [
        {
          "name": "Item Name", 
          "reason": "Why buy this",
          "longevity": 92
        }
      ]
    }`;

    const response = await chatOllama('llama3', [
      { role: 'system', content: 'You are a master fashion forecaster. Output only JSON.' },
      { role: 'user', content: prompt }
    ]);

    let data;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      data = { 
        currentStyle: "Modern Casual", predictedStyle: "Elevated Minimalist", timeline: "6-12 months", confidence: 85,
        influences: ["Shift to higher quality", "Neutral tone preference", "Timeless silhouettes", "Sustainable brands"],
        investmentPieces: [] 
      };
    }

    if (data.investmentPieces && Array.isArray(data.investmentPieces)) {
      data.investmentPieces = await Promise.all(data.investmentPieces.map(async (piece: any) => {
        try {
          // Live search ASOS for the future proof item
          const matchedProducts = await LiveProductSearch.searchProducts(piece.name, 1);
          return {
             ...piece,
             scrapedProduct: matchedProducts.length > 0 ? matchedProducts[0] : null
          };
        } catch(err) {
          return piece;
        }
      }));
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Style Predictor Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
