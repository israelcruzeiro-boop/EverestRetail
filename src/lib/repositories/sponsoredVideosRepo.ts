import { supabase } from '../supabase';
import { getSaoPauloDate } from '../format';

export interface SponsoredVideo {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url?: string;
    sponsor_url?: string;
    reward: number;
    daily_limit: number;
    sponsor_name: string;
    active: boolean;
    created_at: string;
}

export const sponsoredVideosRepo = {
    /**
     * Busca todos os vídeos patrocinados ativos (para o Marketplace).
     */
    async getActiveVideos(): Promise<SponsoredVideo[]> {
        const { data, error } = await supabase
            .from('sponsored_videos')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar vídeos patrocinados:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Busca todos os vídeos (para o Admin).
     */
    async listVideosAdmin(): Promise<SponsoredVideo[]> {
        const { data, error } = await supabase
            .from('sponsored_videos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao listar vídeos para admin:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Cria um novo vídeo patrocinado.
     */
    async createVideo(video: Partial<SponsoredVideo>): Promise<SponsoredVideo | null> {
        // Remover campos que não devem ser enviados no insert
        const { id, created_at, ...payload } = video as any;

        const { data, error } = await supabase
            .from('sponsored_videos')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar vídeo:', error);
            throw error;
        }

        return data;
    },

    /**
     * Atualiza um vídeo existente.
     */
    async updateVideo(id: string, updates: Partial<SponsoredVideo>): Promise<SponsoredVideo | null> {
        // Remover campos que não devem ser atualizados diretamente
        const { id: _id, created_at, updated_at, ...payload } = updates as any;

        const { data, error } = await supabase
            .from('sponsored_videos')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar vídeo:', error);
            throw error;
        }

        return data;
    },

    /**
     * Exclui um vídeo.
     */
    async deleteVideo(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('sponsored_videos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir vídeo:', error);
            throw error;
        }

        return true;
    },

    /**
     * Registra a conclusão de um vídeo e solicita a recompensa.
     * @param videoId ID do vídeo assistido
     * @param watchedSeconds Segundos assistidos
     */
    async completeVideo(videoId: string, watchedSeconds: number): Promise<number | null> {
        try {
            const { data, error } = await supabase.rpc('complete_sponsored_video', {
                p_video_id: videoId,
                p_watched_seconds: watchedSeconds
            });

            if (error) {
                console.error('Erro ao completar vídeo patrocinado:', error);
                return null;
            }

            return data?.balance ?? null; // Retorna o saldo extraído do JSONB record
        } catch (err) {
            console.error('Erro inesperado ao completar vídeo:', err);
            return null;
        }
    },

    /**
     * Verifica se o usuário já completou o vídeo hoje.
     */
    async checkTodayCompletion(videoId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('video_views')
            .select('id')
            .eq('profile_id', user.id)
            .eq('video_id', videoId)
            .eq('view_date', getSaoPauloDate())
            .eq('rewarded', true)
            .maybeSingle();

        if (error) {
            console.error('Erro ao verificar conclusão hoje:', error);
            return false;
        }

        return !!data;
    },

    /**
     * Retorna uma lista de IDs de vídeos que o usuário já completou hoje.
     */
    async getTodayCompletedIds(): Promise<Set<string>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return new Set();

            const { data, error } = await supabase
                .from('video_views')
                .select('video_id')
                .eq('profile_id', user.id)
                .eq('view_date', getSaoPauloDate())
                .eq('rewarded', true);

            if (error) {
                console.error('Erro ao buscar vídeos concluídos hoje:', error.message);
                return new Set();
            }

            const completedSet = new Set((data || []).map(v => v.video_id));
            console.log(`[getTodayCompletedIds] Data SP: ${getSaoPauloDate()}, Concluídos: ${completedSet.size}`);

            return completedSet;
        } catch (err: any) {
            console.error('Erro fatal em getTodayCompletedIds:', err.message || err);
            return new Set();
        }
    },

    /**
     * Retorna a contagem de visualizações de hoje agrupada por vídeo.
     */
    async getTodayCompletionsCount(): Promise<Record<string, number>> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return {};

        const { data, error } = await supabase
            .from('video_views')
            .select('video_id')
            .eq('profile_id', user.id)
            .eq('view_date', getSaoPauloDate())
            .eq('rewarded', true);

        if (error) {
            console.error('Erro ao buscar contagem de vídeos concluídos hoje:', error);
            return {};
        }

        const counts: Record<string, number> = {};
        (data || []).forEach(v => {
            counts[v.video_id] = (counts[v.video_id] || 0) + 1;
        });

        return counts;
    }
};
