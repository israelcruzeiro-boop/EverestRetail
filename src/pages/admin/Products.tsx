import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import FormField, { Input, Select, Textarea } from '@/components/admin/FormField';
import EmptyState from '@/components/admin/EmptyState';
import { supabase } from '@/lib/supabase';
import { storageService } from '@/lib/storageService';
import { supabaseService } from '@/lib/supabaseService';
import { AdminProduct, ProductCategory, ProductStatus } from '@/types/admin';
import { formatBRLFromCents } from '@/lib/format';
import { isValidImageFile } from '@/lib/image';
import { storageUploadRepo } from '@/lib/repositories/storageUploadRepo';

type TabType = 'basic' | 'price' | 'images' | 'features' | 'benefits' | 'testimonial' | 'ctas';

export default function Products() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // States para Formulário
  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: '',
    slug: '',
    category: 'SaaS',
    type: 'digital',
    status: 'active',
    priceCents: 0,
    originalPriceCents: 0,
    billingPeriod: 'monthly',
    priceLabel: 'INVESTIMENTO MENSAL',
    shortDescription: '',
    longDescription: '',
    heroImageUrl: '',
    logoImageUrl: '',
    videoUrl: '',
    features: [
      { id: Math.random().toString(36).substr(2, 9), title: '', description: '' }
    ],
    benefits: [
      { id: Math.random().toString(36).substr(2, 9), text: '' }
    ],
    testimonial: {
      enabled: false,
      stars: 5,
      quote: '',
      authorName: '',
      authorRole: '',
      company: ''
    },
    gallery: [],
    ctaPrimaryLabel: 'SABER MAIS',
    ctaSecondaryLabel: ''
  });

  // Refs para Uploads
  const heroInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = async () => {
    setLoading(true);
    const data = await supabaseService.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenModal = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        category: 'SaaS',
        type: 'digital',
        status: 'active',
        priceCents: 0,
        originalPriceCents: 0,
        billingPeriod: 'monthly',
        priceLabel: 'INVESTIMENTO MENSAL',
        shortDescription: '',
        longDescription: '',
        heroImageUrl: '',
        logoImageUrl: '',
        videoUrl: '',
        features: [
          { id: Math.random().toString(36).substr(2, 9), title: '', description: '' }
        ],
        benefits: [
          { id: Math.random().toString(36).substr(2, 9), text: '' }
        ],
        testimonial: {
          enabled: false,
          stars: 5,
          quote: '',
          authorName: '',
          authorRole: '',
          company: '',
        },
        ctaPrimaryLabel: 'Contratar agora',
        ctaSecondaryLabel: 'Agendar conversa',
      });
    }
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'heroImageUrl' | 'logoImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = isValidImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const type = field === 'heroImageUrl' ? 'hero' : 'logo';
      const url = await storageUploadRepo.uploadProductImage(file, type);
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar imagem.');
    }
  };

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), { id: Math.random().toString(36).substr(2, 9), title: '', description: '' }]
    }));
  };

  const handleRemoveFeature = (id: string) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter(f => f.id !== id)
    }));
  };

  const handleFeatureChange = (id: string, field: 'title' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  const handleAddBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...(prev.benefits || []), { id: Math.random().toString(36).substr(2, 9), text: '' }]
    }));
  };

  const handleRemoveBenefit = (id: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: (prev.benefits || []).filter(b => b.id !== id)
    }));
  };

  const handleBenefitChange = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: (prev.benefits || []).map(b => b.id === id ? { ...b, text } : b)
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || (formData.priceCents || 0) < 0) {
      alert('Preencha os campos obrigatórios básicos.');
      return;
    }

    try {
      const slug = formData.slug || formData.name?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

      await supabaseService.saveProduct({
        ...formData,
        slug,
        id: editingProduct?.id
      });

      await loadProducts();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Erro ao salvar produto.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        if (supabase) {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Erro detalhado ao excluir:', error);
            if (error.code === '23503') {
              alert('Não é possível excluir este produto pois ele possui registros vinculados (vendas, solicitações ou avaliações).');
            } else {
              throw error;
            }
            return;
          }
        } else {
          const products = storageService.getProducts();
          storageService.saveProducts(products.filter(p => p.id !== id));
        }
        await loadProducts();
      } catch (err: any) {
        console.error('Erro ao excluir produto:', err);
        alert(err.message || 'Erro ao excluir produto.');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    const matchesStatus = !filterStatus || p.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns: Column<AdminProduct>[] = [
    {
      header: 'SOLUÇÃO',
      accessor: (p) => (
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-50 border-2 border-[#0B1220] overflow-hidden flex items-center justify-center text-xl shrink-0">
            {p.logoImageUrl || p.heroImageUrl ? (
              <img src={p.logoImageUrl || p.heroImageUrl} alt={p.name} className="w-full h-full object-cover grayscale" />
            ) : (
              '📦'
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[#0B1220] text-sm uppercase tracking-tighter">{p.name}</span>
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{p.slug}</span>
          </div>
        </div>
      )
    },
    {
      header: 'CATEGORIA',
      accessor: (p) => (
        <span className="text-[10px] font-black px-3 py-1 bg-white border-2 border-[#0B1220] uppercase tracking-widest text-[#0B1220]">
          {p.category}
        </span>
      )
    },
    {
      header: 'TIPO',
      accessor: (p) => (
        <span className={`text-[10px] font-black px-3 py-1 bg-white border-2 border-[#0B1220] uppercase tracking-widest ${p.type === 'physical' ? 'text-amber-600' : 'text-blue-600'}`}>
          {p.type === 'physical' ? 'FÍSICO' : 'DIGITAL'}
        </span>
      )
    },
    {
      header: 'INVESTIMENTO',
      accessor: (p) => (
        <div className="flex flex-col">
          <span className="font-black text-[#0B1220] text-base">{formatBRLFromCents(p.priceCents)}</span>
          <span className="text-[9px] text-[#1D4ED8] font-black uppercase tracking-widest">{p.billingPeriod === 'yearly' ? 'CICLO ANUAL' : 'CICLO MENSAL'}</span>
        </div>
      )
    },
    {
      header: 'STATUS',
      accessor: (p) => (
        <span className={`
          inline-flex items-center gap-2 px-3 py-1 border-2 font-black uppercase tracking-widest text-[9px]
          ${p.status === 'active' ? 'bg-[#00FF41] text-[#0B1220] border-[#0B1220]' : p.status === 'pending' ? 'bg-[#1D4ED8] text-white border-[#0B1220]' : 'bg-slate-200 text-slate-600 border-[#0B1220]'}
        `}>
          <span className={`w-1.5 h-1.5 ${p.status === 'active' ? 'bg-[#0B1220]' : 'bg-white'}`}></span>
          {p.status === 'active' ? 'OPERANTE' : p.status === 'pending' ? 'AGUARDANDO' : 'INATIVO'}
        </span>
      )
    },
    {
      header: 'AÇÕES',
      align: 'right',
      accessor: (p) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => handleOpenModal(p)}
            className="px-3 py-1 border-2 border-[#0052cc] text-[9px] font-black uppercase tracking-widest text-[#0052cc] hover:bg-[#0052cc] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,82,204,1)] active:shadow-none"
          >
            EDITAR
          </button>
          <button
            onClick={() => handleDelete(p.id)}
            className="px-3 py-1 border-2 border-[#FF4D00] text-[9px] font-black uppercase tracking-widest text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,77,0,1)] active:shadow-none"
          >
            EXCLUIR
          </button>
        </div>
      )
    }
  ];

  const tabs: { id: TabType; label: string }[] = [
    { id: 'basic', label: 'Básico' },
    { id: 'price', label: 'Preço' },
    { id: 'images', label: 'Imagens' },
    { id: 'features', label: 'Características' },
    { id: 'benefits', label: 'Benefícios' },
    { id: 'testimonial', label: 'Depoimento' },
    { id: 'ctas', label: 'CTAs' },
  ];

  return (
    <>
      <AdminTopbar
        title="Estoque de Soluções"
        actions={
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 px-6 py-3 bg-[#1D4ED8] text-white font-black text-[10px] uppercase tracking-[0.3em] border-2 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            + Adicionar Item
          </button>
        }
      />

      <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12">
        {/* Filters - Brutalist Grid */}
        <div className="flex flex-col md:flex-row border-4 border-[#0B1220] bg-white shadow-[8px_8px_0px_0px_rgba(11,18,32,1)]">
          <div className="flex-1 md:border-r-2 border-[#0B1220]">
            <input
              placeholder="PESQUISAR SOLUÇÃO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 px-8 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] focus:bg-slate-50 focus:outline-none placeholder:text-slate-300"
            />
          </div>
          <div className="flex border-t-2 md:border-t-0 border-[#0B1220]">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full md:w-56 h-16 px-6 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] border-r-2 border-[#0B1220] focus:bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="">CATEGORIAS</option>
              {['SaaS', 'Consultoria', 'IA', 'Operação', 'Financeiro', 'RH', 'Marketing'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-56 h-16 px-6 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] focus:bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="">STATUS</option>
              <option value="active">ATIVO</option>
              <option value="pending">PENDENTE</option>
              <option value="inactive">INATIVO</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border-4 border-[#0B1220] bg-white">
            <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Consultando Banco de Dados...</div>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="SISTEMA VAZIO"
            description="NENHUMA SOLUÇÃO ENCONTRADA NO INVENTÁRIO. COMECE A CADASTRAR AGORA."
            icon="📦"
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
            <DataTable data={filteredProducts} columns={columns} />
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `EDITAR: ${editingProduct.name}` : 'NOVO REGISTRO'}
        size="lg"
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
              className="px-10 py-4 bg-[#1D4ED8] text-white font-black text-xs uppercase tracking-[0.5em] border-2 border-[#0B1220] shadow-[6px_6px_0px_0px_rgba(11,18,32,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1.5 active:translate-y-1.5 transition-all"
            >
              SALVAR SOLUÇÃO
            </button>
          </div>
        }
      >
        <div className="flex flex-col h-full max-h-[70vh]">
          {/* Tabs header - Brutalist Sticky */}
          <div className="flex border-b-4 border-[#0B1220] mb-10 overflow-x-auto no-scrollbar shrink-0 snap-x snap-mandatory px-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap border-b-4 transition-all snap-start
                  ${activeTab === tab.id ? 'border-[#1D4ED8] text-[#1D4ED8] bg-slate-50/50' : 'border-transparent text-slate-400 hover:text-[#0B1220] hover:bg-slate-50'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content - No scrollbar */}
          <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-10 pb-8">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <FormField label="Nome do Produto">
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="EX: DATASTREAM PRO 360"
                  />
                </FormField>
                <FormField label="Slug (URL Amigável)">
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="EX: DATASTREAM-PRO"
                  />
                  <p className="text-[9px] font-black text-slate-300 mt-2 uppercase tracking-widest">DEIXE VAZIO PARA GERAR AUTOMATICAMENTE</p>
                </FormField>
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Categoria">
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    >
                      <option value="SaaS">SaaS</option>
                      <option value="Consultoria">Consultoria</option>
                      <option value="IA">IA</option>
                      <option value="Operação">Operação</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="RH">RH</option>
                      <option value="Marketing">Marketing</option>
                    </Select>
                  </FormField>
                  <FormField label="Tipo">
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="digital">DIGITAL</option>
                      <option value="physical">FÍSICO</option>
                    </Select>
                  </FormField>
                  <FormField label="Status">
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    >
                      <option value="active">ATIVO</option>
                      <option value="pending">PENDENTE</option>
                      <option value="inactive">INATIVO</option>
                    </Select>
                  </FormField>
                </div>
                <FormField label="Descrição Curta (Marketplace)">
                  <Input
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="RESUMO TÉCNICO DE 1-2 LINHAS"
                  />
                </FormField>
                <FormField label="Descrição Longa (Página de Detalhe)">
                  <Textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    placeholder="DETALHAMENTO DA SOLUÇÃO NO MARKETPLACE..."
                    rows={4}
                  />
                </FormField>
              </div>
            )}

            {activeTab === 'price' && (
              <div className="space-y-8">
                <FormField label="Valor de Investimento (Centavos)">
                  <Input
                    type="number"
                    value={formData.priceCents}
                    onChange={(e) => setFormData({ ...formData, priceCents: parseInt(e.target.value) || 0 })}
                    placeholder="EX: 49990 PARA R$ 499,90"
                  />
                </FormField>

                <FormField label="Preço Original / De (Opcional - Centavos)">
                  <Input
                    type="number"
                    value={formData.originalPriceCents || 0}
                    onChange={(e) => setFormData({ ...formData, originalPriceCents: parseInt(e.target.value) || 0 })}
                    placeholder="EX: 59990 PARA R$ 599,90"
                  />
                  <div className="mt-6 p-8 bg-slate-50 border-4 border-[#0B1220] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#1D4ED8]"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Simulação de Exibição</span>
                    <div className="flex flex-col">
                      {formData.originalPriceCents && formData.originalPriceCents > (formData.priceCents || 0) && (
                        <span className="text-sm font-bold text-red-500 line-through mb-1">
                          De: {formatBRLFromCents(formData.originalPriceCents)}
                        </span>
                      )}
                      <span className={`text-4xl font-black tracking-tighter ${formData.originalPriceCents ? 'text-green-600' : 'text-[#0B1220]'}`}>
                        {formData.originalPriceCents ? 'Por: ' : ''}{formatBRLFromCents(formData.priceCents || 0)}
                      </span>
                    </div>
                  </div>
                </FormField>
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Ciclo de Cobrança">
                    <Select
                      value={formData.billingPeriod}
                      onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value as 'monthly' | 'yearly' })}
                    >
                      <option value="monthly">MENSAL</option>
                      <option value="yearly">ANUAL</option>
                    </Select>
                  </FormField>
                  <FormField label="Rótulo do Preço">
                    <Input
                      value={formData.priceLabel}
                      onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
                      placeholder="EX: INVESTIMENTO MENSAL"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-10">
                <FormField label="Impact Image (Hero)">
                  <div className="space-y-6">
                    <div className="aspect-video bg-slate-50 border-4 border-[#0B1220] flex items-center justify-center overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(255,77,0,1)]">
                      {formData.heroImageUrl ? (
                        <img src={formData.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover grayscale" />
                      ) : (
                        <span className="text-6xl grayscale">🖼️</span>
                      )}
                    </div>
                    <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'heroImageUrl')} />
                    <button type="button" onClick={() => heroInputRef.current?.click()} className="w-full py-5 bg-white border-2 border-[#0B1220] text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-all">
                      {formData.heroImageUrl ? 'SUBSTITUIR IMPACT IMAGE' : 'VINCULAR IMPACT IMAGE'}
                    </button>
                  </div>
                </FormField>

                <FormField label="Identidade Visual (Logo)">
                  <div className="flex items-center gap-10">
                    <div className="w-32 h-32 bg-slate-50 border-4 border-[#0B1220] flex items-center justify-center overflow-hidden shrink-0 shadow-[8px_8px_0px_0px_rgba(29,78,216,1)]">
                      {formData.logoImageUrl ? (
                        <img src={formData.logoImageUrl} alt="Logo Preview" className="w-full h-full object-cover grayscale" />
                      ) : (
                        <span className="text-4xl grayscale">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'logoImageUrl')} />
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="px-8 py-4 bg-white border-2 border-[#0B1220] text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-all">
                        {formData.logoImageUrl ? 'ALTERAR LOGO' : 'VINCULAR LOGO'}
                      </button>
                    </div>
                  </div>
                </FormField>

                <FormField label="Vídeo de Apresentação (YouTube ou Link Direto)">
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {formData.videoUrl && (
                    <div className="mt-4 aspect-video bg-black border-4 border-[#0B1220] flex items-center justify-center overflow-hidden">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white animate-pulse">Preview do Vídeo Ativo</div>
                    </div>
                  )}
                </FormField>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 border-l-4 border-[#1D4ED8] pl-4 py-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1220]">Características Técnicas</h4>
                  <button onClick={handleAddFeature} className="text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:underline">+ ADICIONAR ITEM</button>
                </div>
                <div className="space-y-6">
                  {formData.features?.map((feature, index) => (
                    <div key={feature.id} className="flex gap-4 p-4 bg-slate-50 border-2 border-slate-200">
                      <div className="flex-1 space-y-4">
                        <Input
                          value={feature.title}
                          onChange={(e) => handleFeatureChange(feature.id, 'title', e.target.value)}
                          placeholder={`NOME DA CARACTERÍSTICA #${index + 1}`}
                        />
                        <Textarea
                          value={feature.description || ''}
                          onChange={(e) => handleFeatureChange(feature.id, 'description', e.target.value)}
                          placeholder="EXPLICAR DETALHE (OPCIONAL)"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveFeature(feature.id)}
                        className="w-14 h-11 bg-[#FF4D00] text-white border-2 border-[#0B1220] font-black hover:bg-[#0B1220] transition-colors self-start flex items-center justify-center shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 border-l-4 border-[#00FF41] pl-4 py-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1220]">Vantagens Técnicas</h4>
                  <button onClick={handleAddBenefit} className="text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:underline">+ ADICIONAR ITEM</button>
                </div>
                <div className="space-y-4">
                  {formData.benefits?.map((benefit, index) => (
                    <div key={benefit.id} className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          value={benefit.text}
                          onChange={(e) => handleBenefitChange(benefit.id, e.target.value)}
                          placeholder={`BENEFÍCIO #${index + 1}`}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveBenefit(benefit.id)}
                        className="w-14 bg-[#FF4D00] text-white border-2 border-[#0B1220] font-black hover:bg-[#0B1220] transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'testimonial' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-8 bg-[#0B1220] text-white border-b-8 border-[#1D4ED8] relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-xl font-black uppercase tracking-tighter">Prova Social</h4>
                    <p className="text-[9px] text-[#1D4ED8] font-black uppercase tracking-[0.2em] mt-1">Exibir depoimento técnico no marketplace</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, testimonial: { ...formData.testimonial!, enabled: !formData.testimonial?.enabled } })}
                    className={`w-16 h-8 border-2 border-white transition-all relative ${formData.testimonial?.enabled ? 'bg-[#00FF41]' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-5 h-4 bg-white border-2 border-[#0B1220] transition-all ${formData.testimonial?.enabled ? 'left-8' : 'left-1'}`} />
                  </button>
                </div>

                {formData.testimonial?.enabled && (
                  <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <FormField label="Qualificação (Estrelas)">
                      <Select
                        value={formData.testimonial.stars}
                        onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, stars: parseInt(e.target.value) as any } })}
                      >
                        <option value="5">5 ESTRELAS - MÁXIMO</option>
                        <option value="4">4 ESTRELAS - ALTO</option>
                        <option value="3">3 ESTRELAS - REGULAR</option>
                        <option value="2">2 ESTRELAS - BAIXO</option>
                        <option value="1">1 ESTRELA - CRÍTICO</option>
                      </Select>
                    </FormField>
                    <FormField label="Citação (Feedback direto)">
                      <Textarea
                        value={formData.testimonial.quote}
                        onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, quote: e.target.value } })}
                        placeholder="O QUE O CLIENTE DECLAROU..."
                        rows={3}
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="Nome do Autor">
                        <Input
                          value={formData.testimonial.authorName}
                          onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, authorName: e.target.value } })}
                          placeholder="EX: JOÃO SILVA"
                        />
                      </FormField>
                      <FormField label="Cargo / Especialidade">
                        <Input
                          value={formData.testimonial.authorRole}
                          onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, authorRole: e.target.value } })}
                          placeholder="EX: DIRETOR DE TI"
                        />
                      </FormField>
                    </div>
                    <FormField label="Empresa">
                      <Input
                        value={formData.testimonial.company}
                        onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, company: e.target.value } })}
                        placeholder="EX: TECH SOLUTIONS"
                      />
                    </FormField>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ctas' && (
              <div className="space-y-6">
                <div className="p-8 border-l-8 border-[#FF4D00] bg-slate-50 mb-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1220]">Configuração de Gatilhos (CTA)</h4>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Personalize os botões de ação do produto</p>
                </div>
                <FormField label="Label Primário (CONVERSÃO DIRETA)">
                  <Input
                    value={formData.ctaPrimaryLabel}
                    onChange={(e) => setFormData({ ...formData, ctaPrimaryLabel: e.target.value })}
                    placeholder="EX: CONTRATAR SOLUÇÃO"
                  />
                </FormField>
                <FormField label="Label Secundário (AGENDAMENTO)">
                  <Input
                    value={formData.ctaSecondaryLabel}
                    onChange={(e) => setFormData({ ...formData, ctaSecondaryLabel: e.target.value })}
                    placeholder="EX: FALAR COM ESPECIALISTA"
                  />
                </FormField>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}