import { supabase } from '@/lib/supabase';
import { AdminProduct } from '@/types/admin';

export const partnerRepo = {
    /**
     * Busca os produtos/soluções criados pelo usuário logado
     */
    async getMyProducts(): Promise<AdminProduct[]> {
        if (!supabase) return [];

        const { data: authUser } = await supabase.auth.getUser();
        if (!authUser.user) return [];

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('created_by', authUser.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching partner products:', error);
            return [];
        }

        return data.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            category: p.category,
            status: p.status,
            priceCents: p.price_cents,
            billingPeriod: p.billing_period,
            shortDescription: p.short_description,
            longDescription: p.long_description,
            heroImageUrl: p.hero_image_url,
            logoImageUrl: p.logo_image_url,
            partner_id: p.partner_id,
            benefits: p.benefits || [],
            createdAt: p.created_at
        }));
    },

    /**
     * Busca métricas básicas de performance para os produtos do parceiro
     */
    async getPartnerMetrics(productIds: string[]) {
        if (!supabase || productIds.length === 0) return { views: 0, clicks: 0 };

        const { data, error } = await supabase
            .from('analytics_events')
            .select('type')
            .in('meta_json->>productId', productIds);

        if (error) {
            console.error('Error fetching partner metrics:', error);
            return { views: 0, clicks: 0 };
        }

        const views = data.filter(e => e.type === 'page_view' || e.type === 'product_view').length;
        const clicks = data.filter(e => e.type === 'product_click' || e.type === 'checkout_started').length;

        return { views, clicks };
    },

    /**
     * Atualiza dados de marketing de um produto próprio
     */
    async updateMyProduct(productId: string, updates: Partial<AdminProduct>) {
        if (!supabase) return;

        const dbUpdates = {
            name: updates.name,
            short_description: updates.shortDescription,
            long_description: updates.longDescription,
            hero_image_url: updates.heroImageUrl,
            logo_image_url: updates.logoImageUrl,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('products')
            .update(dbUpdates)
            .eq('id', productId);

        if (error) throw error;
    }
};
