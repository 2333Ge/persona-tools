export type ITArot = {
  type: number;
  name: string;
  level?: number;
};

export interface FusionStep {
  material1: number;
  material2: number;
  result: number;
}

export interface FusionPath {
  steps: FusionStep[];
  extraMaterials: number[];
}