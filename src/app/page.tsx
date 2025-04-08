"use client";

import { useState } from "react";
import { Button, Select, Card, Empty } from "antd";
import { ARCANA_LIST } from "@/constant/tarot";
import { findFusionPaths, getArcanaName } from "@/utils/tarot";
import { FusionPath } from "@/types/tarot";
import Fusion from "@/components/Fusion";
import LevelCounter from "@/components/LevelCounter";

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
      <div className="flex flex-col gap-8 max-w-2xl px-4 w-full py-4">
        <Fusion />
        <LevelCounter />
      </div>
    </main>
  );
}
