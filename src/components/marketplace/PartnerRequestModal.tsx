import React, { useState, useEffect } from 'react';
import Modal from '@/components/admin/Modal';
import { useAuth } from '@/context/AuthContext';
import { partnersRepo } from '@/lib/repositories/partnersRepo';
import { publicationRequestsRepo } from '@/lib/repositories/publicationRequestsRepo';
import { storageUploadRepo } from '@/lib/repositories/storageUploadRepo';
import { Image as ImageIcon, Upload, X } from 'lucide-react';

interface PartnerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnerRequestModal({ isOpen, onClose }: PartnerRequestModalProps) {
  const { user, showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Partner Data
    name: '',
    email: '',
    phone: '',
    company: '',
    // Product/Request Data
    solicitationName: '',
    solicitationType: 'product' as 'product' | 'service',
    category: 'SaaS',
    price: '',
    billingPeriod: 'monthly' as 'monthly' | 'yearly',
    description: '',
    coverImageUrl: ''
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Garantir que o Parceiro existe
      const partner = await partnersRepo.upsertPartner({
        companyName: formData.company,
        contactName: formData.name,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        description: formData.description
      });

      if (!partner) throw new Error('Erro ao criar parceiro');

      // 2. Criar a Solicitação de Publicação vinculada ao parceiro
      // Converter preço para centavos
      const priceCents = Math.round(parseFloat(formData.price.replace(/[^\d.]/g, '')) * 100) || 0;

      await publicationRequestsRepo.createRequest({
        partnerId: partner.id,
        type: formData.solicitationType,
        name: formData.solicitationName,
        category: formData.category,
        priceCents,
        billingPeriod: formData.billingPeriod,
        description: formData.description,
        shortDescription: formData.description.substring(0, 100),
        coverImageUrl: formData.coverImageUrl || undefined
      });

      showToast('Solicitação enviada com sucesso! O admin analisará sua proposta.', 100, 'xp');
      onClose();
      
      // Reset form
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        company: '',
        solicitationName: '',
        solicitationType: 'product',
        category: 'SaaS',
        price: '',
        billingPeriod: 'monthly',
        description: '',
        coverImageUrl: ''
      });
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      showToast('Falha ao enviar solicitação.', 0, 'coins');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seja um Parceiro Oficial"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section: Dados do Parceiro */}
        <div>
           <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mb-6 flex items-center gap-2">
             <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">1</span>
             Informações da Empresa
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-1.5 opacity-60">
                  Nome da Empresa / Solução
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Everest Tech"
                  className="w-full bg-slate-50 border-2 border-[#0B1220] p-3 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-blue-600 transition-all"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-1.5 opacity-60">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-2 border-[#0B1220] p-3 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-blue-600 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-1.5 opacity-60">
                  WhatsApp de Contato
                </label>
                <input
                  type="text"
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-50 border-2 border-[#0B1220] p-3 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-blue-600 transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
           </div>
        </div>

        {/* Section: Detalhes do Produto */}
        <div>
           <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-600 mb-6 flex items-center gap-2">
             <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[10px]">2</span>
             Detalhes da Proposta (Publicação)
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-1.5 opacity-60">
                  Título da Oferta / Produto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consultoria em IA para Varejo"
                  className="w-full bg-slate-50 border-2 border-[#0B1220] p-3 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-orange-500 transition-all"
                  value={formData.solicitationName}
                  onChange={e => setFormData({ ...formData, solicitationName: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-1.5 opacity-60">
                  Tipo
                </label>
                <select 
                  className="w-full bg-slate-50 border-2 border-[#0B1220] p-3 text-sm font-bold outline-none focus:bg-white focus:border-orange-500 transition-all cursor-pointer"
                  value={formData.solicitationType}
                  onChange={e => setFormData({ ...formData, solicitationType: e.target.value as any })}
                >
                  <option value="product">Produto (SaaS / HW)</option>
                  <option value="service">Serviço / Consultoria</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-1.5 opacity-60">
                  Categoria Principal
                </label>
                <select 
                  className="w-full bg-slate-50 border-2 border-[#0B1220] p-3 text-sm font-bold outline-none focus:bg-white focus:border-orange-500 transition-all cursor-pointer"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="SaaS">SaaS</option>
                  <option value="Serviço">Serviço</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Estratégia">Estratégia</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-1.5 opacity-60">
                  Preço Sugerido (R$)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  className="w-full bg-slate-50 border-2 border-[#0B1220] p-3 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-orange-500 transition-all"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-1.5 opacity-60">
                  Recorrência
                </label>
                <select 
                  className="w-full bg-slate-50 border-2 border-[#0B1220] p-3 text-sm font-bold outline-none focus:bg-white focus:border-orange-500 transition-all cursor-pointer"
                  value={formData.billingPeriod}
                  onChange={e => setFormData({ ...formData, billingPeriod: e.target.value as any })}
                >
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-1.5 opacity-60">
                  Descrição Completa da Proposta
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explique os benefícios e o que está incluso..."
                  className="w-full bg-slate-50 border-2 border-[#0B1220] p-3 text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-orange-500 transition-all resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0B1220] mb-3 opacity-60">
                  Imagem da Solução / Capa
                </label>
                
                <div className="flex flex-col gap-4">
                  {formData.coverImageUrl ? (
                    <div className="relative w-full h-48 border-4 border-[#0B1220] overflow-hidden group">
                      <img 
                        src={formData.coverImageUrl} 
                        className="w-full h-full object-contain bg-slate-50" 
                        alt="Preview" 
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImageUrl: '' })}
                        className="absolute top-2 right-2 bg-[#FF4D00] text-white p-2 border-2 border-[#0B1220] shadow-[2px_2px_0px_0px_rgba(11,18,32,1)] hover:scale-110 transition-transform"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={`
                      flex flex-col items-center justify-center w-full h-48 
                      border-2 border-dashed border-slate-300 bg-slate-50 
                      cursor-pointer hover:bg-white hover:border-blue-600 transition-all group
                      ${uploading ? 'opacity-50 cursor-wait' : ''}
                    `}>
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
                          {uploading ? (
                            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Upload className="text-slate-400 group-hover:text-blue-600" size={24} />
                          )}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#0B1220]">
                          {uploading ? 'Enviando...' : 'Clique para enviar imagem da solução'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">
                          PNG, JPG ou WEBP (Max 5MB)
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setUploading(true);
                          try {
                            const url = await storageUploadRepo.uploadPartnerImage(file, 'requests');
                            setFormData({ ...formData, coverImageUrl: url });
                          } catch (err: any) {
                            console.error(err);
                            alert(err.message || 'Erro ao fazer upload da imagem');
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
           </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1D4ED8] text-white py-4 font-black uppercase tracking-[0.2em] border-2 border-[#0B1220] shadow-[4px_4px_0px_0px_rgba(11,18,32,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(11,18,32,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processando Solicitação...' : 'Enviar para Análise'}
        </button>
      </form>
    </Modal>
  );
}
