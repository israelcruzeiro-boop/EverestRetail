import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    streak: number;
}

export default function DailyBonusModal({ isOpen, onClose, amount, streak }: DailyBonusModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white border-4 border-[#0B1220] shadow-[16px_16px_0px_0px_rgba(29,78,216,1)] max-w-sm w-full relative overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                        <div className="p-8 text-center space-y-6 relative z-10">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-[#1D4ED8] rounded-3xl flex items-center justify-center text-4xl shadow-lg border-2 border-[#0B1220] animate-bounce">
                                    🪙
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-[#0B1220] uppercase tracking-tighter">Bônus Diário!</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recompensa por Protocolo de Login</p>
                            </div>

                            <div className="bg-slate-50 border-2 border-[#0B1220] p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500">Ganhos de Hoje</span>
                                    <span className="text-[#1D4ED8] font-black text-xl">+{amount} EC</span>
                                </div>
                                <div className="h-0.5 bg-slate-200"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500">Sequência Atual</span>
                                    <span className="text-[#00FF41] font-black text-xl">{streak} DIAS</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-[#0B1220] text-white font-black text-xs uppercase tracking-[0.5em] hover:bg-[#1D4ED8] transition-all shadow-[8px_8px_0px_0px_rgba(29,78,216,0.3)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                                >
                                    COLETAR E CONTINUAR
                                </button>
                            </div>

                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                Volte amanhã para aumentar seu streak!
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
