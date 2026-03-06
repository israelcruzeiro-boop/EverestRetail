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
        <div className="space-y-6 text-slate-900">
            {/* Standard Compact Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Marketplace Elite</h2>
                    <p className="text-slate-500 font-medium max-w-md text-sm">Aceleração e visibilidade. Impulsione seu perfil.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-50 border border-slate-200 p-2.5 px-4 rounded-xl flex items-center gap-3">
                        <div className="text-xl">🪙</div>
                        <div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider leading-none">Saldo</span>
                            <span className="text-base font-black tracking-tight text-slate-800">{balance} <span className="text-[11px] text-[#ee4d2d]">EC</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="max-w-md"
                    >
                        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-lg flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-sm">
                            <span>⚡</span> {successMessage}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Store Grid - Shopee Style */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4 relative z-10 mx-auto">
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -2 }}
                        className="bg-white border border-slate-200 hover:border-[#ee4d2d] transition-all flex flex-col h-full rounded shadow-sm hover:shadow-md overflow-hidden relative"
                    >
                        {item.price >= 2000 && (
                            <div className="absolute top-0 right-0 bg-[#ee4d2d] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                Destaque
                            </div>
                        )}

                        <div className="aspect-square bg-slate-50 flex items-center justify-center border-b border-slate-100 p-6">
                            <span className="text-5xl drop-shadow-sm">{item.benefit_type === 'xp' ? '🔋' : '📡'}</span>
                        </div>

                        <div className="p-3 flex flex-col flex-1">
                            <h3 className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-[#ee4d2d]">
                                {item.name.replace('Pacote de XP', '').replace('Mega Pacote de XP', '').replace('Destaque no Blog', '') || item.name}
                            </h3>

                            <div className="mt-auto pt-2 flex items-center justify-between gap-1">
                                <div className="text-[#ee4d2d] font-medium flex items-baseline gap-1">
                                    <span className="text-xs">🪙</span>
                                    <span className="text-lg font-semibold tracking-tight">{item.price}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">1 uni</span>
                            </div>
                        </div>

                        <div className="p-3 pt-0">
                            <button
                                onClick={() => item.benefit_type === 'boost' ? openBoostSelector(item) : initiationPurchase(item)}
                                disabled={purchasing !== null}
                                className={`w-full py-2 rounded text-[12px] font-medium transition-colors flex items-center justify-center ${purchasing === item.code
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#ee4d2d] hover:bg-[#d74226] text-white shadow-sm'
                                    }`}
                            >
                                {purchasing === item.code ? (
                                    <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-500 rounded-full animate-spin"></div>
                                ) : (
                                    'Comprar'
                                )}
                            </button>
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
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 md:p-6 space-y-5">
                                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">
                                            Selecione o Alvo
                                        </h3>
                                        <p className="text-sm text-slate-500">Escolha a publicação que deseja impulsionar</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPostSelector(false)}
                                        className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="max-h-[400px] overflow-y-auto space-y-3 custom-cyber-scrollbar pr-2">
                                    {myPosts.length === 0 ? (
                                        <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                                            <p className="text-slate-500 text-sm">Nenhuma publicação encontrada para impulsionar.</p>
                                        </div>
                                    ) : (
                                        myPosts.map((post) => (
                                            <button
                                                key={post.id}
                                                onClick={() => selectedBoostItem && initiationPurchase(selectedBoostItem, post.id)}
                                                className="w-full flex items-center gap-4 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#ee4d2d] rounded-lg text-left transition-all active:scale-[0.99] group"
                                            >
                                                <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden shrink-0 border border-slate-200">
                                                    {post.image_url ? (
                                                        <img src={post.image_url} className="w-full h-full object-cover" alt={post.title} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl text-slate-300">🖼️</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden space-y-1">
                                                    <h4 className="text-sm font-medium text-slate-800 truncate">{post.title}</h4>
                                                    <span className="text-[11px] text-slate-500 block">Publicado em {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                                                    {post.boosted_until && new Date(post.boosted_until) > new Date() && (
                                                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-sm mt-1">
                                                            Impulsionado
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[#ee4d2d] font-bold text-sm bg-orange-50 px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Selecionar
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
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 10 }}
                            className="relative w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 text-center space-y-5 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-2xl mx-auto border border-slate-100">
                                {confirmingItem.benefit_type === 'xp' ? '🔋' : '📡'}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Confirmar Compra</h3>
                                <p className="text-slate-500 text-sm">
                                    Deseja prosseguir com a compra do item <span className="font-semibold text-slate-800">{confirmingItem.name}</span> por <span className="text-[#ee4d2d] font-bold">{confirmingItem.price} EC</span>?
                                </p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setConfirmingItem(null)}
                                    disabled={purchasing !== null}
                                    className="flex-1 h-10 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 rounded text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handlePurchase(confirmingItem, confirmingTargetId)}
                                    disabled={purchasing !== null}
                                    className="flex-1 h-10 bg-[#ee4d2d] text-white rounded text-sm font-medium hover:bg-[#d74226] transition-colors flex items-center justify-center"
                                >
                                    {purchasing ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Confirmar'
                                    )}
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
