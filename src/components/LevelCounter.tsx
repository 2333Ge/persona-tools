"use client";

import { useState } from "react";
import { Button, Select, Card, Empty, Radio, Table } from "antd";
import { ARCANA_LIST, SPECIAL_ARCANA_LIST } from "@/constant/tarot";
import { findLevelCombinations } from "@/utils/level";
import { LevelResult } from "@/types/tarot";
import { ColumnsType } from "antd/es/table";
import { cn } from "@/utils/style";

type LevelProps = {
  className?: string;
};

export default function Level({ className }: LevelProps) {
  // 升降级工具的状态
  const [currentArcana, setCurrentArcana] = useState<number>();
  const [isUpgrade, setIsUpgrade] = useState<boolean>(true);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);

  const handleLevelChange = () => {
    if (currentArcana === undefined) return;
    const results = findLevelCombinations(currentArcana, isUpgrade);
    setLevelResults(results);
  };

  const columns: ColumnsType<LevelResult> = [
    {
      title: "序号",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: "宝魔",
      dataIndex: "specialArcana",
      key: "specialArcana",
      render: (value) =>
        SPECIAL_ARCANA_LIST.find((item) => item.type === value)?.name || "未知",
    },
    {
      title: "变化幅度",
      dataIndex: "levelChange",
      key: "levelChange",
      render: (value) => (
        <span className={value > 0 ? "text-green-600" : "text-red-600"}>
          {value > 0 ? "+" : ""}
          {value} 级
        </span>
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-8 max-w-2xl px-4 w-full py-4",
        className
      )}
    >
      <Card title="宝魔升降级计算器" className="w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label>选择当前塔罗牌：</label>
            <Select
              placeholder="请选择塔罗牌"
              value={currentArcana}
              onChange={setCurrentArcana}
              options={ARCANA_LIST.map((item) => ({
                label: item.name,
                value: item.type,
              }))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>选择变化方向：</label>
            <Radio.Group
              value={isUpgrade}
              onChange={(e) => setIsUpgrade(e.target.value)}
              className="flex gap-4"
            >
              <Radio value={true}>升级</Radio>
              <Radio value={false}>降级</Radio>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            onClick={handleLevelChange}
            disabled={currentArcana === undefined}
            className="mt-4"
          >
            计算{isUpgrade ? "升级" : "降级"}方案
          </Button>
        </div>
      </Card>

      <Card title="宝魔升降级方案" className="w-full">
        {levelResults.length > 0 ? (
          <Table
            columns={columns}
            dataSource={levelResults}
            pagination={false}
            rowKey={(record) => record.specialArcana}
            size="small"
          />
        ) : (
          <Empty description="暂无升降级方案" />
        )}
      </Card>
    </div>
  );
}
