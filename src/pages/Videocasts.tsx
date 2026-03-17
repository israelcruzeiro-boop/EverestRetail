import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { homeContentRepo } from '@/lib/repositories/homeContentRepo';
import { VideoCast } from '@/types/content';
import { getYouTubeThumbnail } from '@/lib/videoHelpers';
import VideoModal from '@/components/VideoModal';

export default function VideocastsPage() {
    const [videos, setVideos] = useState<VideoCast[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<VideoCast | null>(null);

    useEffect(() => {
        const loadVideos = async () => {
            setLoading(true);
            try {
                const config = await homeContentRepo.getHomeConfig();
                const activeVideos = config.videocasts
                    .filter(v => v.status === 'active')
                    .sort((a, b) => a.order - b.order);
                setVideos(activeVideos);
            } catch (error) {
                console.error('Erro ao carregar videocasts:', error);
            } finally {
                setLoading(false);
            }
        };

        loadVideos();
    }, []);

    const heroVideo = videos.length > 0 ? videos[0] : null;
    const gridVideos = videos.length > 1 ? videos.slice(1) : [];

    return (
        <div className="bg-[#f5f5f5] min-h-screen pb-20 text-slate-900 font-sans">
            {/* Header Hero */}
            <div className="bg-[#0B1220] pt-6 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Everest Studios</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                Central de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">EverCast</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20 space-y-12">

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="aspect-video bg-white animate-pulse border-2 border-slate-200"></div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="py-20 text-center bg-white border-2 border-dashed border-slate-300">
                        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Aguardando novos conteúdos</p>
                    </div>
                ) : (
                    <>
                        {/* Hero Video (Destaque Principal) */}
                        {heroVideo && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border-4 border-[#0B1220] overflow-hidden shadow-[8px_8px_0px_0px_rgba(11,18,32,1)] group cursor-pointer flex flex-col md:flex-row"
                                onClick={() => setSelectedVideo(heroVideo)}
                            >
                                <div className="w-full md:w-[60%] aspect-video relative overflow-hidden bg-slate-900 border-b-4 md:border-b-0 md:border-r-4 border-[#0B1220] shrink-0">
                                    <img
                                        src={getYouTubeThumbnail(heroVideo.videoUrl) || heroVideo.thumbnailUrl}
                                        alt={heroVideo.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-[#0B1220]/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border-2 border-white/20 group-hover:scale-110 group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-300 shadow-2xl">
                                            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 flex items-center bg-white relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                    <div className="relative z-10 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-[9px] font-black uppercase tracking-widest">{heroVideo.categoryLabel}</span>
                                            {heroVideo.isHighlight && <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1"><span className="text-sm border border-amber-500 rounded-full w-4 h-4 flex items-center justify-center pb-0.5">★</span> TOP VIEWS</span>}
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-black text-[#0B1220] uppercase tracking-tighter leading-[1.1] mb-4 group-hover:text-red-700 transition-colors">
                                            {heroVideo.title}
                                        </h2>
                                        {heroVideo.description && (
                                            <p className="text-slate-500 font-medium text-sm border-l-2 border-red-500 pl-4 py-1 mb-6 line-clamp-3">
                                                {heroVideo.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-auto pt-6 border-t border-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 font-black text-[10px] uppercase">
                                                {heroVideo.speakerLabel?.[0] || 'E'}
                                            </div>
                                            <span className="text-[10px] font-black text-[#0B1220] uppercase tracking-widest">{heroVideo.speakerLabel || 'Host Everest'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Video Grid */}
                        {gridVideos.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {gridVideos.map((video, idx) => (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setSelectedVideo(video)}
                                        className="group bg-white border-2 border-[#0B1220] shadow-[4px_4px_0px_0px_rgba(11,18,32,1)] hover:-translate-y-1 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(11,18,32,1)] transition-all cursor-pointer flex flex-col h-full overflow-hidden"
                                    >
                                        <div className="aspect-video relative overflow-hidden bg-slate-900 border-b-2 border-[#0B1220] shrink-0">
                                            <img
                                                src={getYouTubeThumbnail(video.videoUrl) || video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 opacity-90 group-hover:opacity-100 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#0B1220] group-hover:scale-110 shadow-lg transition-transform">
                                                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>

                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[#0B1220] text-[8px] font-black uppercase tracking-widest shadow-sm">
                                                    {video.categoryLabel}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="text-[16px] font-black text-[#0B1220] uppercase tracking-tighter leading-snug mb-3 line-clamp-2 group-hover:text-red-700 transition-colors">
                                                {video.title}
                                            </h3>
                                            {video.description && (
                                                <p className="text-slate-500 text-[11px] font-medium line-clamp-2 mb-4 mt-auto">
                                                    {video.description}
                                                </p>
                                            )}

                                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{video.speakerLabel || 'Host Everest'}</span>
                                                {video.isHighlight && <span className="text-[8px] font-black text-amber-500 uppercase flex items-center gap-1 border border-amber-200 bg-amber-50 px-1.5 py-0.5"><span className="text-xs leading-none pb-0.5">★</span> TOP</span>}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedVideo && (
                <VideoModal
                    isOpen={!!selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    videoUrl={selectedVideo.videoUrl}
                    title={selectedVideo.title}
                    id={selectedVideo.id}
                    type="videocast"
                />
            )}
        </div>
    );
}
