import {
  ARCANA_LIST,
  CUSTOM_ARCANA_LIST,
  FUSION_TABLE,
} from "@/constant/tarot";
import { FusionPath, FusionStep, ITarot } from "@/types/tarot";
import { randomSelect } from "./data-handle";
import {
  getArcanaTypeName,
  getFusionResultByType,
  getTypeByTypeName,
  getFusionResult,
  getSpecialLevelChange, 
} from "./tarot";

// 常量配置
const MAX_RESULTS = 10;
const MAX_STEPS = 10;
const MAX_EXTRA_MATERIALS = 2;
const MAX_RANDOM_EXTRAS = 3;

/**
 * 查找合成路径
 */
export function findFusionPaths(
  materials: ITarot[],
  target: ITarot
): FusionPath[] {
  const results: FusionPath[] = [];

  // 处理直接合成到目标的情况
  const handleDirectFusion = (
    lastResult: ITarot,
    currentSteps: FusionStep[],
    usedMaterials: Set<ITarot>
  ): boolean => {
    const possibleExtraTypes = findPossibleDirectMaterials(
      getTypeByTypeName(lastResult.typeName),
      getTypeByTypeName(target.typeName),
      new Set(
        Array.from(usedMaterials).map((m) => getTypeByTypeName(m.typeName))
      )
    );

    if (possibleExtraTypes.length === 0) return false;

    let found = false;

    for (const extra of possibleExtraTypes) {
      if (usedMaterials.size >= MAX_EXTRA_MATERIALS) break;

      const extraPersona = getMaterial(lastResult, target, extra);
      if (extraPersona === null) continue;
      found = true;
      const finalStep: FusionStep = {
        material1: lastResult,
        material2: extraPersona,
        result: target,
      };

      results.push({
        steps: [...currentSteps, finalStep],
        extraMaterials: [...Array.from(usedMaterials), extraPersona],
      });
    }

    if (!found) {
      for (const extra of possibleExtraTypes) {
        const material2 = getNearbyPersona(
          extra,
          Number(target.level),
          Number(lastResult.level)
        );
        const result = getFusionResult(lastResult, material2);
        if (!result) continue;
        const finalStep: FusionStep = {
          material1: lastResult,
          material2: material2,
          result: result,
        };
        results.push({
          steps: [...currentSteps, finalStep],
          extraMaterials: [...Array.from(usedMaterials), material2],
          specialChange: getSpecialLevelChange(result, target),
        });
      }
    }
    return true;
  };

  // 处理间接合成到目标的情况
  const handleIndirectFusion = (
    lastResult: ITarot,
    currentSteps: FusionStep[],
    usedMaterials: Set<ITarot>
  ): void => {
    const possibleExtraTypes = randomSelect(
      findPossibleIndirectMaterials(
        getTypeByTypeName(lastResult.typeName),
        getTypeByTypeName(target.typeName)
      ),
      MAX_RANDOM_EXTRAS
    );

    for (const extra of possibleExtraTypes) {
      const extraPersona = getNearbyPersona(
        extra,
        Number(target.level),
        Number(lastResult.level)
      );
      const result = getFusionResult(lastResult, extraPersona);
      if (!result) continue;

      dfs(
        [result],
        [
          ...currentSteps,
          {
            material1: lastResult,
            material2: extraPersona,
            result,
          },
        ],
        new Set([...Array.from(usedMaterials), extraPersona])
      );
    }
  };

  // 递归搜索合成路径
  const dfs = (
    rest: ITarot[],
    currentSteps: FusionStep[],
    usedMaterials: Set<ITarot>
  ): void => {
    // 剪枝条件
    if (shouldPrune(results.length, currentSteps.length, usedMaterials.size))
      return;

    // 处理单个结果的情况
    if (rest.length === 1) {
      const lastResult = rest[0];

      if (
        lastResult.name === target.name &&
        lastResult.level === target.level
      ) {
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

  if (materials.length) {
    // 开始搜索
    dfs(materials, [], new Set());
  } 
  else {
    // 无初始素材时使用基础二体合成
    results.push(...findBasicFusions(target));
  }

  return results.sort(
    (a, b) => a.extraMaterials.length - b.extraMaterials.length
  );
}

/**
 * 已知素材一和目标结果，以及素材二的类型要求，求素材二
 * @param cur 当前素材
 * @param target 目标结果
 * @param materialType 素材二的类型
 * @returns 返回合适的素材二，如果无法合成返回 null
 */
const getMaterial = (
  cur: ITarot,
  target: ITarot,
  materialType: number
): ITarot | null => {
  // 1. 检查参数有效性
  const curType = getTypeByTypeName(cur.typeName);
  const targetType = getTypeByTypeName(target.typeName);

  // 2. 检查是否可以合成目标
  const fusionResult = getFusionResultByType(curType, materialType);
  if (fusionResult !== targetType) {
    return null;
  }

  // 3. 获取指定类型的所有 Persona
  const arcana = ARCANA_LIST.find((item) => item.type === materialType);
  if (!arcana) return null;

  const personas = CUSTOM_ARCANA_LIST.get(arcana.name);
  if (!personas || personas.length === 0) return null;

  // 4. 尝试每个可能的素材，直到找到一个可以合成目标的
  for (const persona of personas) {
    const result = getFusionResult(cur, persona);
    if (
      result &&
      result.typeName === target.typeName &&
      result.name === target.name
    ) {
      return persona;
    }
  }

  return null;
};

function getNearbyPersona(
  type: number,
  targetLevel: number,
  lastResultLevel: number
): ITarot {
  const arcana = ARCANA_LIST.find((item) => item.type === type);
  if (!arcana) throw new Error("Invalid type");

  const materialLevel = Math.floor(targetLevel - 1) * 2 - lastResultLevel; // 计算目标等级

  const personas = CUSTOM_ARCANA_LIST.get(arcana.name);
  if (!personas || personas.length === 0) throw new Error("No persona found");

  const sortedPersonas = [...personas].sort(
    (a, b) => Number(a.level) - Number(b.level)
  );

  const index = sortedPersonas.findIndex(
    (p) => Number(p.level) >= materialLevel
  );

  if (index === -1) {
    // 如果所有素材等级都小于目标等级，返回最高等级的
    return sortedPersonas[sortedPersonas.length - 1];
  }

  if (index === 0) {
    // 如果所有素材等级都大于目标等级，返回最低等级的
    return sortedPersonas[0];
  }

  // 比较前后两个素材哪个更接近目标等级
  const prev = sortedPersonas[index - 1];
  const curr = sortedPersonas[index];

  const prevDiff = Math.abs(Number(prev.level) - materialLevel);
  const currDiff = Math.abs(Number(curr.level) - materialLevel);

  return prevDiff <= currDiff ? prev : curr;
}

// 辅助函数，减枝
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
  usedTypes: Set<number>
): number[] {
  return ARCANA_LIST.map((arcana) => arcana.type).filter(
    (type) =>
      !usedTypes.has(type) && getFusionResultByType(type, current) === target
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
      getFusionResultByType(type, current) !== -1
  );
}

function addValidPath(
  results: FusionPath[],
  steps: FusionStep[],
  usedMaterials: Set<ITarot>
): void {
  results.push({
    steps: steps,
    extraMaterials: Array.from(usedMaterials),
  });
}

function tryPairFusions(
  materials: ITarot[],
  currentSteps: FusionStep[],
  usedMaterials: Set<ITarot>,
  dfsCallback: (rest: ITarot[], steps: FusionStep[], used: Set<ITarot>) => void
): void {
  for (let i = 0; i < materials.length - 1; i++) {
    for (let j = i + 1; j < materials.length; j++) {
      const result = getFusionResult(materials[i], materials[j]);
      if (!result) continue;

      const newStep: FusionStep = {
        material1: materials[i],
        material2: materials[j],
        result: result,
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

/**
 * 查找基础的二体合成路径（无初始素材）
 */
function findBasicFusions(target: ITarot): FusionPath[] {
  const allResults: (FusionPath & { score: number })[] = [];
  const targetType = getTypeByTypeName(target.typeName);
  const targetLevel = Number(target.level);

  // 1. 找出所有可能的合成类型对，避免重复组合
  const possiblePairs: [number, number][] = [];
  ARCANA_LIST.forEach((type1, i) => {
    ARCANA_LIST.forEach((type2, j) => {
      // 只处理 i <= j 的情况，避免重复
      if (
        i <= j &&
        getFusionResultByType(type1.type, type2.type) === targetType
      ) {
        possiblePairs.push([type1.type, type2.type]);
      }
    });
  });

  // 2. 收集所有可能的合成组合
  for (const [type1, type2] of possiblePairs) {
    const personas1 = CUSTOM_ARCANA_LIST.get(getArcanaTypeName(type1)) || [];
    const personas2 = CUSTOM_ARCANA_LIST.get(getArcanaTypeName(type2)) || [];

    for (const p1 of personas1) {
      for (const p2 of personas2) {
        // 同类型时只处理一种顺序
        if (type1 === type2 && p1.name > p2.name) continue;

        const result = getFusionResult(p1, p2);
        if (result && result.name === target.name) {
          allResults.push({
            steps: [
              {
                material1: p1,
                material2: p2,
                result: target,
              },
            ],
            extraMaterials: [],
            score: calculateScore(p1, p2, target),
          });
        }
      }
    }
  }

  // 3. 根据优先级排序
  const sortedResults = allResults.sort((a, b) => b.score - a.score);

  return sortedResults.slice(0, MAX_RESULTS);
}

/**
 * 计算合成组合的得分
 * 分数越高优先级越高
 */
function calculateScore(p1: ITarot, p2: ITarot, target: ITarot): number {
  const isDifferentType = p1.typeName !== p2.typeName;
  const targetLevel = Number(target.level);
  const p1Level = Number(p1.level);
  const p2Level = Number(p2.level);
  const bothLowerLevel = p1Level < targetLevel && p2Level < targetLevel;

  // 优先级评分
  let score = 0;

  // 最优先：不同类型且都低于目标等级
  if (isDifferentType && bothLowerLevel) {
    score += 1000;
  }
  // 其次：不同类型
  else if (isDifferentType) {
    score += 500;
  }
  // 最后：相同类型
  else {
    score += 100;
  }

  // 在同一优先级内，等级差距越小越好
  const levelDiff =
    Math.abs(p1Level - targetLevel) + Math.abs(p2Level - targetLevel);
  score -= levelDiff;

  return score;
}
