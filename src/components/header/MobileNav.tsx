import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavProps {
    isOpen: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    balance: number;
    logout: () => void;
    setIsOpen: (open: boolean) => void;
    navLinks: Array<{ path: string; label: string }>;
}

export default function MobileNav({
    isOpen,
    isAuthenticated,
    isAdmin,
    balance,
    logout,
    setIsOpen,
    navLinks
}: MobileNavProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="md:hidden absolute top-full left-0 w-full bg-[#0B1220]/95 backdrop-blur-3xl border-t border-white/10 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] max-h-[calc(100vh-80px)] overflow-y-auto"
                >
                    <div className="flex flex-col p-6 gap-3 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="space-y-1 relative z-10">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-2xl transition-all"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {isAuthenticated && (
                            <div className="space-y-1 relative z-10 pt-4 border-t border-white/5">
                                <span className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2 block">Painel do Usuário</span>
                                <Link
                                    to="/painel"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-300 hover:text-emerald-400 hover:bg-white/5 rounded-2xl transition-all"
                                >
                                    Meu Painel
                                </Link>
                                <Link
                                    to="/request-publication"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-300 hover:text-emerald-400 hover:bg-white/5 rounded-2xl transition-all"
                                >
                                    Solicitar Publicação
                                </Link>
                            </div>
                        )}

                        {isAdmin && (
                            <div className="pt-2 relative z-10">
                                <Link
                                    to="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex justify-between items-center px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl transition-all hover:bg-cyan-500/20"
                                >
                                    Administração Elite
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse outline outline-2 outline-cyan-500/30"></div>
                                </Link>
                            </div>
                        )}

                        {isAuthenticated && (
                            <div className="mt-2 flex items-center justify-between p-5 bg-gradient-to-br from-[#121A2A] to-[#0A0F18] rounded-[24px] border border-white/5 shadow-inner relative z-10 overflow-hidden">
                                <div className="absolute inset-0 bg-yellow-500/5 blur-xl pointer-events-none"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Saldo</span>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-xl border border-white/10 relative z-10 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                    <span className="text-base">🪙</span>
                                    <span className="text-base font-black text-white tabular-nums">{balance}</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-4 relative z-10">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-5 text-xs font-black uppercase tracking-[0.4em] rounded-[24px] hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20 active:scale-95"
                                >
                                    Encerrar Sessão
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center bg-cyan-500 text-slate-950 py-5 text-xs font-black uppercase tracking-[0.4em] rounded-[24px] hover:bg-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95"
                                >
                                    Entrar Agora
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
