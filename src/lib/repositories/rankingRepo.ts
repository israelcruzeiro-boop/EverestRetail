import { supabase } from '../supabase';

export interface RankingEntry {
    profile_id: string;
    name: string;
    avatar_url: string | null;
    score: number;
    rank_position: number;
    current_level: number;
}

export type RankingCriteria = 'balance' | 'earnings' | 'spending';

export const rankingRepo = {
    async getRanking(criteria: RankingCriteria, limit: number = 50): Promise<RankingEntry[]> {
        const { data, error } = await supabase.rpc('get_ranking', {
            p_criteria: criteria,
            p_limit: limit
        });

        if (error) {
            console.error('Error fetching ranking:', error);
            return [];
        }

        return data || [];
    }
};
