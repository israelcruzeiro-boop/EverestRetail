import React, { useEffect, useState } from 'react';
import { userProgressRepo } from '@/lib/repositories/userProgressRepo';

export default function StreakStats() {
    const [progress, setProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProgress = async () => {
            const data = await userProgressRepo.getUserProgress();
            setProgress(data);
            setLoading(false);
        };
        loadProgress();
    }, []);

    if (loading) return (
        <div className="h-32 bg-white/10 animate-pulse border border-white/20 rounded-3xl" />
    );

    const streak = progress?.effective_streak ?? 0;

    return (
        <div className="bg-white border border-slate-100 p-3 md:p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                    🔥
                </div>
                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-1.5 py-0.5 rounded">
                    STREAK
                </span>
            </div>

            <div className="space-y-1.5">
                <span className="text-xl font-black text-slate-900 block tracking-tighter tabular-nums">
                    {streak} {streak === 1 ? 'Dia' : 'Dias'}
                </span>

                <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                        const isCompleted = streak >= day;
                        const isNext = streak + 1 === day;
                        return (
                            <div
                                key={day}
                                className={`flex-1 h-1 rounded-full transition-all duration-300 ${isCompleted ? 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.3)]' :
                                    isNext ? 'bg-orange-200 animate-pulse' : 'bg-slate-100'
                                    }`}
                                title={`Dia ${day}`}
                            />
                        );
                    })}
                </div>

                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 truncate">
                    {streak >= 7 ? 'Bônus Ativo' : 'Mantenha o foco'}
                </p>
            </div>
        </div>
    );
}
