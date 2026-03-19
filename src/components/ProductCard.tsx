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
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label={product.name}
      onClick={handleAction}
      className="group h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Media Container - Reduced height */}
      <div className="relative h-32 sm:h-40 overflow-hidden bg-slate-50">
        {product.videoUrl && activeMedia === 'video' ? (
          <div className="w-full h-full bg-black">
            {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
              <iframe
                src={`https://www.youtube.com/embed/${product.videoUrl.split('v=')[1]?.split('&')[0] || product.videoUrl.split('/').pop()}?controls=0&autoplay=${isPlaying ? 1 : 0}&mute=1`}
                className="w-full h-full border-0 pointer-events-none"
                allow="autoplay; encrypted-media"
              ></iframe>
            ) : (
              <video src={product.videoUrl} autoPlay muted loop className="w-full h-full object-cover" />
            )}
          </div>
        ) : (
          <img
            src={product.logoImageUrl || product.heroImageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        {/* Badge - Minimalist Type Indicator */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/80 backdrop-blur-sm border border-slate-100 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">
          <span className={product.type === 'physical' ? 'text-amber-600' : 'text-blue-600'}>
            {product.type === 'physical' ? 'FÍSICO' : 'DIGITAL'}
          </span>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-1.5">
        <div className="min-h-[34px]">
          <h3 className="text-[13px] font-bold text-slate-800 leading-[1.2] line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {product.averageRating !== undefined && product.averageRating > 0 ? (
            <div className="flex items-center gap-0.5 text-amber-500">
              <span className="text-[10px]">★</span>
              <span className="text-[10px] font-black">{product.averageRating}</span>
            </div>
          ) : (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Novo</span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            {isAuthenticated ? (
              <>
                {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
                  <span className="text-[9px] font-bold text-red-500 line-through">
                    {formatBRLFromCents(product.originalPriceCents)}
                  </span>
                )}
                <span className="text-[13px] font-black text-slate-900 leading-tight">
                  {formatBRLFromCents(product.priceCents)}
                </span>
              </>
            ) : (
              <span className="text-[9px] font-black text-slate-300 uppercase italic">Restrito</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
