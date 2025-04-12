import {
  ARCANA_LIST,
  CUSTOM_ARCANA_LIST,
  FUSION_TABLE,
  SPECIAL_ARCANA_LIST,
  SPECIAL_LEVEL_CHANGE_TABLE,
} from "@/constant/tarot";
import { FusionPath, FusionStep, ITarot } from "@/types/tarot";
import { randomSelect } from "./data-handle";

/**
 * 得到type1和type2的合成结果
 * @returns -1表示无法合成
 */
export function getFusionResultByType(type1: number, type2: number): number {
  const rowIndex = FUSION_TABLE[0].indexOf(type1);
  const colIndex = FUSION_TABLE.map((row) => row[0]).indexOf(type2);
  if (rowIndex === -1 || colIndex === -1) {
    throw new Error("Invalid type");
  }
  const key = FUSION_TABLE[rowIndex][colIndex];
  return key;
}

/**
 * 计算临时等级
 */
function calculateTempLevel(level1: string, level2: string): number {
  return Math.floor((Number(level1) + Number(level2)) / 2) + 1;
}

/**
 * 已知当前等级，求调整到目标等级调整的级别
 * @returns
 */
function getSpecialLevelChange(curTarot: ITarot, targetTarot: ITarot): number {
  const curType = getTypeByTypeName(curTarot.typeName);
  const targetType = getTypeByTypeName(targetTarot.typeName);

  // 1. 检查参数有效性
  if (curType !== targetType) throw new Error("类型不一致");
  const sortedPersonas = CUSTOM_ARCANA_LIST.get(curTarot.typeName)!.sort(
    (a, b) => Number(a.level) - Number(b.level)
  );

  const curIndex = sortedPersonas.findIndex(
    (item) => item.name === curTarot.name
  );

  const targetIndex = sortedPersonas.findIndex(
    (item) => item.name === targetTarot.name
  );

  const changeLevel = targetIndex - curIndex;

  return changeLevel;
}

/**
 * 获取指定类型中符合等级要求的 Persona
 */
function getPersonaByTypeAndLevel(
  type: number,
  tempLevel: number,
  isTypeSame: boolean,
  materials: ITarot[]
): ITarot | null {
  const arcana = ARCANA_LIST.find((item) => item.type === type);
  if (!arcana) return null;

  const personas = CUSTOM_ARCANA_LIST.get(arcana.name);
  if (!personas || personas.length === 0) return null;

  // 按等级排序
  const sortedPersonas = [...personas].sort(
    (a, b) => Number(b.level) - Number(a.level)
  );

  if (isTypeSame) {
    // 同属性：找到第一个比临时等级低的，且不在材料中的
    const validPersonas = sortedPersonas
      .filter((p) => !materials.some((m) => m.name === p.name)) // 过滤掉材料中的 Persona
      .filter((p) => Number(p.level) <= tempLevel); // 过滤出低于等于临时等级的

    return validPersonas[0] || null;
  } else {
    // 不同属性：找到第一个比临时等级高的
    const validPersonas = sortedPersonas.filter(
      (p) => Number(p.level) >= tempLevel
    );

    return validPersonas[validPersonas.length - 1] || null; // 返回第一个符合条件的
  }
}

export function getFusionResult(
  material1: ITarot,
  material2: ITarot
): ITarot | null {
  // 1. 获取两个素材的 type
  const type1 = getTypeByTypeName(material1.typeName);
  const type2 = getTypeByTypeName(material2.typeName);

  // 2. 计算最终的类型
  const resultType = getFusionResultByType(type1, type2);
  if (resultType === -1) return null; // 无法合成

  // 3. 计算临时等级
  const tempLevel = calculateTempLevel(material1.level, material2.level);

  // 4. 判断是否是同属性合成
  const isTypeSame = material1.typeName === material2.typeName;

  // 5. 获取符合条件的 Persona
  const resultPersona = getPersonaByTypeAndLevel(
    resultType,
    tempLevel,
    isTypeSame,
    [material1, material2]
  );

  // 6. 如果找不到合适的 Persona，返回无法合成
  if (!resultPersona) return null;

  return resultPersona;
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

// 常量配置
const MAX_RESULTS = 10;
const MAX_STEPS = 10;
const MAX_EXTRA_MATERIALS = 2;
const MAX_RANDOM_EXTRAS = 3;

/**
 * 通过 typeName 获取对应的 type
 */
function getTypeByTypeName(typeName: string): number {
  const arcana = ARCANA_LIST.find((item) => item.name === typeName);
  return arcana ? arcana.type : -1;
}

function getNearbyPersona(type: number, targetLevel: number): ITarot {
  const arcana = ARCANA_LIST.find((item) => item.type === type);
  if (!arcana) throw new Error("Invalid type");

  const personas = CUSTOM_ARCANA_LIST.get(arcana.name);
  if (!personas || personas.length === 0) throw new Error("No persona found");

  const sortedPersonas = [...personas].sort(
    (a, b) => Number(a.level) - Number(b.level)
  );

  const index = sortedPersonas.findIndex((p) => Number(p.level) >= targetLevel);

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

  const prevDiff = Math.abs(Number(prev.level) - targetLevel);
  const currDiff = Math.abs(Number(curr.level) - targetLevel);

  return prevDiff <= currDiff ? prev : curr;
}

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
          Number(lastResult.level) - 10
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
        Number(lastResult.level) - 10 // 合成等级一般比最终高，这里降点
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
  usedMaterials: Set<ITarot> // 改为 ITarot
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

export function getArcanaName(type: number): string {
  const arcana = ARCANA_LIST.find((item) => item.type === type);
  return arcana ? arcana.name : "未知";
}
