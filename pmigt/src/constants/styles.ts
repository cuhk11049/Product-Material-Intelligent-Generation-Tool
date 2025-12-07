// src/constants/styles.ts

export interface StyleOption {
  id: string;
  name: string;
  imageUrl: string; // 风格参考图的 URL (必须是公网链接)
  description?: string;
}

export const PRESET_STYLES: StyleOption[] = [
  {
    id: 'fresh_nature',
    name: '清新自然',
    imageUrl: 'https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/02301808c60a7e03b9ba8736e36fca5a.jpg', 
    description: '绿色调，植物元素，清爽洁净'
  },
  {
    id: 'luxury_gold',
    name: '黑金轻奢',
    imageUrl: 'https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/9c96f7655eb510cb0f3dacf155f1c6f8.jpg',
    description: '黑色背景，金色流光，高端质感'
  },
  {
    id: 'warm_home',
    name: '温馨家居',
    imageUrl: 'https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/00b9f61eb2d6326f7c8d0d681eff9559.jpg',
    description: '暖米色调，生活场景，烟火气'
  },
  {
    id: 'festive_promo',
    name: '节日大促',
    imageUrl: 'https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/97a75002e7700018f36132bf7e548235.jpg',
    description: '红色背景，喜庆氛围，强营销感'
  },
  {
    id: 'modern_tech',
    name: '现代科技',
    imageUrl: 'https://ifrctixzjfnynncamthq.supabase.co/storage/v1/object/public/images/styleImages/7f770bcea09abb3398870244e69b400a.jpg',
    description: '渐变背景，简约几何，数码极客'
  }
];

// 默认风格
export const DEFAULT_STYLE = PRESET_STYLES[0];