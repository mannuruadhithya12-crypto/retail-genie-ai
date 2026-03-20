import { NextResponse } from 'next/server';

const clothingItems = [
  {
    id: '1',
    type: 'outer',
    attachmentType: 'upper_body',
    modelUrl: '/models/jacket.glb',
    scale: [1.1, 1.1, 1.1],
    positionOffset: [0, 0.2, 0.1]
  },
  {
    id: '2',
    type: 'base',
    attachmentType: 'upper_body',
    modelUrl: '/models/shirt.glb',
    scale: [1, 1, 1],
    positionOffset: [0, 0.2, 0]
  },
  {
    id: '3',
    type: 'bottom',
    attachmentType: 'lower_body',
    modelUrl: '/models/pants.glb',
    scale: [1, 1, 1],
    positionOffset: [0, -0.5, 0]
  },
  {
    id: '4',
    type: 'outer',
    attachmentType: 'upper_body',
    modelUrl: '/models/jacket.glb',
    scale: [1.05, 1.05, 1.05],
    positionOffset: [0, 0.2, 0]
  }
];

export async function GET() {
  return NextResponse.json(clothingItems);
}
