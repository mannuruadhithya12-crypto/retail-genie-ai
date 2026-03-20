import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  return NextResponse.json({
    id,
    type: "base",
    modelUrl: `/models/${id}.glb`,
    scale: [1, 1, 1],
    positionOffset: [0, 0.2, 0]
  });
}
