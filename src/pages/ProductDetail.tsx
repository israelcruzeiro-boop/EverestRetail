import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storageService } from '../lib/storageService';
import { ArrowLeftIcon, CheckIcon } from '../components/Icons';
import { motion } from 'framer-motion';
import { AdminProduct } from '../types/admin';
import { formatBRLFromCents } from '../lib/format';
import { analytics } from '../lib/analytics';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProduct = () => {
    const all = storageService.getProducts();
    const found = all.find(p => p.id === id);
    if (found) {
      setProduct(found);
      analytics.track('product_view', { productId: found.id, name: found.name });
    }
    setLoading(false);
  };

  useEffect(() => {
    analytics.track('page_view');
    loadProduct();
  }, [id]);

  if (loading) return null;
  if (!product) return <div className="p-20 text-center">Produto não encontrado.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"><ArrowLeftIcon className="w-5 h-5" /><span className="text-sm font-bold uppercase tracking-wider">Voltar</span></button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden shadow-lg border border-slate-200 flex items-center justify-center">
            {product.heroImageUrl ? <img src={product.heroImageUrl} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-6xl">📦</span>}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col">
          <span className="text-[#0052cc] font-bold text-xs md:text-sm uppercase tracking-widest">{product.category}</span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mt-2 mb-4">{product.name}</h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6">{product.shortDescription}</p>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-12">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight block mb-1">{product.priceLabel || 'INVESTIMENTO MENSAL'}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-black text-[#0052cc]">{formatBRLFromCents(product.priceCents)}</span>
              <span className="text-xs text-slate-400 font-bold">/ {product.billingPeriod === 'yearly' ? 'ano' : 'mês'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => navigate(`/checkout/${product.id}`)} className="bg-[#0052cc] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#0052cc]/90 transition-all">Contratar agora</button>
            <button onClick={() => navigate(`/schedule/${product.id}`)} className="bg-white border-2 border-[#0052cc] text-[#0052cc] font-bold py-4 rounded-xl hover:bg-slate-50 transition-all">Agendar conversa</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}