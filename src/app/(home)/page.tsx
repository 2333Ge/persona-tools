"use client";

import Fusion from "@/components/fusion";
import LevelCounter from "@/components/level-counter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center ">
      <div className="flex flex-col gap-8 lg:flex-row w-full items-center justify-center lg:px-40">
        <Fusion className="lg:max-h-screen overflow-y-auto flex-1" />
        <LevelCounter className="lg:max-h-screen overflow-y-auto flex-1" />
      </div>
    </div>
  );
}
