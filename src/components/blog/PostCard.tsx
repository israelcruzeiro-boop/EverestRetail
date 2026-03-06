import React from 'react';
import { motion } from 'framer-motion';
import { BlogPost } from '@/types/blog';

interface PostCardProps {
    post: BlogPost;
    onClick?: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(dateStr));
    };
    return (
        <motion.div
            whileHover={{ y: -4 }}
            aria-label={post.title}
            className="group bg-white border-2 border-[#0B1220] overflow-hidden shadow-[8px_8px_0px_0px_rgba(11,18,32,1)] hover:shadow-[4px_4px_0px_0px_rgba(11,18,32,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer flex flex-col h-full"
            onClick={onClick}
        >
            {post.image_url && (
                <div className="aspect-[16/9] overflow-hidden border-b-2 border-[#0B1220]">
                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                </div>
            )}
            <div className="p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-[#0B1220] overflow-hidden">
                        {post.profile?.avatar_url ? (
                            <img src={post.profile.avatar_url} alt={post.profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-tighter">
                                {post.profile?.name?.[0] || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0B1220]">
                            {post.profile?.name || 'Membro Everest'}
                        </p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                            {formatDate(post.created_at)}
                        </p>
                    </div>
                    {Number(post.average_rating) > 0 && (
                        <div className={`ml-auto flex items-center gap-1.5 border-2 border-[#0B1220] px-3 py-1 shadow-[2px_2px_0px_0px_rgba(11,18,32,1)] ${Number(post.average_rating) <= 4 ? 'bg-[#FF4D00] text-white' :
                            Number(post.average_rating) <= 7 ? 'bg-[#FFD700] text-[#0B1220]' :
                                Number(post.average_rating) <= 9 ? 'bg-[#1D4ED8] text-white' :
                                    'bg-[#00FF41] text-[#0B1220]'
                            }`}>
                            <span className="text-[10px]">★</span>
                            <span className="text-[10px] font-black">{Number(post.average_rating).toFixed(1)}</span>
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-black text-[#0B1220] uppercase tracking-tighter leading-none group-hover:text-[#1D4ED8] transition-colors">
                    {post.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed">
                    {post.content}
                </p>

                <div className="pt-4 flex items-center justify-between border-t-2 border-slate-50">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {post.total_votes === 1 ? '1 AVALIAÇÃO' : `${post.total_votes || 0} AVALIAÇÕES`}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1D4ED8] group-hover:underline">
                        LER COMPLETO →
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
