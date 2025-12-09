//代理加快查看图片的速度
export function proxySupabaseUrl(url: string) {
  return url.replace(
    "https://ifrctixzjfnynncamthq.supabase.co/",
    "https://bitter-bonus-6641.2801672379.workers.dev/"
  );
}
