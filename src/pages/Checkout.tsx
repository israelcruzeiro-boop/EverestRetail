import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storageService } from '../lib/storageService';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CheckIcon } from '../components/Icons';
import { AdminProduct } from '../types/admin';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const all = storageService.getProducts();
    const found = all.find(p => p.id === id);
    setProduct(found || null);
    setLoading(false);
  }, [id]);

  if (loading) return null;

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Produto não encontrado</h2>
        <Link to="/marketplace" className="text-[#0052cc] font-bold hover:underline">
          Voltar ao Marketplace
        </Link>
      </div>
    );
  }

  const handleConfirm = () => {
    alert('Contratação confirmada com sucesso! Nosso time entrará em contato em breve.');
    navigate('/marketplace');
  };

  const price = product.priceCents / 100;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
      </button>

      <h2 className="text-2xl font-black text-slate-900 mb-8">Finalizar Contratação</h2>

      <div className="space-y-6">
        {/* Order Summary */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6">Resumo do Pedido</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900">{product.name}</p>
              <p className="text-sm text-slate-500">Plano Corporate Mensal</p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Assinatura Mensal</span>
              <span className="font-bold">R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Taxas de implementação</span>
              <span className="font-bold text-green-600 uppercase">Grátis</span>
            </div>
            <div className="flex justify-between text-lg pt-4 border-t border-slate-100">
              <span className="font-black">Total</span>
              <span className="font-black text-[#0052cc]">R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </section>

        {/* Info Box */}
        <div className="bg-[#0052cc]/5 border border-[#0052cc]/20 p-4 rounded-xl flex gap-3">
          <span className="text-[#0052cc] font-bold">ⓘ</span>
          <p className="text-sm text-slate-700 leading-relaxed">
            Você está contratando via <strong>ENT</strong>. Nossa equipe especializada fará toda a implementação técnica para você.
          </p>
        </div>

        {/* Payment Methods */}
        <section>
          <h3 className="text-lg font-bold mb-4">Método de Pagamento</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-white border-2 border-[#0052cc] rounded-xl cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">💳</span>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">Cartão de Crédito</span>
                  <span className="text-xs text-slate-500">•••• 8821</span>
                </div>
              </div>
              <input type="radio" checked readOnly className="text-[#0052cc] focus:ring-[#0052cc]" />
            </label>
            <label className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl cursor-pointer opacity-50">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">💠</span>
                <span className="font-bold text-slate-900">PIX</span>
              </div>
              <input type="radio" disabled className="text-[#0052cc] focus:ring-[#0052cc]" />
            </label>
          </div>
        </section>

        <button 
          onClick={handleConfirm}
          className="w-full bg-[#0052cc] hover:bg-[#0052cc]/90 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0052cc]/20"
        >
          Confirmar contratação
          <CheckIcon className="w-5 h-5" />
        </button>

        <p className="text-center text-slate-400 text-xs">
          Ao confirmar, você concorda com os Termos de Serviço e a Política de Privacidade da One Stop Shop ENT.
        </p>

        <div className="flex items-center justify-center gap-2 pt-4">
          <span className="text-slate-400 text-xs">🔒 AMBIENTE SEGURO</span>
        </div>
      </div>
    </div>
  );
}
