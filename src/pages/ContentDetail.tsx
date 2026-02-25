import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storageService } from '../lib/storageService';
import { WeeklyHighlight } from '../types/content';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '../components/Icons';
import { formatDateBR } from '../lib/format';
import { analytics } from '../lib/analytics';

export default function ContentDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [highlight, setHighlight] = useState<WeeklyHighlight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analytics.track('page_view');
    const config = storageService.getHomeContent();
    const found = config.highlights.find(h => h.slug === slug || h.id === slug);
    if (found) {
      setHighlight(found);
      analytics.track('content_view', { contentId: found.id, title: found.title });
    }
    setLoading(false);
  }, [slug]);

  if (loading) return null;
  if (!highlight) return <div className="p-20 text-center">Conteúdo não encontrado.</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-[#0B1220] mb-12"><ArrowLeftIcon className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Voltar</span></button>
      </div>
      <article className="max-w-4xl mx-auto px-6">
        <header className="mb-12">
          <span className="inline-block bg-[#1D4ED8]/10 text-[#1D4ED8] text-[10px] font-black px-2.5 py-1 rounded uppercase mb-6">{highlight.tag}</span>
          <h1 className="text-3xl md:text-5xl font-black text-[#0B1220] leading-[1.1] mb-6">{highlight.title}</h1>
          <p className="text-lg text-slate-500 leading-relaxed">{highlight.subtitle}</p>
        </header>
        <div className="space-y-8">
          {highlight.body?.map((block) => (
            <p key={block.id} className="text-lg text-slate-600 leading-relaxed">{block.text}</p>
          ))}
        </div>
      </article>
    </div>
  );
}