import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sponsoredVideosRepo, SponsoredVideo } from '@/lib/repositories/sponsoredVideosRepo';
import { useAuth } from '@/context/AuthContext';
import VideoModal from './VideoModal';
import { getYouTubeThumbnail } from '@/lib/videoHelpers';

export default function RewardsTab() {
    const [videos, setVideos] = useState<SponsoredVideo[]>([]);
    const [completionsCount, setCompletionsCount] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<SponsoredVideo | null>(null);
    const { balance, refreshBalance } = useAuth();

    const loadData = async () => {
        setLoading(true);
        const [videosData, completionsData] = await Promise.all([
            sponsoredVideosRepo.getActiveVideos(),
            sponsoredVideosRepo.getTodayCompletionsCount()
        ]);
        setVideos(videosData);
        setCompletionsCount(completionsData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleVideoComplete = async () => {
        await refreshBalance();
        await loadData();
    };

    const completedCount = videos.filter(v => (completionsCount[v.id] || 0) >= (v.daily_limit || 1)).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-amber-600 font-mono text-[9px] uppercase tracking-[0.4em]">Earn Coins v3.0</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">Central de Recompensas</h3>
                    <p className="text-slate-400 font-medium max-w-md text-sm">Assista conteúdos selecionados e acumule Everest Coins.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg group-hover:rotate-12 transition-transform">🪙</div>
                        <div className="relative z-10">
                            <span className="text-[8px] font-black uppercase text-white/30 block tracking-widest">Saldo</span>
                            <span className="text-2xl font-black tracking-tighter tabular-nums">{balance} <span className="text-xs text-cyan-400 font-mono">EC</span></span>
                        </div>
                    </div>
                    {videos.length > 0 && (
                        <div className="hidden md:flex flex-col items-center bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl">
                            <span className="text-xl font-black text-emerald-600">{completedCount}/{videos.length}</span>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Resgatados</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-white animate-pulse rounded-2xl border border-slate-100" />
                    ))
                ) : videos.length > 0 ? (
                    videos.map((video, idx) => {
                        const count = completionsCount[video.id] || 0;
                        const limit = video.daily_limit || 1;
                        const isReached = count >= limit;

                        return (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-500 ${isReached
                                    ? 'border-emerald-100 opacity-75'
                                    : 'border-slate-100 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/5'
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video overflow-hidden relative">
                                    {video.thumbnail_url || getYouTubeThumbnail(video.video_url) ? (
                                        <img
                                            src={video.thumbnail_url || getYouTubeThumbnail(video.video_url)}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            alt={video.title}
                                            onError={(e) => {
                                                // Fallback para hqdefault caso maxres não exista
                                                const target = e.target as HTMLImageElement;
                                                if (target.src.includes('maxresdefault')) {
                                                    target.src = target.src.replace('maxresdefault', 'hqdefault');
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-4xl">📺</div>
                                    )}

                                    {/* Overlay */}
                                    <div className={`absolute inset-0 transition-all duration-500 flex items-center justify-center ${isReached
                                        ? 'bg-emerald-950/40 backdrop-blur-[2px]'
                                        : 'bg-slate-950/0 group-hover:bg-slate-950/30 group-hover:backdrop-blur-[2px]'
                                        }`}>
                                        {!isReached && (
                                            <button
                                                onClick={() => setSelectedVideo(video)}
                                                className="w-16 h-16 bg-white/90 backdrop-blur-sm text-slate-900 rounded-2xl flex items-center justify-center text-xl shadow-2xl scale-0 group-hover:scale-100 transition-all duration-300 hover:bg-cyan-500 hover:text-white"
                                            >
                                                ▶
                                            </button>
                                        )}
                                        {isReached && (
                                            <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg">
                                                <span className="text-emerald-600 font-black text-[9px] uppercase tracking-[0.15em]">Limite Atingido</span>
                                                <span className="text-lg">✅</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reward Badge */}
                                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-xl shadow-lg flex items-center gap-1.5 border border-white/10">
                                        <span className="text-base">🪙</span>
                                        <span className="text-[10px] font-black text-white">+{video.reward}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <div>
                                        <span className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.3em] block mb-1">{video.sponsor_name || 'Everest Cloud'}</span>
                                        <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-cyan-600 transition-colors line-clamp-2 uppercase">
                                            {video.title}
                                        </h4>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${isReached ? 'text-emerald-500' : count > 0 ? 'text-cyan-500' : 'text-slate-400'}`}>
                                                {isReached ? 'Recompensa Resgatada' : count > 0 ? `Assistido ${count}/${limit}x hoje` : `Disponível: ${limit}x hoje`}
                                            </p>
                                        </div>
                                        {!isReached && (
                                            <button
                                                onClick={() => setSelectedVideo(video)}
                                                className="text-[9px] font-black text-cyan-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
                                            >
                                                Assistir →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                        <p className="text-slate-400 font-black uppercase tracking-[0.3em] italic text-xs">Nenhum conteúdo premiado disponível</p>
                    </div>
                )}
            </div>

            {selectedVideo && (
                <VideoModal
                    isOpen={!!selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    videoUrl={selectedVideo.video_url}
                    sponsorUrl={selectedVideo.sponsor_url}
                    title={selectedVideo.title}
                    id={selectedVideo.id}
                    type="sponsored"
                    onComplete={handleVideoComplete}
                />
            )}
        </div>
    );
}
