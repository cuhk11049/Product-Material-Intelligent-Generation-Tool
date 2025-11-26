//消息框
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { UIMessage } from '@/src/types/index';

interface ChatMessageListProps {
    messages: UIMessage[];
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
    // TODO: 考虑添加一个 `useEffect` 来自动滚动到底部
    return (
        <ScrollArea className="flex-1 p-6 bg-white">
            <div className="space-y-6 max-w-4xl mx-auto w-full">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${
                            msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-md whitespace-pre-wrap break-words ${
                                msg.sender === "user"
                                    ? "bg-gradient-to-r from-[#ff004f] to-[#2d5bff] text-white rounded-br-none" 
                                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                            }`}
                        >
                            {/* 渲染图片(若存在) */}
                            {msg.imageUrl && (
                                <div className="mb-2">
                                    <img
                                        src={msg.imageUrl}
                                        alt="发送的图片"
                                        className="rounded-lg max-w-full h-auto object-cover max-h-64"
                                    />
                                </div>
                            )}
                            {/* 渲染文字 */}
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};