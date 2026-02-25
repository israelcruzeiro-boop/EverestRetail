import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../lib/storageService';
import { ArrowLeftIcon } from '../components/Icons';
import { AdminProduct } from '../types/admin';

export default function Schedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState('09:00');

  useEffect(() => {
    const all = storageService.getProducts();
    const found = all.find(p => p.id === id);
    setProduct(found || null);
    setLoading(false);
  }, [id]);

  const handleConfirm = () => {
    alert('Reunião agendada com sucesso! Você receberá um convite por e-mail.');
    navigate('/marketplace');
  };

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

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900">Prefere conversar antes?</h2>
        <p className="text-slate-500 mt-2">Escolha o melhor dia e horário para falarmos sobre o seu projeto {product.name}.</p>
      </div>

      <div className="space-y-8">
        {/* Calendar Mockup */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button className="p-2 hover:bg-slate-50 rounded-full">←</button>
            <span className="font-bold">Outubro 2024</span>
            <button className="p-2 hover:bg-slate-50 rounded-full">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase mb-4">
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => (
              <button 
                key={i}
                className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                  ${i + 1 === 15 ? 'bg-[#0052cc] text-white shadow-lg shadow-[#0052cc]/20' : 'hover:bg-slate-50 text-slate-700'}
                `}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </section>

        {/* Time Slots */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Horários disponíveis</h3>
          <div className="grid grid-cols-3 gap-3">
            {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(time => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-xl text-sm font-bold border transition-all
                  ${selectedTime === time 
                    ? 'bg-[#0052cc]/10 border-[#0052cc] text-[#0052cc]' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}
                `}
              >
                {time}
              </button>
            ))}
          </div>
        </section>

        {/* Observations */}
        <section>
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Observações</label>
          <textarea 
            className="w-full rounded-xl border-slate-200 bg-white p-4 text-sm focus:ring-[#0052cc] focus:border-[#0052cc]"
            placeholder="Algum tópico específico que deseja tratar?"
            rows={3}
          ></textarea>
        </section>

        <button 
          onClick={handleConfirm}
          className="w-full bg-[#0052cc] hover:bg-[#0052cc]/90 text-white font-bold py-5 rounded-xl shadow-lg shadow-[#0052cc]/20 transition-all"
        >
          Confirmar reunião
        </button>
      </div>
    </div>
  );
}
