import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storeRepo, StoreItem } from '../lib/repositories/storeRepo';
import { blogRepo } from '../lib/repositories/blogRepo';
import { BlogPost } from '../types/blog';
import { useAuth } from '../context/AuthContext';

export default function StoreTab() {
    const { user, refreshBalance, balance } = useAuth();
    const [items, setItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [showPostSelector, setShowPostSelector] = useState(false);
    const [myPosts, setMyPosts] = useState<BlogPost[]>([]);
    const [selectedBoostItem, setSelectedBoostItem] = useState<StoreItem | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // State for confirmation modal
    const [confirmingItem, setConfirmingItem] = useState<StoreItem | null>(null);
    const [confirmingTargetId, setConfirmingTargetId] = useState<string | undefined>(undefined);

    useEffect(() => {
        loadStore();
    }, []);

    const loadStore = async () => {
        setLoading(true);
        const data = await storeRepo.getItems();
        setItems(data);
        setLoading(false);
    };

    const loadMyPosts = async () => {
        const data = await blogRepo.getPosts();
        // Filtrar apenas posts do usuário
        const filtered = data.filter(p => p.profile_id === user?.id);
        setMyPosts(filtered);
    };

    const handlePurchase = async (item: StoreItem, targetId?: string) => {
        if (purchasing) return;
        setPurchasing(item.code);
        try {
            const result = await storeRepo.purchaseItem(item.code, targetId);
            if (result.success) {
                setSuccessMessage(result.message);
                await refreshBalance();
                setTimeout(() => setSuccessMessage(null), 6000);
                if (showPostSelector) setShowPostSelector(false);
                setConfirmingItem(null);
            } else {
                alert(result.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setPurchasing(null);
        }
    };

    const initiationPurchase = (item: StoreItem, targetId?: string) => {
        const currentBalance = Number(balance) || 0;
        const itemPrice = Number(item.price) || 0;

        if (currentBalance < itemPrice) {
            alert(`Saldo insuficiente para adquirir este item. Seu saldo: ${currentBalance} EC | Custo: ${itemPrice} EC`);
            return;
        }
        setConfirmingItem(item);
        setConfirmingTargetId(targetId);
    };

    const openBoostSelector = (item: StoreItem) => {
        setSelectedBoostItem(item);
        loadMyPosts();
        setShowPostSelector(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1220] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 space-y-16 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent blur-[120px] pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Premium Header */}
            <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4"
                >
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b6d4]"></span>
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Everest Protocol Store v2.5</span>
                </motion.div>

                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                    Marketplace <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 italic">Elite</span>
                </h2>

                <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl mx-auto">
                    Acesso exclusivo a protocolos de aceleração e visibilidade. Impulsione seu perfil com Everest Coins.
                </p>

                {/* Balance Display */}
                <div className="flex items-center justify-center gap-6 pt-4">
                    <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-[32px] backdrop-blur-2xl flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center text-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] group-hover:rotate-12 transition-transform">🪙</div>
                        <div className="text-left">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block">Seu Saldo</span>
                            <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{balance} <span className="text-xs text-yellow-500">EC</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="max-w-md mx-auto relative z-20"
                    >
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-8 py-4 rounded-[32px] backdrop-blur-xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                            <span className="text-2xl">⚡</span> {successMessage}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ultra Premium Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10 max-w-7xl mx-auto">
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -12 }}
                        className="group relative"
                    >
                        {/* Glowing Background Overlay */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[48px] opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>

                        <div className="relative bg-[#0F172A]/80 border border-white/10 p-10 rounded-[48px] backdrop-blur-3xl overflow-hidden flex flex-col h-full">
                            {/* Card Glow Corner */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-colors"></div>

                            {/* Badge */}
                            <div className="mb-8 flex items-center justify-between">
                                <div className="w-20 h-20 bg-white/5 rounded-[28px] border border-white/10 flex items-center justify-center text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                                    {item.benefit_type === 'xp' ? '🔋' : '📡'}
                                </div>
                                {item.price >= 2000 && (
                                    <span className="bg-cyan-500 text-slate-900 text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-[0.2em] shadow-[0_0_15px_#06b6d4]">Premium</span>
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-cyan-400 transition-colors">
                                    {item.benefit_type === 'xp' ? 'Packet' : 'Override'} <span className="block text-slate-500 group-hover:text-white transition-colors">{item.name.replace('Pacote de XP', '').replace('Mega Pacote de XP', '').replace('Destaque no Blog', '') || item.name}</span>
                                </h3>

                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            <div className="pt-10 mt-10 border-t border-white/5 flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] block">Custo de Upgrade</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-white tracking-tighter tabular-nums">{item.price}</span>
                                        <span className="text-xs font-black text-cyan-500 uppercase">EC</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => item.benefit_type === 'boost' ? openBoostSelector(item) : initiationPurchase(item)}
                                    disabled={purchasing !== null}
                                    className={`relative h-16 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all overflow-hidden flex items-center justify-center min-w-[140px] group/btn ${purchasing === item.code
                                        ? 'bg-white/5 text-white/20 cursor-wait'
                                        : 'bg-white text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] active:scale-95'
                                        }`}
                                >
                                    {purchasing === item.code ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="relative z-10 flex items-center gap-2">
                                            Adquirir <svg className="w-3 h-3 translate-x-0 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" /></svg>
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Post Selector Modal */}
            <AnimatePresence>
                {showPostSelector && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPostSelector(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="relative w-full max-w-3xl bg-[#111827] border border-white/10 rounded-[64px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

                            <div className="p-10 md:p-16 space-y-10">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase rounded tracking-widest border border-cyan-500/20">Protocolo Alpha</span>
                                        </div>
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter">
                                            Target <span className="text-cyan-500">Selection</span>
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowPostSelector(false)}
                                        className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all group"
                                    >
                                        <svg className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="max-h-[450px] overflow-y-auto space-y-4 pr-4 custom-cyber-scrollbar">
                                    {myPosts.length === 0 ? (
                                        <div className="py-24 text-center bg-white/5 border border-dashed border-white/10 rounded-[40px]">
                                            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm italic">Nenhuma transmissão ativa detectada</p>
                                        </div>
                                    ) : (
                                        myPosts.map((post) => (
                                            <button
                                                key={post.id}
                                                onClick={() => selectedBoostItem && initiationPurchase(selectedBoostItem, post.id)}
                                                className="w-full flex items-center gap-8 p-8 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-[40px] text-left transition-all group relative overflow-hidden active:scale-[0.98]"
                                            >
                                                <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                                                <div className="w-20 h-20 bg-slate-900 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-2xl">
                                                    {post.image_url ? (
                                                        <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-3xl">💻</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden space-y-2">
                                                    <h4 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors truncate">{post.title}</h4>
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Transmitido em {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                {post.boosted_until && new Date(post.boosted_until) > new Date() && (
                                                    <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[9px] font-black uppercase rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                                        Sinal Ativo
                                                    </div>
                                                )}
                                                <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-all font-black text-lg text-white">
                                                    ↣
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmingItem && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                            onClick={() => !purchasing && setConfirmingItem(null)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-[48px] p-10 text-center space-y-8 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-24 h-24 bg-cyan-500/10 rounded-[32px] border border-cyan-500/20 flex items-center justify-center text-5xl mx-auto shadow-inner">
                                {confirmingItem.benefit_type === 'xp' ? '🔋' : '📡'}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Confirmar Upgrade?</h3>
                                <p className="text-slate-400 text-sm font-medium">
                                    Você está prestes a adquirir <span className="text-white font-bold">{confirmingItem.name}</span> por <span className="text-cyan-400 font-bold">{confirmingItem.price} EC</span>.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={() => handlePurchase(confirmingItem, confirmingTargetId)}
                                    disabled={purchasing !== null}
                                    className="h-16 bg-white text-slate-950 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-400/10 flex items-center justify-center"
                                >
                                    {purchasing ? (
                                        <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
                                    ) : (
                                        'Confirmar Protocolo'
                                    )}
                                </button>
                                <button
                                    onClick={() => setConfirmingItem(null)}
                                    disabled={purchasing !== null}
                                    className="h-16 bg-white/5 text-white/40 hover:text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    Abortar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-cyber-scrollbar::-webkit-scrollbar {
                  width: 4px;
                }
                .custom-cyber-scrollbar::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 10px;
                }
                .custom-cyber-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(6, 182, 212, 0.3);
                  border-radius: 10px;
                }
                .custom-cyber-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(6, 182, 212, 0.6);
                }
              `}} />
        </div>
    );
}
