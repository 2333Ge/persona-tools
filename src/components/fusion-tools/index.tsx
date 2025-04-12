"use client";

import { useState } from "react";
import { Card, Empty, Row, Select, Button, Descriptions } from "antd";
import { ARCANA_LIST, CUSTOM_ARCANA_LIST } from "@/constant/tarot";
import { findFusionPaths, getArcanaName } from "@/utils/tarot";
import { FusionPath, ITarot } from "@/types/tarot";
import { cn } from "@/utils/style";
import FusionItem from "./FusionItem";

const arcanaTypes = Array.from(CUSTOM_ARCANA_LIST.keys());
const formatArcana = (arcana: ITarot) => (
  <>
    {arcana.name}
    <span className="text-gray-500 text-xs">
      ({arcana.typeName}Lv.{arcana.level})
    </span>
  </>
);

type FusionProps = {
  className?: string;
};

const EMPTY_TAROT: ITarot = {
  typeName: "愚者",
  name: "亚森",
  level: "1",
};

export default function Fusion({ className }: FusionProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<ITarot[]>([
    EMPTY_TAROT,
  ]);
  const [targetPersona, setTargetPersona] = useState<ITarot>(EMPTY_TAROT);
  const [fusionResults, setFusionResults] = useState<FusionPath[]>([]);

  const isNotChoose =
    !targetPersona ||
    selectedMaterials.length < 1 ||
    selectedMaterials.some((item) => !item.name) ||
    !targetPersona.name;

  const handleConfirm = () => {
    if (isNotChoose) return;

    const paths = findFusionPaths(selectedMaterials, targetPersona);
    setFusionResults(paths);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-8 max-w-2xl px-4 w-full py-4",
        className
      )}
    >
      <Card title="二体处刑（合成）计算器" className="w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label>选择基础素材（1-6个）：</label>
            {selectedMaterials.map((item, index) => {
              return (
                <FusionItem
                  key={index}
                  material={item}
                  arcanaTypes={arcanaTypes}
                  onMaterialChange={(material) => {
                    setSelectedMaterials((prev) => {
                      const newMaterials = [...prev];
                      newMaterials[index] = material;
                      return newMaterials;
                    });
                  }}
                  onDelete={() => {
                    const newMaterials = [...selectedMaterials];
                    newMaterials.splice(index, 1);
                    setSelectedMaterials(newMaterials);
                  }}
                  showDelete={selectedMaterials.length > 1}
                />
              );
            })}
            {selectedMaterials.length < 6 && (
              <Button
                type="dashed"
                onClick={() => {
                  setSelectedMaterials((prev) => [...prev, EMPTY_TAROT]);
                }}
              >
                添加素材
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label>选择目标结果：</label>
            <FusionItem
              material={targetPersona}
              arcanaTypes={arcanaTypes}
              onMaterialChange={(material) => {
                setTargetPersona(material);
              }}
              showDelete={false}
            />
          </div>

          <Button
            type="primary"
            onClick={handleConfirm}
            disabled={isNotChoose || selectedMaterials.length > 5}
            className="mt-4"
          >
            计算合成路径
          </Button>
        </div>
      </Card>

      <Card title="合成路径" className="w-full">
        {fusionResults?.length > 0 ? (
          <div className="flex flex-col gap-4">
            {fusionResults.map((result, index) => (
              <Card key={index} type="inner" title={`方案 ${index + 1}`}>
                <Descriptions column={1}>
                  {result.steps.map((step, stepIndex) => (
                    <Descriptions.Item
                      key={stepIndex}
                      label={`步骤 ${stepIndex + 1}`}
                    >
                      <div>
                        {formatArcana(step.material1)} +{" "}
                        {formatArcana(step.material2)} ={" "}
                        {formatArcana(step.result)}
                      </div>
                    </Descriptions.Item>
                  ))}
                  {result.extraMaterials.length > 0 && (
                    <Descriptions.Item label="额外材料">
                      <div>
                        {result.extraMaterials.map((material, index) => (
                          <span key={index}>
                            {formatArcana(material)}
                            {index < result.extraMaterials.length - 1 && "、"}
                          </span>
                        ))}
                      </div>
                    </Descriptions.Item>
                  )}
                  {!!result.specialChange && (
                    <Descriptions.Item label="宝魔升降">
                      <span
                        className={
                          result.specialChange > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {result.specialChange > 0 ? "+" : ""}
                        {result.specialChange}
                      </span>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            ))}
          </div>
        ) : (
          <Empty description="暂无合成路径" />
        )}
      </Card>
    </div>
  );
}
