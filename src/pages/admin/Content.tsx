import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import DataTable, { Column } from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Select } from '../../components/admin/FormField';
import EmptyState from '../../components/admin/EmptyState';
import { storageService } from '../../lib/storageService';
import { WeeklyHighlight, SuggestedProductBlock, VideoCast, HomeContentConfig } from '../../types/content';
import { AdminProduct } from '../../types/admin';

type Tab = 'highlights' | 'suggested' | 'videocasts';

export default function Content() {
  const [activeTab, setActiveTab] = useState<Tab>('highlights');
  const [config, setConfig] = useState<HomeContentConfig>({ highlights: [], suggested: [], videocasts: [] });
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [highlightForm, setHighlightForm] = useState<Partial<WeeklyHighlight>>({
    title: '',
    tag: 'OPERAÇÃO',
    imageUrl: '',
    readTimeLabel: '',
    ctaLabel: 'Ler agora',
    linkType: 'internal',
    linkUrl: '',
    status: 'active',
    order: 0
  });

  const [suggestedForm, setSuggestedForm] = useState<Partial<SuggestedProductBlock>>({
    productId: '',
    customTitle: '',
    customCta: 'Saber mais',
    status: 'active',
    order: 0
  });

  const [videocastForm, setVideocastForm] = useState<Partial<VideoCast>>({
    title: '',
    categoryLabel: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    speakerLabel: '',
    status: 'active',
    order: 0
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
    if (item) {
      setEditingItem(item);
      if (activeTab === 'highlights') setHighlightForm(item);
      if (activeTab === 'suggested') setSuggestedForm(item);
      if (activeTab === 'videocasts') setVideocastForm(item);
    } else {
      setEditingItem(null);
      if (activeTab === 'highlights') setHighlightForm({ title: '', tag: 'OPERAÇÃO', imageUrl: '', readTimeLabel: '', ctaLabel: 'Ler agora', linkType: 'internal', linkUrl: '', status: 'active', order: config.highlights.length + 1 });
      if (activeTab === 'suggested') setSuggestedForm({ productId: products[0]?.id || '', customTitle: '', customCta: 'Saber mais', status: 'active', order: config.suggested.length + 1 });
      if (activeTab === 'videocasts') setVideocastForm({ title: '', categoryLabel: '', description: '', thumbnailUrl: '', videoUrl: '', speakerLabel: '', status: 'active', order: config.videocasts.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'highlight' | 'videocast') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'highlight') setHighlightForm({ ...highlightForm, imageUrl: base64 });
      if (type === 'videocast') setVideocastForm({ ...videocastForm, thumbnailUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const newConfig = { ...config };

    if (activeTab === 'highlights') {
      const item = { ...highlightForm, id: editingItem?.id || Math.random().toString(36).substr(2, 9) } as WeeklyHighlight;
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
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    const currentConfig = storageService.getHomeContent();
    const newConfig = { ...currentConfig };
    
    if (activeTab === 'highlights') newConfig.highlights = newConfig.highlights.filter(h => h.id !== id);
    if (activeTab === 'suggested') newConfig.suggested = newConfig.suggested.filter(s => s.id !== id);
    if (activeTab === 'videocasts') newConfig.videocasts = newConfig.videocasts.filter(v => v.id !== id);
    
    storageService.saveHomeContent(newConfig);
    loadData();
  };

  const handleToggleStatus = (item: any) => {
    const newConfig = { ...config };
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    
    if (activeTab === 'highlights') newConfig.highlights = newConfig.highlights.map(h => h.id === item.id ? { ...h, status: newStatus } : h);
    if (activeTab === 'suggested') newConfig.suggested = newConfig.suggested.map(s => s.id === item.id ? { ...s, status: newStatus } : s);
    if (activeTab === 'videocasts') newConfig.videocasts = newConfig.videocasts.map(v => v.id === item.id ? { ...v, status: newStatus } : v);
    
    storageService.saveHomeContent(newConfig);
    loadData();
  };

  const highlightColumns: Column<WeeklyHighlight>[] = [
    {
      header: 'Destaque',
      accessor: (h) => (
        <div className="flex items-center gap-3">
          <img src={h.imageUrl} className="w-12 h-8 object-cover rounded" alt="" />
          <div>
            <p className="font-bold text-slate-900">{h.title}</p>
            <span className="text-[10px] font-black text-[#0052cc] uppercase tracking-widest">{h.tag}</span>
          </div>
        </div>
      )
    },
    { header: 'Ordem', accessor: 'order' },
    {
      header: 'Status',
      accessor: (h) => (
        <button 
          onClick={() => handleToggleStatus(h)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${h.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}
        >
          {h.status === 'active' ? 'Ativo' : 'Inativo'}
        </button>
      )
    },
    {
      header: 'Ações',
      align: 'right',
      accessor: (h) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleOpenModal(h)} className="text-xs font-bold text-[#0052cc] hover:underline">Editar</button>
          <button onClick={() => handleDelete(h.id)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
        </div>
      )
    }
  ];

  const suggestedColumns: Column<SuggestedProductBlock>[] = [
    {
      header: 'Produto',
      accessor: (s) => {
        const p = products.find(prod => prod.id === s.productId);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
              {p?.logoImageUrl || p?.heroImageUrl ? <img src={p.logoImageUrl || p.heroImageUrl} className="w-full h-full object-cover rounded" alt="" /> : '📦'}
            </div>
            <div>
              <p className="font-bold text-slate-900">{s.customTitle || p?.name || 'Produto não encontrado'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{p?.category}</p>
            </div>
          </div>
        );
      }
    },
    { header: 'Ordem', accessor: 'order' },
    {
      header: 'Status',
      accessor: (s) => (
        <button 
          onClick={() => handleToggleStatus(s)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}
        >
          {s.status === 'active' ? 'Ativo' : 'Inativo'}
        </button>
      )
    },
    {
      header: 'Ações',
      align: 'right',
      accessor: (s) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleOpenModal(s)} className="text-xs font-bold text-[#0052cc] hover:underline">Editar</button>
          <button onClick={() => handleDelete(s.id)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
        </div>
      )
    }
  ];

  const videocastColumns: Column<VideoCast>[] = [
    {
      header: 'Vídeo-cast',
      accessor: (v) => (
        <div className="flex items-center gap-3">
          <img src={v.thumbnailUrl} className="w-12 h-8 object-cover rounded" alt="" />
          <div>
            <p className="font-bold text-slate-900">{v.title}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{v.categoryLabel}</p>
          </div>
        </div>
      )
    },
    { header: 'Ordem', accessor: 'order' },
    {
      header: 'Status',
      accessor: (v) => (
        <button 
          onClick={() => handleToggleStatus(v)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}
        >
          {v.status === 'active' ? 'Ativo' : 'Inativo'}
        </button>
      )
    },
    {
      header: 'Ações',
      align: 'right',
      accessor: (v) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleOpenModal(v)} className="text-xs font-bold text-[#0052cc] hover:underline">Editar</button>
          <button onClick={() => handleDelete(v.id)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
        </div>
      )
    }
  ];

  return (
    <>
      <AdminTopbar title="Gestão de Conteúdo (CMS)" actions={
        <button onClick={() => handleOpenModal()} className="px-3 md:px-4 py-2 bg-[#0052cc] text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-[#0052cc]/20 transition-all">
          <span className="hidden sm:inline">+ Novo Item</span>
          <span className="sm:hidden">+ Novo</span>
        </button>
      } />
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('highlights')}
            className={`px-4 md:px-6 py-3 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'highlights' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Destaques
          </button>
          <button 
            onClick={() => setActiveTab('suggested')}
            className={`px-4 md:px-6 py-3 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'suggested' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Produtos Sugeridos
          </button>
          <button 
            onClick={() => setActiveTab('videocasts')}
            className={`px-4 md:px-6 py-3 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'videocasts' ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Vídeo-cast
          </button>
        </div>

        {activeTab === 'highlights' && (
          config.highlights.length > 0 ? (
            <DataTable data={config.highlights.sort((a, b) => a.order - b.order)} columns={highlightColumns} />
          ) : (
            <EmptyState title="Nenhum destaque" description="Adicione destaques para a página inicial." icon="✨" />
          )
        )}

        {activeTab === 'suggested' && (
          config.suggested.length > 0 ? (
            <DataTable data={config.suggested.sort((a, b) => a.order - b.order)} columns={suggestedColumns} />
          ) : (
            <EmptyState title="Nenhuma sugestão" description="Adicione produtos sugeridos para a página inicial." icon="🛍️" />
          )
        )}

        {activeTab === 'videocasts' && (
          config.videocasts.length > 0 ? (
            <DataTable data={config.videocasts.sort((a, b) => a.order - b.order)} columns={videocastColumns} />
          ) : (
            <EmptyState title="Nenhum vídeo-cast" description="Adicione vídeo-casts para a página inicial." icon="🎥" />
          )
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? 'Editar Item' : 'Novo Item'}
        size="lg"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-[#0052cc] text-white rounded-xl text-sm font-bold">Salvar Alterações</button>
          </>
        }
      >
        {activeTab === 'highlights' && (
          <div className="space-y-4">
            <FormField label="Título do Destaque">
              <Input value={highlightForm.title} onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tag (Badge)">
                <Input placeholder="Ex: OPERAÇÃO" value={highlightForm.tag} onChange={(e) => setHighlightForm({ ...highlightForm, tag: e.target.value })} />
              </FormField>
              <FormField label="Tempo de Leitura">
                <Input placeholder="Ex: 5 min leitura" value={highlightForm.readTimeLabel} onChange={(e) => setHighlightForm({ ...highlightForm, readTimeLabel: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Imagem de Capa">
              <div className="space-y-2">
                {highlightForm.imageUrl && <img src={highlightForm.imageUrl} className="w-full h-32 object-cover rounded-xl border border-slate-200" alt="" />}
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'highlight')} />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:border-[#0052cc] hover:text-[#0052cc] transition-all">
                  {highlightForm.imageUrl ? 'Alterar Imagem' : 'Upload Imagem'}
                </button>
              </div>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tipo de Link">
                <Select value={highlightForm.linkType} onChange={(e) => setHighlightForm({ ...highlightForm, linkType: e.target.value as any })}>
                  <option value="internal">Interno (Rota)</option>
                  <option value="external">Externo (URL)</option>
                </Select>
              </FormField>
              <FormField label="URL/Rota">
                <Input placeholder={highlightForm.linkType === 'internal' ? '/marketplace' : 'https://...'} value={highlightForm.linkUrl} onChange={(e) => setHighlightForm({ ...highlightForm, linkUrl: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ordem">
                <Input type="number" value={highlightForm.order} onChange={(e) => setHighlightForm({ ...highlightForm, order: parseInt(e.target.value) })} />
              </FormField>
              <FormField label="Status">
                <Select value={highlightForm.status} onChange={(e) => setHighlightForm({ ...highlightForm, status: e.target.value as any })}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </Select>
              </FormField>
            </div>
          </div>
        )}

        {activeTab === 'suggested' && (
          <div className="space-y-4">
            <FormField label="Selecionar Produto">
              <Select value={suggestedForm.productId} onChange={(e) => setSuggestedForm({ ...suggestedForm, productId: e.target.value })}>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Título Customizado (Opcional)">
              <Input placeholder="Deixe vazio para usar o nome original" value={suggestedForm.customTitle} onChange={(e) => setSuggestedForm({ ...suggestedForm, customTitle: e.target.value })} />
            </FormField>
            <FormField label="Texto do CTA">
              <Input value={suggestedForm.customCta} onChange={(e) => setSuggestedForm({ ...suggestedForm, customCta: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ordem">
                <Input type="number" value={suggestedForm.order} onChange={(e) => setSuggestedForm({ ...suggestedForm, order: parseInt(e.target.value) })} />
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
              <FormField label="Categoria/Sessão">
                <Input placeholder="Ex: GESTÃO • SESSÃO #42" value={videocastForm.categoryLabel} onChange={(e) => setVideocastForm({ ...videocastForm, categoryLabel: e.target.value })} />
              </FormField>
              <FormField label="Palestrantes/Speakers">
                <Input placeholder="Ex: Com Marcos Paulo..." value={videocastForm.speakerLabel} onChange={(e) => setVideocastForm({ ...videocastForm, speakerLabel: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Thumbnail">
              <div className="space-y-2">
                {videocastForm.thumbnailUrl && <img src={videocastForm.thumbnailUrl} className="w-full h-32 object-cover rounded-xl border border-slate-200" alt="" />}
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'videocast')} />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:border-[#0052cc] hover:text-[#0052cc] transition-all">
                  {videocastForm.thumbnailUrl ? 'Alterar Thumbnail' : 'Upload Thumbnail'}
                </button>
              </div>
            </FormField>
            <FormField label="URL do Vídeo (YouTube)">
              <Input placeholder="https://youtube.com/watch?v=..." value={videocastForm.videoUrl} onChange={(e) => setVideocastForm({ ...videocastForm, videoUrl: e.target.value })} />
            </FormField>
            <FormField label="Descrição (Opcional)">
              <Input value={videocastForm.description} onChange={(e) => setVideocastForm({ ...videocastForm, description: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ordem">
                <Input type="number" value={videocastForm.order} onChange={(e) => setVideocastForm({ ...videocastForm, order: parseInt(e.target.value) })} />
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
