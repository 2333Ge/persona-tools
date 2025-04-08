import {
  SPECIAL_LEVEL_CHANGE_TABLE,
  SPECIAL_ARCANA_LIST,
} from "@/constant/tarot";
import { LevelResult } from "@/types/tarot";

/**
 * 查找可能的升降级组合
 * @param arcanaType 当前arcana的type
 * @param isUpgrade true表示升级,false表示降级
 * @returns 所有可能的组合，按变化幅度排序
 */
export function findLevelCombinations(
  arcanaType: number,
  isUpgrade: boolean
): LevelResult[] {
  const results: LevelResult[] = [];

  // 在第一行找到当前arcana的列索引
  const colIndex = SPECIAL_LEVEL_CHANGE_TABLE[0].indexOf(arcanaType);
  if (colIndex === -1) return results;

  // 遍历每一行(跳过第一行的表头)
  for (
    let rowIndex = 1;
    rowIndex < SPECIAL_LEVEL_CHANGE_TABLE.length;
    rowIndex++
  ) {
    // 获取special arcana的类型(第一列)
    const specialArcanaType = SPECIAL_LEVEL_CHANGE_TABLE[rowIndex][0];

    // 获取升降级数值
    const levelChange = SPECIAL_LEVEL_CHANGE_TABLE[rowIndex][colIndex];

    // 根据升降级要求筛选
    if (isUpgrade && levelChange > 0) {
      results.push({
        specialArcana: specialArcanaType,
        levelChange,
      });
    } else if (!isUpgrade && levelChange < 0) {
      results.push({
        specialArcana: specialArcanaType,
        levelChange,
      });
    }
  }

  // 按照等级排序
  results.sort((a, b) => a.specialArcana - b.specialArcana);

  return results;
}
