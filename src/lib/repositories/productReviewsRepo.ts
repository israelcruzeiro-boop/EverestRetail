import { supabase } from '../supabase';
import { ProductReview, ProductHire } from '@/types/admin';

export const productReviewsRepo = {
    /**
     * Registra uma nova contratação de produto.
     */
    async recordHire(productId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('product_hires')
            .upsert({
                profile_id: user.id,
                product_id: productId,
                hired_at: new Date().toISOString()
            }, { onConflict: 'profile_id, product_id' });

        if (error) {
            console.error('Erro ao registrar contratação:', error);
            return false;
        }

        return true;
    },

    /**
     * Verifica se o usuário logado contratou o produto.
     */
    async checkUserHired(productId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('product_hires')
            .select('id')
            .eq('profile_id', user.id)
            .eq('product_id', productId)
            .maybeSingle();

        if (error) {
            console.error('Erro ao verificar contratação:', error);
            return false;
        }

        return !!data;
    },

    /**
     * Verifica se o usuário logado já avaliou o produto.
     */
    async checkUserReviewed(productId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('product_reviews')
            .select('id')
            .eq('profile_id', user.id)
            .eq('product_id', productId)
            .maybeSingle();

        if (error) {
            console.error('Erro ao verificar avaliação do usuário:', error);
            return false;
        }

        return !!data;
    },

    /**
     * Busca as avaliações de um produto.
     */
    async getProductReviews(productId: string): Promise<ProductReview[]> {
        const { data, error } = await supabase
            .from('product_reviews')
            .select('*, profile:profiles(name, avatar_url)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar avaliações:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Busca a média de avaliações de um produto.
     */
    async getProductRatingSummary(productId: string): Promise<{ average: number; count: number }> {
        const { data, error } = await supabase
            .from('product_reviews')
            .select('rating')
            .eq('product_id', productId);

        if (error || !data || data.length === 0) {
            return { average: 0, count: 0 };
        }

        const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
        const average = sum / data.length;

        return {
            average: Number(average.toFixed(1)),
            count: data.length
        };
    },

    /**
     * Salva ou atualiza uma avaliação.
     */
    async submitReview(productId: string, rating: number, comment?: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('product_reviews')
            .upsert({
                profile_id: user.id,
                product_id: productId,
                rating,
                comment,
                updated_at: new Date().toISOString()
            }, { onConflict: 'profile_id, product_id' });

        if (error) {
            console.error('Erro ao enviar avaliação:', error);
            throw error;
        }

        return true;
    }
};
