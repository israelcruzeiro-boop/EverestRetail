import { supabase } from '../supabase';

export interface StoreItem {
    id: string;
    code: string;
    name: string;
    description: string;
    price: number;
    benefit_type: 'xp' | 'boost';
    benefit_value: number;
    is_active: boolean;
}

export interface PurchaseResult {
    success: boolean;
    message: string;
    new_balance?: number;
}

export const storeRepo = {
    async getItems(): Promise<StoreItem[]> {
        const { data, error } = await supabase
            .from('store_items')
            .select('*')
            .eq('is_active', true)
            .order('price', { ascending: true });

        if (error) {
            console.error('Error fetching store items:', error);
            return [];
        }
        return data || [];
    },

    async purchaseItem(itemCode: string, targetId?: string): Promise<PurchaseResult> {
        try {
            const { data, error } = await supabase.rpc('purchase_store_item', {
                p_item_code: itemCode,
                p_target_id: targetId || null
            });

            if (error) throw error;
            return data as PurchaseResult;
        } catch (err: any) {
            console.error('Error purchasing item:', err);
            return {
                success: false,
                message: err.message || 'Erro ao processar compra'
            };
        }
    }
};
