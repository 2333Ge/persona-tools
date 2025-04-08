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
  let materialsPaths: number[][][] = [];
  let path: number[][] = [];

  // 第一步，合成到只剩一个结果
  const dfs = (rest: number[]) => {
    if (rest.length === 1) {
      materialsPaths.push([...path]);
      return;
    }

    for (let i = 0; i < rest.length - 1; i++) {
      for (let j = i + 1; j < rest.length; j++) {
        const type1 = rest[i];
        const type2 = rest[j];
        const result = getFusionResult(type1, type2);
        path.push([type1, type2]);

        const newRest = rest.filter((_, index) => index !== i && index !== j);
        newRest.push(result);
        dfs(newRest);
        path.pop(); // 回溯，移除最后一步
      }
    }
  };

  dfs(materials);

  console.log("materialsPaths====>", materialsPaths);

  const middleFusionResult: FusionPath[] = [];
  // 将结果转换为FusionStep格式
  for (let i = 0; i < materialsPaths.length; i++) {
    const path = materialsPaths[i];
    const fusionSteps: FusionStep[] = path.map((step) => {
      const type1 = step[0];
      const type2 = step[1];
      const result = getFusionResult(type1, type2);
      return { material1: type1, material2: type2, result };
    });
    middleFusionResult.push({ steps: fusionSteps, extraMaterials: [] });
  }

  console.log("middleFusionResult====>", middleFusionResult);

  const finalFusionResult: FusionPath[] = [];

  // 第二步，合成到目标结果
  for (let i = 0; i < middleFusionResult.length; i++) {
    const path = middleFusionResult[i];
    const lastResult = path.steps[path.steps.length - 1].result;
    console.log("getLast====>", getArcanaName(lastResult));
    if (lastResult !== target) {
      // 如果最后一步的结果不是目标结果，则利用当前的结果继续合成，额外材料可从所有塔罗牌中任意选取

      const extraMaterials = ARCANA_LIST.map((arcana) => arcana.type).filter(
        (type) => getFusionResult(type, lastResult) === target
      );

      if (extraMaterials.length) {
        console.log("extraMaterials====>", extraMaterials);
      }

      finalFusionResult.push(
        ...extraMaterials.map((extraMaterial) => {
          return {
            steps: [
              ...path.steps,
              {
                material1: lastResult,
                material2: extraMaterial,
                result: target,
              },
            ],
            extraMaterials: [extraMaterial],
          } satisfies FusionPath;
        })
      );
    } else {
      finalFusionResult.push(path);
    }
  }

  return finalFusionResult;
}

export function getArcanaName(type: number): string {
  const arcana = ARCANA_LIST.find((item) => item.type === type);
  return arcana ? arcana.name : "未知";
}
