"use client";

import { useState } from "react";
import { Button, Select, Card, Empty } from "antd";
import { ARCANA_LIST } from "@/constant/tarot";
import { findFusionPaths, getArcanaName } from "@/utils/tarot";
import { FusionPath } from "@/types/tarot";

export default function Home() {
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [targetType, setTargetType] = useState<number>();
  const [fusionResults, setFusionResults] = useState<FusionPath[]>([]);

  const isNotChoose =
    targetType === undefined || selectedMaterials.length === 0;

  const handleConfirm = () => {
    if (isNotChoose) return;

    const paths = findFusionPaths(selectedMaterials, targetType);
    setFusionResults(paths);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col gap-8 max-w-2xl px-4 w-full">
        <Card title="二体处刑（合成）计算器" className="w-full">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label>选择基础素材（2-6个）：</label>
              <Select
                mode="multiple"
                placeholder="请选择基础素材"
                value={selectedMaterials}
                onChange={setSelectedMaterials}
                maxTagCount={6}
                options={ARCANA_LIST.map((item) => ({
                  label: `${item.name} (${item.type})`,
                  value: item.type,
                }))}
                className="w-full"
                maxTagTextLength={10}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label>选择目标结果：</label>
              <Select
                placeholder="请选择目标塔罗牌"
                value={targetType}
                onChange={setTargetType}
                options={ARCANA_LIST.map((item) => ({
                  label: `${item.name} (${item.type})`,
                  value: item.type,
                }))}
                className="w-full"
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
          {fusionResults.length > 0 ? (
            <div className="flex flex-col gap-4">
              {fusionResults.map((result, index) => (
                <Card key={index} type="inner" title={`方案 ${index + 1}`}>
                  <div className="whitespace-pre-wrap">
                    {result.steps.map((step, stepIndex) => {
                      return (
                        <div key={stepIndex}>
                          步骤 {stepIndex + 1}: {getArcanaName(step.material1)}{" "}
                          + {getArcanaName(step.material2)} ={" "}
                          {getArcanaName(step.result)}
                        </div>
                      );
                    })}
                    {result.extraMaterials.length > 0 && (
                      <div className="mt-2">
                        额外材料:{" "}
                        {result.extraMaterials
                          .map(
                            (type) =>
                              ARCANA_LIST.find((item) => item.type === type)
                                ?.name || type
                          )
                          .join(", ")}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="暂无合成路径" />
          )}
        </Card>
      </div>
    </main>
  );
}
