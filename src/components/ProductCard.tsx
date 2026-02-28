import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckIcon } from './Icons';
import { AdminProduct } from '../types/admin';
import { formatBRLFromCents } from '../lib/format';
import { motion } from 'framer-motion';
import { analytics } from '../lib/analytics';

interface ProductCardProps {
  product: AdminProduct;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (product.videoUrl && !isPlaying) {
      const interval = setInterval(() => {
        setActiveMedia(prev => prev === 'image' ? 'video' : 'image');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [product.videoUrl, isPlaying]);

  const handleAction = () => {
    analytics.track('product_click', { productId: product.id, name: product.name });
    if (isAuthenticated) {
      navigate(`/product/${product.id}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group h-full p-2 bg-white/40 backdrop-blur-xl border border-white rounded-[40px] shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/15 transition-all duration-500"
    >
      <div className="bg-white rounded-[32px] overflow-hidden flex flex-col h-full border border-slate-100/50 shadow-inner">
        <div className="relative h-60 overflow-hidden">
          {product.videoUrl && activeMedia === 'video' ? (
            <div className="w-full h-full bg-black relative">
              {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${product.videoUrl.split('v=')[1]?.split('&')[0] || product.videoUrl.split('/').pop()}?controls=1&autoplay=${isPlaying ? 1 : 0}`}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  onLoad={() => isPlaying && setIsPlaying(true)}
                ></iframe>
              ) : (
                <video
                  src={product.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                />
              )}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer group/play"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(true);
                  }}
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover/play:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ) : product.logoImageUrl || product.heroImageUrl ? (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src={product.logoImageUrl || product.heroImageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-6xl">
              📦
            </div>
          )}

          {/* Media Indicators */}
          {product.videoUrl && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              <div className={`h-1 rounded-full transition-all duration-500 ${activeMedia === 'image' ? 'bg-blue-600 w-6' : 'bg-white/50 w-3'}`}></div>
              <div className={`h-1 rounded-full transition-all duration-500 ${activeMedia === 'video' ? 'bg-blue-600 w-6' : 'bg-white/50 w-3'}`}></div>
            </div>
          )}

          <div className="absolute top-4 right-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 shadow-sm border border-white">
            {product.category}
          </div>
        </div>

        <div className="p-8 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            {product.averageRating !== undefined && product.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                <span className="text-amber-500 text-[10px]">★</span>
                <span className="text-amber-700 font-black text-[10px]">{product.averageRating}</span>
              </div>
            )}
          </div>

          <p className="text-slate-500 text-sm font-medium mb-8 line-clamp-2 leading-relaxed opacity-80">
            {product.shortDescription || `Solução estratégica de ${product.category.toLowerCase()} validada pelo ecossistema ENT.`}
          </p>

          <div className="mt-auto">
            <div className="flex items-center gap-3 mb-6 bg-slate-50 w-fit px-4 py-1.5 rounded-full border border-slate-100">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estratégia Validada Everest</span>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-slate-400 font-black tracking-[0.1em] mb-1">
                  Investimento
                </span>
                {!isAuthenticated ? (
                  <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-tighter">Área Restrita</span>
                ) : (
                  <div className="flex flex-col">
                    {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
                      <span className="text-[10px] font-bold text-red-500 line-through mb-0.5">
                        De: {formatBRLFromCents(product.originalPriceCents)}
                      </span>
                    )}
                    <span className={`text-xl font-black tracking-tight ${product.originalPriceCents ? 'text-green-600' : 'text-slate-900'}`}>
                      {product.originalPriceCents ? 'Por: ' : ''}{formatBRLFromCents(product.priceCents)}
                    </span>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAction}
                className="bg-slate-900 hover:bg-blue-600 text-white font-black px-6 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/20"
              >
                Ver Detalhes
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
