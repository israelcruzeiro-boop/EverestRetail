import React, { useState, useEffect } from 'react';
import { blogRepo } from '@/lib/repositories/blogRepo';
import { BlogPost } from '@/types/blog';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '@/components/blog/PostCard';
import PostInteraction from '@/components/blog/PostInteraction';
import Modal from '@/components/admin/Modal';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateStr));
};

export default function BlogFeed() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    const loadPosts = async () => {
        // Não mostramos o loading spinner global se for apenas uma atualização de post individual
        // para dar um feeling de "instantâneo"
        const data = await blogRepo.getPosts();
        setPosts(data);

        // Sincronizar ou abrir post
        if (id && !selectedPost) {
            const requested = data.find(p => p.id === id);
            if (requested) {
                setSelectedPost(requested);
            }
        } else if (selectedPost) {
            const updated = data.find(p => p.id === selectedPost.id);
            if (updated) setSelectedPost(updated);
        }

        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        loadPosts();
    }, []);

    return (
        <div className="min-h-screen bg-white" aria-label="Feed de Notícias Everest">
            {/* Dark Header - Compacted */}
            <div className="bg-black pt-6 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">ENT-CORE INTEL FEED</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                Blog <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Everest</span>
                            </h1>
                        </div>
                        {isAuthenticated && (
                            <Link
                                to="/blog/novo"
                                className="px-6 py-3 bg-white text-[#0B1220] font-black text-[10px] uppercase tracking-widest border border-white shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-block"
                            >
                                + Novo Insight
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Feed Grid - Standard Position */}
            <div className="max-w-7xl mx-auto px-4 -mt-8 pb-32 relative z-20">
                {loading ? (
                    <div className="h-64 flex items-center justify-center bg-white border-4 border-[#0B1220] shadow-[12px_12px_0px_0px_rgba(11,18,32,1)]">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Consultando Arquivos ENT...</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-white border-4 border-[#0B1220] shadow-[12px_12px_0px_0px_rgba(11,18,32,1)] space-y-6">
                        <span className="text-4xl">📠</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Nenhum insight estratégico captado hoje.</p>
                        <Link to="/blog/novo" className="text-[10px] font-black text-[#1D4ED8] underline">SEJA O PRIMEIRO A COMPARTILHAR</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <div key={post.id}>
                                <PostCard
                                    post={post}
                                    onClick={() => setSelectedPost(post)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Detail Modal */}
            <Modal
                isOpen={!!selectedPost}
                onClose={() => {
                    setSelectedPost(null);
                    if (id) {
                        navigate('/blog', { replace: true });
                    }
                }}
                title={selectedPost?.title || ''}
                size="lg"
            >
                {selectedPost && (
                    <div className="space-y-12">
                        {selectedPost.image_url && (
                            <div className="aspect-video bg-slate-50 border-4 border-[#0B1220] overflow-hidden shadow-[12px_12px_0px_0px_rgba(29,78,216,0.1)]">
                                <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-[#0B1220] overflow-hidden">
                                    {selectedPost.profile?.avatar_url ? (
                                        <img src={selectedPost.profile.avatar_url} alt={selectedPost.profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm font-black uppercase">
                                            {selectedPost.profile?.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#0B1220]">
                                        {selectedPost.profile?.name}
                                    </p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                                        Publicado em {formatDate(selectedPost.created_at)}
                                    </p>
                                </div>
                                {Number(selectedPost.average_rating) > 0 && (
                                    <div className="ml-auto flex flex-col items-end">
                                        <div className={`flex items-center gap-2 border-2 border-[#0B1220] px-4 py-2 shadow-[4px_4px_0px_0px_rgba(11,18,32,1)] ${Number(selectedPost.average_rating) <= 4 ? 'bg-[#FF4D00] text-white' :
                                            Number(selectedPost.average_rating) <= 7 ? 'bg-[#FFD700] text-[#0B1220]' :
                                                Number(selectedPost.average_rating) <= 9 ? 'bg-[#1D4ED8] text-white' :
                                                    'bg-[#00FF41] text-[#0B1220]'
                                            }`}>
                                            <span className="text-sm">★</span>
                                            <span className="text-lg font-black">{Number(selectedPost.average_rating).toFixed(1)}</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-2">
                                            NOTAS DE {selectedPost.total_votes} {selectedPost.total_votes === 1 ? 'ESPECIALISTA' : 'ESPECIALISTAS'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="prose max-w-none">
                                <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedPost.content}
                                </p>
                            </div>
                        </div>

                        <div className="h-0.5 bg-slate-100 w-full"></div>

                        <PostInteraction
                            post={selectedPost}
                            onUpdate={loadPosts}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
}
