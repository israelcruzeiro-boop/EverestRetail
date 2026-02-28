import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
    id: string;
    message: string;
    amount: number;
}

export default function Toast({ message, amount }: ToastProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-slate-900 text-white px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl"
        >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-xl shadow-lg shadow-blue-500/40">
                🪙
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Recompensa Everest</span>
                <span className="text-sm font-bold">{message} <span className="text-blue-400">+{amount} moedas</span></span>
            </div>
        </motion.div>
    );
}
