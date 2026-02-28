import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import FormField, { Input, Textarea, Select } from '@/components/admin/FormField';
import EmptyState from '@/components/admin/EmptyState';
import { sponsoredVideosRepo, SponsoredVideo } from '@/lib/repositories/sponsoredVideosRepo';
import { getYouTubeThumbnail } from '@/lib/videoHelpers';

export default function SponsoredVideos() {
    const [videos, setVideos] = useState<SponsoredVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<SponsoredVideo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<Partial<SponsoredVideo>>({
        title: '',
        description: '',
        video_url: '',
        sponsor_url: '',
        reward: 50,
        daily_limit: 1,
        sponsor_name: '',
        active: true
    });

    const loadVideos = async () => {
        setLoading(true);
        const data = await sponsoredVideosRepo.listVideosAdmin();
        setVideos(data);
        setLoading(false);
    };

    useEffect(() => {
        loadVideos();
    }, []);

    const handleOpenModal = (video?: SponsoredVideo) => {
        if (video) {
            setEditingVideo(video);
            setFormData({ ...video });
        } else {
            setEditingVideo(null);
            setFormData({
                title: '',
                description: '',
                video_url: '',
                sponsor_url: '',
                reward: 50,
                daily_limit: 1,
                sponsor_name: '',
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.video_url || !formData.reward) {
            alert('Preencha os campos obrigatórios (Título, URL e Recompensa).');
            return;
        }

        try {
            if (editingVideo) {
                await sponsoredVideosRepo.updateVideo(editingVideo.id, formData);
            } else {
                await sponsoredVideosRepo.createVideo(formData);
            }
            await loadVideos();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('Error saving video:', err);
            alert(`Erro ao salvar vídeo: ${err.message || 'Erro desconhecido'}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este vídeo patrocinado?')) {
            try {
                await sponsoredVideosRepo.deleteVideo(id);
                await loadVideos();
            } catch (err) {
                alert('Erro ao excluir vídeo.');
            }
        }
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.sponsor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: Column<SponsoredVideo>[] = [
        {
            header: 'CONTEÚDO / VÍDEO',
            accessor: (v) => (
                <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-slate-100 border-2 border-[#0B1220] overflow-hidden flex items-center justify-center shrink-0">
                        {(v.thumbnail_url || getYouTubeThumbnail(v.video_url)) ? (
                            <img
                                src={v.thumbnail_url || getYouTubeThumbnail(v.video_url)}
                                alt={v.title}
                                className="w-full h-full object-cover grayscale"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('maxresdefault')) {
                                        target.src = target.src.replace('maxresdefault', 'hqdefault');
                                    }
                                }}
                            />
                        ) : (
                            <span className="text-lg">🎞️</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-[#0B1220] text-sm uppercase tracking-tighter leading-none mb-1">{v.title}</span>
                        <span className="text-[9px] text-[#1D4ED8] font-black uppercase tracking-widest">{v.sponsor_name || 'EVEREST CLOUD'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'RECOMPENSA',
            accessor: (v) => (
                <div className="flex items-center gap-2">
                    <span className="text-base">🪙</span>
                    <span className="font-black text-[#0B1220]">{v.reward} Everest Coins</span>
                </div>
            )
        },
        {
            header: 'STATUS',
            accessor: (v) => (
                <span className={`
          inline-flex items-center gap-2 px-3 py-1 border-2 font-black uppercase tracking-widest text-[9px]
          ${v.active ? 'bg-[#00FF41] text-[#0B1220] border-[#0B1220]' : 'bg-slate-200 text-slate-600 border-[#0B1220]'}
        `}>
                    <span className={`w-1.5 h-1.5 ${v.active ? 'bg-[#0B1220]' : 'bg-slate-500'}`}></span>
                    {v.active ? 'OPERANTE' : 'DESATIVADO'}
                </span>
            )
        },
        {
            header: 'AÇÕES',
            align: 'right',
            accessor: (v) => (
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => handleOpenModal(v)}
                        className="px-3 py-1 border-2 border-[#1D4ED8] text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(29,78,216,1)] active:shadow-none"
                    >
                        EDITAR
                    </button>
                    <button
                        onClick={() => handleDelete(v.id)}
                        className="px-3 py-1 border-2 border-[#FF4D00] text-[9px] font-black uppercase tracking-widest text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,77,0,1)] active:shadow-none"
                    >
                        REMOVER
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <AdminTopbar
                title="Gestão de Vídeos Premiados"
                actions={
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-3 px-6 py-3 bg-[#1D4ED8] text-white font-black text-[10px] uppercase tracking-[0.3em] border-2 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                        + NOVO VÍDEO
                    </button>
                }
            />

            <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12">
                {/* Search Bar */}
                <div className="border-4 border-[#0B1220] bg-white shadow-[8px_8px_0px_0px_rgba(11,18,32,1)]">
                    <input
                        placeholder="LOCALIZAR VÍDEO OU PATROCINADOR..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 px-8 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] focus:bg-slate-50 focus:outline-none placeholder:text-slate-300"
                    />
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center border-4 border-[#0B1220] bg-white">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando Database...</div>
                    </div>
                ) : videos.length === 0 ? (
                    <EmptyState
                        title="NENHUM VÍDEO"
                        description="O CATÁLOGO DE VÍDEOS PATROCINADOS ESTÁ VAZIO. CRIE O PRIMEIRO AGORA."
                        icon="🎞️"
                        action={
                            <button
                                onClick={() => handleOpenModal()}
                                className="bg-[#1D4ED8] text-white px-10 py-5 font-black text-xs uppercase tracking-[0.4em] border-2 border-[#0B1220] shadow-[8px_8px_0px_0px_rgba(11,18,32,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                            >
                                CRIAR REGISTRO
                            </button>
                        }
                    />
                ) : (
                    <div className="border-4 border-[#0B1220] shadow-[12px_12px_0px_0px_rgba(11,18,32,1)] bg-white overflow-hidden">
                        <DataTable data={filteredVideos} columns={columns} />
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingVideo ? `EDITAR VÍDEO: ${editingVideo.title}` : 'CADASTRAR VÍDEO PATROCINADO'}
                size="md"
                footer={
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 text-[10px] font-black text-[#0B1220] uppercase tracking-[0.3em] hover:text-[#FF4D00] transition-colors"
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-10 py-4 bg-[#1D4ED8] text-white font-black text-xs uppercase tracking-[0.5em] border-2 border-[#0B1220] shadow-[6px_6px_0px_0px_rgba(11,18,32,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                        >
                            {editingVideo ? 'ATUALIZAR VÍDEO' : 'LANÇAR VÍDEO'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <FormField label="Título do Vídeo">
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="EX: APRESENTAÇÃO ECOSSISTEMA"
                        />
                    </FormField>

                    <FormField label="Patrocinador (Sponsor)">
                        <Input
                            value={formData.sponsor_name}
                            onChange={(e) => setFormData({ ...formData, sponsor_name: e.target.value })}
                            placeholder="EX: EVEREST CLOUD"
                        />
                    </FormField>

                    <FormField label="URL do Vídeo (Youtube)">
                        <Input
                            value={formData.video_url}
                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </FormField>

                    <FormField label="Link do Patrocinador (Site)">
                        <Input
                            value={formData.sponsor_url}
                            onChange={(e) => setFormData({ ...formData, sponsor_url: e.target.value })}
                            placeholder="https://site-do-patrocinador.com"
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-6">
                        <FormField label="Recompensa (Moedas)">
                            <Input
                                type="number"
                                value={formData.reward}
                                onChange={(e) => setFormData({ ...formData, reward: parseInt(e.target.value) || 0 })}
                            />
                        </FormField>
                        <FormField label="Limite Diário">
                            <Input
                                type="number"
                                value={formData.daily_limit}
                                onChange={(e) => setFormData({ ...formData, daily_limit: parseInt(e.target.value) || 0 })}
                            />
                        </FormField>
                    </div>

                    <FormField label="Status Ativo">
                        <Select
                            value={formData.active ? 'true' : 'false'}
                            onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                        >
                            <option value="true">HABILITADO - VISÍVEL NO MARKETPLACE</option>
                            <option value="false">DESABILITADO - OCULTO</option>
                        </Select>
                    </FormField>

                    <FormField label="Descrição do Conteúdo">
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="BREVE RESUMO DO QUE O USUÁRIO VAI ASSISTIR..."
                            rows={3}
                        />
                    </FormField>
                </div>
            </Modal>
        </>
    );
}
