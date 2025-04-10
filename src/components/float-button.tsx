"use client";

import { FloatButton } from "antd";
import { MenuOutlined, HomeOutlined, GithubOutlined } from "@ant-design/icons";
import { useState } from "react";

const LinkFloatButton = ({
  icon,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}) => {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      onClick={onClick}
      style={{ display: "block" }}
    >
      <FloatButton icon={icon} />
    </a>
  );
};

const FloatMenuButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <FloatButton.Group
      trigger="click"
      type="default"
      style={{ right: 24 }}
      icon={<MenuOutlined />}
      open={open}
      onOpenChange={setOpen}
    >
      {/* <LinkFloatButton
        icon={<HomeOutlined />}
        href="/"
        onClick={() => {
          // 处理导航
        }}
      /> */}
      <LinkFloatButton
        icon={<GithubOutlined />}
        href="https://github.com/2333Ge/persona-tools"
      />
    </FloatButton.Group>
  );
};

export default FloatMenuButton;
