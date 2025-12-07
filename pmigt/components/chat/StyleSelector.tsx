import React from 'react';
import { PRESET_STYLES, StyleOption } from '@/src/constants/styles';

interface StyleSelectorProps {
  selectedStyleId: string;
  onSelect: (style: StyleOption) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyleId, onSelect }) => {
  return (
    <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <label className="text-m font-semibold text-gray-500 uppercase tracking-wider">
          请选择生成风格
        </label>
        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {PRESET_STYLES.find(s => s.id === selectedStyleId)?.name || '未选择'}
        </span>
      </div>
      
      {/* 横向滚动容器，适应移动端和窄屏 */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {PRESET_STYLES.map((style) => {
          const isSelected = selectedStyleId === style.id;
          
          return (
            <div
              key={style.id}
              onClick={() => onSelect(style)}
              className={`
                relative flex-shrink-0 w-24 cursor-pointer group
                rounded-lg overflow-hidden border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-600 ring-2 ring-blue-100 scale-105 shadow-md' 
                  : 'border-transparent hover:border-gray-200 hover:scale-105'
                }
              `}
            >
              {/* 图片 */}
              <div className="aspect-square relative bg-gray-100">
                <img 
                  src={style.imageUrl} 
                  alt={style.name} 
                  className={`
                    object-cover w-full h-full transition-opacity
                    ${isSelected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}
                  `}
                />
                
                {/* 选中时的打钩图标 */}
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-blue-600 text-white rounded-full p-1 shadow-sm">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* 文字标签 */}
              <div className={`
                py-1.5 text-[10px] text-center font-medium truncate px-1 transition-colors
                ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 group-hover:bg-gray-100'}
              `}>
                {style.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}