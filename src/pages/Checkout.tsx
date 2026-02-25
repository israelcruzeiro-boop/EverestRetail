import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storageService } from '../lib/storageService';
import { ArrowLeftIcon, CheckIcon } from '../components/Icons';
import { AdminProduct } from '../types/admin';
import { analytics } from '../lib/analytics';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    analytics.track('page_view');
    const found = storageService.getProducts().find(p => p.id === id);
    if (found) {
      setProduct(found);
      analytics.track('checkout_started', { productId: found.id, priceCents: found.priceCents });
    }
  }, [id]);

  const handleConfirm = () => {
    if (product) {
      analytics.track('checkout_confirmed', { productId: product.id, priceCents: product.priceCents });
    }
    alert('Contratação confirmada!');
    navigate('/marketplace');
  };

  if (!product) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-8"><ArrowLeftIcon className="w-5 h-5" /><span className="text-sm font-bold uppercase tracking-wider">Voltar</span></button>
      <h2 className="text-2xl font-black text-slate-900 mb-8">Finalizar Contratação</h2>
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
        <h3 className="text-lg font-bold mb-6">Resumo do Pedido</h3>
        <p className="font-bold text-slate-900">{product.name}</p>
        <p className="text-lg font-black text-[#0052cc] mt-4">R$ {(product.priceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </section>
      <button onClick={handleConfirm} className="w-full bg-[#0052cc] text-white font-bold py-5 rounded-xl shadow-lg flex items-center justify-center gap-2">Confirmar contratação <CheckIcon className="w-5 h-5" /></button>
    </div>
  );
}