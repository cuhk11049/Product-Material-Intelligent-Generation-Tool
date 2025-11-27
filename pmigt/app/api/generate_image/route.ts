// app/api/generate-image/route.ts
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const client = new OpenAI({
  apiKey: process.env.VOLC_API_KEY,
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // 接收前端传来的参数
    const { productImageUrl, styleImageUrl,userPrompt} = await req.json();

    const imageGenerationPrompt = `
    你是一名电商师。
   【核心任务】：保留【图1】中的主体，为其生成背景。
   【风格参考】：借鉴【图2】的布局，颜色和光影，但绝对不要画出图2中的物体。
   【细节要求】：
   1. 主体必须是图一中的商品，不要改变其形状。
   2. 在图片周围添加简体中文氛围贴纸（约10字）。
   3. 用户描述：${userPrompt}
    `;

    console.log("--------------------------------");
    console.log("【调试】最终发送给 AI 的 Prompt:");
    console.log(imageGenerationPrompt);
    console.log("--------------------------------");

    const imageResponse = await client.images.generate({
      model: process.env.VOLC_IMAGE_ENDPOINT_ID!, 
      prompt: imageGenerationPrompt,
      size: "1024x1024",
      response_format: "url",
      image: [productImageUrl, styleImageUrl],
      watermark: true,
      sequential_image_generation: "disabled",
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    }as any);

    const generatedImageUrl = imageResponse.data?.[0]?.url;

    if (!generatedImageUrl) {
        throw new Error("模型未返回图片 URL");
    }

    return NextResponse.json({ 
        success: true, 
        imageUrl: generatedImageUrl 
    });

  } catch (error: unknown) {
    console.error("画图 API 出错:", error);
    
    let errorMessage = "生成失败";
    if (error instanceof Error) errorMessage = error.message;

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}