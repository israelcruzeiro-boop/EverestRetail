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
type ModalTab = 'basic' | 'content';

export default function Content() {
  const [activeTab, setActiveTab] = useState<Tab>('highlights');
  const [modalTab, setModalTab] = useState<ModalTab>('basic');
  const [config, setConfig] = useState<HomeContentConfig>({ highlights: [], suggested: [], videocasts: [] });
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Refs for uploads
  const highlightImageRef = useRef<HTMLInputElement>(null);
  const videocastThumbRef = useRef<HTMLInputElement>(null);

  // Form States
  const [highlightForm, setHighlightForm] = useState<Partial<WeeklyHighlight>>({
    title: '', slug: '', tag: 'OPERAÇÃO', imageUrl: '', readTimeLabel: '', ctaLabel: 'Ler agora', linkType: 'internal', linkUrl: '', status: 'active', order: 0, body: [], authorName: 'Redação ENT'
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
    setModalTab('basic');
    
    if (activeTab === 'highlights') {
      setHighlightForm(item || { 
        title: '', slug: '', tag: 'OPERAÇÃO', imageUrl: '', readTimeLabel: '', ctaLabel: 'Ler agora', linkType: 'internal', linkUrl: '', status: 'active', order: config.highlights.length + 1,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'highlight' | 'videocast') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = isValidImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      if (type === 'highlight') {
        setHighlightForm(prev => ({ ...prev, imageUrl: dataUrl }));
      } else {
        setVideocastForm(prev => ({ ...prev, thumbnailUrl: dataUrl }));
      }
    } catch (err) {
      alert('Erro ao processar imagem.');
    }
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

  // Content Block Helpers
  const addBlock = () => {
    setHighlightForm(prev => ({
      ...prev,
      body: [...(prev.body || []), { id: Math.random().toString(36).substr(2, 9), type: 'paragraph', text: '' }]
    }));
  };

  const updateBlock = (id: string, field: keyof ContentBlock, value: string) => {
    setHighlightForm(prev => ({
      ...prev,
      body: (prev.body || []).map(b => b.id === id ? { ...b, [field]: value } : b)
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
              { header: 'Tipo', accessor: (h) => h.linkType === 'internal' ? 'Interno (Artigo)' : 'Externo (URL)' },
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

        {activeTab === 'suggested' && (
          config.suggested.length > 0 ? (
            <DataTable data={config.suggested.sort((a, b) => a.order - b.order)} columns={[
              {
                header: 'Produto',
                accessor: (s) => {
                  const product = products.find(p => p.id === s.productId);
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-xs">📦</div>
                      <div>
                        <p className="font-bold text-slate-900">{s.customTitle || product?.name || 'Produto Indisponível'}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{product?.category || '-'}</p>
                      </div>
                    </div>
                  );
                }
              },
              { header: 'Ordem', accessor: 'order' },
              { header: 'Status', accessor: (s) => s.status === 'active' ? 'Ativo' : 'Inativo' },
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
              {
                header: 'Vídeo-cast',
                accessor: (v) => (
                  <div className="flex items-center gap-3">
                    <img src={v.thumbnailUrl} className="w-12 h-8 object-cover rounded" alt="" />
                    <div>
                      <p className="font-bold text-slate-900">{v.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{v.categoryLabel}</p>
                    </div>
                  </div>
                )
              },
              { header: 'Palestrante', accessor: 'speakerLabel' },
              { header: 'Ordem', accessor: 'order' },
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
            <button onClick={handleSave} className="px-6 py-2 bg-[#1D4ED8] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#1D4ED8]/20 transition-all">Salvar Alterações</button>
          </div>
        }
      >
        {activeTab === 'highlights' && (
          <div className="flex flex-col gap-6">
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setModalTab('basic')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${modalTab === 'basic' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent text-slate-400'}`}
              >
                Informações Básicas
              </button>
              <button 
                onClick={() => setModalTab('content')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${modalTab === 'content' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent text-slate-400'}`}
              >
                Conteúdo (Ler Mais)
              </button>
            </div>

            {modalTab === 'basic' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField label="Título do Destaque">
                      <Input value={highlightForm.title} onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })} />
                    </FormField>
                    <FormField label="URL da Imagem de Capa">
                      <div className="flex gap-2">
                        <Input value={highlightForm.imageUrl} onChange={(e) => setHighlightForm({ ...highlightForm, imageUrl: e.target.value })} placeholder="https://..." />
                        <button 
                          onClick={() => highlightImageRef.current?.click()}
                          className="px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all shrink-0"
                        >
                          Upload
                        </button>
                        <input type="file" ref={highlightImageRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'highlight')} />
                      </div>
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Tag (Ex: OPERAÇÃO)">
                        <Input value={highlightForm.tag} onChange={(e) => setHighlightForm({ ...highlightForm, tag: e.target.value })} />
                      </FormField>
                      <FormField label="Tipo de Link">
                        <Select value={highlightForm.linkType} onChange={(e) => setHighlightForm({ ...highlightForm, linkType: e.target.value as any })}>
                          <option value="internal">Interno (Conteúdo)</option>
                          <option value="external">Externo (URL)</option>
                        </Select>
                      </FormField>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {highlightForm.linkType === 'external' ? (
                      <FormField label="Link Externo">
                        <Input value={highlightForm.linkUrl} onChange={(e) => setHighlightForm({ ...highlightForm, linkUrl: e.target.value })} placeholder="https://..." />
                      </FormField>
                    ) : (
                      <FormField label="Slug da URL (Opcional)">
                        <Input value={highlightForm.slug} onChange={(e) => setHighlightForm({ ...highlightForm, slug: e.target.value })} placeholder="ex: titulo-do-destaque" />
                      </FormField>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Tempo de Leitura">
                        <Input value={highlightForm.readTimeLabel} onChange={(e) => setHighlightForm({ ...highlightForm, readTimeLabel: e.target.value })} placeholder="5 min leitura" />
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
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Autor do Conteúdo">
                    <Input value={highlightForm.authorName} onChange={(e) => setHighlightForm({ ...highlightForm, authorName: e.target.value })} />
                  </FormField>
                  <div className="flex items-end">
                    <button onClick={addBlock} className="w-full h-11 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-xs font-bold hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all">
                      + Adicionar Bloco de Texto
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {highlightForm.body?.map((block, idx) => (
                    <div key={block.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                      <div className="flex items-center justify-between gap-4">
                        <Select 
                          className="w-32 h-8 text-[10px] font-black" 
                          value={block.type} 
                          onChange={(e) => updateBlock(block.id, 'type', e.target.value as any)}
                        >
                          <option value="paragraph">Parágrafo</option>
                          <option value="heading">Título (H2)</option>
                          <option value="quote">Citação</option>
                          <option value="bullet">Marcador</option>
                        </Select>
                        <button onClick={() => removeBlock(block.id)} className="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                      </div>
                      <Textarea 
                        rows={block.type === 'paragraph' ? 3 : 1}
                        className="bg-white"
                        value={block.text}
                        onChange={(e) => updateBlock(block.id, 'text', e.target.value)}
                        placeholder="Digite o conteúdo aqui..."
                      />
                    </div>
                  ))}
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
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
              </Select>
            </FormField>
            <FormField label="Título Customizado (opcional)">
              <Input value={suggestedForm.customTitle} onChange={(e) => setSuggestedForm({ ...suggestedForm, customTitle: e.target.value })} placeholder="Título que aparecerá no card..." />
            </FormField>
            <FormField label="Texto do Botão (CTA)">
              <Input value={suggestedForm.customCta} onChange={(e) => setSuggestedForm({ ...suggestedForm, customCta: e.target.value })} placeholder="Saber mais" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ordem">
                <Input type="number" value={suggestedForm.order} onChange={(e) => setSuggestedForm({ ...suggestedForm, order: parseInt(e.target.value) || 0 })} />
              </FormField>
              <FormField label="Status">
                <Select value={suggestedForm.status} onChange={(e) => setSuggestedForm({ ...suggestedForm, status: e.target.value as any })}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </Select>
              </FormField>
            </div>
          </div>
        )}

        {activeTab === 'videocasts' && (
          <div className="space-y-4">
            <FormField label="Título do Vídeo">
              <Input value={videocastForm.title} onChange={(e) => setVideocastForm({ ...videocastForm, title: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Categoria/Etiqueta">
                <Input value={videocastForm.categoryLabel} onChange={(e) => setVideocastForm({ ...videocastForm, categoryLabel: e.target.value })} placeholder="Ex: PODCAST" />
              </FormField>
              <FormField label="Palestrante/Host">
                <Input value={videocastForm.speakerLabel} onChange={(e) => setVideocastForm({ ...videocastForm, speakerLabel: e.target.value })} placeholder="Ex: João Silva" />
              </FormField>
            </div>
            <FormField label="Thumbnail (URL)">
              <div className="flex gap-2">
                <Input value={videocastForm.thumbnailUrl} onChange={(e) => setVideocastForm({ ...videocastForm, thumbnailUrl: e.target.value })} placeholder="https://..." />
                <button 
                  onClick={() => videocastThumbRef.current?.click()}
                  className="px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all shrink-0"
                >
                  Upload
                </button>
                <input type="file" ref={videocastThumbRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'videocast')} />
              </div>
            </FormField>
            <FormField label="URL do Vídeo (YouTube/Vimeo)">
              <Input value={videocastForm.videoUrl} onChange={(e) => setVideocastForm({ ...videocastForm, videoUrl: e.target.value })} placeholder="https://youtube.com/..." />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ordem">
                <Input type="number" value={videocastForm.order} onChange={(e) => setVideocastForm({ ...videocastForm, order: parseInt(e.target.value) || 0 })} />
              </FormField>
              <FormField label="Status">
                <Select value={videocastForm.status} onChange={(e) => setVideocastForm({ ...videocastForm, status: e.target.value as any })}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </Select>
              </FormField>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}