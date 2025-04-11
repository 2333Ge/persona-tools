"use client";

import { ConfigProvider, theme } from "antd";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // 检查系统颜色方案
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    // 监听系统颜色方案变化
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          // 金色主题
          colorPrimary: "#E6be5b", // 经典金色
          colorPrimaryHover: "#D4AF37", // 明亮金色
          colorPrimaryActive: "#996515", // 古铜金色
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
