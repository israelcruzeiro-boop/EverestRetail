import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import DataTable, { Column } from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Select, Textarea } from '../../components/admin/FormField';
import EmptyState from '../../components/admin/EmptyState';
import { storageService } from '../../lib/storageService';
import { WeeklyHighlight, SuggestedProductBlock, VideoCast, HomeContentConfig, ContentBlock, ContentBlockType } from '../../types/content';
import { AdminProduct } from '../../types/admin';
import { formatDateBR } from '../../lib/format';
import { isValidImageFile, readFileAsDataURL } from '../../lib/image';

type Tab = 'highlights' | 'suggested' | 'videocasts';
type ModalTab = 'card' | 'content';

export default function Content() {
  const [activeTab, setActiveTab] = useState<Tab>('highlights');
  const [modalTab, setModalTab] = useState<ModalTab>('card');
  const [config, setConfig] = useState<HomeContentConfig>({ highlights: [], suggested: [], videocasts: [] });
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Refs for uploads
  const highlightCardRef = useRef<HTMLInputElement>(null);
  const highlightCoverRef = useRef<HTMLInputElement>(null);
  const videocastThumbRef = useRef<HTMLInputElement>(null);

  // Form States
  const [highlightForm, setHighlightForm] = useState<Partial<WeeklyHighlight>>({
    title: '', subtitle: '', slug: '', tag: 'OPERAÇÃO', imageUrl: '', contentCoverUrl: '', readTimeLabel: '', ctaLabel: 'Ler agora', linkType: 'internal', linkUrl: '', status: 'active', order: 0, body: [], authorName: 'Redação ENT'
  });

  const [suggestedForm, setSuggestedForm] = useState<Partial<SuggestedProductBlock>>({
    productId: '', customTitle: '', customCta: 'Saber mais', status: 'active', order: 0
  });

  const [videocastForm, setVideocastForm] = useState<Partial<VideoCast>>({
    title: '', categoryLabel: '', description: '', thumbnailUrl: '', videoUrl: '', speakerLabel: '', status: 'active', order: 0
  });

  useEffect(() => {
    loadData();
    window.addEventListener('ENT_STORAGE_UPDATED', loadData);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadData);
  }, []);

  const loadData = () => {
    setConfig(storageService.getHomeContent());
    setProducts(storageService.getProducts());
  };

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
      setVideocastForm(item || { title: '', categoryLabel: '', description: '', thumbnailUrl: '', videoUrl: '', speakerLabel: '', status: 'active', order: config.videocasts.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'contentCoverUrl' | 'thumbnailUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = isValidImageFile(file);
    if (!validation.valid) { alert(validation.error); return; }
    try {
      const dataUrl = await readFileAsDataURL(file);
      if (activeTab === 'highlights') {
        setHighlightForm(prev => ({ ...prev, [field]: dataUrl }));
      } else {
        setVideocastForm(prev => ({ ...prev, thumbnailUrl: dataUrl }));
      }
    } catch (err) { alert('Erro ao processar imagem.'); }
  };

  const handleSave = () => {
    const currentConfig = storageService.getHomeContent();
    const newConfig = { ...currentConfig };

    if (activeTab === 'highlights') {
      const slug = highlightForm.slug || highlightForm.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
      const item = { ...highlightForm, id: editingItem?.id || Math.random().toString(36).substr(2, 9), slug } as WeeklyHighlight;
      if (editingItem) {
        newConfig.highlights = newConfig.highlights.map(h => h.id === editingItem.id ? item : h);
      } else {
        newConfig.highlights.push(item);
      }
    } else if (activeTab === 'suggested') {
      const item = { ...suggestedForm, id: editingItem?.id || Math.random().toString(36).substr(2, 9) } as SuggestedProductBlock;
      if (editingItem) {
        newConfig.suggested = newConfig.suggested.map(s => s.id === editingItem.id ? item : s);
      } else {
        newConfig.suggested.push(item);
      }
    } else if (activeTab === 'videocasts') {
      const item = { ...videocastForm, id: editingItem?.id || Math.random().toString(36).substr(2, 9) } as VideoCast;
      if (editingItem) {
        newConfig.videocasts = newConfig.videocasts.map(v => v.id === editingItem.id ? item : v);
      } else {
        newConfig.videocasts.push(item);
      }
    }

    storageService.saveHomeContent(newConfig);
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    const newConfig = { ...config };
    if (activeTab === 'highlights') newConfig.highlights = newConfig.highlights.filter(h => h.id !== id);
    if (activeTab === 'suggested') newConfig.suggested = newConfig.suggested.filter(s => s.id !== id);
    if (activeTab === 'videocasts') newConfig.videocasts = newConfig.videocasts.filter(v => v.id !== id);
    storageService.saveHomeContent(newConfig);
    loadData();
  };

  const addBlock = (type: ContentBlockType = 'paragraph') => {
    setHighlightForm(prev => ({
      ...prev,
      body: [...(prev.body || []), { id: Math.random().toString(36).substr(2, 9), type, text: '' }]
    }));
  };

  const updateBlock = (id: string, text: string) => {
    setHighlightForm(prev => ({
      ...prev,
      body: (prev.body || []).map(b => b.id === id ? { ...b, text } : b)
    }));
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
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[#1D4ED8] text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-[#1D4ED8]/20 transition-all hover:scale-[1.02]">
          + Novo Item
        </button>
      } />
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {(['highlights', 'suggested', 'videocasts'] as Tab[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap uppercase tracking-widest ${activeTab === tab ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent text-slate-400'}`}
            >
              {tab === 'highlights' ? 'Destaques' : tab === 'suggested' ? 'Sugeridos' : 'Vídeo-casts'}
            </button>
          ))}
        </div>

        {activeTab === 'highlights' && (
          config.highlights.length > 0 ? (
            <DataTable data={config.highlights.sort((a, b) => a.order - b.order)} columns={[
              {
                header: 'Destaque',
                accessor: (h) => (
                  <div className="flex items-center gap-3">
                    <img src={h.imageUrl} className="w-12 h-8 object-cover rounded border border-slate-100" alt="" />
                    <div>
                      <p className="font-bold text-slate-900">{h.title}</p>
                      <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-widest">{h.tag}</span>
                    </div>
                  </div>
                )
              },
              { header: 'Status', accessor: (h) => h.status === 'active' ? 'Ativo' : 'Inativo' },
              {
                header: 'Ações',
                align: 'right',
                accessor: (h) => (
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(h)} className="text-xs font-bold text-[#1D4ED8] hover:underline">Editar</button>
                    <button onClick={() => handleDelete(h.id)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
                  </div>
                )
              }
            ]} />
          ) : <EmptyState title="Nenhum destaque" description="Adicione seu primeiro destaque para a Home." icon="✨" />
        )}

        {/* Suggested and Videocast tables */}
        {activeTab === 'suggested' && (
          config.suggested.length > 0 ? (
            <DataTable data={config.suggested.sort((a, b) => a.order - b.order)} columns={[
              {
                header: 'Produto',
                accessor: (s) => {
                  const product = products.find(p => p.id === s.productId);
                  return <span className="font-bold">{s.customTitle || product?.name || 'Produto'}</span>;
                }
              },
              { header: 'Ordem', accessor: 'order' },
              {
                header: 'Ações',
                align: 'right',
                accessor: (s) => (
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(s)} className="text-xs font-bold text-[#1D4ED8] hover:underline">Editar</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
                  </div>
                )
              }
            ]} />
          ) : <EmptyState title="Sem Sugestões" description="Selecione produtos para destacar na Home." icon="📦" />
        )}

        {activeTab === 'videocasts' && (
          config.videocasts.length > 0 ? (
            <DataTable data={config.videocasts.sort((a, b) => a.order - b.order)} columns={[
              { header: 'Vídeo-cast', accessor: (v) => <span className="font-bold">{v.title}</span> },
              { header: 'Status', accessor: (v) => v.status === 'active' ? 'Ativo' : 'Inativo' },
              {
                header: 'Ações',
                align: 'right',
                accessor: (v) => (
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(v)} className="text-xs font-bold text-[#1D4ED8] hover:underline">Editar</button>
                    <button onClick={() => handleDelete(v.id)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
                  </div>
                )
              }
            ]} />
          ) : <EmptyState title="Sem Vídeos" description="Adicione seus vídeo-casts para a Home." icon="🎥" />
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? 'Editar Item' : 'Novo Item'}
        size={activeTab === 'highlights' ? 'xl' : 'lg'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-[#1D4ED8] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#1D4ED8]/20 transition-all hover:scale-[1.02]">Salvar Alterações</button>
          </div>
        }
      >
        {activeTab === 'highlights' && (
          <div className="flex flex-col gap-6">
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setModalTab('card')}
                className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${modalTab === 'card' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent text-slate-400'}`}
              >
                Configurações do Card
              </button>
              <button 
                onClick={() => setModalTab('content')}
                className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${modalTab === 'content' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent text-slate-400'}`}
              >
                Conteúdo da Publicação
              </button>
            </div>

            {modalTab === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <FormField label="Título no Card">
                    <Input value={highlightForm.title} onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })} placeholder="Título chamativo para a Home..." />
                  </FormField>
                  <FormField label="Imagem do Card (Thumbnail)">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        {highlightForm.imageUrl ? <img src={highlightForm.imageUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-xl opacity-20">🖼️</span>}
                      </div>
                      <div className="flex-1 space-y-2">
                        <button onClick={() => highlightCardRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Upload da Miniatura</button>
                        <input type="file" ref={highlightCardRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
                      </div>
                    </div>
                  </FormField>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Tag (Ex: IA)">
                      <Input value={highlightForm.tag} onChange={(e) => setHighlightForm({ ...highlightForm, tag: e.target.value.toUpperCase() })} />
                    </FormField>
                    <FormField label="Ordem">
                      <Input type="number" value={highlightForm.order} onChange={(e) => setHighlightForm({ ...highlightForm, order: parseInt(e.target.value) || 0 })} />
                    </FormField>
                  </div>
                  <FormField label="Status">
                    <Select value={highlightForm.status} onChange={(e) => setHighlightForm({ ...highlightForm, status: e.target.value as any })}>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </Select>
                  </FormField>
                </div>
              </div>
            ) : (
              <div className="space-y-8 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 space-y-4">
                    <FormField label="Imagem de Capa (Interna)">
                      <div className="space-y-3">
                        <div className="aspect-[4/3] bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
                          {highlightForm.contentCoverUrl ? <img src={highlightForm.contentCoverUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-3xl opacity-20">🌄</span>}
                        </div>
                        <button onClick={() => highlightCoverRef.current?.click()} className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Upload da Capa</button>
                        <input type="file" ref={highlightCoverRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'contentCoverUrl')} />
                      </div>
                    </FormField>
                    <FormField label="Autor da Matéria">
                      <Input value={highlightForm.authorName} onChange={(e) => setHighlightForm({ ...highlightForm, authorName: e.target.value })} />
                    </FormField>
                  </div>
                  <div className="md:col-span-2 space-y-6">
                    <FormField label="Título da Publicação">
                      <Input className="text-lg font-bold" value={highlightForm.title} onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })} placeholder="Título principal..." />
                    </FormField>
                    <FormField label="Subtítulo / Lead">
                      <Textarea value={highlightForm.subtitle} onChange={(e) => setHighlightForm({ ...highlightForm, subtitle: e.target.value })} placeholder="Resumo que introduz o texto..." rows={3} />
                    </FormField>
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conteúdo</h4>
                      <button onClick={() => addBlock('paragraph')} className="text-xs font-bold text-[#1D4ED8]">+ Adicionar Bloco</button>
                    </div>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                      {highlightForm.body?.map((block) => (
                        <div key={block.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[8px] font-black uppercase bg-slate-200 px-1.5 py-0.5 rounded">{block.type}</span>
                            <button onClick={() => removeBlock(block.id)} className="text-red-500 text-xs">✕</button>
                          </div>
                          <Textarea 
                            className="bg-white text-sm"
                            value={block.text}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggested' && (
          <div className="space-y-4">
            <FormField label="Vincular Produto">
              <Select value={suggestedForm.productId} onChange={(e) => setSuggestedForm({ ...suggestedForm, productId: e.target.value })}>
                <option value="">Selecione um produto...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Título Customizado">
              <Input value={suggestedForm.customTitle} onChange={(e) => setSuggestedForm({ ...suggestedForm, customTitle: e.target.value })} />
            </FormField>
          </div>
        )}

        {activeTab === 'videocasts' && (
          <div className="space-y-4">
            <FormField label="Thumbnail">
              <div className="flex items-center gap-4">
                <div className="w-24 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  {videocastForm.thumbnailUrl ? <img src={videocastForm.thumbnailUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-xl opacity-20">🎥</span>}
                </div>
                <div className="flex-1 space-y-2">
                  <button onClick={() => videocastThumbRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Upload Thumbnail</button>
                  <input type="file" ref={videocastThumbRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnailUrl' as any)} />
                </div>
              </div>
            </FormField>
            <FormField label="Título">
              <Input value={videocastForm.title} onChange={(e) => setVideocastForm({ ...videocastForm, title: e.target.value })} />
            </FormField>
            <FormField label="URL do Vídeo">
              <Input value={videocastForm.videoUrl} onChange={(e) => setVideocastForm({ ...videocastForm, videoUrl: e.target.value })} placeholder="YouTube Link..." />
            </FormField>
          </div>
        )}
      </Modal>
    </>
  );
}