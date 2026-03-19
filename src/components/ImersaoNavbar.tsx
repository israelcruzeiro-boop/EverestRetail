import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '@/config/appConfig';

const ImersaoNavbar = () => {
  const paymentLink = "https://clkdmg.site/pay/imersao-de-ia-na-pratica";

  return (
    <nav className="fixed top-0 inset-x-0 z-[100] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5">
        <Link to="/" className="flex items-center group">
          <img src={APP_CONFIG.logoPath} alt="Everest Logo" className="h-10 md:h-12 w-auto object-contain brightness-110" />
        </Link>
        <div className="flex items-center gap-8">
          <a href="#experiencia" className="hidden md:block text-xs font-bold uppercase tracking-widest text-white/60 hover:text-cyan-400 transition-colors">Experiência</a>
          <a href="#metodologia" className="hidden md:block text-xs font-bold uppercase tracking-widest text-white/60 hover:text-cyan-400 transition-colors">Metodologia</a>
          <motion.a
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 transition-all"
          >
            Garantir Vaga
          </motion.a>
        </div>
      </div>
    </nav>
  );
};

export default ImersaoNavbar;
