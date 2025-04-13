import {
  ARCANA_LIST,
  CUSTOM_ARCANA_LIST,
  FUSION_TABLE,
} from "@/constant/tarot";
import { ITarot } from "@/types/tarot";

/**
 * 查找面具类型名
 * @param type
 * @returns
 */
export function getArcanaTypeName(type: number): string {
  const arcana = ARCANA_LIST.find((item) => item.type === type);
  return arcana ? arcana.name : "未知";
}

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
 * 通过 typeName 获取对应的 type
 */
export function getTypeByTypeName(typeName: string): number {
  const arcana = ARCANA_LIST.find((item) => item.name === typeName);
  return arcana ? arcana.type : -1;
}

/**
 * 计算临时等级
 */
function calculateTempLevel(level1: string, level2: string): number {
  return Math.floor((Number(level1) + Number(level2)) / 2) + 1;
}

/**
 * 两两尝试合成
 * @param material1
 * @param material2
 * @returns
 */
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
  if (material1.name === material2.name) return null; // 同素材无法合成

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

/**
 * 已知当前等级，求调整到目标等级调整的级别
 * @returns
 */ export function getSpecialLevelChange(
  curTarot: ITarot,
  targetTarot: ITarot
): number {
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
