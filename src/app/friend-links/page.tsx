"use client";

import FloatMenuButton from "@/components/float-menu-button";
import { Card, Typography, Space } from "antd";
import { HomeOutlined, LinkOutlined } from "@ant-design/icons";
import { getLocalPath } from "@/utils/config";
import { motion } from "framer-motion";

const { Title, Link } = Typography;

const links = [
  {
    title: "P5合成范式",
    description: "B站P5R Wiki的P5R合成范式详细说明",
    url: "https://wiki.biligame.com/persona/P5R/%E5%90%88%E6%88%90%E8%8C%83%E5%BC%8F",
  },
  {
    title: "P5技能列表",
    description: "B站Wiki的P5R技能详细说明",
    url: "https://wiki.biligame.com/persona/P5R%E6%8A%80%E8%83%BD%E5%88%97%E8%A1%A8",
  },
  {
    title: "面具合成与宝魔升降法",
    description: "B站：蒙奇·D·瓦西里的详细教程",
    url: "https://www.bilibili.com/opus/722047078518226960",
  },
  {
    title: "社区工具",
    description: "社区制作的P5R合成合成工具",
    url: "https://zonizuka.github.io/p5r-fusion",
  },
];

export default function FriendLinks() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Title level={2} className="text-center mb-12">
          友情链接
        </Title>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link, index) => (
            <motion.div
              key={link.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={link.url}>
                <Card
                  hoverable
                  className="h-full transition-all duration-300 hover:shadow-lg"
                >
                  <Space className="w-full" direction="vertical">
                    <div className="flex items-center gap-2">
                      <LinkOutlined className="text-blue-500" />
                      <Title level={4} className="m-0">
                        {link.title}
                      </Title>
                    </div>
                    <p className="text-gray-500">{link.description}</p>
                  </Space>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <FloatMenuButton
        extraBtns={[
          {
            icon: <HomeOutlined />,
            href: getLocalPath("/"),
          },
        ]}
      />
    </div>
  );
}
