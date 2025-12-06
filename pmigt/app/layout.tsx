import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// AuthProvider 组件
import { AuthProvider } from "@/components/user/AuthProvider"; 
// 侧边导航栏
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from "sonner";
import { UserProvider } from "@/components/user/UserProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "图灵",
  description: "智能电商助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <UserProvider>
            <Sidebar />
            <div className="ml-20 min-h-screen bg-[#f0f2f5]"> 
                {children}
            </div>
            {/* 渲染警告组件 */}
            <Toaster 
                position="top-right" // 右上角警告
                richColors 
            />
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}