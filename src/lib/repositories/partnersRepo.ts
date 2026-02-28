import { supabase } from '@/lib/supabase';

export interface PartnerRow {
    id: string;
    owner_profile_id: string;
    company_name: string;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    logo_url: string | null;
    status: 'pending' | 'approved' | 'blocked';
    created_at: string;
    updated_at: string;
}

export const partnersRepo = {
    async upsertPartner(data: {
        companyName: string;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
        logoUrl?: string;
    }): Promise<PartnerRow | null> {
        if (!supabase) return null;

        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) throw new Error('Não autenticado');

        // Verifica se já existe partner para este usuário
        const { data: existing } = await supabase
            .from('partners')
            .select('id')
            .eq('owner_profile_id', userId)
            .maybeSingle();

        const payload = {
            owner_profile_id: userId,
            company_name: data.companyName,
            contact_name: data.contactName || null,
            contact_email: data.contactEmail || null,
            contact_phone: data.contactPhone || null,
            logo_url: data.logoUrl || null,
        };

        if (existing) {
            const { data: updated, error } = await supabase
                .from('partners')
                .update(payload)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return updated;
        } else {
            const { data: created, error } = await supabase
                .from('partners')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            return created;
        }
    },

    async getMyPartner(): Promise<PartnerRow | null> {
        if (!supabase) return null;

        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) return null;

        const { data } = await supabase
            .from('partners')
            .select('*')
            .eq('owner_profile_id', userId)
            .maybeSingle();

        return data;
    },

    async listPartnersAdmin(): Promise<PartnerRow[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) { console.error('listPartnersAdmin error:', error); return []; }
        return data || [];
    },

    async updatePartnerStatus(partnerId: string, status: 'pending' | 'approved' | 'blocked'): Promise<void> {
        if (!supabase) return;

        const { error } = await supabase
            .from('partners')
            .update({ status })
            .eq('id', partnerId);

        if (error) throw error;
    }
};
