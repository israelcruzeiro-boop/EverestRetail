import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedPriceProps {
  price: number;
}

export default function ProtectedPrice({ price }: ProtectedPriceProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center gap-3">
        <p className="text-sm text-slate-500 font-medium">Preços visíveis apenas para parceiros</p>
        <Link 
          to="/login"
          className="bg-[#0052cc] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#0052cc]/90 transition-all"
        >
          Acessar condições
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">Investimento Mensal</span>
      <span className="text-3xl font-black text-[#0052cc]">
        R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}
