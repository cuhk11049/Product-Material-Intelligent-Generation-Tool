import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { AIContent } from '@/src/types';
import { createClient } from '@/utils/supabase/server'; 

const client = new OpenAI({
  apiKey: process.env.VOLC_API_KEY,
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});


export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // 2. 初始化 Supabase 客户端 (带 Cookie 的)
    const supabase = await createClient();

    // 3. 从 Cookie 获取真实用户信息 
    // 这比 req.json().userId 可靠
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 如果没拿到 user，直接拦截
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }
    
    // 使用这个真实的 ID 替换之前的 userId 参数
    const userId = user.id;

    console.log("准备写入数据库的 UserID:", userId); 

    // 4. 解析 Body：去掉了 userId 的解构，因为上面已经拿到了
    const { imageUrl, userPrompt, sessionId: clientSessionId } = await req.json();

    let currentSessionId = clientSessionId;

    // 如果前端没传 sessionId，说明是“新建会话”
    if (!currentSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: userId, // 存入数据库的是这个“真身”ID
          name: userPrompt.slice(0, 10) || "新商品素材",
        })
        .select()
        .single();
      
      if (sessionError) throw new Error("创建会话失败: " + sessionError.message);
      currentSessionId = session.id;
    }

    // 存入用户消息
    await supabase.from('messages').insert({
      session_id: currentSessionId,
      user_id: userId,
      role: 'user',
      content: userPrompt,
      image_url: imageUrl
    });

    const targetModel = process.env.VOLC_ENDPOINT_ID!; 
    const systemPrompt = `
    你是一位资深电商运营专家。请根据用户提供的商品信息（图片或文字描述），生成结构化素材。
    
    严格遵守 JSON 格式返回：
    {
      "title": "商品标题(15-30字)",
      "selling_points": ["卖点1", "卖点2", "卖点3"], 
      "atmosphere": "氛围文案",
    }
    不要使用markdown。
    `;

    const response = await client.chat.completions.create({
      model: targetModel,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: userPrompt || "生成电商素材" },
          ],
        },
      ],
      temperature: 0.5,
    });

    const aiRawText = response.choices[0].message.content;
    let parsedData: Partial<AIContent> & Record<string,unknown> = {};
    
    try {
      const cleanJson = aiRawText?.replace(/```json|```/g, '').trim();
      parsedData = JSON.parse(cleanJson || '{}');
    } catch { 
      console.log("JSON 解析失败");
    }

    // 数据清洗
    let cleanSellingPoints: string[] = [];
    const rawPoints = parsedData.selling_points;

    if (Array.isArray(rawPoints)) {
      cleanSellingPoints = rawPoints.map(String);
    } else if (typeof rawPoints === 'string') {
      cleanSellingPoints = [rawPoints];
    } else {
      cleanSellingPoints = ["卖点提取中..."];
    }

    const finalData: AIContent = {
      title: parsedData.title || "生成标题失败",
      selling_points: cleanSellingPoints,
      atmosphere: parsedData.atmosphere || "氛围感生成中...",
    };

    // 5. 存入 AI 消息：同样使用 userId
    await supabase.from('messages').insert({
      session_id: currentSessionId,
      user_id: userId,
      role: 'assistant',
      content: JSON.stringify(finalData),
    });

    return NextResponse.json({
      success: true,
      data: finalData,
      sessionId: currentSessionId 
    });

  } catch (error: unknown) { 
    console.error("API 调用出错:", error);
     let errorMessage = "未知错误";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}