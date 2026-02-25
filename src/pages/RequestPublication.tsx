import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../lib/storageService';
import { AdminUser, PartnerType, ProductCategory, PublicationRequest } from '../types/admin';
import { motion } from 'framer-motion';

export default function RequestPublication() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    requesterUserId: '',
    partnerName: '',
    partnerType: 'Tecnologia' as PartnerType,
    productName: '',
    category: 'SaaS' as ProductCategory,
    description: '',
  });

  useEffect(() => {
    const allUsers = storageService.getUsers();
    setUsers(allUsers.filter(u => u.status === 'active'));
    if (allUsers.length > 0) {
      setFormData(prev => ({ ...prev, requesterUserId: allUsers[0].id }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerName || !formData.productName || !formData.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    
    const requester = users.find(u => u.id === formData.requesterUserId);
    
    const newRequest: PublicationRequest = {
      id: Math.random().toString(36).substr(2, 9),
      requesterUserId: formData.requesterUserId,
      requesterName: requester?.name || 'Usuário Desconhecido',
      requesterEmail: requester?.email || '',
      partnerName: formData.partnerName,
      partnerType: formData.partnerType,
      productName: formData.productName,
      category: formData.category,
      description: formData.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const allRequests = storageService.getPublicationRequests();
    storageService.savePublicationRequests([...allRequests, newRequest]);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/marketplace'), 3000);
    }, 1000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4"
        >
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-black text-slate-900">Solicitação Enviada!</h2>
          <p className="text-slate-500">
            Sua solicitação de publicação para <strong>{formData.productName}</strong> foi recebida com sucesso e será analisada pelo nosso time.
          </p>
          <p className="text-xs text-slate-400">Redirecionando para o marketplace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Solicitar Publicação</h1>
          <p className="text-slate-500">
            Deseja incluir seu produto ou serviço no ecossistema ENT? Preencha os dados abaixo.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Usuário Solicitante (Simulação MVP)</label>
              <select 
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052cc] focus:border-transparent outline-none transition-all"
                value={formData.requesterUserId}
                onChange={(e) => setFormData({ ...formData, requesterUserId: e.target.value })}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nome do Parceiro/Empresa</label>
                <input 
                  type="text"
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052cc] focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Tech Solutions"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tipo de Parceiro</label>
                <select 
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052cc] focus:border-transparent outline-none transition-all"
                  value={formData.partnerType}
                  onChange={(e) => setFormData({ ...formData, partnerType: e.target.value as PartnerType })}
                >
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Consultoria">Consultoria</option>
                  <option value="Fornecedor">Fornecedor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nome do Produto/Serviço</label>
                <input 
                  type="text"
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052cc] focus:border-transparent outline-none transition-all"
                  placeholder="Ex: ERP Cloud"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Categoria</label>
                <select 
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052cc] focus:border-transparent outline-none transition-all"
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
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Descrição da Solução</label>
              <textarea 
                rows={4}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052cc] focus:border-transparent outline-none transition-all resize-none"
                placeholder="Descreva brevemente o que sua solução faz e como ela ajuda o varejo..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`
                px-8 py-3 bg-[#0052cc] text-white rounded-xl font-bold shadow-lg shadow-[#0052cc]/20 transition-all
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
              `}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
