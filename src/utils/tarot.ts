import { ARCANA_LIST, FUSION_TABLE } from "@/constant/tarot";
import { FusionPath, FusionStep } from "@/types/tarot";
import { randomSelect } from "./data-handle";

/**
 * 得到type1和type2的合成结果
 */
export function getFusionResult(type1: number, type2: number): number {
  const rowIndex = FUSION_TABLE[0].indexOf(type1);
  const colIndex = FUSION_TABLE.map((row) => row[0]).indexOf(type2);
  if (rowIndex === -1 || colIndex === -1) {
    throw new Error("Invalid type");
  }
  const key = FUSION_TABLE[rowIndex][colIndex];
  return key;
}

// 常量配置
const MAX_RESULTS = 10;
const MAX_STEPS = 10;
const MAX_EXTRA_MATERIALS = 2;
const MAX_RANDOM_EXTRAS = 3;

/**
 * 查找合成路径
 * @param materials 初始素材列表
 * @param target 目标结果
 * @returns 最多10个可能的合成路径
 */
export function findFusionPaths(
  materials: number[],
  target: number
): FusionPath[] {
  const results: FusionPath[] = [];
  const tried = new Set<string>();

  // 检查路径是否已尝试过
  const isTriedPath = (steps: FusionStep[]): boolean => {
    const pathKey = steps.map((s) => `${s.material1},${s.material2}`).join("|");
    return tried.has(pathKey) ? true : (tried.add(pathKey), false);
  };

  // 处理直接合成到目标的情况
  const handleDirectFusion = (
    lastResult: number,
    currentSteps: FusionStep[],
    usedMaterials: Set<number>
  ): boolean => {
    const possibleExtras = findPossibleDirectMaterials(
      lastResult,
      target,
      usedMaterials
    );

    if (possibleExtras.length === 0) return false;

    for (const extra of possibleExtras) {
      if (usedMaterials.size >= MAX_EXTRA_MATERIALS) break;

      const finalStep: FusionStep = {
        material1: lastResult,
        material2: extra,
        result: target,
      };

      results.push({
        steps: [...currentSteps, finalStep],
        extraMaterials: [...Array.from(usedMaterials), extra],
      });
    }
    return true;
  };

  // 处理间接合成到目标的情况
  const handleIndirectFusion = (
    lastResult: number,
    currentSteps: FusionStep[],
    usedMaterials: Set<number>
  ): void => {
    const possibleExtras = randomSelect(
      findPossibleIndirectMaterials(lastResult, target),
      MAX_RANDOM_EXTRAS
    );

    for (const extra of possibleExtras) {
      const intermediateResult = getFusionResult(lastResult, extra);

      dfs(
        [intermediateResult],
        [
          ...currentSteps,
          {
            material1: lastResult,
            material2: extra,
            result: intermediateResult,
          },
        ],
        new Set([...Array.from(usedMaterials), extra])
      );
    }
  };

  // 递归搜索合成路径
  const dfs = (
    rest: number[],
    currentSteps: FusionStep[],
    usedMaterials: Set<number>
  ): void => {
    // 剪枝条件
    if (shouldPrune(results.length, currentSteps.length, usedMaterials.size))
      return;

    if (isTriedPath(currentSteps)) return;

    // 处理单个结果的情况
    if (rest.length === 1) {
      const lastResult = rest[0];

      if (lastResult === target) {
        addValidPath(results, currentSteps, usedMaterials);
        return;
      }

      if (!handleDirectFusion(lastResult, currentSteps, usedMaterials)) {
        handleIndirectFusion(lastResult, currentSteps, usedMaterials);
      }
      return;
    }

    // 尝试两两合成
    tryPairFusions(rest, currentSteps, usedMaterials, dfs);
  };

  // 开始搜索
  dfs(materials, [], new Set());
  return results.sort(
    (a, b) => a.extraMaterials.length - b.extraMaterials.length
  );
}

// 辅助函数
function shouldPrune(
  resultsCount: number,
  stepsCount: number,
  extraMaterialsCount: number
): boolean {
  return (
    resultsCount >= MAX_RESULTS ||
    stepsCount > MAX_STEPS ||
    extraMaterialsCount > MAX_EXTRA_MATERIALS
  );
}

function findPossibleDirectMaterials(
  current: number,
  target: number,
  usedMaterials: Set<number>
): number[] {
  return ARCANA_LIST.map((arcana) => arcana.type).filter(
    (type) =>
      !usedMaterials.has(type) && getFusionResult(type, current) === target
  );
}

function findPossibleIndirectMaterials(
  current: number,
  target: number
): number[] {
  return ARCANA_LIST.map((arcana) => arcana.type).filter(
    (type) =>
      type !== current &&
      type !== target &&
      getFusionResult(type, current) !== -1
  );
}

function addValidPath(
  results: FusionPath[],
  steps: FusionStep[],
  usedMaterials: Set<number>
): void {
  results.push({
    steps: steps,
    extraMaterials: Array.from(usedMaterials),
  });
}

function tryPairFusions(
  materials: number[],
  currentSteps: FusionStep[],
  usedMaterials: Set<number>,
  dfsCallback: (rest: number[], steps: FusionStep[], used: Set<number>) => void
): void {
  for (let i = 0; i < materials.length - 1; i++) {
    for (let j = i + 1; j < materials.length; j++) {
      const result = getFusionResult(materials[i], materials[j]);
      if (result === -1) continue;

      const newStep: FusionStep = {
        material1: materials[i],
        material2: materials[j],
        result,
      };

      const remainingMaterials = [
        ...materials.filter((_, index) => index !== i && index !== j),
        result,
      ];

      dfsCallback(
        remainingMaterials,
        [...currentSteps, newStep],
        usedMaterials
      );
    }
  }
}

export function getArcanaName(type: number): string {
  const arcana = ARCANA_LIST.find((item) => item.type === type);
  return arcana ? arcana.name : "未知";
}
