import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { v4 as uuidv4 } from 'uuid';
import { useUser } from "@/components/user/UserProvider";
import { toast } from 'sonner';

const SUPABASE_BUCKET_NAME = "images"; 
const supabase = createClient();

export const useFileUploader = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);

    //获取userId
    const { userId, loading } = useUser();

    const uploadFileToSupabase = useCallback(async (file: File): Promise<string | null> => {
        console.log("进入上传图片函数：", userId, loading);
        if (loading) {
            toast.warning("会话初始化中...", { 
                description: "请等待页面加载完成后再尝试上传。",
                duration: 3000
            });
            console.warn("UserProvider 仍在加载中，无法执行上传。");
            return null;
        }


        // 确保用户已登录 (或已匿名登录)
        if (!userId) {
            toast.error("操作失败", { 
                description: "服务器连接异常，请尝试刷新页面后重试。",
                duration: 5000 // 保持显示 5 秒
            });
            console.error("用户 ID 不存在，无法执行上传。");
            return null;
        }

        console.log("上传图片:",userId);


        setIsUploading(true);
        setUploadError(null);
        setUploadProgress(0);

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${uuidv4()}-${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;
            const { data, error } = await supabase.storage
                .from(SUPABASE_BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });
            
            console.log(data, error);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from(SUPABASE_BUCKET_NAME)
                .getPublicUrl(data!.path);
            
            return publicUrlData.publicUrl;

        } catch (error) {
            console.error("Supabase 上传失败:", error);
            setUploadError("图片上传失败。");
            return null;
        } finally {
            setIsUploading(false);
            setUploadProgress(100);
        }
    }, [userId,loading]);

    return {
        isUploading,
        uploadProgress,
        uploadError,
        uploadFileToSupabase,
        setUploadError
    };
};