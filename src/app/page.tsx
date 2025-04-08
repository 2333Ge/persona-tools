"use client";

import Fusion from "@/components/Fusion";
import LevelCounter from "@/components/LevelCounter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col gap-8 lg:flex-row w-full items-center justify-center ">
        <Fusion className="lg:max-h-screen overflow-y-auto flex-1" />
        <LevelCounter className="lg:max-h-screen overflow-y-auto flex-1" />
      </div>
    </main>
  );
}
