'use client';

import React from "react";
import { ChevronDown } from 'lucide-react'; 
// 导入 shadcn/ui 组件
import { Button } from '@/components/ui/button'; 
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 导入模型定义
import { ModelId, AppModel } from '@/src/types/model'; 

export interface ModelSelectorProps {
    value: ModelId; 
    onChange: (modelId: ModelId) => void;
    models: AppModel[]; 
    disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange, models ,disabled}) => {
    
    // 查找当前选中的模型的名称
    const selectedModel = models.find(m => m.id === value);

    // 处理菜单项点击
    const handleSelect = (modelId: ModelId) => {
        if (disabled) return;
        onChange(modelId);
        console.log("切换到模型：", modelId);
    };

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={disabled}>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-[200px] justify-between text-left font-medium rounded-xl h-9 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}"
                    >
                        {/* 显示当前选中的模型名称 */}
                        <span className="truncate pr-2">
                            {selectedModel ? selectedModel.name : '选择模型'}
                        </span>
                        
                        {/* 下拉箭头图标 */}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-[200px] rounded-xl">
                    {models.map((m) =>
                        m.endpoint ? (
                            <DropdownMenuItem 
                                key={m.id}
                                onSelect={() => handleSelect(m.id)}
                                className={`cursor-pointer ${m.id === value ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium">{m.name}</span>
                                    <span className="text-xs text-gray-500 truncate">{m.description}</span> 
                                </div>
                            </DropdownMenuItem>
                        ) : null
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};