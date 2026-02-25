import React, { useState, useEffect, useRef } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import DataTable, { Column } from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Select, Textarea } from '../../components/admin/FormField';
import EmptyState from '../../components/admin/EmptyState';
import { storageService } from '../../lib/storageService';
import { AdminProduct, ProductCategory, ProductStatus } from '../../types/admin';
import { formatBRLFromCents } from '../../lib/format';
import { isValidImageFile, readFileAsDataURL } from '../../lib/image';

type TabType = 'basic' | 'price' | 'images' | 'benefits' | 'testimonial' | 'ctas';

export default function Products() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: '',
    slug: '',
    category: 'SaaS',
    status: 'active',
    priceCents: 0,
    billingPeriod: 'monthly',
    priceLabel: 'INVESTIMENTO MENSAL',
    shortDescription: '',
    longDescription: '',
    heroImageUrl: '',
    logoImageUrl: '',
    benefits: [],
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

  const heroInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
    window.addEventListener('ENT_STORAGE_UPDATED', loadProducts);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadProducts);
  }, []);

  const loadProducts = () => {
    setProducts(storageService.getProducts());
  };

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
        status: 'active',
        priceCents: 0,
        billingPeriod: 'monthly',
        priceLabel: 'INVESTIMENTO MENSAL',
        shortDescription: '',
        longDescription: '',
        heroImageUrl: '',
        logoImageUrl: '',
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
      const dataUrl = await readFileAsDataURL(file);
      setFormData(prev => ({ ...prev, [field]: dataUrl }));
    } catch (err) {
      alert('Erro ao carregar imagem.');
    }
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

  const handleSave = () => {
    if (!formData.name || !formData.category || (formData.priceCents || 0) < 0) {
      alert('Preencha os campos obrigatórios básicos.');
      return;
    }

    const allProducts = storageService.getProducts();
    const slug = formData.slug || formData.name?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    
    const finalData = {
      ...formData,
      slug,
      updatedAt: new Date().toISOString(),
    } as AdminProduct;

    if (editingProduct) {
      const updated = allProducts.map(p => 
        p.id === editingProduct.id ? { ...p, ...finalData } : p
      );
      storageService.saveProducts(updated);
    } else {
      const newProduct: AdminProduct = {
        ...finalData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      storageService.saveProducts([...allProducts, newProduct]);
    }

    loadProducts();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const all = storageService.getProducts();
      const updated = all.filter(p => p.id !== id);
      storageService.saveProducts(updated);
      loadProducts();
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
      header: 'Produto',
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center text-lg border border-slate-200">
            {p.logoImageUrl || p.heroImageUrl ? (
              <img src={p.logoImageUrl || p.heroImageUrl} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              '📦'
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{p.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">{p.slug}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Categoria',
      accessor: (p) => (
        <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded uppercase tracking-wider">
          {p.category}
        </span>
      )
    },
    {
      header: 'Preço',
      accessor: (p) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{formatBRLFromCents(p.priceCents)}</span>
          <span className="text-[10px] text-slate-400 uppercase">{p.billingPeriod === 'yearly' ? 'Anual' : 'Mensal'}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (p) => (
        <span className={`
          inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
          ${p.status === 'active' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}
        `}>
          {p.status === 'active' ? 'Ativo' : p.status === 'pending' ? 'Pendente' : 'Inativo'}
        </span>
      )
    },
    {
      header: 'Ações',
      align: 'right',
      accessor: (p) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => {
              const newStatus: ProductStatus = p.status === 'active' ? 'inactive' : 'active';
              const updated = storageService.getProducts().map(item => 
                item.id === p.id ? { ...item, status: newStatus } : item
              );
              storageService.saveProducts(updated);
              loadProducts();
            }}
            className={`text-xs font-bold hover:underline ${p.status === 'active' ? 'text-orange-500' : 'text-green-600'}`}
          >
            {p.status === 'active' ? 'Inativar' : 'Ativar'}
          </button>
          <button 
            onClick={() => handleOpenModal(p)}
            className="text-xs font-bold text-[#0052cc] hover:underline"
          >
            Editar
          </button>
          <button 
            onClick={() => handleDelete(p.id)}
            className="text-xs font-bold text-red-500 hover:underline"
          >
            Excluir
          </button>
        </div>
      )
    }
  ];

  const tabs: { id: TabType; label: string }[] = [
    { id: 'basic', label: 'Básico' },
    { id: 'price', label: 'Preço' },
    { id: 'images', label: 'Imagens' },
    { id: 'benefits', label: 'Benefícios' },
    { id: 'testimonial', label: 'Depoimento' },
    { id: 'ctas', label: 'CTAs' },
  ];

  return (
    <>
      <AdminTopbar 
        title="Produtos" 
        actions={
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#0052cc] text-white rounded-xl text-xs md:text-sm font-bold hover:shadow-lg hover:shadow-[#0052cc]/20 transition-all"
          >
            <span className="hidden sm:inline">+ Novo Produto</span>
            <span className="sm:hidden">+ Novo</span>
          </button>
        }
      />
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <Input 
              placeholder="Buscar por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-4">
            <div className="w-full sm:w-48">
              <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">Categorias</option>
                <option value="SaaS">SaaS</option>
                <option value="Consultoria">Consultoria</option>
                <option value="IA">IA</option>
                <option value="Operação">Operação</option>
                <option value="Financeiro">Financeiro</option>
                <option value="RH">RH</option>
                <option value="Marketing">Marketing</option>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Status</option>
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="inactive">Inativo</option>
              </Select>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState 
            title="Nenhum produto cadastrado" 
            description="Comece adicionando sua primeira solução ao marketplace."
            icon="📦"
            action={
              <button 
                onClick={() => handleOpenModal()}
                className="bg-[#0052cc] text-white px-8 py-3 rounded-xl font-bold text-sm"
              >
                Criar Primeiro Produto
              </button>
            }
          />
        ) : (
          <DataTable data={filteredProducts} columns={columns} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Editar: ${editingProduct.name}` : 'Novo Produto'}
        size="lg"
        footer={
          <>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-[#0052cc] text-white rounded-xl text-sm font-bold"
            >
              Salvar Produto
            </button>
          </>
        }
      >
        <div className="flex flex-col h-full max-h-[70vh]">
          {/* Tabs Header */}
          <div className="flex border-b border-slate-100 mb-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all
                  ${activeTab === tab.id ? 'border-[#0052cc] text-[#0052cc]' : 'border-transparent text-slate-400 hover:text-slate-600'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <FormField label="Nome do Produto">
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: DataStream Pro 360"
                  />
                </FormField>
                <FormField label="Slug (URL Amigável)">
                  <Input 
                    value={formData.slug} 
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ex: datastream-pro"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">Deixe vazio para gerar automaticamente</p>
                </FormField>
                <div className="grid grid-cols-2 gap-4">
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
                  <FormField label="Status">
                    <Select 
                      value={formData.status} 
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    >
                      <option value="active">Ativo</option>
                      <option value="pending">Pendente</option>
                      <option value="inactive">Inativo</option>
                    </Select>
                  </FormField>
                </div>
                <FormField label="Descrição Curta (Marketplace)">
                  <Input 
                    value={formData.shortDescription} 
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="1-2 linhas resumindo a solução"
                  />
                </FormField>
                <FormField label="Descrição Longa (Página de Detalhe)">
                  <Textarea 
                    value={formData.longDescription} 
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    placeholder="Texto detalhado sobre a solução..."
                    rows={4}
                  />
                </FormField>
              </div>
            )}

            {activeTab === 'price' && (
              <div className="space-y-6">
                <FormField label="Preço (em centavos)">
                  <Input 
                    type="number"
                    value={formData.priceCents} 
                    onChange={(e) => setFormData({ ...formData, priceCents: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 49990 para R$ 499,90"
                  />
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Preview do Preço</span>
                    <span className="text-xl font-black text-[#0052cc]">{formatBRLFromCents(formData.priceCents || 0)}</span>
                  </div>
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Período de Cobrança">
                    <Select 
                      value={formData.billingPeriod} 
                      onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value as 'monthly' | 'yearly' })}
                    >
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </Select>
                  </FormField>
                  <FormField label="Rótulo do Preço">
                    <Input 
                      value={formData.priceLabel} 
                      onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
                      placeholder="Ex: INVESTIMENTO MENSAL"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-8">
                <FormField label="Imagem Principal (Hero)">
                  <div className="space-y-4">
                    <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
                      {formData.heroImageUrl ? (
                        <img src={formData.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-slate-200">🖼️</span>
                      )}
                    </div>
                    <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'heroImageUrl')} />
                    <button type="button" onClick={() => heroInputRef.current?.click()} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      {formData.heroImageUrl ? 'Alterar Imagem Hero' : 'Selecionar Imagem Hero'}
                    </button>
                  </div>
                </FormField>

                <FormField label="Logo / Miniatura">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                      {formData.logoImageUrl ? (
                        <img src={formData.logoImageUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl text-slate-200">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'logoImageUrl')} />
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        {formData.logoImageUrl ? 'Alterar Logo' : 'Selecionar Logo'}
                      </button>
                      <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight">Ideal para ícones ou marcas quadradas.</p>
                    </div>
                  </div>
                </FormField>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lista de Benefícios</h4>
                  <button onClick={handleAddBenefit} className="text-xs font-bold text-[#0052cc] hover:underline">+ Adicionar</button>
                </div>
                <div className="space-y-3">
                  {formData.benefits?.map((benefit, index) => (
                    <div key={benefit.id} className="flex gap-2">
                      <div className="flex-1">
                        <Input 
                          value={benefit.text} 
                          onChange={(e) => handleBenefitChange(benefit.id, e.target.value)}
                          placeholder={`Benefício ${index + 1}`}
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveBenefit(benefit.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'testimonial' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900">Ativar Depoimento</h4>
                    <p className="text-[10px] text-slate-400 uppercase">Exibir prova social na página do produto</p>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, testimonial: { ...formData.testimonial!, enabled: !formData.testimonial?.enabled } })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.testimonial?.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.testimonial?.enabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {formData.testimonial?.enabled && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <FormField label="Estrelas">
                      <Select 
                        value={formData.testimonial.stars} 
                        onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, stars: parseInt(e.target.value) as any } })}
                      >
                        <option value="5">5 Estrelas</option>
                        <option value="4">4 Estrelas</option>
                        <option value="3">3 Estrelas</option>
                        <option value="2">2 Estrelas</option>
                        <option value="1">1 Estrela</option>
                      </Select>
                    </FormField>
                    <FormField label="Depoimento (Aspas)">
                      <Textarea 
                        value={formData.testimonial.quote} 
                        onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, quote: e.target.value } })}
                        placeholder="O que o cliente disse..."
                        rows={3}
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Nome do Autor">
                        <Input 
                          value={formData.testimonial.authorName} 
                          onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, authorName: e.target.value } })}
                          placeholder="Ex: João Silva"
                        />
                      </FormField>
                      <FormField label="Cargo">
                        <Input 
                          value={formData.testimonial.authorRole} 
                          onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, authorRole: e.target.value } })}
                          placeholder="Ex: Diretor de TI"
                        />
                      </FormField>
                    </div>
                    <FormField label="Empresa">
                      <Input 
                        value={formData.testimonial.company} 
                        onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, company: e.target.value } })}
                        placeholder="Ex: Varejo S.A."
                      />
                    </FormField>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ctas' && (
              <div className="space-y-4">
                <FormField label="Texto Botão Primário (Contratar)">
                  <Input 
                    value={formData.ctaPrimaryLabel} 
                    onChange={(e) => setFormData({ ...formData, ctaPrimaryLabel: e.target.value })}
                    placeholder="Contratar agora"
                  />
                </FormField>
                <FormField label="Texto Botão Secundário (Agendar)">
                  <Input 
                    value={formData.ctaSecondaryLabel} 
                    onChange={(e) => setFormData({ ...formData, ctaSecondaryLabel: e.target.value })}
                    placeholder="Agendar conversa"
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
