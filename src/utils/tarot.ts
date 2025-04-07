import { FUSION_TABLE } from "@/constant/tarot";

/**
 * 得到type1和type2的合成结果
 */
export function getFusionResult(type1: number, type2: number): number {
  const key = type1 < type2 ? `${type1},${type2}` : `${type2},${type1}`;
  return FUSION_TABLE.get(key) ?? -1;
}

// ...existing code...

interface FusionStep {
  material1: number;
  material2: number;
  result: number;
}

interface FusionPath {
  steps: FusionStep[];
  extraMaterials: number[];
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
  const maxExtraMaterials = 4;
  const visited = new Set<string>();

  // 验证初始条件
  if (materials.length < 2 || materials.length > 6) {
    return [];
  }

  function backtrack(
    current: number[], // 当前可用的素材
    unused: number[], // 未使用的基础素材
    path: FusionStep[], // 当前合成路径
    extras: number[], // 额外添加的素材
    depth: number // 递归深度防止无限递归
  ) {
    // 剪枝条件
    if (extras.length > maxExtraMaterials || depth > 10) {
      return;
    }

    // 生成当前状态的唯一标识，用于防止重复搜索
    const stateKey = `${current.sort().join(",")}|${unused.sort().join(",")}`;
    if (visited.has(stateKey)) {
      return;
    }
    visited.add(stateKey);

    // 检查是否达到目标
    if (current.length === 1 && current[0] === target && unused.length === 0) {
      results.push({
        steps: [...path],
        extraMaterials: [...extras],
      });
      return;
    }

    // 1. 优先尝试合成已有素材
    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        const result = getFusionResult(current[i], current[j]);
        if (result !== -1) {
          const newCurrent = [
            ...current.slice(0, i),
            ...current.slice(i + 1, j),
            ...current.slice(j + 1),
            result,
          ];

          backtrack(
            newCurrent,
            unused,
            [...path, { material1: current[i], material2: current[j], result }],
            extras,
            depth + 1
          );
        }
      }
    }

    // 2. 如果还有未使用的基础素材，尝试加入
    if (unused.length > 0) {
      const material = unused[0];
      const newUnused = unused.slice(1);
      backtrack([...current, material], newUnused, path, extras, depth + 1);
    }

    // 3. 尝试添加一个额外素材（当其他方法都尝试过后）
    if (extras.length < maxExtraMaterials) {
      for (let type = 0; type < 23; type++) {
        if (
          !extras.includes(type) &&
          !current.includes(type) &&
          !unused.includes(type)
        ) {
          backtrack(
            [...current, type],
            unused,
            path,
            [...extras, type],
            depth + 1
          );
        }
      }
    }
  }

  // 开始搜索
  backtrack([], [...materials], [], [], 0);

  // 按额外素材数量排序并限制返回数量
  return results
    .sort((a, b) => a.extraMaterials.length - b.extraMaterials.length)
    .slice(0, 5);
}

/**
 * 格式化合成路径为可读字符串
 */
export function formatFusionPath(path: FusionPath): string {
  const { steps, extraMaterials } = path;
  let result = `需要额外素材: ${extraMaterials.join(", ")}\n合成步骤:\n`;

  steps.forEach((step, index) => {
    result += `${index + 1}. ${step.material1} + ${step.material2} = ${
      step.result
    }\n`;
  });

  return result;
}
