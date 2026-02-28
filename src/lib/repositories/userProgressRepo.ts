import { supabase } from '../supabase';

export interface DailyBonusResult {
    awarded: boolean;
    amount: number;
    streak: number;
    balance: number;
    message?: string;
}

export const userProgressRepo = {
    /**
     * Tenta resgatar o bônus de login diário.
     */
    async claimDailyBonus(): Promise<DailyBonusResult | null> {
        try {
            const { data, error } = await supabase.rpc('claim_daily_login_bonus');

            if (error) {
                console.error('Erro ao resgatar bônus diário:', error);
                return null;
            }

            return data as DailyBonusResult;
        } catch (err) {
            console.error('Erro inesperado claimDailyBonus:', err);
            return null;
        }
    },

    /**
     * Busca os dados de progresso e streak do usuário logado.
     */
    async getUserProgress() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('profile_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Erro ao buscar progresso:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Erro inesperado getUserProgress:', err);
            return null;
        }
    }
};
