import { supabase } from '@/lib/supabase';

/**
 * Interface para representar uma configuração no banco/localstorage
 */
export interface Setting<T = any> {
    key: string;
    value: T;
    description?: string;
    updated_at?: string;
}

const SETTINGS_STORAGE_KEY = 'marketplace_settings';

/**
 * Repositório para gestão de configurações globais.
 * Padrão: Supabase (Primário) -> LocalStorage (Fallback)
 */
export const settingsRepo = {
    /**
     * Busca todas as configurações
     */
    async getAll(): Promise<Setting[]> {
        if (supabase) {
            const { data, error } = await supabase
                .from('settings')
                .select('*');

            if (!error && data) return data;
            console.error('Erro ao buscar settings do Supabase:', error);
        }

        // Fallback LocalStorage
        const local = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return local ? JSON.parse(local) : [];
    },

    /**
     * Busca uma configuração específica pela chave
     */
    async getByKey<T>(key: string): Promise<T | null> {
        if (supabase) {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', key)
                .maybeSingle();

            if (!error && data) return data.value as T;
        }

        // Fallback LocalStorage
        const all = await this.getAll();
        const item = all.find(s => s.key === key);
        return item ? (item.value as T) : null;
    },

    /**
     * Atualiza ou insere uma configuração
     */
    async upsert(key: string, value: any, description?: string): Promise<void> {
        const payload = {
            key,
            value,
            description,
            updated_at: new Date().toISOString()
        };

        if (supabase) {
            const { error } = await supabase
                .from('settings')
                .upsert(payload, { onConflict: 'key' });

            if (!error) return;
            console.error('Erro ao salvar setting no Supabase:', error);
        }

        // Fallback LocalStorage
        const all = await this.getAll();
        const index = all.findIndex(s => s.key === key);
        if (index >= 0) {
            all[index] = { ...all[index], ...payload };
        } else {
            all.push(payload);
        }
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(all));
    }
};
