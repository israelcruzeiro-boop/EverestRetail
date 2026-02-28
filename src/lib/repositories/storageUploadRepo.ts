import { supabase } from '@/lib/supabase';
import { isValidImageFile } from '@/lib/image';

type Bucket = 'product-images' | 'partner-uploads';

interface UploadResult {
    url: string;
    path: string;
}

/**
 * Repositório de upload de imagens.
 * Faz upload para Supabase Storage e retorna a URL pública.
 * Se o Supabase não estiver disponível, converte para data URL (fallback).
 */
export const storageUploadRepo = {
    /**
     * Upload de um arquivo para o Supabase Storage.
     * @param file Arquivo a ser enviado
     * @param bucket Nome do bucket
     * @param folder Subpasta dentro do bucket (ex: "hero", "logo", "gallery")
     * @returns URL pública do arquivo
     */
    async uploadFile(file: File, bucket: Bucket, folder?: string): Promise<UploadResult> {
        // Validação
        const check = isValidImageFile(file);
        if (!check.valid) throw new Error(check.error);

        // Fallback: sem Supabase, converte para data URL
        if (!supabase) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({ url: reader.result as string, path: '' });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        // Nome único: timestamp + nome original sanitizado
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = folder
            ? `${folder}/${Date.now()}_${safeName}`
            : `${Date.now()}_${safeName}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw new Error(`Erro no upload: ${error.message}`);

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

        return {
            url: urlData.publicUrl,
            path: filePath
        };
    },

    /**
     * Upload de imagem de produto (admin).
     * Organiza em subpastas: hero/, logo/, gallery/
     */
    async uploadProductImage(file: File, type: 'hero' | 'logo' | 'gallery' | 'highlights' | 'videocasts'): Promise<string> {
        const result = await this.uploadFile(file, 'product-images', type);
        return result.url;
    },

    /**
     * Upload de imagem de solicitação/parceiro (usuário).
     * Organiza por user ID para isolamento.
     */
    async uploadPartnerImage(file: File, folder?: string): Promise<string> {
        if (!supabase) {
            const result = await this.uploadFile(file, 'partner-uploads');
            return result.url;
        }

        const userId = (await supabase.auth.getUser()).data.user?.id;
        const subFolder = folder ? `${userId}/${folder}` : userId || 'anonymous';
        const result = await this.uploadFile(file, 'partner-uploads', subFolder);
        return result.url;
    },

    /**
     * Deleta um arquivo do storage.
     */
    async deleteFile(bucket: Bucket, path: string): Promise<void> {
        if (!supabase || !path) return;
        await supabase.storage.from(bucket).remove([path]);
    }
};
