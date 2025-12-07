import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // 允许 Supabase 的图片
      },
      {
        protocol: 'https',
        hostname: '**.volces.com', // 允许火山引擎的图片
      },
      // 如果你的风格参考图放在其他图床，也要加在这里
    ],
  },
};

export default nextConfig;
