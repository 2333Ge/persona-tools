import { ARCANA_LIST, FUSION_TABLE } from "@/constant/tarot";
import { FusionPath, FusionStep } from "@/types/tarot";

/**
 * 得到type1和type2的合成结果
 */
export function getFusionResult(type1: number, type2: number): number {
  const key = type1 < type2 ? `${type1},${type2}` : `${type2},${type1}`;
  return FUSION_TABLE.get(key) ?? -1;
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

  // 辅助函数: 检查路径是否已尝试过
  const isTriedPath = (path: FusionStep[]) => {
    const key = path.map((p) => `${p.material1},${p.material2}`).join("|");
    if (tried.has(key)) return true;
    tried.add(key);
    return false;
  };

  // 辅助函数: 统计额外需要的素材
  const getExtraMaterials = (path: FusionStep[], baseMaterials: number[]) => {
    const used = new Map<number, number>(); // 记录每种素材使用次数

    // 统计基础素材数量
    baseMaterials.forEach((m) => {
      used.set(m, (used.get(m) || 0) + 1);
    });

    // 统计路径中使用的素材
    path.forEach((step) => {
      used.set(step.material1, (used.get(step.material1) || 0) - 1);
      used.set(step.material2, (used.get(step.material2) || 0) - 1);
    });

    // 收集额外需要的素材
    const extras: number[] = [];
    used.forEach((count, type) => {
      if (count < 0) {
        for (let i = 0; i < Math.abs(count); i++) {
          extras.push(type);
        }
      }
    });

    return extras;
  };

  const tryFusion = (
    currentMaterials: number[],
    path: FusionStep[],
    baseMaterials: number[]
  ) => {
    // 基本条件检查
    if (path.length > 5) return; // 限制合成步骤
    if (results.length >= 5) return; // 限制结果数量

    // 检查是否需要额外素材超过限制
    const extras = getExtraMaterials(path, baseMaterials);
    if (extras.length > 3) return;

    // 尝试两两合成
    for (let i = 0; i < currentMaterials.length; i++) {
      for (let j = i + 1; j < currentMaterials.length; j++) {
        const mat1 = currentMaterials[i];
        const mat2 = currentMaterials[j];
        const result = getFusionResult(mat1, mat2);

        if (result === -1) continue;

        const newPath = [...path, { material1: mat1, material2: mat2, result }];
        if (isTriedPath(newPath)) continue;

        // 如果达到目标
        if (result === target) {
          const extraMaterials = getExtraMaterials(newPath, baseMaterials);
          if (extraMaterials.length <= 3) {
            results.push({ steps: newPath, extraMaterials });
          }
          return;
        }

        // 继续尝试剩余材料
        const remainingMaterials = [
          ...currentMaterials.slice(0, i),
          ...currentMaterials.slice(i + 1, j),
          ...currentMaterials.slice(j + 1),
          result,
        ];
        tryFusion(remainingMaterials, newPath, baseMaterials);
      }
    }

    // 如果当前材料不够,尝试添加新素材
    if (currentMaterials.length < 2) {
      for (const arcana of ARCANA_LIST) {
        const newMat = arcana.type;
        if (extras.length >= 3) break; // 已经需要3个额外素材了
        tryFusion([...currentMaterials, newMat], path, baseMaterials);
      }
    }
  };

  // 开始搜索
  tryFusion([...materials], [], materials);
  return results;
}

export function getArcanaName(type: number): string {
  const arcana = ARCANA_LIST.find((item) => item.type === type);
  return arcana ? arcana.name : "未知";
}
