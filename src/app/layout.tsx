import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils/style";
import { BASE_PATH } from "@/utils/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "女神异闻录工具",
  description: "女神异闻录工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-cn">
      <body>
        <main className={cn(inter.className, "relative bg-background")}>
          <div className="w-1/2 md:w-80 fixed right-4 bottom-4 z-[-1] flex flex-col gap-4 items-center justify-center opacity-30">
            <img
              src={`${BASE_PATH}/images/p5-1.png`}
              alt="Background Bottom"
              className="w-4/5 h-auto object-contain opacity-80"
            />
            <img
              src={`${BASE_PATH}/images/p5-2.png`}
              alt="Background Top"
              className="w-full h-auto object-contain opacity-80"
            />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
