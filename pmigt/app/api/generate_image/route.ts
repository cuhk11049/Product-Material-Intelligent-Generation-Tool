// app/api/generate-image/route.ts
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; 
import { getModelEndpointId } from '@/src/types/model';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const client = new OpenAI({
  apiKey: process.env.VOLC_API_KEY,
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

export const maxDuration = 300;

export async function POST(req: Request) {
  try {

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("【来源】Cookie 解析结果:", user ? `✅ 成功 (ID: ${user.id})` : "❌ 失败 (无用户)");

    // 如果没拿到 user，直接拦截
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }
    
    // 使用这个真实的 ID 替换之前的 userId 参数
    const userId = user.id;

    // 接收前端传来的参数
    const { saveImageUrl, contextImageUrl, isRegenerate, deleteMessageId, styleImageUrl, userPrompt, sessionId, modelId } = await req.json();
    
    const backendEndpointId = getModelEndpointId(modelId);

    if (!backendEndpointId) {
        // 如果找不到对应的后端 ID，返回错误
        return NextResponse.json(
            { success: false, error: `Invalid model configuration for ID: ${modelId}` }, 
            { status: 400 }
        );
    }

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          name: "图片合成任务", // 给新会话起个默认名字
        })
        .select()
        .single();
      
      if (sessionError) throw new Error("创建会话失败: " + sessionError.message);
      currentSessionId = session.id;
    }

    if (!isRegenerate) {
      await supabase.from('messages').insert({
        session_id: currentSessionId,
        user_id: userId,
        role: 'user',
        content: userPrompt,
        image_url: saveImageUrl
      });
    }

    if (isRegenerate && deleteMessageId) {
      await supabase.from('messages').delete().eq('id', deleteMessageId);
    }


    const imageGenerationPrompt = `
    #role
    你是一位资深电商视觉设计师，精通产品合成与商业海报设计。

    #task
    利用【图1】的商品主体和【图2】的视觉风格，结合用户描述，合成一张高品质的电商海报。
    
    #图片生成要求
    1. 主体层 (绝对保留)：
      - 提取【图1】中的商品主体，保持其原始轮廓、材质、透视和细节完全不变。
      - 商品必须位于画面的视觉中心或黄金分割点。

    2. 背景层 (风格迁移)：
      - 风格来源：严格提取【图2】的色调板、光影方向和构图几何感。
      - 内容重构：严禁出现【图2】中的任何具体物体（如原本的瓶子、道具等）。
      - 融合度：确保背景的光影能够合理地投射在【图1】的商品上，使其看起来自然融合，非简单贴图。

    3. 装饰层 (Decoration - 氛围贴纸)：
      - 在商品周围添加“标签式”或“浮层式”的氛围文案。
      - 文字内容：简体中文（约10字），字体风格需匹配背景氛围（如：清新、科技、国潮等）。
      - 样式：贴纸化设计，边缘清晰，不遮挡商品主体。

    #限制
    - 禁止改变图1商品的任何物理属性（变形、变色）。
    - 禁止直接复制图2的任何实体道具。
    - 背景图仅供参考，实际图片背景需要根据用户指令进行调整

    # User Description
    ${userPrompt}
    `;

    const imageResponse = await client.images.generate({
      model: backendEndpointId, 
      prompt: imageGenerationPrompt,
      size: "2048x2048",
      response_format: "url",
      image: [contextImageUrl, styleImageUrl],
      watermark: false,
      sequential_image_generation: "disabled",
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    }as any);

    const tempImageUrl = imageResponse.data?.[0]?.url;

    if (!tempImageUrl) {
        throw new Error("模型未返回图片 URL");
    }

    console.log("图片生成成功，正在下载并添加水印...", tempImageUrl);

    const fetchRes = await fetch(tempImageUrl);
    if (!fetchRes.ok) throw new Error("下载生成图片失败");
    const originalArrayBuffer = await fetchRes.arrayBuffer();
    const originalBuffer = Buffer.from(originalArrayBuffer);

    const contentType = fetchRes.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpeg';

    //使用 Sharp 添加水印 
    let finalBuffer: Buffer;
    
    try {
      // 1. 确定字体路径
      const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansSC-Bold.ttf');
      
      // 检查文件是否存在
      if (!fs.existsSync(fontPath)) {
         console.error(`❌ 字体文件未找到，路径: ${fontPath}`);
         throw new Error("Font file missing");
      }

      const image = sharp(originalBuffer);
      const metadata = await image.metadata();
      const width = metadata.width || 2048;
      
      // 2. 计算字体大小
      // Pango 的 size 属性单位是 "1/1024 点"，所以我们需要把像素值 * 1024
      const fontSizePx = Math.floor(width * 0.03); 
      const pangoSize = fontSizePx * 1024; 
      const watermarkText = "抖音电商前端训练营";

      // 3. 执行合成
      finalBuffer = await image
        .composite([
          {
            input: {
              text: {
                // 【关键修复 1】颜色必须使用 Hex 格式 (#RRGGBBAA)，Pango 不支持 rgba() 函数
                // #FFFFFFCC -> 白色 (FFFFFF) + 80%透明度 (CC)
                // 【关键修复 2】直接在 span 里指定 size，避免外部冲突
                text: `<span foreground="#FFFFFFCC" size="${pangoSize}">${watermarkText}</span>`,
                
                fontfile: fontPath,     // 强制加载字体文件
                font: 'Noto Sans SC',   // 字体族名（作为后备）
                
                width: Math.floor(width * 0.8), // 文本容器宽度
                align: 'right',         // 文字右对齐
                rgba: true              // 允许 alpha 通道
              }
            },
            gravity: 'southeast', // 放在右下角
          },
        ])
        .toBuffer();
        
       console.log("✅ 水印添加成功");

    } catch (processError) {
       console.error("❌ 水印添加失败，详细错误:", processError);
       finalBuffer = originalBuffer; 
    }



    const fileName = `images/${userId}/${Date.now()}_generated.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('generated_files') 
      .upload(fileName, finalBuffer, { 
        contentType: contentType,
        upsert: false
    });

    if (uploadError) {
      console.error("Supabase 上传失败:", uploadError);
      throw new Error("图片转存失败");
    }

    const { data: { publicUrl: finalPermanentUrl } } = supabase.storage
      .from('generated_files')
      .getPublicUrl(fileName);

    console.log("图片已转存:", finalPermanentUrl);



    const { data: assistantMessage} = await supabase
      .from('messages')
      .insert({
        session_id: currentSessionId,
        user_id: userId,
        role: 'assistant',
        content: JSON.stringify({ note: "图片已生成" }),
        image_url: finalPermanentUrl
      })
      .select('id')
      .single();

    return NextResponse.json({ 
        success: true, 
        imageUrl: finalPermanentUrl,
        sessionId: currentSessionId,
        messageId: assistantMessage?.id 
    });

  } catch (error: unknown) {
    console.error("画图 API 出错:", error);
    
    let errorMessage = "生成失败";
    if (error instanceof Error) errorMessage = error.message;

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}