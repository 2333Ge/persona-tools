"use client";

import FloatMenuButton from "@/components/float-menu-button";
import Fusion from "@/components/fusion-tools";
import LevelCounter from "@/components/level-counter";
import { getLocalPath } from "@/utils/config";
import { LinkOutlined } from "@ant-design/icons";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center ">
      <div className="flex flex-col gap-8 lg:flex-row w-full items-center justify-center lg:px-40">
        <Fusion className="lg:max-h-screen overflow-y-auto flex-1" />
        <LevelCounter className="lg:max-h-screen overflow-y-auto flex-1" />
      </div>
      <FloatMenuButton
        extraBtns={[
          {
            icon: <LinkOutlined />,
            href: getLocalPath("/friend-links"),
          },
        ]}
      />
    </div>
  );
}
