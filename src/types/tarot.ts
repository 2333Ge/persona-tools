export type ITArotType = {
  type: number;
  name: string;
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

export interface LevelResult {
  specialArcana: number; // 特殊arcana的type
  levelChange: number; // 升降级数值
}

export interface ITarot {
  typeName: string; // 塔罗牌类型名称
  name: string; // persona名称
  level: string; // 等级
}
