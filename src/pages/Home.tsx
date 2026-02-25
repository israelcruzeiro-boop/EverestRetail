import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { storageService } from '../lib/storageService';
import { HomeContentConfig, WeeklyHighlight, SuggestedProductBlock, VideoCast } from '../types/content';
import { AdminProduct } from '../types/admin';

export default function Home() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<HomeContentConfig>({ highlights: [], suggested: [], videocasts: [] });
  const [products, setProducts] = useState<AdminProduct[]>([]);

  const loadData = () => {
    setConfig(storageService.getHomeContent());
    setProducts(storageService.getProducts());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ENT_STORAGE_UPDATED', loadData);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadData);
  }, []);

  const activeHighlights = config.highlights
    .filter(h => h.status === 'active')
    .sort((a, b) => a.order - b.order);

  const activeSuggested = config.suggested
    .filter(s => s.status === 'active')
    .sort((a, b) => a.order - b.order);

  const activeVideocasts = config.videocasts
    .filter(v => v.status === 'active')
    .sort((a, b) => a.order - b.order);

  const handleHighlightClick = (h: WeeklyHighlight) => {
    if (h.linkType === 'internal') {
      navigate(h.linkUrl);
    } else {
      window.open(h.linkUrl, '_blank');
    }
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[400px] md:h-[500px] flex items-center overflow-hidden bg-slate-900">
        <img 
          src="https://picsum.photos/seed/business/1920/1080" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block bg-[#0052cc] text-white text-[10px] font-bold px-2 py-1 rounded mb-4 uppercase tracking-widest">
              Estratégia 2024
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              O Ecossistema Inteligente do Varejo
            </h2>
            <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
              A plataforma definitiva para escala e gestão estratégica no marketplace global. 
              Transforme dados em conversão real para o seu negócio.
            </p>
            <Link 
              to="/marketplace"
              className="inline-block w-full sm:w-auto text-center bg-[#0052cc] text-white px-10 py-4 rounded font-bold text-sm tracking-wide shadow-lg shadow-[#0052cc]/20 hover:bg-[#0052cc]/90 transition-all"
            >
              Explorar Soluções
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      {activeHighlights.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8 md:mb-12 border-l-4 border-[#0052cc] pl-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Destaques da Semana</h3>
              <p className="text-slate-500 text-xs md:text-sm">As principais tendências e insights do mercado.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {activeHighlights.map((h) => (
              <motion.div 
                key={h.id}
                whileHover={{ y: -5 }}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md"
                onClick={() => handleHighlightClick(h)}
              >
                <div className="relative h-64">
                  <img src={h.imageUrl} alt={h.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#0052cc] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {h.tag}
                    </span>
                  </div>
                  {h.readTimeLabel && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white">
                      {h.readTimeLabel}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-black text-slate-900 mb-4 leading-tight group-hover:text-[#0052cc] transition-colors">
                    {h.title}
                  </h4>
                  <span className="text-sm font-bold text-[#0052cc] flex items-center gap-2">
                    {h.ctaLabel || 'Ler agora'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Products Section */}
      {activeSuggested.length > 0 && (
        <section className="bg-slate-50 py-12 md:py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 md:mb-12 text-center">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">Produtos Sugeridos</h3>
              <div className="w-12 h-1 bg-[#0052cc] mx-auto mt-2"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {activeSuggested.map((s) => {
                const product = products.find(p => p.id === s.productId);
                if (!product) return null;

                return (
                  <motion.div 
                    key={s.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center mb-4 overflow-hidden border border-slate-100">
                      {product.logoImageUrl || product.heroImageUrl ? (
                        <img src={product.logoImageUrl || product.heroImageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
                      {s.customTitle || product.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                      {product.category}
                    </p>
                    <Link 
                      to={`/product/${product.id}`}
                      className="mt-auto text-xs font-black text-[#0052cc] hover:underline"
                    >
                      {s.customCta || 'Saber mais'}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* VideoCast Section */}
      {activeVideocasts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8 md:mb-12 border-l-4 border-[#0052cc] pl-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Vídeo-cast</h3>
              <p className="text-slate-500 text-xs md:text-sm">Aprenda com os maiores especialistas do ecossistema.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {activeVideocasts.map((v) => (
              <motion.div 
                key={v.id}
                className="group"
              >
                <div 
                  className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 cursor-pointer mb-4"
                  onClick={() => window.open(v.videoUrl, '_blank')}
                >
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-[#0052cc] group-hover:scale-110 transition-all">
                      <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#0052cc] uppercase tracking-widest block mb-1">
                    {v.categoryLabel}
                  </span>
                  <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">
                    {v.title}
                  </h4>
                  {v.speakerLabel && (
                    <p className="text-sm text-slate-500 font-medium">
                      {v.speakerLabel}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Stats/Trust Section */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <p className="text-4xl font-black text-[#0052cc] mb-2">120+</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Parceiros Ativos</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#0052cc] mb-2">R$ 45M+</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">GMV Transacionado</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#0052cc] mb-2">99.9%</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Uptime Garantido</p>
          </div>
        </div>
      </section>
    </div>
  );
}
