import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { coinRepo } from '@/lib/repositories/coinRepo';
import { useAuth } from '@/context/AuthContext';
import { sponsoredVideosRepo, SponsoredVideo } from '@/lib/repositories/sponsoredVideosRepo';
import VideoModal from './VideoModal';

interface Mission {
    id: string;
    code: string;
    description: string;
    reward: number;
    daily_limit: number;
    is_completed_today: boolean;
}

export default function MissionsTab() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [sponsoredVideos, setSponsoredVideos] = useState<SponsoredVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<SponsoredVideo | null>(null);
    const { balance, refreshBalance, setMissionStreak } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [missionsData, videosData, completionsCount] = await Promise.all([
            coinRepo.getUserMissions(),
            sponsoredVideosRepo.getActiveVideos(),
            sponsoredVideosRepo.getTodayCompletionsCount()
        ]);

        // Só mostrar vídeos que ainda não atingiram o limite diário
        const availableVideos = (videosData || []).filter(v => {
            const count = completionsCount[v.id] || 0;
            const limit = v.daily_limit || 1;
            return count < limit;
        });

        setMissions(missionsData);
        setSponsoredVideos(availableVideos);
        setLoading(false);
    };

    const handleVideoComplete = async (res?: any) => {
        await refreshBalance();
        if (res?.day_complete) {
            setMissionStreak({
                amount: res.streak_bonus,
                streak: res.streak_count
            });
        }
        loadData();
    };

    const handleMissionClick = (code: string) => {
        switch (code) {
            case 'view_highlight':
            case 'watch_videocast':
                navigate('/');
                break;
            case 'share_solution':
                navigate('/marketplace');
                break;
            default:
                break;
        }
    };

    const completedCount = missions.filter(m => m.is_completed_today).length;
    const totalCount = missions.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="space-y-8">
            {/* Progress Overview */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                            <span className="text-cyan-600 font-mono text-[9px] uppercase tracking-[0.4em]">Missões Diárias</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                            {completedCount} <span className="text-slate-300">/</span> {totalCount} <span className="text-cyan-600 text-lg">Concluídas</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                        <span className="text-2xl">🪙</span>
                        <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Patrimônio</span>
                            <span className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">{balance}</span>
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full relative"
                    >
                        {progress > 0 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-cyan-500 rounded-full shadow-lg"></div>}
                    </motion.div>
                </div>
            </div>

            {/* Mission Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-36 bg-white animate-pulse rounded-2xl border border-slate-100" />
                        ))
                    ) : (
                        missions.map((mission, idx) => (
                            <motion.div
                                key={mission.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                onClick={() => !mission.is_completed_today && handleMissionClick(mission.code)}
                                className={`relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden group ${mission.is_completed_today
                                    ? 'bg-emerald-50/50 border-emerald-200/60 shadow-sm'
                                    : 'bg-white border-slate-100 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer active:scale-[0.98]'
                                    }`}
                            >
                                {/* Scanline */}
                                {!mission.is_completed_today && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-[2s] pointer-events-none"></div>
                                )}

                                <div className="flex items-start justify-between relative z-10 gap-4">
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all group-hover:scale-110 ${mission.is_completed_today
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-slate-900 text-white shadow-lg shadow-black/10'
                                            }`}>
                                            {mission.is_completed_today ? '✓' : '🎯'}
                                        </div>
                                        <div className="space-y-2 min-w-0">
                                            <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${mission.is_completed_today ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {mission.is_completed_today ? 'Completada' : 'Missão Ativa'}
                                            </span>
                                            <h4 className="text-base font-black text-slate-900 leading-snug group-hover:text-cyan-600 transition-colors uppercase tracking-tight">
                                                {mission.description}
                                            </h4>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                                                <span className="text-sm">🪙</span>
                                                <span className="text-[10px] font-black text-slate-700">+{mission.reward} EC</span>
                                            </div>
                                        </div>
                                    </div>

                                    {mission.is_completed_today && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="px-3 py-1.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-[0.15em] rounded-lg shadow-lg shadow-emerald-500/20 shrink-0"
                                        >
                                            OK
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Sponsored Videos Section */}
            {sponsoredVideos.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                        <span className="text-amber-600 text-[10px] font-black uppercase tracking-[0.3em] py-1">
                            Conteúdo Patrocinado
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sponsoredVideos.map((video, idx) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedVideo(video)}
                                className="bg-[#0B1220] p-6 rounded-[24px] border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all duration-500 group overflow-hidden relative shadow-2xl shadow-black/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Animated Glow on Hover */}
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                <div className="flex flex-col gap-5 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all duration-500">
                                            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                            <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Premium</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-white font-black uppercase tracking-tight line-clamp-1 text-sm group-hover:text-amber-400 transition-colors">{video.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-500 text-[10px]">🪙</span>
                                            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">+{video.reward} EC RECOMPENSA</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && missions.length === 0 && (
                <div className="py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] italic text-xs">Aguardando novos protocolos diários</p>
                </div>
            )}

            <VideoModal
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
                videoUrl={selectedVideo?.video_url || ''}
                title={selectedVideo?.title || ''}
                id={selectedVideo?.id || ''}
                type="sponsored"
                onComplete={handleVideoComplete}
            />
        </div>
    );
}
