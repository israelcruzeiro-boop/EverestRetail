import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';
import ProductCard from '@/components/ProductCard';
import { productReviewsRepo } from '@/lib/repositories/productReviewsRepo';
import { motion } from 'framer-motion';
import { AdminProduct } from '@/types/admin';
import { analytics } from '@/lib/analytics';
import { useAuth } from '@/context/AuthContext';
import PartnerRequestModal from '@/components/marketplace/PartnerRequestModal';

export default function Marketplace() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  const handlePartnerClick = () => {
    if (isAuthenticated) {
      setIsPartnerModalOpen(true);
    } else {
      navigate('/login?mode=signup');
    }
  };

  const categories = ['Todas', 'SaaS', 'Serviço', 'Hardware', 'Destaque', 'Estratégia'];

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todas' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20 font-sans selection:bg-blue-500/30">

      {/* Compact Top Bar - Search & Sticky Header */}
      <div className="bg-white py-2 md:py-3 px-4 sticky top-0 md:top-14 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-2.5">

          {/* Search Header */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <input
                type="text"
                placeholder="Buscar soluções..."
                className="w-full h-9 md:h-10 pl-10 pr-4 bg-slate-100 border border-slate-200 rounded-md text-slate-800 text-[13px] font-medium outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Atalho Parceiro - Visível para todos */}
            <button 
              onClick={handlePartnerClick}
              className="hidden md:flex h-10 px-4 bg-[#FF4D00] text-white rounded-md items-center gap-2 text-[11px] font-black uppercase tracking-widest border-2 border-[#0B1220] shadow-[2px_2px_0px_0px_rgba(11,18,32,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shrink-0"
            >
              <span>Quero ser parceiro</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </button>


          </div>

          {/* Category Chips - Scroll Horizontal */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex overflow-x-auto gap-1.5 pb-1 hide-scrollbar flex-1 whitespace-nowrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all border ${activeCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Versão mobile do botão parceiro */}
            <button 
              onClick={handlePartnerClick}
              className="md:hidden flex h-7 px-2 bg-[#FF4D00] text-white rounded-sm items-center gap-1.5 text-[9px] font-black uppercase tracking-wider border-2 border-[#0B1220] shadow-[1px_1px_0px_0px_rgba(11,18,32,1)] shrink-0"
            >
              Parceria +
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 md:py-4">

        {/* Dense Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
          {loading ? (
            Array(12).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl border border-slate-300/50"></div>
            ))
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhuma solução encontrada</p>
            </div>
          )}
        </div>
      </div>

      <PartnerRequestModal 
        isOpen={isPartnerModalOpen} 
        onClose={() => setIsPartnerModalOpen(false)} 
      />
    </div>
  );
}