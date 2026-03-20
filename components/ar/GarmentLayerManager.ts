export type GarmentType = 'base' | 'mid' | 'outer' | 'bottom';
export type AttachmentType = 'upper_body' | 'lower_body';

export interface Garment {
  id: string;
  type: GarmentType;
  attachmentType: AttachmentType;
  modelUrl: string;
  scale: number[];
  positionOffset: number[];
}

export class GarmentLayerManager {
  private garments: Map<string, Garment> = new Map();
  private layeringOrder: Record<GarmentType, number> = {
    'base': 0,
    'bottom': 1,
    'mid': 2,
    'outer': 3
  };

  public addGarment(garment: Garment) {
    this.garments.set(garment.id, garment);
  }

  public removeGarment(id: string) {
    this.garments.delete(id);
  }

  public getLayeredGarments(): Garment[] {
    return Array.from(this.garments.values()).sort(
      (a, b) => this.layeringOrder[a.type] - this.layeringOrder[b.type]
    );
  }

  public clear() {
    this.garments.clear();
  }
}
