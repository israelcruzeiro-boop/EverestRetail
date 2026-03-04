import React, { useState, useEffect } from 'react';
import { blogRepo } from '@/lib/repositories/blogRepo';
import { BlogPost, PostComment } from '@/types/blog';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { coinRepo } from '@/lib/repositories/coinRepo';
import { useNavigate } from 'react-router-dom';

interface PostInteractionProps {
    post: BlogPost;
    onUpdate?: () => void;
}

const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
    }).format(new Date(dateStr));
};

export default function PostInteraction({ post, onUpdate }: PostInteractionProps) {
    const [rating, setRating] = useState<number | null>(null);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, refreshBalance, showToast } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [myRating, postComments] = await Promise.all([
                blogRepo.getMyRating(post.id),
                blogRepo.getComments(post.id)
            ]);
            setRating(myRating);
            setSelectedRating(myRating);
            setComments(postComments);
            setLoading(false);
        };
        load();
    }, [post.id]);

    const handleRatingSubmit = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (selectedRating === null || isSubmitting) return;
        setIsSubmitting(true);
        const success = await blogRepo.submitRating(post.id, selectedRating);
        if (success) {
            setRating(selectedRating);
            onUpdate?.();

            // Tentar completar a missão se ativo
            try {
                const res = await coinRepo.completeMission('blog_review', post.id);
                await refreshBalance();
                if (res && res.awarded) {
                    showToast('Everest Coins!', res.amount, 'coins');
                    if (res.xp_awarded) {
                        setTimeout(() => showToast('XP Ganho!', res.xp_awarded, 'xp'), 1000);
                    }
                }
            } catch (err) {
                // Silencioso, pois a missão pode já ter sido concluída ou não ser ativada
                console.log('Missão de blog_review não rendeu moedas ou já concluída:', err);
            }
        }
        setIsSubmitting(false);
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const success = await blogRepo.addComment(post.id, newComment);
        if (success) {
            setNewComment('');
            const updated = await blogRepo.getComments(post.id);
            setComments(updated);

            // Tentar completar a missão se ativo
            try {
                const res = await coinRepo.completeMission('blog_comment', post.id);
                await refreshBalance();
                if (res && res.awarded) {
                    showToast('Everest Coins!', res.amount, 'coins');
                    if (res.xp_awarded) {
                        setTimeout(() => showToast('XP Ganho!', res.xp_awarded, 'xp'), 1000);
                    }
                }
            } catch (err) {
                // Silencioso, pois a missão pode já ter sido concluída ou não estar na fila
                console.log('Missão de blog_comment não rendeu moedas ou já concluída:', err);
            }
        }
        setIsSubmitting(false);
    };

    if (loading) return null;

    return (
        <div className="space-y-12">
            {/* Rating Section */}
            <div className="p-10 bg-white border-4 border-[#0B1220] shadow-[8px_8px_0px_0px_rgba(29,78,216,0.1)]">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 block">Avalie este Conteúdo</p>
                <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <button
                            key={n}
                            onClick={() => setSelectedRating(n)}
                            disabled={isSubmitting}
                            className={`
                                w-11 h-11 rounded-xl font-black text-sm transition-all border-2
                                ${selectedRating === n
                                    ? 'bg-[#1D4ED8] text-white border-[#0B1220] shadow-lg scale-110'
                                    : 'bg-white text-[#0B1220] border-[#0B1220]/10 hover:border-[#1D4ED8] hover:bg-slate-50'
                                }
                            `}
                        >
                            {n}
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-between border-t-2 border-slate-50 pt-8">
                    {rating !== null ? (
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-[#00C832] rounded-full animate-pulse"></span>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#00C832]">
                                AVALIAÇÃO REGISTRADA: {rating}/10
                            </p>
                        </div>
                    ) : (
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                            SELECIONE UMA NOTA E CONFIRME ABAIXO
                        </p>
                    )}

                    <button
                        onClick={handleRatingSubmit}
                        disabled={isSubmitting || selectedRating === null || selectedRating === rating}
                        className={`
                            px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all border-2 border-[#0B1220]
                            ${selectedRating !== null && selectedRating !== rating
                                ? 'bg-[#1D4ED8] text-white shadow-[4px_4px_0px_0px_rgba(11,18,32,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {isSubmitting ? 'ENVIANDO...' : rating !== null ? 'ATUALIZAR NOTA' : 'ENVIAR AVALIAÇÃO'}
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-8">
                <h4 className="text-xl font-black text-[#0B1220] uppercase tracking-tighter border-b-4 border-[#0B1220] pb-4 inline-block">
                    {comments.length} Comentários
                </h4>

                <form onSubmit={handleComment} className="flex gap-4">
                    <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicione um comentário estratégico..."
                        className="flex-1 h-16 px-6 bg-slate-50 border-2 border-[#0B1220]/10 focus:border-[#1D4ED8] focus:bg-white outline-none text-sm font-medium transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="px-8 bg-[#0B1220] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#1D4ED8] transition-all disabled:opacity-50"
                    >
                        ENVIAR
                    </button>
                </form>

                <div className="space-y-6">
                    <AnimatePresence>
                        {comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-4 p-6 bg-white border-2 border-[#0B1220]/5 hover:border-[#0B1220]/10 transition-all"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-[#0B1220] overflow-hidden shrink-0">
                                    {comment.profile?.avatar_url ? (
                                        <img src={comment.profile.avatar_url} alt={comment.profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-black">
                                            {comment.profile?.name?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0B1220]">
                                            {comment.profile?.name}
                                        </span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                                            {formatDate(comment.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
