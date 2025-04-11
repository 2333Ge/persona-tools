"use client";

import { FloatButton } from "antd";
import { MenuOutlined, GithubOutlined } from "@ant-design/icons";
import { ReactNode, useState } from "react";

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

const FloatMenuButton = (props: {
  extraBtns?: { icon: ReactNode; href: string }[];
}) => {
  const { extraBtns } = props;

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
      {extraBtns?.map((item) => {
        return (
          <LinkFloatButton key={item.href} icon={item.icon} href={item.href} />
        );
      })}
      <LinkFloatButton
        icon={<GithubOutlined />}
        href="https://github.com/2333Ge/persona-tools"
      />
    </FloatButton.Group>
  );
};

export default FloatMenuButton;
