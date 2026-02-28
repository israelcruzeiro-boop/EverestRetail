import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userProgressRepo, DailyBonusResult } from '@/lib/repositories/userProgressRepo';
import DailyBonusModal from './DailyBonusModal';
import { supabase } from '@/lib/supabase';

export default function DailyBonusLoader() {
    const { isAuthenticated, loading, refreshBalance } = useAuth();
    const [bonusData, setBonusData] = useState<DailyBonusResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // useRef para evitar race conditions (estado compartilhado entre renders)
    const hasCheckedRef = useRef(false);
    const isClaimingRef = useRef(false);

    useEffect(() => {
        // Guardas rigorosas:
        // 1. Auth ainda está carregando → esperar
        // 2. Não está autenticado → não fazer nada
        // 3. Já verificou nesta sessão → não repetir
        // 4. Já está no meio de uma chamada → não duplicar
        if (loading || !isAuthenticated || hasCheckedRef.current || isClaimingRef.current) {
            return;
        }

        const checkBonus = async () => {
            isClaimingRef.current = true;

            try {
                // Verificar se existe uma sessão REAL no Supabase (não apenas localStorage)
                if (supabase) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        console.log('[DailyBonus] Sessão inválida, ignorando.');
                        hasCheckedRef.current = true;
                        isClaimingRef.current = false;
                        return;
                    }
                }

                const result = await userProgressRepo.claimDailyBonus();
                console.log('[DailyBonus] Resultado:', result);

                if (result && result.awarded) {
                    setBonusData(result);
                    setIsModalOpen(true);
                    await refreshBalance();
                } else {
                    console.log('[DailyBonus] Não premiado:', result?.message);
                }
            } catch (err) {
                console.error('[DailyBonus] Erro:', err);
            } finally {
                hasCheckedRef.current = true;
                isClaimingRef.current = false;
            }
        };

        checkBonus();
    }, [isAuthenticated, loading]); // Sem refreshBalance — estabiliza as dependências

    if (!bonusData) return null;

    return (
        <DailyBonusModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            amount={bonusData.amount}
            streak={bonusData.streak}
        />
    );
}
