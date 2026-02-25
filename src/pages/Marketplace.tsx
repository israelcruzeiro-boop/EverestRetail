import { useState, useEffect } from 'react';
import { storageService } from '../lib/storageService';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { AdminProduct } from '../types/admin';

export default function Marketplace() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProducts = () => {
    const all = storageService.getProducts();
    // Only show active products for end users
    setProducts(all.filter(p => p.status === 'active'));
  };

  useEffect(() => {
    loadProducts();
    window.addEventListener('ENT_STORAGE_UPDATED', loadProducts);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadProducts);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <header className="mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Marketplace de Soluções</h2>
        <p className="text-slate-500 max-w-2xl text-sm md:text-base">
          Encontre as melhores ferramentas e serviços para escalar sua operação de varejo. 
          Todas as soluções são validadas pelo time ENT.
        </p>
      </header>

      {/* Search Bar */}
      <div className="mb-8 md:mb-12">
        <div className="relative max-w-xl">
          <input 
            type="text"
            placeholder="O que você está procurando?"
            className="w-full h-12 md:h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052cc] focus:border-transparent text-sm md:text-base shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500">Nenhuma solução encontrada para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
