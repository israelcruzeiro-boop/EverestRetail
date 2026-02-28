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

    const streak = progress?.login_streak || 0;

    return (
        <div className="bg-white border border-slate-100 p-7 rounded-3xl shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-lg group-hover:bg-orange-500 group-hover:text-white transition-all">
                    🔥
                </div>
                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded-md">
                    LOGIN STREAK
                </span>
            </div>

            <div className="space-y-2">
                <span className="text-3xl font-black text-slate-900 block tracking-tighter tabular-nums">
                    {streak} {streak === 1 ? 'Dia' : 'Dias'}
                </span>

                {/* Streak Progress Visualization (Dots/Mini-bars) */}
                <div className="flex gap-1.5 pt-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                        const isCompleted = streak >= day;
                        const isNext = streak + 1 === day;
                        return (
                            <div
                                key={day}
                                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' :
                                        isNext ? 'bg-orange-200 animate-pulse' : 'bg-slate-100'
                                    }`}
                                title={`Dia ${day}: ${day <= 4 ? 10 + (2 * (day - 1)) : day === 5 ? 20 : day === 6 ? 24 : 30} EC`}
                            />
                        );
                    })}
                </div>

                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">
                    {streak >= 7 ? 'Bônus Máximo Ativo' : 'Mantenha a sequência'}
                </p>
            </div>
        </div>
    );
}
