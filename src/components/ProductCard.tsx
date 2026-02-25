import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckIcon } from './Icons';
import { AdminProduct } from '../types/admin';
import { formatBRLFromCents } from '../lib/format';

interface ProductCardProps {
  product: AdminProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate(`/product/${product.id}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-md h-full">
      <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
        {product.logoImageUrl || product.heroImageUrl ? (
          <img 
            src={product.logoImageUrl || product.heroImageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">📦</span>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded text-[#0052cc] uppercase border border-[#0052cc]/20">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
          {product.shortDescription || `Solução estratégica de ${product.category.toLowerCase()} validada pelo ecossistema ENT.`}
        </p>
        
        <div className="flex items-center gap-2 mb-6">
          <CheckIcon className="text-[#0052cc] w-4 h-4" />
          <span className="text-sm font-semibold text-slate-700">Implementação Ágil</span>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">
              {product.priceLabel || 'Investimento'}
            </span>
            {!isAuthenticated ? (
              <span className="text-xs text-slate-400 italic">Login para ver</span>
            ) : (
              <span className="text-lg font-bold text-[#0052cc]">
                {formatBRLFromCents(product.priceCents)}
              </span>
            )}
          </div>
          <button 
            onClick={handleAction}
            className="bg-[#0052cc] hover:bg-[#0052cc]/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
