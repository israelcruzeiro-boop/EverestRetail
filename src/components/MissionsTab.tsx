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
    const [completionsCount, setCompletionsCount] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<SponsoredVideo | null>(null);
    const { balance, refreshBalance, setMissionStreak } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [missionsData, videosData, counts] = await Promise.all([
            coinRepo.getUserMissions(),
            sponsoredVideosRepo.getActiveVideos(),
            sponsoredVideosRepo.getTodayCompletionsCount()
        ]);

        // Lógica de seleção aleatória estável (baseada na data) para mostrar apenas 3 missões
        const getDailySelection = (allMissions: Mission[]) => {
            if (allMissions.length <= 3) return allMissions;

            // Criar semente numérica a partir da data de hoje (America/Sao_Paulo)
            const todayStr = new Intl.DateTimeFormat('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            }).format(new Date());

            let seed = 0;
            for (let i = 0; i < todayStr.length; i++) {
                seed += todayStr.charCodeAt(i);
            }

            // Ordenar de forma determinística usando a semente
            const shuffled = [...allMissions].sort((a, b) => {
                const aHash = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed);
                const bHash = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed);
                return (aHash % 100) - (bHash % 100);
            });

            return shuffled.slice(0, 3);
        };

        const dailySelection = getDailySelection(missionsData);
        setMissions(dailySelection);
        setSponsoredVideos(videosData || []);
        setCompletionsCount(counts || {});
        setLoading(false);
    };

    const handleVideoComplete = async (res?: any) => {
        // O VideoModal já chama updateBalance se o saldo vier no res
        // Se não vier, ou se for uma missão normal sem vídeo, o refreshBalance pode ser necessário
        // mas aqui estamos lidando com o callback do VideoModal
        if (!res?.balance) {
            await refreshBalance();
        }

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
            case 'blog_review':
            case 'blog_comment':
                navigate('/blog');
                break;
            case 'share_solution':
            case 'watch_sponsored':
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
        <div className="space-y-8" aria-label="Painel de Missões">
            {/* Progress Overview */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-100">
                            <span className="text-blue-600 font-bold text-[10px] uppercase tracking-wider">Missões Diárias</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {completedCount} <span className="text-slate-400 font-normal">/</span> {totalCount} <span className="text-slate-500 text-lg font-medium">Concluídas</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl">
                        <span className="text-2xl drop-shadow-sm">🪙</span>
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Saldo Atual</span>
                            <span className="text-xl font-bold text-slate-900 tabular-nums">{balance}</span>
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-6 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-blue-500 rounded-full relative"
                    >
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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => !mission.is_completed_today && handleMissionClick(mission.code)}
                                className={`relative p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${mission.is_completed_today
                                    ? 'bg-emerald-50 border-emerald-100 shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer active:scale-[0.99]'
                                    }`}
                            >
                                <div className="flex items-start justify-between relative z-10 gap-4">
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all ${mission.is_completed_today
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-blue-50 border border-blue-100 text-blue-600'
                                            }`}>
                                            {mission.is_completed_today ? '✓' : '🎯'}
                                        </div>
                                        <div className="space-y-1.5 min-w-0">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${mission.is_completed_today ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                {mission.is_completed_today ? 'Completada' : 'Missão Ativa'}
                                            </span>
                                            <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                                                {mission.description}
                                            </h4>
                                            <div className="flex items-center gap-1.5 pt-1">
                                                <span className="text-xs">🪙</span>
                                                <span className="text-xs font-bold text-[#ee4d2d]">+{mission.reward} EC</span>
                                            </div>
                                        </div>
                                    </div>

                                    {mission.is_completed_today && (
                                        <div className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded">
                                            OK
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Sponsored Videos Section */}
            {sponsoredVideos.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                        <span className="text-slate-800 text-sm font-bold">
                            Vídeos Patrocinados
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sponsoredVideos.map((video, idx) => {
                            const count = completionsCount[video.id] || 0;
                            const limit = video.daily_limit || 1;
                            const isCompleted = count >= limit;

                            return (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => !isCompleted && setSelectedVideo(video)}
                                    className={`p-4 rounded-xl border transition-all duration-300 group overflow-hidden relative shadow-sm flex flex-col justify-between min-h-[140px] ${isCompleted
                                        ? 'bg-slate-50 border-slate-200 grayscale opacity-60'
                                        : 'bg-white border-slate-200 hover:border-orange-500 hover:shadow cursor-pointer active:scale-[0.99]'
                                        }`}
                                >
                                    <div className="flex items-start justify-between z-10 mb-2">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 transition-all ${isCompleted
                                            ? 'bg-slate-200 text-slate-400'
                                            : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'
                                            }`}>
                                            {isCompleted ? '✓' : '▶'}
                                        </div>
                                        <div className={`${isCompleted ? 'bg-slate-200' : 'bg-orange-100'} px-2 py-0.5 rounded`}>
                                            <span className={`text-[10px] font-bold ${isCompleted ? 'text-slate-500' : 'text-orange-600'}`}>
                                                {isCompleted ? 'Limite Atingido' : `${limit > 1 ? `Disponível ${count}/${limit}` : 'Prêmio'}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 mt-auto relative z-10">
                                        <h4 className={`font-medium line-clamp-2 text-sm leading-tight transition-colors ${isCompleted ? 'text-slate-500' : 'text-slate-800 group-hover:text-orange-600'}`}>
                                            {video.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2 mt-2">
                                            <span className={`${isCompleted ? 'opacity-50' : ''} text-xs`}>🪙</span>
                                            <p className={`${isCompleted ? 'text-slate-400' : 'text-[#ee4d2d]'} text-xs font-bold`}>
                                                +{video.reward} EC
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
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
