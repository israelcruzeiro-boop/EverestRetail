import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';
import ProductCard from '@/components/ProductCard';
import { productReviewsRepo } from '@/lib/repositories/productReviewsRepo';
import { motion } from 'framer-motion';
import { AdminProduct } from '@/types/admin';
import { analytics } from '@/lib/analytics';

export default function Marketplace() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const all = await supabaseService.getProducts();
      const active = all.filter(p => p.status === 'active');

      const productsWithRatings = await Promise.all(active.map(async (p) => {
        const rating = await productReviewsRepo.getProductRatingSummary(p.id);
        return {
          ...p,
          averageRating: rating.average,
          reviewCount: rating.count
        };
      }));

      setProducts(productsWithRatings);
      setLoading(false);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) analytics.track('search', { query: searchTerm });
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Black Market Header Section - Unified with Header */}
      <div className="bg-black pt-16 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Background Art */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <header className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[48px] shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Soluções Validadas</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
              Everest <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Retail</span>
            </h1>

            <p className="text-slate-400 mt-6 text-lg font-medium max-w-xl leading-relaxed">
              A curadoria definitiva de ferramentas e serviços estratégicos para transformar sua operação de varejo.
            </p>
          </header>
        </div>
      </div>

      {/* Main Content Body - Light Mode */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 space-y-16">
        {/* Search Bar - Sophisticated Light */}
        <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 border border-slate-100 p-6 rounded-[32px] shadow-sm">
          <div className="relative flex-1 w-full">
            <div className="relative group">
              <input
                type="text"
                placeholder="Procurar Solução Estratégica..."
                className="w-full h-16 pl-8 pr-16 bg-white border border-slate-200 rounded-2xl font-bold text-lg outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-300 transition-all placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center bg-white px-8 py-3 rounded-2xl border border-slate-200">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Total Ativos</span>
            <span className="text-3xl font-black text-slate-900 leading-none">{filteredProducts.length}</span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-[32px] border border-slate-200"></div>
            ))
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="col-span-full py-24 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <span className="text-5xl block mb-4 grayscale opacity-30">🔍</span>
              <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Nenhuma solução encontrada</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-6 text-cyan-600 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-slate-900 transition-colors"
              >
                [ Limpar Busca ]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}