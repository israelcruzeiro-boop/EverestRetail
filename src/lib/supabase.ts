import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializa o cliente apenas se as variáveis existirem para evitar erros de inicialização
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Log de aviso se o Supabase não estiver configurado
 */
if (!supabase) {
    console.warn('Supabase credentials missing. Falling back to local storage service.');
}
