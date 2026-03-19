import { supabase } from './supabase';

export type ImersaoEvent = 'page_view' | 'click_buy' | 'click_location' | 'click_whatsapp';

/**
 * Envia um evento de tracking para o Supabase (Tabela tracking_imersao)
 * Sistema ultra-leve focado em métricas essenciais.
 */
export async function trackImersaoEvent(event: ImersaoEvent) {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('tracking_imersao')
      .insert([{ event }]);
    
    if (error) {
      // Falha silenciosa para não afetar o UX
      console.error('[Tracking] Erro ao registrar evento:', error.message);
    }
  } catch (err) {
    // Falha silenciosa
  }
}
