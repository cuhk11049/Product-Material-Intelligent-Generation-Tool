/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export interface MasonryImage {
  src: string;
  title: string;
  tag?: string;
}

interface InspirationMasonryProps {
  images?: MasonryImage[];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  className?: string;
  cols?: { base?: number; md?: number; lg?: number };
  animated?: boolean;
}

const defaultImages: MasonryImage[] = [
  { src: "https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/dc54282d68708b0a27147d954ddd0994.jpg", title: "风格图 1", tag: "Square" },
  { src: "https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/bb88cb6f8d324123018fb941b29a6c2b.jpg", title: "风格图 2", tag: "Square" },
  { src: "https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/9c96f7655eb510cb0f3dacf155f1c6f8.jpg", title: "风格图 3", tag: "Square" },
  { src: "https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/97a75002e7700018f36132bf7e548235.jpg", title: "风格图 4", tag: "Square" },
  { src: "https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/7f770bcea09abb3398870244e69b400a.jpg", title: "风格图 5", tag: "Square" },
  { src: "https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/05eda5fe3ba2550c29544e55f5db01b3.jpg", title: "风格图 6", tag: "Square" },
  { src: "https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/02301808c60a7e03b9ba8736e36fca5a.jpg", title: "风格图 7", tag: "Square" },
  { src: "https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/00b9f61eb2d6326f7c8d0d681eff9559.jpg", title: "风格图 8", tag: "Square" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
};

const InspirationMasonry: React.FC<InspirationMasonryProps> = ({
  images = defaultImages,
  title = "发现即时灵感",
  subtitle,
  showHeader = true,
  className,
  cols = { base: 2, md: 3, lg: 4 },
  animated = true,
}) => {
  const gridCols = clsx(
    cols.base === 1 ? "grid-cols-1" : cols.base === 2 ? "grid-cols-2" : cols.base === 3 ? "grid-cols-3" : "grid-cols-4",
    cols.md === 1 ? "md:grid-cols-1" : cols.md === 2 ? "md:grid-cols-2" : cols.md === 3 ? "md:grid-cols-3" : "md:grid-cols-4",
    cols.lg === 1 ? "lg:grid-cols-1" : cols.lg === 2 ? "lg:grid-cols-2" : cols.lg === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
  );

  const Section: any = animated ? motion.section : 'section';
  const HeaderH2: any = animated ? motion.h2 : 'h2';
  const Grid: any = animated ? motion.div : 'div';
  const Card: any = animated ? motion.article : 'article';

  return (
    <Section
      className={clsx("w-full max-w-7xl mx-auto px-4 sm:px-6", className)}
      {...(animated ? { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.2 } } : {})}
      variants={containerVariants}
    >
      {showHeader && (
        <div className="mb-8">
          <HeaderH2
            className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600"
            {...(animated ? { initial: { opacity: 0, y: 10 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.5 } } : {})}
          >
            {title}
          </HeaderH2>
          {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
        </div>
      )}

      <Grid className={clsx("grid gap-6", gridCols)} variants={containerVariants}>
        {images.map((item) => (
          <Card
            key={item.src}
            className={clsx(
              "group relative rounded-2xl overflow-hidden",
              "bg-white/80 backdrop-blur-sm border border-white/60",
              "shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_40px_rgba(45,91,255,0.18)]",
              "hover:[box-shadow:0_0_0_1px_rgba(99,102,241,0.35),0_18px_40px_rgba(99,102,241,0.15)]"
            )}
            variants={cardVariants}
            whileHover={animated ? { scale: 1.01 } : undefined}
          >
            <div className="relative w-full aspect-square">
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 ring-1 ring-black/5" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />

              {/* 闪光扫过 */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                <div className="absolute -inset-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_1.2s_ease-in-out]" />
              </div>
            </div>

          </Card>
        ))}
      </Grid>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-120%) skewX(-12deg); }
          100% { transform: translateX(220%) skewX(-12deg); }
        }
      `}</style>
    </Section>
  );
};

export default InspirationMasonry;