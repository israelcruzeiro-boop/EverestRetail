import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CircularImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    title: string;
}

export default function CircularImageModal({ isOpen, onClose, imageUrl, title }: CircularImageModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative max-w-lg w-full flex flex-col items-center gap-6"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-all"
                    >
                        ✕
                    </button>

                    {/* Circular Image Container */}
                    <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white group">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    </div>

                    {/* Description */}
                    <div className="text-center">
                        <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tighter mb-2">
                            {title}
                        </h3>
                        <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em]">
                            Visualização em Detalhe
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-[#0B1220] font-black text-xs uppercase tracking-widest rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                    >
                        Fechar
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
