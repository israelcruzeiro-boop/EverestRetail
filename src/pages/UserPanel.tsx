import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { partnerRepo } from '../lib/repositories/partnerRepo';
import { AdminProduct } from '../types/admin';
import { formatBRLFromCents } from '../lib/format';
import MissionsTab from '@/components/MissionsTab';
import RewardsTab from '@/components/RewardsTab';
import RankingTab from '@/components/RankingTab';
import StoreTab from '@/components/StoreTab';
import { supabaseService } from '@/lib/supabaseService';
import { storageUploadRepo } from '@/lib/repositories/storageUploadRepo';
import { isValidImageFile } from '@/lib/image';
import { getLevelByScore, getNextLevel } from '@/lib/rankingHelpers';
import StreakStats from '@/components/StreakStats';

export default function UserPanel() {
  const { user, logout, balance } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<AdminProduct[]>([]);
  const [metrics, setMetrics] = useState({ views: 0, clicks: 0 });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'rewards' | 'ranking' | 'store'>('dashboard');
  const [selectedLevelIcon, setSelectedLevelIcon] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isUploading, setIsUploading] = useState(false);

  const isPartner = user?.role === 'partner' || user?.role === 'admin';

  useEffect(() => {
    if (user) setNewName(user.name);
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = isValidImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      setIsUploading(true);
      const url = await storageUploadRepo.uploadPartnerImage(file, 'avatars');
      await supabaseService.updateProfile(user.id, { avatar_url: url });
      window.location.reload(); // Simplificado para garantir atualização do AuthContext
    } catch (err: any) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !newName.trim()) return;
    try {
      await supabaseService.updateProfile(user.id, { name: newName });
      setIsEditingProfile(false);
      window.location.reload();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (isPartner) {
        setLoading(true);
        const products = await partnerRepo.getMyProducts();
        setMyProducts(products);

        if (products.length > 0) {
          const ids = products.map(p => p.id);
          const m = await partnerRepo.getPartnerMetrics(ids);
          setMetrics(m);
        }
        setLoading(false);
      }
    };
    loadData();
  }, [isPartner]);

  const tabs = [
    { id: 'dashboard', label: 'Meu Painel', icon: '📊' },
    { id: 'rewards', label: 'Ganhe Moedas', icon: '🪙' },
    { id: 'missions', label: 'Missões', icon: '🎯' },
    { id: 'store', label: 'Loja', icon: '🛒' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Black Header Section - Unified with Branding */}
      <div className="bg-[#0B1220] pt-16 md:pt-24 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.03] backdrop-blur-3xl border border-white/[0.06] p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -ml-24 -mb-24"></div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              {/* Avatar Section */}
              <div className="relative group/avatar">
                <div className={`relative w-28 h-28 md:w-36 md:h-36 rounded-[32px] p-1 border-2 transition-all duration-500 ${isUploading ? 'border-cyan-500 animate-pulse' : 'border-white/10 group-hover/avatar:border-cyan-500/50'}`}>
                  {/* Glow Ring */}
                  <div className="absolute -inset-2 bg-cyan-500/15 rounded-[36px] blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-white/5 backdrop-blur-sm shadow-inner">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/10 uppercase">
                        {user?.name[0]}
                      </div>
                    )}

                    {/* Overlay Upload */}
                    <label className="absolute inset-0 bg-black/70 backdrop-blur-sm items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col gap-2">
                      <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" disabled={isUploading} />
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Alterar foto</span>
                    </label>
                  </div>
                </div>
                {/* Upload Button - Always visible on mobile */}
                <label className="md:hidden absolute -bottom-1.5 -left-1.5 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-200 cursor-pointer hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all text-slate-600">
                  <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" disabled={isUploading} />
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </label>
                {/* Status Dot */}
                <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 border-[3px] border-[#0B1220]">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center md:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                  <span className="text-cyan-500 font-mono text-[9px] uppercase tracking-[0.4em]">Protocolo Executivo</span>
                </div>

                {isEditingProfile ? (
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white/10 border-2 border-cyan-500/50 rounded-2xl px-6 py-4 text-2xl font-black text-white uppercase tracking-tight focus:outline-none focus:border-cyan-500 transition-all"
                      placeholder="NOME DO PROTOCOLO"
                    />
                    <div className="flex gap-3">
                      <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-cyan-500 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all">Sincronizar</button>
                      <button onClick={() => setIsEditingProfile(false)} className="px-6 py-2.5 bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:text-white transition-all">Descartar</button>
                    </div>
                  </div>
                ) : (
                  <div className="group/name">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                      Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase italic">{user?.name}</span>
                      <button onClick={() => setIsEditingProfile(true)} className="opacity-0 group-hover/name:opacity-100 transition-all text-sm text-cyan-400 p-2 hover:bg-white/5 rounded-xl align-middle ml-2">✎</button>
                    </h1>
                    <p className="text-slate-500 mt-3 text-sm font-mono opacity-70 group-hover:opacity-100 transition-opacity flex items-center justify-center md:justify-start gap-3">
                      <span>{user?.email}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden md:block"></span>
                      <div className="flex items-center gap-2">
                        {getLevelByScore(user?.xpTotal || 0).iconUrl ? (
                          <div
                            className="relative group/medal cursor-zoom-in"
                            onClick={() => setSelectedLevelIcon(getLevelByScore(user?.xpTotal || 0).iconUrl || null)}
                          >
                            <img
                              src={getLevelByScore(user?.xpTotal || 0).iconUrl}
                              className="w-12 h-12 md:w-14 md:h-14 object-contain transition-transform group-hover/medal:scale-110"
                              alt={getLevelByScore(user?.xpTotal || 0).name}
                            />
                            <div className="absolute -top-1 -right-1 bg-cyan-500 text-white p-0.5 rounded-full opacity-0 group-hover/medal:opacity-100 transition-opacity">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <span className={`font-black uppercase tracking-widest ${getLevelByScore(user?.xpTotal || 0).color}`}>
                            Nível {getLevelByScore(user?.xpTotal || 0).name}
                          </span>
                        )}
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden md:block"></span>
                      <span>Everest Elite</span>
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-4 relative z-10">
              <div className="bg-white/[0.04] border border-white/[0.08] p-6 rounded-[28px] shadow-lg flex items-center gap-5 group hover:border-cyan-500/30 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-2xl shadow-cyan-500/20 group-hover:rotate-12 group-hover:scale-110 transition-all">
                  🪙
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-white/30 block tracking-widest mb-1">Patrimônio Everest</span>
                  <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{balance} <span className="text-sm text-cyan-400 font-mono">EC</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 p-1.5 bg-white/[0.04] w-fit rounded-2xl md:rounded-full backdrop-blur-md border border-white/[0.06] mx-auto lg:mx-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl md:rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-white text-slate-950 shadow-xl shadow-white/10 scale-[1.02]'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 relative z-10">
        <div className="flex flex-col gap-10">
          {/* Dynamic Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === 'dashboard' ? (
                <div className="space-y-8">
                  {/* Dashboard Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat: Views or XP */}
                    {isPartner ? (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                          className="bg-white border border-slate-100 p-7 rounded-3xl shadow-sm hover:shadow-lg hover:border-cyan-200/50 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-5">
                            <div className="w-11 h-11 bg-cyan-50 rounded-xl flex items-center justify-center text-lg group-hover:bg-cyan-500 group-hover:text-white transition-all">👁️</div>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">+12%</span>
                          </div>
                          <span className="text-3xl font-black text-slate-900 block tracking-tighter tabular-nums">{metrics.views}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 block">Visualizações</span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                          className="bg-white border border-slate-100 p-7 rounded-3xl shadow-sm hover:shadow-lg hover:border-orange-200/50 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-5">
                            <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-lg group-hover:bg-orange-500 group-hover:text-white transition-all">⚡</div>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">+8%</span>
                          </div>
                          <span className="text-3xl font-black text-slate-900 block tracking-tighter tabular-nums">{metrics.clicks}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 block">Interações</span>
                        </motion.div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 p-7 rounded-3xl shadow-sm hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="w-11 h-11 bg-cyan-50 rounded-xl flex items-center justify-center text-lg">🎖️</div>
                          {getNextLevel(user?.xpTotal || 0).level ? (
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              Próximo: {getNextLevel(user?.xpTotal || 0).level?.name}
                            </span>
                          ) : (
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Nível Máximo</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div
                            className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shrink-0 cursor-zoom-in group/bigmedal relative"
                            onClick={() => setSelectedLevelIcon(getLevelByScore(user?.xpTotal || 0).iconUrl || null)}
                          >
                            {getLevelByScore(user?.xpTotal || 0).iconUrl ? (
                              <>
                                <img
                                  src={getLevelByScore(user?.xpTotal || 0).iconUrl}
                                  className="w-full h-full object-contain transition-transform group-hover/bigmedal:scale-110"
                                  alt={getLevelByScore(user?.xpTotal || 0).name}
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <div className="absolute inset-0 bg-cyan-500/10 rounded-full opacity-0 group-hover/bigmedal:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="bg-cyan-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Zoom</span>
                                </div>
                              </>
                            ) : (
                              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-lg">🎖️</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className={`text-xl font-black block tracking-tighter truncate ${getLevelByScore(user?.xpTotal || 0).color}`}>
                              {getLevelByScore(user?.xpTotal || 0).name}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 block">Nível Everest</span>
                            <span className="text-[10px] font-bold text-cyan-600 block mt-1">{user?.xpTotal || 0} XP</span>
                          </div>
                        </div>
                        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000"
                            style={{ width: `${getNextLevel(user?.xpTotal || 0).progress}%` }}
                          ></div>
                        </div>
                        {getNextLevel(user?.xpTotal || 0).level && (
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                              Progresso: {Math.round(getNextLevel(user?.xpTotal || 0).progress)}%
                            </span>
                            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-wider">
                              Faltam {getNextLevel(user?.xpTotal || 0).level!.minScore - (user?.xpTotal || 0)} XP
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Coin Balance Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-7 rounded-3xl shadow-lg relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                      <div className="flex items-center justify-between mb-5 relative z-10">
                        <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-lg group-hover:rotate-12 transition-transform">🪙</div>
                      </div>
                      <span className="text-3xl font-black block tracking-tighter tabular-nums relative z-10">{balance}</span>
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-1 block relative z-10">Everest Coins</span>
                    </motion.div>

                    {/* Streak Stats Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                    >
                      <StreakStats />
                    </motion.div>

                    {/* CTA Card */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                      onClick={() => setActiveTab('rewards')}
                      className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-7 rounded-3xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex flex-col justify-between group text-left relative overflow-hidden"
                    >
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                      <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-lg mb-5 group-hover:bg-white/30 transition-all">🎁</div>
                      <div className="relative z-10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/70 block">Ganhar Moedas</span>
                        <span className="text-lg font-black leading-tight tracking-tighter uppercase mt-1 block group-hover:translate-x-1 transition-transform">Explorar →</span>
                      </div>
                    </motion.button>
                  </div>

                  {/* Solutions Section if Partner */}
                  {isPartner && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 border-l-8 border-blue-600 pl-8">
                        <div>
                          <h4 className="text-3xl font-black uppercase tracking-tight text-slate-900">Minhas Soluções</h4>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Gestão de catálogo e status</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {loading ? (
                          <div className="h-40 bg-white/20 animate-pulse rounded-[40px] border border-white" />
                        ) : myProducts.length > 0 ? (
                          myProducts.map((p) => (
                            <div key={p.id} className="bg-white/60 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:shadow-lg hover:border-blue-100 transition-all">
                              <div className="w-24 h-24 bg-slate-100 rounded-3xl overflow-hidden shrink-0 border border-slate-100">
                                {p.heroImageUrl ? (
                                  <img src={p.heroImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="text-xl font-black text-slate-900 uppercase tracking-tight">{p.name}</h5>
                                  <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {p.status}
                                  </span>
                                </div>
                                <p className="text-slate-500 text-xs font-medium max-w-lg">{p.shortDescription}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-lg font-black text-slate-900">{formatBRLFromCents(p.priceCents)}</span>
                                <button className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-colors">Detalhes</button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center bg-white/40 border-4 border-dashed border-slate-200 rounded-[48px]">
                            <p className="text-slate-400 font-black uppercase tracking-widest italic">Nenhuma solução vinculada ainda</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'rewards' ? (
                <RewardsTab />
              ) : activeTab === 'store' ? (
                <StoreTab />
              ) : activeTab === 'ranking' ? (
                <RankingTab />
              ) : (
                <MissionsTab />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Medal Zoom Modal */}
      <AnimatePresence>
        {selectedLevelIcon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-xl cursor-zoom-out"
            onClick={() => setSelectedLevelIcon(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
              className="relative max-w-4xl w-full aspect-square flex items-center justify-center p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedLevelIcon}
                className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(34,211,238,0.4)]"
                alt="Medal Preview"
              />

              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center w-full">
                <h3 className="text-white text-4xl font-black uppercase tracking-tighter shadow-black drop-shadow-lg">
                  {getLevelByScore(user?.xpTotal || 0).name}
                </h3>
                <p className="text-cyan-400 font-mono text-xs uppercase tracking-[0.4em] mt-3">Patente de Elite Everest</p>
              </div>

              <button
                className="absolute -top-12 -right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
                onClick={() => setSelectedLevelIcon(null)}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}