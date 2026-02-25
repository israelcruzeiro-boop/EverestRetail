import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import DataTable, { Column } from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Select, Textarea } from '../../components/admin/FormField';
import EmptyState from '../../components/admin/EmptyState';
import { storageService } from '../../lib/storageService';
import { WeeklyHighlight, SuggestedProductBlock, VideoCast, HomeContentConfig, ContentArticle, ContentBlock, ContentBlockType } from '../../types/content';
import { AdminProduct } from '../../types/admin';
import { formatDateBR } from '../../lib/format';

type Tab = 'highlights' | 'articles' | 'suggested' | 'videocasts';

export default function Content() {
  const [activeTab, setActiveTab] = useState<Tab>('highlights');
  const [config, setConfig] = useState<HomeContentConfig>({ highlights: [], suggested: [], videocasts: [] });
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form States
  const [highlightForm, setHighlightForm] = useState<Partial<WeeklyHighlight>>({
    title: '', tag: 'OPERAÇÃO', imageUrl: '', readTimeLabel: '', ctaLabel: 'Ler agora', linkType: 'internal', linkUrl: '', contentId: '', status: 'active', order: 0
  });

  const [suggestedForm, setSuggestedForm] = useState<Partial<SuggestedProductBlock>>({
    productId: '', customTitle: '', customCta: 'Saber mais', status: 'active', order: 0
  });

  const [videocastForm, setVideocastForm] = useState<Partial<VideoCast>>({
    title: '', categoryLabel: '', description: '', thumbnailUrl: '', videoUrl: '', speakerLabel: '', status: 'active', order: 0
  });

  const [articleForm, setArticleForm] = useState<Partial<ContentArticle>>({
    title: '', slug: '', excerpt: '', coverImageUrl: '', readingTime: '', authorName: '', tags: [], status: 'published', body: []
  });

  useEffect(() => {
    loadData();
    window.addEventListener('ENT_STORAGE_UPDATED', loadData);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadData);
  }, []);

  const loadData = () => {
    setConfig(storageService.getHomeContent());
    setProducts(storageService.getProducts());
    setArticles(storageService.getArticles());
  };

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null);
    if (activeTab === 'highlights') {
      setHighlightForm(item || { title: '', tag: 'OPERAÇÃO', imageUrl: '', readTimeLabel: '', ctaLabel: 'Ler agora', linkType: 'internal', linkUrl: '', contentId: '', status: 'active', order: config.highlights.length + 1 });
    } else if (activeTab === 'suggested') {
      setSuggestedForm(item || { productId: products[0]?.id || '', customTitle: '', customCta: 'Saber mais', status: 'active', order: config.suggested.length + 1 });
    } else if (activeTab === 'videocasts') {
      setVideocastForm(item || { title: '', categoryLabel: '', description: '', thumbnailUrl: '', videoUrl: '', speakerLabel: '', status: 'active', order: config.videocasts.length + 1 });
    } else if (activeTab === 'articles') {
      setArticleForm(item || { 
        title: '', slug: '', excerpt: '', coverImageUrl: '', readingTime: '', authorName: '', tags: [], status: 'published', 
        body: [{ id: Math.random().toString(36).substr(2, 9), type: 'paragraph', text: '' }] 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const currentConfig = storageService.getHomeContent();
    const newConfig = { ...currentConfig };

    if (activeTab === 'highlights') {
      // Auto-gerar link se for artigo interno
      let finalUrl = highlightForm.linkUrl || '';
      if (highlightForm.linkType === 'internal' && highlightForm.contentId) {
        const art = articles.find(a => a.id === highlightForm.contentId);
        if (art) finalUrl = `/conteudo/${art.slug}`;
      }

      const item = { ...highlightForm, id: editingItem?.id || Math.random().toString(36).substr(2, 9), linkUrl: finalUrl } as WeeklyHighlight;
      if (editingItem) {
        newConfig.highlights = newConfig.highlights.map(h => h.id === editingItem.id ? item : h);
      } else {
        newConfig.highlights.push(item);
      }
      storageService.saveHomeContent(newConfig);
    } else if (activeTab === 'articles') {
      const allArticles = storageService.getArticles();
      const slug = articleForm.slug || articleForm.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
      const item = { 
        ...articleForm, 
        id: editingItem?.id || Math.random().toString(36).substr(2, 9), 
        slug,
        createdAt: editingItem?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as ContentArticle;

      if (editingItem) {
        storageService.saveArticles(allArticles.map(a => a.id === editingItem.id ? item : a));
      } else {
        storageService.saveArticles([...allArticles, item]);
      }
    } else if (activeTab === 'suggested') {
      const item = { ...suggestedForm, id: editingItem?.id || Math.random().toString(36).substr(2, 9) } as SuggestedProductBlock;
      if (editingItem) {
        newConfig.suggested = newConfig.suggested.map(s => s.id === editingItem.id ? item : s);
      } else {
        newConfig.suggested.push(item);
      }
      storageService.saveHomeContent(newConfig);
    } else if (activeTab === 'videocasts') {
      const item = { ...videocastForm, id: editingItem?.id || Math.random().toString(36).substr(2, 9) } as VideoCast;
      if (editingItem) {
        newConfig.videocasts = newConfig.videocasts.map(v => v.id === editingItem.id ? item : v);
      } else {
        newConfig.videocasts.push(item);
      }
      storageService.saveHomeContent(newConfig);
    }

    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    if (activeTab === 'articles') {
      storageService.saveArticles(articles.filter(a => a.id !== id));
    } else {
      const newConfig = { ...config };
      if (activeTab === 'highlights') newConfig.highlights = newConfig.highlights.filter(h => h.id !== id);
      if (activeTab === 'suggested') newConfig.suggested = newConfig.suggested.filter(s => s.id !== id);
      if (activeTab === 'videocasts') newConfig.videocasts = newConfig.videocasts.filter(v => v.id !== id);
      storageService.saveHomeContent(newConfig);
    }
    loadData();
  };

  // Funções do Editor de Blocos de Artigo
  const addBlock = () => {
    setArticleForm({
      ...articleForm,
      body: [...(articleForm.body || []), { id: Math.random().toString(36).substr(2, 9), type: 'paragraph', text: '' }]
    });
  };

  const updateBlock = (id: string, field: keyof ContentBlock, value: string) => {
    setArticleForm({
      ...articleForm,
      body: (articleForm.body || []).map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  const removeBlock = (id: string) => {
    setArticleForm({
      ...articleForm,
      body: (articleForm.body || []).filter(b => b.id !== id)
    });
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...(articleForm.body || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    setArticleForm({ ...articleForm, body: blocks });
  };

  const articleColumns: Column<ContentArticle>[] = [
    {
      header: 'Título',
      accessor: (a) => (
        <div className="flex flex-col">
          <p className="font-bold text-slate-900">{a.title}</p>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{a.slug}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (a) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {a.status === 'published' ? 'Publicado' : 'Rascunho'}
        </span>
      )
    },
    { header: 'Criado em', accessor: (a) => formatDateBR(a.createdAt) },
    {
      header: 'Ações',
      align: 'right',
      accessor: (a) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleOpenModal(a)} className="text-xs font-bold text-[#1D4ED8] hover:underline">Editar</button>
          <button onClick={() => handleDelete(a.id)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
        </div>
      )
    }
  ];

  return (
    <>
      <AdminTopbar title="Gestão de Conteúdo (CMS)" actions={
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[#1D4ED8] text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-[#1D4ED8]/20 transition-all hover:scale-[1.02]">
          + Novo Item
        </button>
      } />
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {(['highlights', 'articles', 'suggested', 'videocasts'] as Tab[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap uppercase tracking-widest ${activeTab === tab ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent text-slate-400'}`}
            >
              {tab === 'highlights' ? 'Destaques' : tab === 'articles' ? 'Artigos' : tab === 'suggested' ? 'Sugeridos' : 'Vídeo-casts'}
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

        {activeTab === 'articles' && (
          articles.length > 0 ? <DataTable data={articles} columns={articleColumns} /> : <EmptyState title="Nenhum artigo" description="Escreva artigos para serem vinculados aos destaques." icon="✍️" />
        )}

        {/* Outras tabs mantidas para compatibilidade */}
        {(activeTab === 'suggested' || activeTab === 'videocasts') && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Gestão de {activeTab} disponível em breve nesta visão.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? 'Editar Item' : 'Novo Item'}
        size={activeTab === 'articles' ? 'xl' : 'lg'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-[#1D4ED8] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#1D4ED8]/20 transition-all hover:scale-[1.02]">Salvar Alterações</button>
          </div>
        }
      >
        {activeTab === 'highlights' && (
          <div className="space-y-4">
            <FormField label="Título do Destaque">
              <Input value={highlightForm.title} onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tag (Badge)">
                <Input value={highlightForm.tag} onChange={(e) => setHighlightForm({ ...highlightForm, tag: e.target.value })} />
              </FormField>
              <FormField label="Tipo de Link">
                <Select value={highlightForm.linkType} onChange={(e) => setHighlightForm({ ...highlightForm, linkType: e.target.value as any })}>
                  <option value="internal">Interno (Artigo)</option>
                  <option value="external">Externo (URL)</option>
                </Select>
              </FormField>
            </div>
            {highlightForm.linkType === 'internal' ? (
              <FormField label="Vincular Artigo">
                <Select value={highlightForm.contentId} onChange={(e) => setHighlightForm({ ...highlightForm, contentId: e.target.value })}>
                  <option value="">Selecione um artigo...</option>
                  {articles.map(a => <option key={a.id} value={a.id}>{a.title} ({a.status})</option>)}
                </Select>
              </FormField>
            ) : (
              <FormField label="URL Externa">
                <Input value={highlightForm.linkUrl} onChange={(e) => setHighlightForm({ ...highlightForm, linkUrl: e.target.value })} placeholder="https://..." />
              </FormField>
            )}
            <FormField label="Capa do Card (URL)">
              <Input value={highlightForm.imageUrl} onChange={(e) => setHighlightForm({ ...highlightForm, imageUrl: e.target.value })} placeholder="https://..." />
            </FormField>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-2">Metadados</h3>
              <FormField label="Título">
                <Input value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} placeholder="Título chamativo..." />
              </FormField>
              <FormField label="Slug">
                <Input value={articleForm.slug} onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })} placeholder="auto-gerado-se-vazio" />
              </FormField>
              <FormField label="Autor">
                <Input value={articleForm.authorName} onChange={(e) => setArticleForm({ ...articleForm, authorName: e.target.value })} placeholder="Nome do autor..." />
              </FormField>
              <FormField label="Tempo de Leitura">
                <Input value={articleForm.readingTime} onChange={(e) => setArticleForm({ ...articleForm, readingTime: e.target.value })} placeholder="Ex: 5 min leitura" />
              </FormField>
              <FormField label="Tags (separadas por vírgula)">
                <Input 
                  value={articleForm.tags?.join(', ')} 
                  onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) })} 
                  placeholder="IA, VAREJO, DADOS"
                />
              </FormField>
              <FormField label="Capa (URL)">
                <Input value={articleForm.coverImageUrl} onChange={(e) => setArticleForm({ ...articleForm, coverImageUrl: e.target.value })} placeholder="https://..." />
              </FormField>
              <FormField label="Status">
                <Select value={articleForm.status} onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value as any })}>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </Select>
              </FormField>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Conteúdo (Editor de Blocos)</h3>
                <button onClick={addBlock} className="text-xs font-bold text-[#1D4ED8] hover:underline">+ Adicionar Bloco</button>
              </div>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {articleForm.body?.map((block, idx) => (
                  <div key={block.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Select 
                          className="w-32 h-8 text-[10px] font-black" 
                          value={block.type} 
                          onChange={(e) => updateBlock(block.id, 'type', e.target.value as any)}
                        >
                          <option value="paragraph">Parágrafo</option>
                          <option value="heading">Título (H2)</option>
                          <option value="quote">Citação</option>
                          <option value="bullet">Marcador (Bullet)</option>
                        </Select>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => moveBlock(idx, 'up')} className="p-1 text-slate-400 hover:text-[#1D4ED8] transition-colors" title="Subir">↑</button>
                        <button onClick={() => moveBlock(idx, 'down')} className="p-1 text-slate-400 hover:text-[#1D4ED8] transition-colors" title="Descer">↓</button>
                        <button onClick={() => removeBlock(block.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Remover">✕</button>
                      </div>
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

                {(!articleForm.body || articleForm.body.length === 0) && (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <button onClick={addBlock} className="text-sm font-bold text-[#1D4ED8]">+ Começar a escrever</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}