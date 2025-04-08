import { ARCANA_LIST, FUSION_TABLE } from "@/constant/tarot";
import { FusionPath, FusionStep } from "@/types/tarot";

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

/**
 * 查找合成路径
 * @param materials 初始素材列表
 * @param target 目标结果
 * @returns 最多5个可能的合成路径
 */
export function findFusionPaths(
  materials: number[],
  target: number
): FusionPath[] {
  const results: FusionPath[] = [];
  const tried = new Set<string>();

  // 检查路径是否已尝试过
  const isTriedPath = (steps: FusionStep[]): boolean => {
    const key = steps.map((s) => `${s.material1},${s.material2}`).join("|");
    if (tried.has(key)) return true;
    tried.add(key);
    return false;
  };

  // 递归搜索合成路径
  const dfs = (
    rest: number[],
    currentSteps: FusionStep[],
    usedMaterials: Set<number>
  ): void => {
    // 剪枝条件
    if (results.length >= 5 || currentSteps.length > 5) return;

    // 检查当前路径是否重复
    if (isTriedPath(currentSteps)) return;

    // 如果当前只剩一个结果,检查是否需要额外材料
    if (rest.length === 1) {
      const lastResult = rest[0];
      if (lastResult === target) {
        // 找到一个有效路径
        results.push({
          steps: currentSteps,
          extraMaterials: Array.from(usedMaterials),
        });
      } else {
        // 尝试用一个额外材料达到目标
        const possibleExtras = ARCANA_LIST.map((arcana) => arcana.type).filter(
          (type) =>
            !usedMaterials.has(type) &&
            getFusionResult(type, lastResult) === target
        );

        for (const extra of possibleExtras) {
          if (usedMaterials.size >= 3) break; // 限制额外材料数量

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
      }
      return;
    }

    // 尝试两两合成
    for (let i = 0; i < rest.length - 1; i++) {
      for (let j = i + 1; j < rest.length; j++) {
        const type1 = rest[i];
        const type2 = rest[j];
        const result = getFusionResult(type1, type2);

        if (result === -1) continue; // 无效合成

        const newStep: FusionStep = {
          material1: type1,
          material2: type2,
          result,
        };

        // 准备下一轮递归的材料列表
        const newRest = [
          ...rest.filter((item) => item !== type1 && item !== type2),
          result,
        ];

        dfs(newRest, [...currentSteps, newStep], usedMaterials);
      }
    }
  };

  // 开始搜索
  dfs(materials, [], new Set());
  return results.sort(
    (a, b) => a.extraMaterials.length - b.extraMaterials.length
  );
}

export function getArcanaName(type: number): string {
  const arcana = ARCANA_LIST.find((item) => item.type === type);
  return arcana ? arcana.name : "未知";
}
