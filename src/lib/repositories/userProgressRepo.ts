import { supabase } from '../supabase';
import { getSaoPauloDate } from '../format';

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

            if (data) {
                const today = getSaoPauloDate();
                const lastLogin = data.last_login_date;

                let effectiveStreak = data.login_streak || 0;

                if (lastLogin) {
                    const todayDate = new Date(today);
                    const lastLoginDate = new Date(lastLogin);
                    const diffTime = todayDate.getTime() - lastLoginDate.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    // Se passou mais de 1 dia (ontem), o streak quebrou para fins de exibição
                    if (diffDays > 1) {
                        effectiveStreak = 0;
                    }
                } else {
                    effectiveStreak = 0;
                }

                return {
                    ...data,
                    effective_streak: effectiveStreak
                };
            }

            return null;
        } catch (err) {
            console.error('Erro inesperado getUserProgress:', err);
            return null;
        }
    }
};
