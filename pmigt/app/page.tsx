"use client";

import { useState, useCallback, useRef,useEffect } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInputArea } from "@/components/chat/ChatInputArea";
import { createClient } from '@/utils/supabase/client'; 

import { UIMessage, UISession } from '@/src/types/index'


// 导入 Hook 和常量
import { useFileUploader } from "@/hooks/useFileUploader"; 

// 会话列表模拟
const DUMMY_SESSIONS = [
  { id: 's1', name: '图片素材生成 (1)', isActive: true },
  { id: 's2', name: '电商宣传文案 (2)', isActive: false },
  { id: 's3', name: '周报总结草稿 (3)', isActive: false },
];

export default function HomePage() {
  const supabase = createClient();
  const [authStatus, setAuthStatus] = useState('Initializing...');

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 上传和会话状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  // 当前会话中使用的图片 URL 
  const [currentSessionImageUrl, setCurrentSessionImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 会话列表
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sessions, setSessions] = useState<UISession[]>(DUMMY_SESSIONS);
  // 当前用户正在查看的会话ID
  const [activeSessionId, setActiveSessionId] = useState<string>('s1');
  // 创建新会话
  const [sessionCounter, setSessionCounter] = useState<number>(DUMMY_SESSIONS.length + 1);
  
  //整合 Hook
  const { 
    isUploading, 
    uploadProgress, 
    uploadError, 
    uploadFileToSupabase,
    setUploadError
  } = useFileUploader(); 

  useEffect(() => {
    const ensureUserSession = async () => {
      // 检查当前会话
      const { data: { user } } = await supabase.auth.getUser();
      console.log("用户：", user);
      
      if (!user) {
        setAuthStatus("Session not found, attempting anonymous sign-in...");
        // 自动创建新用户 (匿名登录)
        const { data, error } = await supabase.auth.signInAnonymously();
        console.log("创建新用户：", data);
        if (error) {
          setAuthStatus(`Anonymous sign-in failed: ${error.message}`);
          console.error("Anonymous Sign-in Error:", error);
        } else if (data.user) {
          setAuthStatus(`Anonymous sign-in successful. UID: ${data.user.id.substring(0, 8)}...`);
        }
      } else {
        setAuthStatus(`Session exists. UID: ${user.id.substring(0, 8)}...`);
      }
    };
    
    // 确保这只在客户端运行
    if (typeof window !== 'undefined') {
      ensureUserSession();
    }
  }, [supabase]);

  // 清除已选择的文件
  const clearFile = useCallback(() => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl); 
    }
    setUploadedFile(null);
    setFilePreviewUrl(null);
    setUploadError(null); // 清空 Hook 内部错误
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  }, [filePreviewUrl, setUploadError]);


  // 统一处理文件选择和拖放
  const handleFileDropOrSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("只支持图片文件。");
      return;
    }
    clearFile();
    setUploadedFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
  }, [clearFile]);

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDropOrSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [handleFileDropOrSelect]);

  // 文件选择按钮处理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileDropOrSelect(file);
    }
  };

  // 新建会话处理
  const handleNewSession = useCallback(() => {
    const newId = `temp-${sessionCounter}`;
    const newSession: UISession = {
      id: newId,
      name: `新对话 ${sessionCounter}`, // 默认名称
    };

    // 将新会话添加到列表最前面
    setSessions(prevSessions => [newSession, ...prevSessions]);
    // 自动切换到新创建的会话
    setActiveSessionId(newId);
    // 增加计数器
    setSessionCounter(prevCounter => prevCounter + 1);
    // 模拟新建对话
    console.log('--- 新建对话被点击，已创建会话 ID:', newId);
  }, [sessionCounter]);

  // 会话切换处理
  const handleSessionChange = useCallback((id: string) => {
    // 更新当前激活的会话 ID
    setActiveSessionId(id);
    //模拟
    console.log(`切换到会话: ${id}`);
  }, []);


  // 发送请求
  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (isLoading || isUploading) return;

    console.log("authStatus:",authStatus);
    // 确保认证已完成
    if (authStatus.startsWith('Initializing') || authStatus.startsWith('❌')) {
      setMessages((prev) => [...prev, { text: " 认证会话正在初始化或已失败，请稍候再试。", sender: "ai" }]);
      return;
    }
    
    //用局部变量effectiveImageUrl保存当前会话最新商品图
    let effectiveImageUrl = currentSessionImageUrl;

    // 确定最终发送的图片 URL (优先级：新上传文件 -> 会话图 )
    // 如果有新文件，则先上传，并获取 URL
    if (uploadedFile) {
      const newUrl = await uploadFileToSupabase(uploadedFile);
      if (!newUrl) {
        setMessages((prev) => [...prev, { text: "图片上传失败，请重试。", sender: "ai" }]);
        return;
      } // 上传失败，终止发送
      effectiveImageUrl = newUrl;//更新图片
      setCurrentSessionImageUrl(newUrl);//更新全局会话状态
    }

    // 若当前会话未上传过图片，拦截请求
    if (!effectiveImageUrl) {
      const errorMsg: UIMessage = {
        text: "当前会话需要一张商品参考图，请先上传一张商品图片。",
        sender: "ai"
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    // 立即显示用户消息
    const userMessage: UIMessage = { 
      text: trimmedInput, 
      sender: "user",
      imageUrl: uploadedFile ? effectiveImageUrl : undefined
    };
    setMessages((prev) => [...prev, userMessage]);


    // 启动加载状态并更新图片会话状态
    setIsLoading(true);
    setInput("");
    clearFile(); // 清除本地文件预览状态


    try {
      // 调用后端 API，发送历史和图片 URL
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: effectiveImageUrl, 
          userPrompt: trimmedInput,
          // // 发送历史消息 (用于多轮上下文)
          // history: messagesRef.current.map(msg => ({ sender: msg.sender, text: msg.text }))
        }),
      });
      
      const result = await response.json();
      let aiResponse: UIMessage;

      if (result.success) {
        const data = result.data;
        const responseText = `
          素材生成成功！
          标题：${data.title}
          卖点：${data.selling_points.join(' | ')}
          氛围：${data.atmosphere}
          (您可以继续输入指令进行修正。)
        `;
        aiResponse = { text: responseText, sender: "ai"};
      } else {
        aiResponse = {
          text: `服务错误：${result.error || '无法获取生成结果'}`,
          sender: "ai"
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("API调用失败：", error);
      const errorMsg: UIMessage = {
        text: "网络连接失败，请检查服务状态。",
        sender:"ai"
      }
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isUploading, uploadedFile, currentSessionImageUrl, clearFile, uploadFileToSupabase, messages]); 
  
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatLayout 
      sessions={sessions}
      currentUserName="您的用户ID/昵称" // 实际应从认证状态获取
      onSessionChange={handleSessionChange}
      onNewSession={handleNewSession}
      activeSessionId={activeSessionId}
        >
        {/* 聊天消息列表 */}
        <ChatMessageList messages={messages} />

        {/* 输入和上传区域 */}
        <ChatInputArea
            // 状态
            input={input}
            isLoading={isLoading}
            isUploading={isUploading}
            uploadedFile={uploadedFile}
            filePreviewUrl={filePreviewUrl}
            currentSessionImageUrl={currentSessionImageUrl}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            isDragging={isDragging}
            authStatus={authStatus}
            
            // Handlers
            setInput={setInput}
            handleSend={handleSend}
            handleFileChange={handleFileChange}
            handleKeyDown={handleKeyDown}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            clearFile={clearFile}
            
            // Refs
            fileInputRef={fileInputRef}
        />
    </ChatLayout>
  );
}