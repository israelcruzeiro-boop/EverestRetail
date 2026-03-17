import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import FormField, { Input, Select, Textarea } from '@/components/admin/FormField';
import EmptyState from '@/components/admin/EmptyState';
import { WeeklyHighlight, SuggestedProductBlock, VideoCast, HomeContentConfig, ContentBlock, ContentBlockType, HeroSlide } from '@/types/content';
import { AdminProduct } from '@/types/admin';
import { formatDateBR } from '@/lib/format';
import { isValidImageFile } from '@/lib/image';
import { getYouTubeThumbnail } from '@/lib/videoHelpers';
import { supabase } from '@/lib/supabase';
import { homeContentRepo } from '@/lib/repositories/homeContentRepo';
import { storageUploadRepo } from '@/lib/repositories/storageUploadRepo';

type Tab = 'hero' | 'highlights' | 'suggested' | 'videocasts';
type ModalTab = 'card' | 'content';

export default function Content() {
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [modalTab, setModalTab] = useState<ModalTab>('card');
  const [config, setConfig] = useState<HomeContentConfig>({ hero: [], highlights: [], suggested: [], videocasts: [] });
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // States para Formulários
  const [highlightForm, setHighlightForm] = useState<Partial<WeeklyHighlight>>({
    title: '', subtitle: '', slug: '', tag: 'OPERAÇÃO', imageUrl: '', contentCoverUrl: '', readTimeLabel: '', ctaLabel: 'Ler agora', linkType: 'internal', linkUrl: '', status: 'active', order: 1,
    body: [], authorName: 'Redação ENT'
  });

  const [suggestedForm, setSuggestedForm] = useState<Partial<SuggestedProductBlock>>({
    productId: '', customTitle: '', customCta: 'Saber mais', status: 'active', order: 1
  });

  const [videocastForm, setVideocastForm] = useState<Partial<VideoCast>>({
    title: '', categoryLabel: '', description: '', thumbnailUrl: '', videoUrl: '', speakerLabel: '', status: 'active', order: 1, isHighlight: false
  });

  const [heroForm, setHeroForm] = useState<Partial<HeroSlide>>({
    imageUrl: '', altText: '', title: '', subtitle: '', ctaLabel: 'Explorar Marketplace', linkUrl: '/marketplace', status: 'active', order: 1
  });

  // Refs para Uploads
  const highlightCardRef = useRef<HTMLInputElement>(null);
  const highlightCoverRef = useRef<HTMLInputElement>(null);
  const videocastThumbRef = useRef<HTMLInputElement>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    const [content, pts] = await Promise.all([
      homeContentRepo.getHomeConfig(),
      supabase ? (await supabase.from('products').select('*')).data || [] : []
    ]);

    // Mapeamento simples para produtcts do products admin se necessário
    const formattedProducts = (pts as any[]).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      logoImageUrl: p.logo_image_url || p.hero_image_url
    })) as AdminProduct[];

    setConfig(content);
    setProducts(formattedProducts);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null);
    setModalTab('card');

    if (activeTab === 'highlights') {
      setHighlightForm(item || {
        title: '', subtitle: '', slug: '', tag: 'OPERAÇÃO', imageUrl: '', contentCoverUrl: '', readTimeLabel: '', ctaLabel: 'Ler agora', linkType: 'internal', linkUrl: '', status: 'active', order: config.highlights.length + 1,
        body: [{ id: Math.random().toString(36).substr(2, 9), type: 'paragraph', text: '' }],
        authorName: 'Redação ENT'
      });
    } else if (activeTab === 'suggested') {
      setSuggestedForm(item || { productId: products[0]?.id || '', customTitle: '', customCta: 'Saber mais', status: 'active', order: config.suggested.length + 1 });
    } else if (activeTab === 'videocasts') {
      setVideocastForm(item || { title: '', categoryLabel: '', description: '', thumbnailUrl: '', videoUrl: '', speakerLabel: '', status: 'active', order: config.videocasts.length + 1, isHighlight: false });
    } else if (activeTab === 'hero') {
      setHeroForm(item || { imageUrl: '', altText: '', title: '', subtitle: '', ctaLabel: 'Explorar Marketplace', linkUrl: '/marketplace', status: 'active', order: config.hero.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'contentCoverUrl' | 'thumbnailUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = isValidImageFile(file);
    if (!validation.valid) { alert(validation.error); return; }
    try {
      const type = field === 'thumbnailUrl' ? 'videocasts' : field === 'imageUrl' && activeTab === 'hero' ? 'hero' : 'highlights';
      const url = await storageUploadRepo.uploadProductImage(file, type as any);

      if (activeTab === 'highlights') {
        setHighlightForm(prev => ({ ...prev, [field]: url }));
      } else if (activeTab === 'hero') {
        setHeroForm(prev => ({ ...prev, imageUrl: url }));
      } else {
        setVideocastForm(prev => ({ ...prev, thumbnailUrl: url }));
      }
    } catch (err: any) { alert(err.message || 'Erro ao processar imagem.'); }
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'highlights') {
        const slug = highlightForm.slug || highlightForm.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        const item = {
          title: highlightForm.title,
          subtitle: highlightForm.subtitle,
          slug,
          tag: highlightForm.tag,
          imageUrl: highlightForm.imageUrl,
          contentCoverUrl: highlightForm.contentCoverUrl,
          readTimeLabel: highlightForm.readTimeLabel,
          ctaLabel: highlightForm.ctaLabel,
          linkType: highlightForm.linkType,
          linkUrl: highlightForm.linkUrl,
          status: highlightForm.status,
          order: highlightForm.order,
          body: highlightForm.body,
          authorName: highlightForm.authorName
        };

        if (supabase) {
          const dbItem = {
            title: item.title,
            subtitle: item.subtitle,
            slug,
            tag: item.tag,
            image_url: item.imageUrl,
            content_cover_url: item.contentCoverUrl,
            read_time_label: item.readTimeLabel,
            cta_label: item.ctaLabel,
            link_type: item.linkType,
            link_url: item.linkUrl,
            status: item.status,
            sort_order: item.order,
            body_json: item.body,
            author_name: item.authorName,
            updated_at: new Date().toISOString()
          };

          if (editingItem) {
            await supabase.from('highlights').update(dbItem).eq('id', editingItem.id);
          } else {
            await supabase.from('highlights').insert([{ ...dbItem, created_at: new Date().toISOString() }]);
          }
        }
      } else if (activeTab === 'suggested') {
        const item = {
          productId: suggestedForm.productId,
          customTitle: suggestedForm.customTitle,
          customCta: suggestedForm.customCta,
          status: suggestedForm.status,
          order: suggestedForm.order
        };

        if (supabase) {
          const dbItem = {
            product_id: item.productId,
            custom_title: item.customTitle,
            custom_cta: item.customCta,
            status: item.status,
            sort_order: item.order,
            updated_at: new Date().toISOString()
          };

          if (editingItem) {
            await supabase.from('suggested_products').update(dbItem).eq('id', editingItem.id);
          } else {
            await supabase.from('suggested_products').insert([{ ...dbItem, created_at: new Date().toISOString() }]);
          }
        }
      } else if (activeTab === 'videocasts') {
        const item = {
          title: videocastForm.title,
          categoryLabel: videocastForm.categoryLabel,
          description: videocastForm.description,
          thumbnailUrl: videocastForm.thumbnailUrl,
          videoUrl: videocastForm.videoUrl,
          speakerLabel: videocastForm.speakerLabel,
          isHighlight: videocastForm.isHighlight,
          status: videocastForm.status,
          order: videocastForm.order
        };

        if (supabase) {
          const dbItem = {
            title: item.title,
            category_label: item.categoryLabel,
            description: item.description,
            thumbnail_url: item.thumbnailUrl,
            video_url: item.videoUrl,
            speaker_label: item.speakerLabel,
            is_highlight: item.isHighlight,
            status: item.status,
            sort_order: item.order,
            updated_at: new Date().toISOString()
          };

          if (editingItem) {
            await supabase.from('videocasts').update(dbItem).eq('id', editingItem.id);
          } else {
            await supabase.from('videocasts').insert([{ ...dbItem, created_at: new Date().toISOString() }]);
          }
        }
      } else if (activeTab === 'hero') {
        const item = {
          image_url: heroForm.imageUrl,
          alt_text: heroForm.altText,
          title: heroForm.title,
          subtitle: heroForm.subtitle,
          cta_label: heroForm.ctaLabel,
          link_url: heroForm.linkUrl,
          status: heroForm.status,
          sort_order: heroForm.order,
          updated_at: new Date().toISOString()
        };

        if (supabase) {
          if (editingItem) {
            await supabase.from('hero_carousel').update(item).eq('id', editingItem.id);
          } else {
            await supabase.from('hero_carousel').insert([{ ...item, created_at: new Date().toISOString() }]);
          }
        }
      }

      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Erro ao salvar conteúdo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      if (supabase) {
        const table = activeTab === 'highlights' ? 'highlights' : activeTab === 'suggested' ? 'suggested_products' : activeTab === 'videocasts' ? 'videocasts' : 'hero_carousel';
        await supabase.from(table).delete().eq('id', id);
      }
      await loadData();
    } catch (err) {
      alert('Erro ao excluir item.');
    }
  };

  const addBlock = (type: ContentBlockType = 'paragraph') => {
    setHighlightForm(prev => ({
      ...prev,
      body: [...(prev.body || []), { id: Math.random().toString(36).substr(2, 9), type, text: '' }]
    }));
  };

  const updateBlock = (id: string, text: string, imageUrl?: string) => {
    setHighlightForm(prev => ({
      ...prev,
      body: (prev.body || []).map(b => b.id === id ? { ...b, text, imageUrl: imageUrl !== undefined ? imageUrl : b.imageUrl } : b)
    }));
  };

  const handleBlockImageUpload = async (file: File, blockId: string) => {
    const validation = isValidImageFile(file);
    if (!validation.valid) { alert(validation.error); return; }
    try {
      const url = await storageUploadRepo.uploadProductImage(file, 'highlights');
      updateBlock(blockId, '', url);
    } catch (err: any) { alert(err.message || 'Erro ao processar imagem.'); }
  };

  const removeBlock = (id: string) => {
    setHighlightForm(prev => ({
      ...prev,
      body: (prev.body || []).filter(b => b.id !== id)
    }));
  };

  return (
    <>
      <AdminTopbar title="Gestão de Conteúdo (CMS)" actions={
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-[#1D4ED8] text-white font-black text-[10px] uppercase tracking-[0.3em] border-2 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          + Novo Registro
        </button>
      } />

      <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12">
        <div className="flex border-b-4 border-[#0B1220] overflow-x-auto no-scrollbar shrink-0 snap-x snap-mandatory px-4">
          {(['hero', 'highlights', 'suggested', 'videocasts'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-5 text-[10px] font-black transition-all border-b-4 whitespace-nowrap uppercase tracking-[0.2em] snap-start ${activeTab === tab ? 'border-[#1D4ED8] text-[#1D4ED8] bg-slate-50' : 'border-transparent text-slate-400 hover:text-[#0B1220] hover:bg-slate-50'}`}
            >
              {tab === 'highlights' ? 'CURADORIA SEMANAL' : tab === 'suggested' ? 'SUGESTÕES IA' : tab === 'videocasts' ? 'EVERCAST' : 'CARROSSEL HERO'}
            </button>
          ))}
        </div>

        <div className="border-4 border-[#0B1220] shadow-[12px_12px_0px_0px_rgba(11,18,32,1)] bg-white overflow-hidden">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-[#0B1220]">Sincronizando Biblioteca...</div>
            </div>
          ) : activeTab === 'hero' ? (
            config.hero.length > 0 ? (
              <DataTable<HeroSlide> data={config.hero.sort((a, b) => a.order - b.order)} columns={[
                {
                  header: 'SLIDE',
                  accessor: (h) => (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border-2 border-[#0B1220] bg-slate-50 overflow-hidden shrink-0">
                        <img src={h.imageUrl} className="w-full h-full object-cover grayscale" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-black text-[#0B1220] text-sm uppercase tracking-tighter leading-none mb-1">{h.altText || 'SLIDE SEM DESCRIÇÃO'}</p>
                        <span className="text-[9px] font-black text-[#1D4ED8] uppercase tracking-[0.2em]">ORDEM: {h.order}</span>
                      </div>
                    </div>
                  )
                },
                {
                  header: 'CONTEÚDO',
                  accessor: (h) => (
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-[#0B1220]">{h.title || '-'}</p>
                      <p className="text-[9px] text-slate-400">{h.subtitle || '-'}</p>
                    </div>
                  )
                },
                {
                  header: 'STATUS',
                  accessor: (h) => (
                    <span className={`px-3 py-1 border-2 font-black uppercase tracking-widest text-[9px] ${h.status === 'active' ? 'bg-[#00FF41] text-[#0B1220] border-[#0B1220]' : 'bg-slate-200 text-slate-500 border-[#0B1220]'}`}>
                      {h.status === 'active' ? 'ATIVO' : 'INATIVO'}
                    </span>
                  )
                },
                {
                  header: 'AÇÕES',
                  align: 'right',
                  accessor: (h) => (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(h)}
                        className="px-3 py-1 border-2 border-[#1D4ED8] text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(29,78,216,1)] active:shadow-none"
                      >
                        EDITAR
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="px-3 py-1 border-2 border-[#FF4D00] text-[9px] font-black uppercase tracking-widest text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,77,0,1)] active:shadow-none"
                      >
                        EXCLUIR
                      </button>
                    </div>
                  )
                }
              ]} />
            ) : <EmptyState title="CARROSSEL VAZIO" description="CADASTRE AS IMAGENS DE IMPACTO PARA A HERO." icon="🖼️" />
          ) : activeTab === 'highlights' && (
            config.highlights.length > 0 ? (
              <DataTable<WeeklyHighlight> data={config.highlights.sort((a, b) => a.order - b.order)} columns={[
                {
                  header: 'DESTAQUE',
                  accessor: (h) => (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 border-2 border-[#0B1220] bg-slate-50 overflow-hidden shrink-0">
                        <img src={h.imageUrl} className="w-full h-full object-cover grayscale" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-black text-[#0B1220] text-sm uppercase tracking-tighter leading-none mb-1">{h.title}</p>
                        <span className="text-[9px] font-black text-[#1D4ED8] uppercase tracking-[0.2em]">{h.tag}</span>
                      </div>
                    </div>
                  )
                },
                {
                  header: 'STATUS',
                  accessor: (h) => (
                    <span className={`px-3 py-1 border-2 font-black uppercase tracking-widest text-[9px] ${h.status === 'active' ? 'bg-[#00FF41] text-[#0B1220] border-[#0B1220]' : 'bg-slate-200 text-slate-500 border-[#0B1220]'}`}>
                      {h.status === 'active' ? 'PUBLICADO' : 'OCULTO'}
                    </span>
                  )
                },
                {
                  header: 'AÇÕES',
                  align: 'right',
                  accessor: (h) => (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(h)}
                        className="px-3 py-1 border-2 border-[#1D4ED8] text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(29,78,216,1)] active:shadow-none"
                      >
                        EDITAR
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="px-3 py-1 border-2 border-[#FF4D00] text-[9px] font-black uppercase tracking-widest text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,77,0,1)] active:shadow-none"
                      >
                        EXCLUIR
                      </button>
                    </div>
                  )
                }
              ]} />
            ) : <EmptyState title="CURADORIA VAZIA" description="NENHUM DESTAQUE SEMANAL CADASTRADO NO CMS." icon="✨" />
          )}

          {activeTab === 'suggested' && (
            config.suggested.length > 0 ? (
              <DataTable<SuggestedProductBlock> data={config.suggested.sort((a, b) => a.order - b.order)} columns={[
                {
                  header: 'SOLUÇÃO VINCULADA',
                  accessor: (s) => {
                    const product = products.find(p => p.id === s.productId);
                    return <span className="font-black text-[#0B1220] text-sm uppercase tracking-tighter">{s.customTitle || product?.name || 'REGISTRO NÃO ENCONTRADO'}</span>;
                  }
                },
                {
                  header: 'ORDEM',
                  accessor: (s) => <span className="font-black text-[#1D4ED8]">{s.order.toString().padStart(2, '0')}</span>
                },
                {
                  header: 'AÇÕES',
                  align: 'right',
                  accessor: (s) => (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(s)}
                        className="px-3 py-1 border-2 border-[#1D4ED8] text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(29,78,216,1)] active:shadow-none"
                      >
                        EDITAR
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="px-3 py-1 border-2 border-[#FF4D00] text-[9px] font-black uppercase tracking-widest text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,77,0,1)] active:shadow-none"
                      >
                        EXCLUIR
                      </button>
                    </div>
                  )
                }
              ]} />
            ) : <EmptyState title="SEM SUGESTÕES" description="ORGANIZE AS SOLUÇÕES PRIORITÁRIAS PARA A HOME." icon="📦" />
          )}

          {activeTab === 'videocasts' && (
            config.videocasts.length > 0 ? (
              <DataTable<VideoCast> data={config.videocasts.sort((a, b) => a.order - b.order)} columns={[
                {
                  header: 'CONTEÚDO AUDIOVISUAL',
                  accessor: (v) => (
                    <div className="flex flex-col">
                      <span className="font-black text-[#0B1220] text-sm uppercase tracking-tighter leading-none mb-1">{v.title}</span>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{v.speakerLabel}</span>
                    </div>
                  )
                },
                {
                  header: 'STATUS',
                  accessor: (v) => (
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-3 py-1 border-2 font-black uppercase tracking-widest text-[9px] inline-block ${v.status === 'active' ? 'bg-[#00FF41] text-[#0B1220] border-[#0B1220]' : 'bg-slate-200 text-slate-500 border-[#0B1220]'}`}>
                        {v.status === 'active' ? 'REPRODUZÍVEL' : 'OFFLINE'}
                      </span>
                      {v.isHighlight && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-amber-200">
                          <span className="text-amber-500">★</span> Destaque Home
                        </span>
                      )}
                    </div>
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
                        EXCLUIR
                      </button>
                    </div>
                  )
                }
              ]} />
            ) : <EmptyState title="BIBLIOTECA VAZIA" description="CADASTRE VÍDEOCASTS PARA EDUCAR O MERCADO." icon="🎥" />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `EDITAR ITEM: ${activeTab.toUpperCase()}` : 'NOVO REGISTRO CMS'}
        size={activeTab === 'highlights' ? 'xl' : 'lg'}
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 text-[10px] font-black text-[#0B1220] uppercase tracking-[0.3em] hover:text-[#FF4D00] transition-colors"
            >
              DESCARTAR
            </button>
            <button
              onClick={handleSave}
              className="px-10 py-4 bg-[#1D4ED8] text-white font-black text-xs uppercase tracking-[0.5em] border-2 border-[#0B1220] shadow-[6px_6px_0px_0px_rgba(11,18,32,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1.5 active:translate-y-1.5 transition-all text-center"
            >
              SALVAR CONFIGURAÇÃO
            </button>
          </div>
        }
      >
        {activeTab === 'highlights' && (
          <div className="flex flex-col h-full max-h-[70vh]">
            <div className="flex border-b-4 border-[#0B1220] mb-10 overflow-x-auto no-scrollbar shrink-0 snap-x snap-mandatory px-4">
              <button
                onClick={() => setModalTab('card')}
                className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-4 transition-all whitespace-nowrap snap-start ${modalTab === 'card' ? 'border-[#1D4ED8] text-[#1D4ED8] bg-slate-50' : 'border-transparent text-slate-400 hover:text-[#0B1220]'}`}
              >
                FRONT-END DO CARD
              </button>
              <button
                onClick={() => setModalTab('content')}
                className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-4 transition-all whitespace-nowrap snap-start ${modalTab === 'content' ? 'border-[#1D4ED8] text-[#1D4ED8] bg-slate-50' : 'border-transparent text-slate-400 hover:text-[#0B1220]'}`}
              >
                MATÉRIA COMPLETA
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-10 pb-10">
              {modalTab === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <FormField label="Título de Exibição">
                      <Input value={highlightForm.title} onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })} placeholder="TÍTULO IMPACTANTE..." />
                    </FormField>
                    <FormField label="Captura Visual (Card)">
                      <div className="space-y-4">
                        <div className="aspect-video bg-white border-4 border-[#0B1220] flex items-center justify-center overflow-hidden shrink-0 shadow-[8px_8px_0px_0px_rgba(255,77,0,1)] relative">
                          {highlightForm.imageUrl ? <img src={highlightForm.imageUrl} className="w-full h-full object-cover grayscale" alt="" /> : <span className="text-4xl grayscale">🖼️</span>}
                        </div>
                        <button onClick={() => highlightCardRef.current?.click()} className="w-full py-4 bg-white border-2 border-[#0B1220] text-[9px] font-black uppercase tracking-[0.2rem] text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-all">UPLOAD DO CARD</button>
                        <input type="file" ref={highlightCardRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
                      </div>
                    </FormField>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="Etiqueta (TAG)">
                        <Input value={highlightForm.tag} onChange={(e) => setHighlightForm({ ...highlightForm, tag: e.target.value.toUpperCase() })} />
                      </FormField>
                      <FormField label="Prioridade">
                        <Input type="number" value={highlightForm.order} onChange={(e) => setHighlightForm({ ...highlightForm, order: parseInt(e.target.value) || 0 })} />
                      </FormField>
                    </div>
                    <FormField label="Status de Veiculação">
                      <Select value={highlightForm.status} onChange={(e) => setHighlightForm({ ...highlightForm, status: e.target.value as any })}>
                        <option value="active">PUBLICAR AGORA</option>
                        <option value="inactive">RASCUNHO / OCULTO</option>
                      </Select>
                    </FormField>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-1 space-y-6">
                      <FormField label="Imagem de Capa (Header)">
                        <div className="space-y-4">
                          <div className="aspect-[4/5] bg-white border-4 border-[#0B1220] flex items-center justify-center overflow-hidden shadow-[10px_10px_0px_0px_rgba(29,78,216,1)]">
                            {highlightForm.contentCoverUrl ? <img src={highlightForm.contentCoverUrl} className="w-full h-full object-cover grayscale" alt="" /> : <span className="text-5xl grayscale">🌄</span>}
                          </div>
                          <button onClick={() => highlightCoverRef.current?.click()} className="w-full py-4 bg-white border-2 border-[#0B1220] text-[9px] font-black uppercase tracking-[0.2rem] text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-all">UPLOAD DA CAPA</button>
                          <input type="file" ref={highlightCoverRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'contentCoverUrl')} />
                        </div>
                      </FormField>
                      <FormField label="Assinatura (Autor)">
                        <Input value={highlightForm.authorName} onChange={(e) => setHighlightForm({ ...highlightForm, authorName: e.target.value })} />
                      </FormField>
                    </div>
                    <div className="md:col-span-2 space-y-8">
                      <FormField label="H1 - Título da Matéria">
                        <Input className="text-base" value={highlightForm.title} onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })} placeholder="TÍTULO COMPLETO..." />
                      </FormField>
                      <FormField label="Resumo / Lead">
                        <Textarea value={highlightForm.subtitle} onChange={(e) => setHighlightForm({ ...highlightForm, subtitle: e.target.value })} placeholder="INTRODUÇÃO DA PAUTA..." rows={3} />
                      </FormField>

                      <div className="flex items-center justify-between border-b-4 border-[#0B1220] pb-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1220]">Corpo Editorial</h4>
                        <div className="flex gap-4">
                          <button onClick={() => addBlock('paragraph')} className="text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:underline">+ TEXTO</button>
                          <button onClick={() => addBlock('heading')} className="text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:underline">+ TÍTULO</button>
                          <button onClick={() => addBlock('quote')} className="text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:underline">+ CITAÇÃO</button>
                          <button onClick={() => addBlock('image')} className="text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:underline">+ IMAGEM</button>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-4">
                        {highlightForm.body?.map((block) => (
                          <div key={block.id} className="p-6 bg-white border-2 border-[#0B1220] space-y-4 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-black uppercase bg-[#1D4ED8] text-white px-2 py-0.5">{block.type}</span>
                              <button
                                onClick={() => removeBlock(block.id)}
                                className="w-6 h-6 border-2 border-[#0B1220] flex items-center justify-center text-[10px] font-black bg-[#FF4D00] text-white hover:bg-[#0B1220] transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                            {block.type === 'image' ? (
                              <div className="space-y-4">
                                <div className="aspect-video bg-slate-50 border-2 border-[#0B1220] flex items-center justify-center overflow-hidden">
                                  {block.imageUrl ? (
                                    <img src={block.imageUrl} className="w-full h-full object-cover grayscale" alt="" />
                                  ) : (
                                    <span className="text-2xl grayscale">📸 Nenhuma imagem vinculada</span>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`file-${block.id}`}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleBlockImageUpload(file, block.id);
                                  }}
                                />
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => document.getElementById(`file-${block.id}`)?.click()}
                                    className="flex-1 py-2 bg-white border-2 border-[#0B1220] text-[9px] font-black uppercase tracking-widest text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-all"
                                  >
                                    VINCULAR IMAGEM
                                  </button>
                                  <Input
                                    className="flex-[2]"
                                    value={block.text}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    placeholder="LEGENDA DA IMAGEM..."
                                  />
                                </div>
                              </div>
                            ) : (
                              <Textarea
                                className="bg-slate-50 border-0 focus:bg-white"
                                value={block.text}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                rows={block.type === 'paragraph' ? 12 : 5}
                                placeholder={block.type === 'heading' ? 'TÍTULO DA SEÇÃO...' : block.type === 'quote' ? 'CITAÇÃO DE IMPACTO...' : 'COLE AQUI O CONTEÚDO... AS QUEBRAS DE LINHA SERÃO PRESERVADAS.'}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'suggested' && (
          <div className="space-y-8 py-4">
            <FormField label="Selecionar Solução no Inventário">
              <Select value={suggestedForm.productId} onChange={(e) => setSuggestedForm({ ...suggestedForm, productId: e.target.value })}>
                <option value="">AGUARDANDO SELEÇÃO...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
              </Select>
            </FormField>
            <FormField label="Título de Chamada Customizado">
              <Input value={suggestedForm.customTitle} onChange={(e) => setSuggestedForm({ ...suggestedForm, customTitle: e.target.value })} placeholder="DEIXE EM BRANCO PARA USAR O NOME ORIGINAL" />
            </FormField>
            <div className="p-6 bg-[#0B1220] border-l-8 border-[#FF4D00]">
              <p className="text-[9px] font-black text-[#1D4ED8] uppercase tracking-[0.2em]">Nota técnica</p>
              <p className="text-white text-[10px] font-medium uppercase mt-2">Este bloco será exibido na seção "Inspirado em Sua Operação" da Home.</p>
            </div>
          </div>
        )}

        {activeTab === 'videocasts' && (
          <div className="space-y-10 py-4">
            <FormField label="Capa do Episódio (Audiovisual)">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-full md:w-64 aspect-video bg-white border-4 border-[#0B1220] flex items-center justify-center overflow-hidden shrink-0 relative shadow-[12px_12px_0px_0px_rgba(255,77,0,1)] group">
                  {videocastForm.thumbnailUrl || (videocastForm.videoUrl && getYouTubeThumbnail(videocastForm.videoUrl)) ? (
                    <img
                      src={videocastForm.thumbnailUrl || getYouTubeThumbnail(videocastForm.videoUrl!)}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      alt="Preview"
                    />
                  ) : (
                    <span className="text-5xl grayscale opacity-30">🎥</span>
                  )}
                  <div className="absolute inset-0 bg-[#0B1220]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => videocastThumbRef.current?.click()} className="p-4 bg-white border-2 border-[#0B1220] text-[#1D4ED8] font-black text-xs uppercase hover:bg-[#1D4ED8] hover:text-white transition-all">
                      CARREGAR CAPA
                    </button>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1D4ED8] text-white border-2 border-[#0B1220] font-black text-[9px] uppercase tracking-widest">
                    {videocastForm.thumbnailUrl ? 'UPLOAD CONFIRMADO' : videocastForm.videoUrl ? 'VÍNCULO YOUTUBE OK' : 'STATUS: PENDENTE'}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">O CMS capturará automaticamente a miniatura do YouTube, mas você pode sobrescrever com uma imagem técnica personalizada.</p>
                  <input type="file" ref={videocastThumbRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnailUrl' as any)} />
                </div>
              </div>
            </FormField>

            <FormField label="URL de Origin (YouTube/Vimeo)">
              <div className="relative">
                <Input
                  className="pr-16"
                  value={videocastForm.videoUrl}
                  onChange={(e) => setVideocastForm({ ...videocastForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {videocastForm.videoUrl && getYouTubeThumbnail(videocastForm.videoUrl) && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 bg-[#00FF41] border-2 border-[#0B1220] flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#0B1220]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Título do Programa/Episódio">
                <Input value={videocastForm.title} onChange={(e) => setVideocastForm({ ...videocastForm, title: e.target.value })} placeholder="EX: A NOVA ERA DA IA..." />
              </FormField>
              <FormField label="Rótulo da Categoria">
                <Input value={videocastForm.categoryLabel} onChange={(e) => setVideocastForm({ ...videocastForm, categoryLabel: e.target.value.toUpperCase() })} placeholder="EX: TECH TALK" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Participante / Host">
                <Input value={videocastForm.speakerLabel} onChange={(e) => setVideocastForm({ ...videocastForm, speakerLabel: e.target.value })} placeholder="EX: ISRAEL CABRAL" />
              </FormField>
              <FormField label="Disponibilidade">
                <Select value={videocastForm.status} onChange={(e) => setVideocastForm({ ...videocastForm, status: e.target.value as any })}>
                  <option value="active">ATIVO NO FEED</option>
                  <option value="inactive">REMOVER DO FEED</option>
                </Select>
              </FormField>
            </div>

            <div className="flex items-center gap-4 p-4 border border-[#0B1220] bg-slate-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!videocastForm.isHighlight}
                  onChange={(e) => setVideocastForm({ ...videocastForm, isHighlight: e.target.checked })}
                  className="w-5 h-5 accent-[#1D4ED8]"
                />
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#0B1220] flex items-center gap-2">
                    <span className="text-amber-500 text-lg leading-none">★</span> Destacar na Home
                  </span>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Se marcado, este vídeo aparecerá na vitrine principal da Home (limite de 3). Todos os vídeos ativos continuarão disponíveis na página completa de Videocasts.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="space-y-10 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <FormField label="Imagem do Slide">
                  <div className="space-y-4">
                    <div className="aspect-video bg-white border-4 border-[#0B1220] flex items-center justify-center overflow-hidden shrink-0 shadow-[8px_8px_0px_0px_rgba(255,77,0,1)] relative">
                      {heroForm.imageUrl ? <img src={heroForm.imageUrl} className="w-full h-full object-cover grayscale" alt="" /> : <span className="text-4xl grayscale">🖼️</span>}
                    </div>
                    <button onClick={() => heroImageRef.current?.click()} className="w-full py-4 bg-white border-2 border-[#0B1220] text-[9px] font-black uppercase tracking-[0.2rem] text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-all">UPLOAD DA IMAGEM</button>
                    <input type="file" ref={heroImageRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl' as any)} />
                  </div>
                </FormField>
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Ordem de Exibição">
                    <Input type="number" value={heroForm.order} onChange={(e) => setHeroForm({ ...heroForm, order: parseInt(e.target.value) || 0 })} />
                  </FormField>
                  <FormField label="Status">
                    <Select value={heroForm.status} onChange={(e) => setHeroForm({ ...heroForm, status: e.target.value as any })}>
                      <option value="active">ATIVO</option>
                      <option value="inactive">INATIVO</option>
                    </Select>
                  </FormField>
                </div>
              </div>

              <div className="space-y-6">
                <FormField label="Alt Text (Acessibilidade)">
                  <Input value={heroForm.altText} onChange={(e) => setHeroForm({ ...heroForm, altText: e.target.value })} placeholder="DESCRIÇÃO DA IMAGEM..." />
                </FormField>
                <FormField label="Título (Opcional)">
                  <Input value={heroForm.title} onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })} placeholder="TEXTO DE IMPACTO 1..." />
                </FormField>
                <FormField label="Subtítulo (Opcional)">
                  <Input value={heroForm.subtitle} onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })} placeholder="TEXTO DE IMPACTO 2..." />
                </FormField>
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Rótulo Botão">
                    <Input value={heroForm.ctaLabel} onChange={(e) => setHeroForm({ ...heroForm, ctaLabel: e.target.value })} />
                  </FormField>
                  <FormField label="Link Destino">
                    <Input value={heroForm.linkUrl} onChange={(e) => setHeroForm({ ...heroForm, linkUrl: e.target.value })} />
                  </FormField>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}