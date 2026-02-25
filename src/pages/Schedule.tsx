import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../lib/storageService';
import { ArrowLeftIcon } from '../components/Icons';
import { AdminProduct } from '../types/admin';
import { analytics } from '../lib/analytics';

export default function Schedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    analytics.track('page_view');
    const found = storageService.getProducts().find(p => p.id === id);
    if (found) {
      setProduct(found);
      analytics.track('schedule_started', { productId: found.id });
    }
  }, [id]);

  const handleConfirm = () => {
    if (product) analytics.track('schedule_confirmed', { productId: product.id });
    alert('Agendado!');
    navigate('/marketplace');
  };

  if (!product) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2"><ArrowLeftIcon className="w-5 h-5" /> Voltar</button>
      <h2 className="text-3xl font-black mb-8">Agendar conversa</h2>
      <button onClick={handleConfirm} className="w-full bg-[#0052cc] text-white font-bold py-5 rounded-xl">Confirmar reunião</button>
    </div>
  );
}