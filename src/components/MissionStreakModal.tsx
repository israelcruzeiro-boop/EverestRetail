import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MissionStreakModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    streak: number;
}

export default function MissionStreakModal({ isOpen, onClose, amount, streak }: MissionStreakModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
                        className="bg-white border-4 border-[#0B1220] shadow-[20px_20px_0px_0px_rgba(34,211,238,1)] max-w-md w-full relative overflow-hidden"
                    >
                        {/* Matrix Background Effect */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0B1220 1px, transparent 1px), linear-gradient(90deg, #0B1220 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        <div className="p-10 text-center space-y-8 relative z-10">
                            <div className="flex justify-center relative">
                                <div className="absolute inset-0 bg-cyan-400 blur-3xl opacity-20 animate-pulse"></div>
                                <div className="w-24 h-24 bg-[#0B1220] rounded-[32px] flex items-center justify-center text-5xl shadow-2xl border-2 border-cyan-400 relative z-10 transform rotate-12">
                                    🎯
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-4xl font-black text-[#0B1220] uppercase tracking-tighter italic">Dia Completo!</h3>
                                <div className="h-1 w-20 bg-cyan-400 mx-auto"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Protocolo de Missões Finalizado</p>
                            </div>

                            <div className="bg-slate-50 border-2 border-[#0B1220] p-8 space-y-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Bônus de Sequência</span>
                                    <span className="text-4xl font-black text-cyan-600">+{amount} EC</span>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <div className="px-4 py-2 bg-[#0B1220] text-white rounded-xl">
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none block opacity-50">Streak</span>
                                        <span className="text-xl font-black italic">{streak} DIAS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={onClose}
                                    className="w-full py-5 bg-[#0B1220] text-white font-black text-xs uppercase tracking-[0.6em] hover:bg-cyan-600 transition-all shadow-[10px_10px_0px_0px_rgba(34,211,238,0.5)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                                >
                                    CONFIRMAR PROTOCOLO
                                </button>
                            </div>

                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                                Mantenha o ritmo para bônus exponenciais
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
