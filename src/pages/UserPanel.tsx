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
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import DashboardWidgetCard from '@/components/dashboard/DashboardWidgetCard';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

export default function UserPanel() {
  const { user, logout, balance } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<AdminProduct[]>([]);
  const [metrics, setMetrics] = useState({ views: 0, clicks: 0 });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'rewards' | 'ranking' | 'store'>('dashboard');
  const [selectedLevelIcon, setSelectedLevelIcon] = useState<string | null>(null);

  // Profile Edit State
  const [isUploading, setIsUploading] = useState(false);

  const isPartner = user?.role === 'partner' || user?.role === 'admin';

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
      window.location.reload();
    } catch (err: any) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (newName: string) => {
    if (!user || !newName.trim()) return;
    try {
      await supabaseService.updateProfile(user.id, { name: newName });
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
    { id: 'dashboard', label: 'Início', icon: '📊' },
    { id: 'rewards', label: 'Ganhe', icon: '🪙' },
    { id: 'missions', label: 'Missões', icon: '🎯' },
    { id: 'store', label: 'Loja', icon: '🛒' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 font-sans selection:bg-blue-500/30">
      {/* Marketplace Header - White/Dense */}
      <div className="bg-white pt-8 pb-0 px-4 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader
            user={user}
            balance={balance || 0}
            isUploading={isUploading}
            onAvatarUpload={handleAvatarUpload}
            onSaveProfile={handleSaveProfile}
            onLogout={logout}
          />

          <div className="mt-2">
            <DashboardTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as any)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' ? (
              <div className="space-y-6">
                {/* 4-Column Grid for Primary Widgets */}
                <DashboardGrid cols={4}>
                  {/* XP & Level Widget */}
                  <DashboardWidgetCard
                    title="Nível Everest"
                    icon={getLevelByScore(user?.xpTotal || 0).iconUrl ? (
                      <img src={getLevelByScore(user?.xpTotal || 0).iconUrl} className="w-5 h-5 object-contain" alt="" />
                    ) : '🎖️'}
                    badge={`${user?.xpTotal || 0} XP`}
                    badgeColor="bg-blue-500/10 text-blue-600"
                    onClick={() => getLevelByScore(user?.xpTotal || 0).iconUrl && setSelectedLevelIcon(getLevelByScore(user?.xpTotal || 0).iconUrl || null)}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className={`text-base font-black tracking-tighter ${getLevelByScore(user?.xpTotal || 0).color}`}>
                          {getLevelByScore(user?.xpTotal || 0).name}
                        </span>
                        {getNextLevel(user?.xpTotal || 0).level && (
                          <span className="text-[7px] font-black text-slate-400 uppercase">
                            {Math.round(getNextLevel(user?.xpTotal || 0).progress)}%
                          </span>
                        )}
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getNextLevel(user?.xpTotal || 0).progress}%` }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  </DashboardWidgetCard>

                  {/* Coins Widget */}
                  <DashboardWidgetCard
                    title="Everest Coins"
                    icon="🪙"
                    onClick={() => setActiveTab('rewards')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-slate-900 tabular-nums tracking-tighter">{balance || 0}</span>
                      <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded">EC</span>
                    </div>
                  </DashboardWidgetCard>

                  {/* Streak Stats Card */}
                  <StreakStats />

                  {/* Quick Goal Widget */}
                  <DashboardWidgetCard
                    title="Meta Diária"
                    icon="🎯"
                    badge="50%"
                    badgeColor="bg-amber-50 text-amber-600"
                  >
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-600">Completar 2 missões</span>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-amber-500 rounded-full" />
                      </div>
                    </div>
                  </DashboardWidgetCard>
                </DashboardGrid>

                {/* Secondary Widgets Grid - Oculto conforme solicitação do usuário */}
                {/* 
                <DashboardGrid cols={4}>
                  <DashboardWidgetCard title="Ranking Global" icon="🏆" onClick={() => setActiveTab('ranking')}>
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-black text-slate-900 tracking-tighter">#42</span>
                      <span className="text-[8px] font-bold text-emerald-500 mb-1">↑ 2 posições</span>
                    </div>
                  </DashboardWidgetCard>

                  <DashboardWidgetCard title="Missões Ativas" icon="⚡" onClick={() => setActiveTab('missions')}>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">12</span>
                    <span className="text-[8px] font-bold text-slate-400 ml-1">pendentes</span>
                  </DashboardWidgetCard>

                  <DashboardWidgetCard title="Notificações" icon="🔔">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-800 uppercase truncate">Nova recompensa!</span>
                    </div>
                  </DashboardWidgetCard>

                  <DashboardWidgetCard title="Atividade" icon="📋">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline cursor-pointer">Ver histórico</span>
                  </DashboardWidgetCard>
                </DashboardGrid>
                */}

                {/* Partner Content - Dense Marketplace Style */}
                {isPartner && (
                  <div className="space-y-6">
                    {/* Partner Metrics - Oculto conforme solicitação do usuário */}
                    {/*
                    <DashboardGrid cols={4}>
                      <DashboardWidgetCard title="Vendas Mensais" icon="💰" badge="+14%" badgeColor="bg-emerald-50 text-emerald-600">
                        <span className="text-xl font-black text-slate-900 tracking-tighter">R$ 1.250,00</span>
                      </DashboardWidgetCard>
                      <DashboardWidgetCard title="Visualizações" icon="👁️" badge="+12%" badgeColor="bg-emerald-50 text-emerald-600">
                        <span className="text-xl font-black text-slate-900 tracking-tighter">{metrics.views}</span>
                      </DashboardWidgetCard>
                      <DashboardWidgetCard title="Conversão" icon="🎯" badge="3.2%" badgeColor="bg-blue-50 text-blue-600">
                        <span className="text-xl font-black text-slate-900 tracking-tighter">12%</span>
                      </DashboardWidgetCard>
                      <DashboardWidgetCard title="Suporte" icon="🎧">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Sem chamados</span>
                      </DashboardWidgetCard>
                    </DashboardGrid>
                    */}

                    {/* Solutions Area */}
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Minhas Soluções</h4>
                        <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Criar Nova</button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {loading ? (
                          Array(2).fill(0).map((_, i) => <div key={i} className="h-12 bg-white animate-pulse" />)
                        ) : myProducts.length > 0 ? (
                          myProducts.map((p) => (
                            <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                                  {p.heroImageUrl ? <img src={p.heroImageUrl} className="w-full h-full object-cover" alt="" /> : <span className="w-full h-full flex items-center justify-center text-sm">📦</span>}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[150px]">{p.name}</h5>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-bold text-slate-400">{p.category}</span>
                                    <span className={`text-[7px] font-black uppercase px-1 rounded ${p.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>{p.status}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-900 tabular-nums">{formatBRLFromCents(p.priceCents)}</span>
                                <button className="p-1.5 hover:bg-slate-100 rounded transition-all text-slate-400">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center bg-white">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Nenhuma solução vinculada</p>
                          </div>
                        )}
                      </div>
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

      {/* Medal Zoom Modal */}
      <AnimatePresence>
        {selectedLevelIcon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl cursor-zoom-out"
            onClick={() => setSelectedLevelIcon(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative max-w-lg w-full aspect-square flex items-center justify-center p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedLevelIcon} className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" alt="Medal Preview" />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
                <h3 className="text-white text-xl font-black uppercase tracking-tighter">
                  {getLevelByScore(user?.xpTotal || 0).name}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
