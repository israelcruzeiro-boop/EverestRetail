import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { storageService } from '../lib/storageService';
import { HomeContentConfig, WeeklyHighlight, VideoCast } from '../types/content';
import { AdminProduct } from '../types/admin';
import VideoModal from '../components/VideoModal';

export default function Home() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<HomeContentConfig>({ highlights: [], suggested: [], videocasts: [] });
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoCast | null>(null);

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
    // Força a navegação para a página interna de conteúdo
    const target = h.slug || h.id;
    navigate(`/conteudo/${target}`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="relative h-[320px] md:h-[400px] flex items-center overflow-hidden bg-[#0B1220] rounded-2xl md:rounded-3xl">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/40 to-transparent"></div>
          
          <div className="relative z-10 w-full px-6 md:px-12">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl"
            >
              <span className="inline-block bg-[#1D4ED8] text-white text-[9px] font-black px-2 py-0.5 rounded mb-4 uppercase tracking-[0.15em]">
                Estratégia 2024
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                O Ecossistema Inteligente do Varejo
              </h2>
              <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed max-w-sm">
                Soluções validadas para escala e gestão estratégica. Transforme dados em conversão real.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/marketplace"
                  className="bg-[#1D4ED8] text-white px-8 py-3.5 rounded-xl font-bold text-sm text-center shadow-lg shadow-[#1D4ED8]/20 hover:bg-[#1D4ED8]/90 transition-all"
                >
                  Explorar Soluções
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      {activeHighlights.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-[#0B1220]">Destaques da Semana</h3>
              <p className="text-slate-500 text-xs mt-1">Insights estratégicos editados pelo time ENT.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {activeHighlights.map((h) => (
              <motion.div 
                key={h.id}
                whileHover={{ y: -4 }}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200 flex flex-col"
                onClick={() => handleHighlightClick(h)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={h.imageUrl} 
                    alt={h.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-md text-[#0B1220] text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider border border-slate-200">
                      {h.tag}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-lg md:text-xl font-bold text-[#0B1220] mb-3 leading-tight group-hover:text-[#1D4ED8] transition-colors">
                    {h.title}
                  </h4>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#1D4ED8] uppercase tracking-widest">
                        {h.ctaLabel || 'Ler agora'}
                      </span>
                      <svg className="w-3 h-3 text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    {h.readTimeLabel && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {h.readTimeLabel}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Products Section */}
      {activeSuggested.length > 0 && (
        <section className="bg-slate-50/50 py-12 md:py-16 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h3 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase mb-2">Recomendados</h3>
              <h2 className="text-xl md:text-2xl font-black text-[#0B1220]">Produtos Sugeridos</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {activeSuggested.map((s) => {
                const product = products.find(p => p.id === s.productId);
                if (!product) return null;

                return (
                  <motion.div 
                    key={s.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center transition-all hover:border-slate-200"
                  >
                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-slate-100 p-2">
                      {product.logoImageUrl || product.heroImageUrl ? (
                        <img src={product.logoImageUrl || product.heroImageUrl} alt={product.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#0B1220] mb-1 line-clamp-1">
                      {s.customTitle || product.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">
                      {product.category}
                    </p>
                    <Link 
                      to={`/product/${product.id}`}
                      className="mt-auto text-[10px] font-black text-[#1D4ED8] uppercase tracking-widest hover:underline"
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
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-10">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-[#0B1220]">Vídeo-cast</h3>
            <p className="text-slate-500 text-xs mt-1">Conhecimento compartilhado por especialistas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeVideocasts.map((v) => (
              <motion.div 
                key={v.id}
                className="group"
              >
                <div 
                  className="relative aspect-video rounded-2xl overflow-hidden bg-[#0B1220] cursor-pointer mb-5 shadow-sm border border-slate-100"
                  onClick={() => setSelectedVideo(v)}
                >
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-[#1D4ED8] group-hover:scale-110 transition-all duration-300">
                      <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-[0.15em] block mb-2">
                    {v.categoryLabel}
                  </span>
                  <h4 className="text-lg font-bold text-[#0B1220] leading-snug mb-2 group-hover:text-[#1D4ED8] transition-colors">
                    {v.title}
                  </h4>
                  {v.speakerLabel && (
                    <p className="text-xs text-slate-500 font-medium">
                      {v.speakerLabel}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <VideoModal 
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.videoUrl || ''}
        title={selectedVideo?.title || ''}
      />
    </div>
  );
}