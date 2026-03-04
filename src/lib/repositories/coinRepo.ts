import { supabase } from '../supabase';
import { getSaoPauloDate } from '../format';

export const coinRepo = {
    /**
     * Busca o saldo e dados de nível do usuário logado.
     */
    async getUserCoinData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('coins_balance, coins_earned_total, current_level, xp_total')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Erro ao buscar dados de moedas:', error);
            return null;
        }

        return {
            balance: data.coins_balance ?? 0,
            earnedTotal: data.coins_earned_total ?? 0,
            level: data.current_level ?? 1,
            xpTotal: data.xp_total ?? 0
        };
    },

    /**
     * Adiciona recompensa de moedas via RPC seguro.
     */
    async addReward(actionType: string, amount: number, referenceId?: string, cooldownDays: number = 0): Promise<any> {
        try {
            const { data, error } = await supabase.rpc('add_coins_reward', {
                p_action_type: actionType,
                p_amount: amount,
                p_reference_id: referenceId,
                p_cooldown_days: cooldownDays
            });

            if (error) {
                console.warn(`Erro ao processar recompensa ${actionType}:`, error.message);
                return { success: false, message: error.message };
            }

            return data;
        } catch (err) {
            console.error('Erro inesperado em addReward:', err);
            return { success: false, message: 'Erro interno' };
        }
    },


    async rewardHighlightWeekly(highlightId: string) {
        const { data, error } = await supabase.rpc('complete_mission', {
            mission_code: 'view_highlight',
            p_reference_id: highlightId
        });
        if (error) throw error;
        return data;
    },

    async rewardVideocast(videoId: string) {
        const { data, error } = await supabase.rpc('complete_mission', {
            mission_code: 'watch_videocast',
            p_reference_id: videoId
        });
        if (error) throw error;
        return data;
    },

    async rewardSolutionShare(solutionId: string) {
        return this.completeMission('share_solution', solutionId);
    },

    async completeMission(missionCode: string, referenceId?: string) {
        const { data, error } = await supabase.rpc('complete_mission', {
            mission_code: missionCode,
            p_reference_id: referenceId
        });
        if (error) throw error;
        return data;
    },

    /**
     * Busca as missões ativas e verifica se foram completadas hoje pelo usuário.
     */
    async getUserMissions() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // 1. Buscar todas as missões ativas
            const { data: missions, error: mError } = await supabase
                .from('missions')
                .select('*')
                .eq('active', true);

            if (mError) throw mError;

            const { data: completions, error: cError } = await supabase
                .from('mission_completions')
                .select('mission_id')
                .eq('profile_id', user.id)
                .gte('completed_at', getSaoPauloDate());

            if (cError) {
                console.error('Erro ao buscar conclusões de missões:', cError.message);
                throw cError;
            }

            const completedIds = new Set(completions?.map(c => c.mission_id) || []);


            // 3. Mapear para o formato da UI
            return (missions || []).map(m => ({
                id: m.id,
                code: m.code,
                description: m.description,
                reward: m.reward,
                daily_limit: m.daily_limit,
                is_completed_today: completedIds.has(m.id)
            }));
        } catch (err: any) {
            console.error('Erro fatal em getUserMissions:', err.message || err);
            return [];
        }
    }
};
