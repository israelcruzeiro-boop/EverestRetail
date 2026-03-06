import { supabase } from '@/lib/supabase';
import { HomeContentConfig, WeeklyHighlight, SuggestedProductBlock, VideoCast } from '@/types/content';

/**
 * Repositório para gestão do conteúdo dinâmico da Home.
 */
export const homeContentRepo = {
    /**
     * Busca todo o conteúdo da home de forma agregada.
     */
    async getHomeConfig(): Promise<HomeContentConfig> {
        if (!supabase) {
            // Fallback para mock vazio se não houver Supabase (localStorage pode ser implementado se necessário)
            return { hero: [], highlights: [], suggested: [], videocasts: [] };
        }

        const [heroRes, highlightsRes, suggestedRes, videocastsRes] = await Promise.all([
            supabase.from('hero_carousel').select('*').order('sort_order', { ascending: true }),
            supabase.from('highlights').select('*').order('sort_order', { ascending: true }),
            supabase.from('suggested_products').select('*').order('sort_order', { ascending: true }),
            supabase.from('videocasts').select('id, title, category_label, description, thumbnail_url, video_url, speaker_label, is_highlight, status, sort_order').order('sort_order', { ascending: true })
        ]);

        return {
            hero: (heroRes.data || []).map(h => ({
                id: h.id,
                imageUrl: h.image_url,
                altText: h.alt_text,
                title: h.title,
                subtitle: h.subtitle,
                ctaLabel: h.cta_label,
                linkUrl: h.link_url,
                status: h.status as any,
                order: h.sort_order
            })),
            highlights: (highlightsRes.data || []).map(h => ({
                id: h.id,
                title: h.title,
                subtitle: h.subtitle,
                slug: h.slug,
                tag: h.tag,
                imageUrl: h.image_url,
                contentCoverUrl: h.content_cover_url,
                readTimeLabel: h.read_time_label,
                ctaLabel: h.cta_label,
                linkType: h.link_type as any,
                linkUrl: h.link_url,
                status: h.status as any,
                order: h.sort_order,
                body: h.body_json,
                authorName: h.author_name
            })),
            suggested: (suggestedRes.data || []).map(s => ({
                id: s.id,
                productId: s.product_id,
                customTitle: s.custom_title,
                customCta: s.custom_cta,
                status: s.status as any,
                order: s.sort_order
            })),
            videocasts: (videocastsRes.data || []).map(v => ({
                id: v.id,
                title: v.title,
                categoryLabel: v.category_label,
                description: v.description,
                thumbnailUrl: v.thumbnail_url,
                videoUrl: v.video_url,
                speakerLabel: v.speaker_label,
                isHighlight: v.is_highlight,
                status: v.status as any,
                order: v.sort_order
            }))
        };
    }
};
