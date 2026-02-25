import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storageService } from '../lib/storageService';
import ProtectedPrice from '../components/ProtectedPrice';
import { ArrowLeftIcon, CheckIcon } from '../components/Icons';
import { motion } from 'framer-motion';
import { AdminProduct } from '../types/admin';
import { formatBRLFromCents } from '../lib/format';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProduct = () => {
    const all = storageService.getProducts();
    const found = all.find(p => p.id === id);
    setProduct(found || null);
    setLoading(false);
  };

  useEffect(() => {
    loadProduct();
    window.addEventListener('ENT_STORAGE_UPDATED', loadProduct);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadProduct);
  }, [id]);

  if (loading) return null;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">📦</div>
        <h2 className="text-2xl font-black text-slate-900">Produto não encontrado</h2>
        <p className="text-slate-500 mt-2">A solução que você procura não está disponível ou foi removida.</p>
        <Link to="/marketplace" className="bg-[#0052cc] text-white px-8 py-3 rounded-xl font-bold text-sm mt-8 inline-block">
          Voltar para o Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 md:mb-8 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden shadow-lg border border-slate-200 flex items-center justify-center">
            {product.heroImageUrl ? (
              <img 
                src={product.heroImageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl">📦</span>
            )}
          </div>
          
          {product.testimonial?.enabled && (
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: product.testimonial.stars }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-base md:text-lg italic leading-relaxed mb-6">
                "{product.testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                  {product.testimonial.authorName?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <div className="font-bold text-sm md:text-base">{product.testimonial.authorName}</div>
                  <div className="text-xs text-white/60">
                    {product.testimonial.authorRole}{product.testimonial.company ? `, ${product.testimonial.company}` : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          <div className="mb-8">
            <span className="text-[#0052cc] font-bold text-xs md:text-sm uppercase tracking-widest">{product.category}</span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mt-2 mb-4">{product.name}</h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6">
              {product.shortDescription}
            </p>
            {product.longDescription && (
              <div className="prose prose-slate max-w-none">
                <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Sobre a Solução</h4>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                  {product.longDescription}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6 md:space-y-8 mb-12">
            <div>
              <h3 className="text-base md:text-lg font-bold mb-4">Benefícios Principais</h3>
              <ul className="space-y-3">
                {product.benefits.map((benefit) => (
                  <li key={benefit.id} className="flex items-start gap-3 text-slate-700 text-sm md:text-base">
                    <CheckIcon className="text-[#0052cc] w-5 h-5 shrink-0 mt-0.5" />
                    <span>{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight block mb-1">
                {product.priceLabel || 'INVESTIMENTO MENSAL'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-black text-[#0052cc]">
                  {formatBRLFromCents(product.priceCents)}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  / {product.billingPeriod === 'yearly' ? 'ano' : 'mês'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">Preços exclusivos para membros do ecossistema ENT.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <button 
              onClick={() => navigate(`/checkout/${product.id}`)}
              className="bg-[#0052cc] text-white font-bold py-3 md:py-4 rounded-xl shadow-lg hover:bg-[#0052cc]/90 transition-all text-sm md:text-base"
            >
              {product.ctaPrimaryLabel || 'Contratar agora'}
            </button>
            <button 
              onClick={() => navigate(`/schedule/${product.id}`)}
              className="bg-white border-2 border-[#0052cc] text-[#0052cc] font-bold py-3 md:py-4 rounded-xl hover:bg-slate-50 transition-all text-sm md:text-base"
            >
              {product.ctaSecondaryLabel || 'Agendar conversa'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
