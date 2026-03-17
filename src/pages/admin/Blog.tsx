import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import DataTable from '@/components/admin/DataTable';
import EmptyState from '@/components/admin/EmptyState';
import { blogRepo } from '@/lib/repositories/blogRepo';
import { BlogPost } from '@/types/blog';
import { formatDateBR } from '@/lib/format';

export default function AdminBlog() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        setLoading(true);
        const data = await blogRepo.getPosts();
        setPosts(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleDelete = async (postId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta publicação? Esta ação é irreversível.')) return;

        try {
            const success = await blogRepo.deletePost(postId);
            if (success) {
                await loadPosts();
            } else {
                alert('Erro ao excluir post.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao processar exclusão.');
        }
    };

    return (
        <>
            <AdminTopbar title="Gestão de Blog" />

            <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12">
                <div className="border-4 border-[#0B1220] shadow-[12px_12px_0px_0px_rgba(11,18,32,1)] bg-white overflow-hidden">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-[#0B1220]">
                                Sincronizando Arquivos Blog...
                            </div>
                        </div>
                    ) : posts.length > 0 ? (
                        <DataTable<BlogPost>
                            data={posts}
                            columns={[
                                {
                                    header: 'PUBLICAÇÃO',
                                    accessor: (p) => (
                                        <div className="flex items-center gap-4">
                                            {p.image_url && (
                                                <div className="w-16 h-16 border-2 border-[#0B1220] overflow-hidden shrink-0">
                                                    <img src={p.image_url} className="w-full h-full object-cover grayscale" alt="" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <p className="font-black text-[#0B1220] text-sm uppercase tracking-tighter leading-none mb-1">
                                                    {p.title}
                                                </p>
                                                <span className="text-[9px] font-black text-[#1D4ED8] uppercase tracking-[0.2em]">
                                                    AUTOR: {p.profile?.name || 'MEMBRO'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    header: 'DATA',
                                    accessor: (p) => (
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {formatDateBR(p.created_at)}
                                        </span>
                                    )
                                },
                                {
                                    header: 'MÉDIA',
                                    accessor: (p) => (
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 border-2 font-black text-[10px] ${Number(p.average_rating) === 0 ? 'bg-slate-100 text-slate-400 border-slate-200' :
                                                    Number(p.average_rating) <= 4 ? 'bg-[#FF4D00] text-white border-[#0B1220]' :
                                                        Number(p.average_rating) <= 7 ? 'bg-[#FFD700] text-[#0B1220] border-[#0B1220]' :
                                                            Number(p.average_rating) <= 9 ? 'bg-[#1D4ED8] text-white border-[#0B1220]' :
                                                                'bg-[#00FF41] text-[#0B1220] border-[#0B1220]'
                                                }`}>
                                                ★ {Number(p.average_rating).toFixed(1)}
                                            </span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase">
                                                ({p.total_votes})
                                            </span>
                                        </div>
                                    )
                                },
                                {
                                    header: 'DESTAQUE',
                                    accessor: (p) => (
                                        <button
                                            onClick={async () => {
                                                const success = await blogRepo.toggleHighlight(p.id, !p.is_highlight);
                                                if (success) {
                                                    await loadPosts();
                                                } else {
                                                    alert('Erro ao atualizar destaque. Verifique suas permissões ou conexão.');
                                                }
                                            }}
                                            className={`px-3 py-1 border-2 font-black text-[9px] uppercase tracking-widest transition-all ${
                                                p.is_highlight 
                                                    ? 'bg-[#1D4ED8] text-white border-[#0B1220] shadow-[4px_4px_0px_0px_rgba(11,18,32,1)]' 
                                                    : 'bg-white text-slate-400 border-slate-200 hover:border-[#0B1220] hover:text-[#0B1220]'
                                            }`}
                                        >
                                            {p.is_highlight ? '★ DESTACADO' : 'DESTACAR'}
                                        </button>
                                    )
                                },
                                {
                                    header: 'AÇÕES',
                                    align: 'right',
                                    accessor: (p) => (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="px-4 py-2 border-2 border-[#FF4D00] text-[9px] font-black uppercase tracking-widest text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(255,77,0,1)] active:shadow-none"
                                            >
                                                EXCLUIR
                                            </button>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    ) : (
                        <EmptyState
                            title="SEM PUBLICAÇÕES"
                            description="NENHUM INSIGHT FOI COMPARTILHADO NO BLOG AINDA."
                            icon="📠"
                        />
                    )}
                </div>
            </div>
        </>
    );
}
