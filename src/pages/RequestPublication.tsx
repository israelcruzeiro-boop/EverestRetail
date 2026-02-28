import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { partnersRepo } from '@/lib/repositories/partnersRepo';
import { publicationRequestsRepo } from '@/lib/repositories/publicationRequestsRepo';
import { storageUploadRepo } from '@/lib/repositories/storageUploadRepo';
import { isValidImageFile } from '@/lib/image';
import { ProductCategory } from '@/types/admin';
import { motion, AnimatePresence } from 'framer-motion';

type RequestType = 'product' | 'service';

export default function RequestPublication() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    type: 'product' as RequestType,
    name: '',
    category: 'SaaS' as ProductCategory,
    shortDescription: '',
    description: '',
    priceCents: 0,
    billingPeriod: 'monthly' as 'monthly' | 'yearly',
    benefits: [''] as string[],
    coverImageUrl: '',
  });

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    const reqs = await publicationRequestsRepo.listMyRequests();
    setMyRequests(reqs);
  };

  const addBenefit = () => setForm(f => ({ ...f, benefits: [...f.benefits, ''] }));
  const removeBenefit = (i: number) => setForm(f => ({ ...f, benefits: f.benefits.filter((_, idx) => idx !== i) }));
  const updateBenefit = (i: number, v: string) => setForm(f => ({
    ...f,
    benefits: f.benefits.map((b, idx) => idx === i ? v : b)
  }));

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = isValidImageFile(file);
    if (!check.valid) { alert(check.error); return; }
    setUploading(true);
    try {
      const url = await storageUploadRepo.uploadPartnerImage(file, 'covers');
      setForm(f => ({ ...f, coverImageUrl: url }));
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.name || !form.description) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      // 1. Cria/atualiza partner vinculado ao perfil
      const partner = await partnersRepo.upsertPartner({
        companyName: form.companyName,
        contactName: form.contactName || user?.name,
        contactEmail: form.contactEmail || user?.email,
        contactPhone: form.contactPhone,
      });

      // 2. Cria publication request
      await publicationRequestsRepo.createRequest({
        partnerId: partner?.id,
        type: form.type,
        name: form.name,
        category: form.category,
        shortDescription: form.shortDescription,
        description: form.description,
        priceCents: form.priceCents,
        billingPeriod: form.billingPeriod,
        benefits: form.benefits.filter(b => b.trim()),
        coverImageUrl: form.coverImageUrl || undefined,
      });

      setSuccess(true);
      setTimeout(() => navigate('/marketplace'), 3000);
    } catch (err: any) {
      console.error('Erro ao enviar solicitação:', err);
      alert(err.message || 'Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Enviada' },
      under_review: { bg: 'bg-cyan-50', text: 'text-cyan-600', label: 'Em Análise' },
      approved: { bg: 'bg-green-50', text: 'text-green-600', label: 'Aprovada' },
      rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rejeitada' },
    };
    const { bg, text, label } = map[s] || map.submitted;
    return <span className={`${bg} ${text} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider`}>{label}</span>;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/40 backdrop-blur-3xl p-1.5 rounded-[56px] shadow-3xl shadow-cyan-500/10 max-w-xl w-full relative z-10"
        >
          <div className="bg-white p-14 rounded-[48px] text-center border border-white">
            <div className="w-28 h-28 bg-black text-cyan-400 rounded-3xl flex items-center justify-center text-4xl font-black mx-auto mb-10 shadow-3xl shadow-black/30 border-2 border-cyan-500/20">
              <span className="animate-pulse">✓</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 leading-tight tracking-tight mb-6 uppercase">
              Protocolo<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Concluído</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12">
              A proposta para <strong className="text-slate-900 underline decoration-cyan-500/30">{form.name}</strong> foi integrada à fila de análise estratégica.
            </p>
            <div className="pt-10 border-t border-slate-50 text-[10px] font-black uppercase tracking-[0.5em] text-cyan-600">
              Redirecionando ao ecossistema em 3s
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Black Header Section - Unified with Branding */}
      <div className="bg-black pt-16 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Background Art */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <header className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[48px] shadow-2xl">
            <div className="flex justify-between items-start flex-wrap gap-6">
              <div className="space-y-4">
                <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full inline-block border border-cyan-500/20">
                  Parceria Estratégica
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                  Solicitar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Publicação</span>
                </h1>
                <p className="text-slate-400 mt-6 text-lg max-w-lg font-medium leading-relaxed">
                  Integre sua inovação ao ecossistema tecnológico mais influente do mercado.
                </p>
              </div>
              {myRequests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowMyRequests(!showMyRequests)}
                  className="px-8 py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-slate-950 transition-all border border-white/10"
                >
                  Minhas Solicitações ({myRequests.length})
                </button>
              )}
            </div>
          </header>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20 relative z-10">

        {/* Minhas Solicitações */}
        <AnimatePresence>
          {showMyRequests && myRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 bg-white/60 backdrop-blur-xl border border-white rounded-[40px] shadow-lg p-8 overflow-hidden"
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Histórico de Solicitações</h3>
              <div className="space-y-3">
                {myRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{req.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(req.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge(req.status)}
                      {req.admin_notes && req.status === 'rejected' && (
                        <span className="text-[10px] text-red-500 max-w-[200px] truncate" title={req.admin_notes}>
                          💬 {req.admin_notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="md:col-span-4 space-y-8">
              {/* Dados da Empresa */}
              <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-lg shadow-blue-500/5 space-y-5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Dados da Empresa</label>
                <input
                  type="text"
                  required
                  className="w-full h-12 px-5 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all"
                  placeholder="Nome da Empresa *"
                  value={form.companyName}
                  onChange={e => setForm({ ...form, companyName: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full h-12 px-5 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all"
                  placeholder="Nome do Contato"
                  value={form.contactName}
                  onChange={e => setForm({ ...form, contactName: e.target.value })}
                />
                <input
                  type="email"
                  className="w-full h-12 px-5 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all"
                  placeholder="E-mail"
                  value={form.contactEmail}
                  onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                />
                <input
                  type="tel"
                  className="w-full h-12 px-5 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all"
                  placeholder="Telefone"
                  value={form.contactPhone}
                  onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                />
              </div>

              {/* Tipo */}
              <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-lg shadow-blue-500/5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-4">Tipo</label>
                <div className="flex gap-3">
                  {([{ v: 'product', l: 'Produto' }, { v: 'service', l: 'Serviço' }] as const).map(t => (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => setForm({ ...form, type: t.v })}
                      className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl border transition-all ${form.type === t.v
                        ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-xl shadow-cyan-500/20'
                        : 'bg-white/50 border-slate-100 text-slate-500 hover:bg-white hover:border-cyan-200'
                        }`}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preço */}
              <div className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-lg shadow-blue-500/5 space-y-5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Precificação</label>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="flex-1 h-12 px-5 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all"
                    placeholder="0"
                    value={form.priceCents / 100 || ''}
                    onChange={e => setForm({ ...form, priceCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                  />
                </div>
                <div className="flex gap-3">
                  {([{ v: 'monthly', l: 'Mensal' }, { v: 'yearly', l: 'Anual' }] as const).map(p => (
                    <button
                      key={p.v}
                      type="button"
                      onClick={() => setForm({ ...form, billingPeriod: p.v })}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${form.billingPeriod === p.v
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-100 text-slate-400'
                        }`}
                    >
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-8 bg-white/60 backdrop-blur-xl border border-white p-10 md:p-12 rounded-[48px] shadow-xl shadow-blue-500/5 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nome da Solução *</label>
                  <input
                    type="text"
                    required
                    className="w-full h-14 px-0 bg-transparent border-b-2 border-slate-100 font-black text-2xl outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-200"
                    placeholder="NOME DA SOLUÇÃO"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Imagem de Capa</label>
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
                  >
                    {form.coverImageUrl ? (
                      <img src={form.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{uploading ? 'Enviando...' : 'Clique para enviar'}</span>
                    )}
                  </div>
                  <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vertical do Negócio</label>
                <div className="flex flex-wrap gap-3">
                  {(['SaaS', 'Consultoria', 'IA', 'Operação', 'Financeiro', 'RH', 'Marketing'] as ProductCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all ${form.category === cat
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição Curta */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Descrição Curta</label>
                <input
                  type="text"
                  maxLength={200}
                  className="w-full h-12 px-5 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all"
                  placeholder="Resumo em uma frase..."
                  value={form.shortDescription}
                  onChange={e => setForm({ ...form, shortDescription: e.target.value })}
                />
              </div>

              {/* Descrição Completa */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pitch da Solução *</label>
                <textarea
                  rows={4}
                  required
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[24px] font-bold text-base outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all resize-none placeholder:text-slate-200"
                  placeholder="Descreva o impacto estratégico da sua tecnologia..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Benefícios */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Benefícios</label>
                  <button type="button" onClick={addBenefit} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">
                    + Adicionar
                  </button>
                </div>
                {form.benefits.map((b, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input
                      type="text"
                      className="flex-1 h-10 px-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                      placeholder={`Benefício ${i + 1}`}
                      value={b}
                      onChange={e => updateBenefit(i, e.target.value)}
                    />
                    {form.benefits.length > 1 && (
                      <button type="button" onClick={() => removeBenefit(i)} className="text-red-400 hover:text-red-600 text-lg font-black">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white/40 backdrop-blur-2xl border border-white p-10 rounded-[48px] shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 hover:text-red-500 transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`px-16 py-6 bg-cyan-500 text-slate-950 rounded-3xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl shadow-cyan-500/20 border-2 border-white/20 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-400'}`}
            >
              {loading ? 'Processando...' : 'Protocolar Publicação'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
