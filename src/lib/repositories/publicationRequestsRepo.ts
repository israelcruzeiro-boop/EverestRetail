import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabaseService';

export interface PublicationRequestRow {
    id: string;
    requester_profile_id: string;
    partner_id: string | null;
    type: 'product' | 'service';
    name: string;
    slug: string | null;
    category: string | null;
    short_description: string | null;
    description: string | null;
    price_cents: number;
    billing_period: 'monthly' | 'yearly';
    benefits: string[];
    cover_image_url: string | null;
    gallery_image_urls: string[];
    status: 'submitted' | 'under_review' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_product_id: string | null;
    created_at: string;
    updated_at: string;
}

export const publicationRequestsRepo = {
    async createRequest(data: {
        partnerId?: string;
        type?: 'product' | 'service';
        name: string;
        slug?: string;
        category?: string;
        shortDescription?: string;
        description?: string;
        priceCents?: number;
        billingPeriod?: 'monthly' | 'yearly';
        benefits?: string[];
        coverImageUrl?: string;
        galleryImageUrls?: string[];
    }): Promise<PublicationRequestRow | null> {
        if (!supabase) return null;

        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) throw new Error('Não autenticado');

        const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const { data: created, error } = await supabase
            .from('publication_requests')
            .insert([{
                requester_profile_id: userId,
                partner_id: data.partnerId || null,
                type: data.type || 'product',
                name: data.name,
                slug,
                category: data.category || 'SaaS',
                short_description: data.shortDescription || null,
                description: data.description || null,
                price_cents: data.priceCents || 0,
                billing_period: data.billingPeriod || 'monthly',
                benefits: data.benefits || [],
                cover_image_url: data.coverImageUrl || null,
                gallery_image_urls: data.galleryImageUrls || [],
            }])
            .select()
            .single();

        if (error) throw error;

        // Notificar Admin
        await supabaseService.addNotification({
            type: 'info',
            title: 'Nova Solicitação de Publicação',
            description: `O parceiro enviou uma proposta para: ${data.name}`,
            link: '/admin/partners' // Ou onde o admin gerencia as solicitações
        });

        return created;
    },

    async listMyRequests(): Promise<PublicationRequestRow[]> {
        if (!supabase) return [];

        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) return [];

        const { data, error } = await supabase
            .from('publication_requests')
            .select('*')
            .eq('requester_profile_id', userId)
            .order('created_at', { ascending: false });

        if (error) { console.error('listMyRequests error:', error); return []; }
        return data || [];
    },

    async listRequestsAdmin(filters?: { status?: string }): Promise<PublicationRequestRow[]> {
        if (!supabase) return [];

        let query = supabase
            .from('publication_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) { console.error('listRequestsAdmin error:', error); return []; }
        return data || [];
    },

    async approveRequest(requestId: string): Promise<string | null> {
        if (!supabase) return null;

        const { data, error } = await supabase
            .rpc('approve_publication_request', { request_id: requestId });

        if (error) throw error;
        return data; // returns product_id
    },

    async rejectRequest(requestId: string, notes?: string): Promise<void> {
        if (!supabase) return;

        const { error } = await supabase
            .rpc('reject_publication_request', {
                request_id: requestId,
                notes: notes || null
            });

        if (error) throw error;
    }
};
