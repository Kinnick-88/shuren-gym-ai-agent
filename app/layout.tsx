import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "树人健身房 AI 会员服务智能体",
  description: "浙江树人学院杨汛桥校区健身房会员申请、反馈和管理员审核系统。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
