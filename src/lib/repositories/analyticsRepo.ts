import { supabase } from '@/lib/supabase';
import { storageService } from '@/lib/storageService';
import { AnalyticsEvent } from '@/types/analytics';

/**
 * Repositório para gestão de eventos de analytics.
 * Implementa padrão de fallback: Supabase (Primário) -> LocalStorage (Secundário)
 */
export const analyticsRepo = {
    /**
     * Insere um novo evento de analytics
     */
    async insertEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
        const timestamp = new Date().toISOString();

        // Tenta usar Supabase se estiver configurado
        if (supabase) {
            try {
                const { error } = await supabase
                    .from('analytics_events')
                    .insert([{
                        type: event.type,
                        session_id: event.sessionId,
                        meta_json: event.meta,
                        timestamp: timestamp
                    }]);

                if (!error) return;
                console.error('Supabase analytics insert failed, failing over to local storage:', error);
            } catch (err) {
                console.error('Supabase connection error, failing over to local storage:', err);
            }
        }

        // Fallback para LocalStorage via storageService
        storageService.appendAnalyticsEvent({
            id: Math.random().toString(36).substring(2, 11),
            timestamp,
            ...event
        } as AnalyticsEvent);
    },

    /**
     * Lista eventos dentro de um intervalo de tempo
     */
    async listEvents(params: { from?: string; to?: string }): Promise<AnalyticsEvent[]> {
        // Tenta usar Supabase se estiver configurado
        if (supabase) {
            try {
                let query = supabase
                    .from('analytics_events')
                    .select('*')
                    .order('timestamp', { ascending: false });

                if (params.from) {
                    query = query.gte('timestamp', params.from);
                }
                if (params.to) {
                    query = query.lte('timestamp', params.to);
                }

                const { data, error } = await query;

                if (!error && data) {
                    return data.map(d => ({
                        id: d.id,
                        type: d.type,
                        timestamp: d.timestamp,
                        sessionId: d.session_id,
                        meta: d.meta_json
                    }));
                }
                console.error('Supabase analytics fetch failed, falling back to local storage:', error);
            } catch (err) {
                console.error('Supabase connection error during fetch, falling back to local storage:', err);
            }
        }

        // Fallback para LocalStorage
        const localEvents = storageService.getAnalyticsEvents();
        if (!params.from && !params.to) return localEvents;

        return localEvents.filter(e => {
            const ts = new Date(e.timestamp).getTime();
            const from = params.from ? new Date(params.from).getTime() : 0;
            const to = params.to ? new Date(params.to).getTime() : Infinity;
            return ts >= from && ts <= to;
        });
    },

    /**
     * Busca métricas agregadas para o dashboard
     */
    async getDashboardMetrics() {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('dashboard_metrics')
            .select('*')
            .maybeSingle();

        if (error) {
            console.error('Error fetching dashboard statistics:', error);
            return null;
        }

        return {
            activeProducts: data.active_products,
            pendingRequests: data.pending_requests,
            monthlyConversions: data.monthly_conversions
        };
    }
};
