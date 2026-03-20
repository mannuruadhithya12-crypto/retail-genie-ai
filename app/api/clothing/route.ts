import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: "shirt-1",
      type: "base",
      modelUrl: "/models/shirt.glb",
      scale: [1, 1, 1],
      positionOffset: [0, 0.2, 0]
    },
    {
      id: "jacket-1",
      type: "mid",
      modelUrl: "/models/jacket.glb",
      scale: [1.05, 1.05, 1.05],
      positionOffset: [0, 0.2, 0.1]
    }
  ]);
}
