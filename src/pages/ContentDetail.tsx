import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storageService } from '../lib/storageService';
import { WeeklyHighlight } from '../types/content';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '../components/Icons';
import { formatDateBR } from '../lib/format';

export default function ContentDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [highlight, setHighlight] = useState<WeeklyHighlight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const config = storageService.getHomeContent();
    // Busca pelo slug ou pelo ID (caso não tenha slug)
    const found = config.highlights.find(h => h.slug === slug || h.id === slug);
    setHighlight(found || null);
    setLoading(false);
  }, [slug]);

  if (loading) return null;

  if (!highlight || !highlight.body) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Conteúdo não encontrado</h2>
        <button 
          onClick={() => navigate('/')} 
          className="text-[#1D4ED8] font-bold hover:underline"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-[#0B1220] transition-colors mb-8 group"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Voltar</span>
        </button>
      </div>

      <article>
        <header className="max-w-3xl mx-auto px-4 mb-12">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-slate-50 text-[#1D4ED8] text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider border border-slate-100">
              {highlight.tag}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-[#0B1220] leading-[1.1] mb-6 tracking-tight">
            {highlight.title}
          </h1>

          <div className="flex items-center gap-4 border-y border-slate-100 py-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
              {highlight.authorName?.split(' ').map(n => n[0]).join('') || 'RE'}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0B1220]">{highlight.authorName || 'Redação ENT'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {highlight.readTimeLabel || '5 min leitura'}
              </p>
            </div>
          </div>
        </header>

        {highlight.imageUrl && (
          <div className="max-w-5xl mx-auto px-4 mb-12">
            <div className="aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <img src={highlight.imageUrl} alt={highlight.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4">
          <div className="space-y-8">
            {highlight.body.map((block) => {
              switch (block.type) {
                case 'heading':
                  return <h2 key={block.id} className="text-2xl font-black text-[#0B1220] tracking-tight mt-12">{block.text}</h2>;
                case 'paragraph':
                  return <p key={block.id} className="text-lg text-slate-600 leading-relaxed">{block.text}</p>;
                case 'quote':
                  return (
                    <blockquote key={block.id} className="border-l-4 border-[#1D4ED8] pl-6 py-2 italic text-xl text-[#0B1220] font-medium bg-slate-50 rounded-r-xl">
                      "{block.text}"
                    </blockquote>
                  );
                case 'bullet':
                  return (
                    <div key={block.id} className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] mt-2.5 shrink-0" />
                      <p className="text-lg text-slate-600 leading-relaxed">{block.text}</p>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 text-center">
            <h4 className="text-lg font-black text-[#0B1220] mb-2">Gostou deste conteúdo?</h4>
            <p className="text-slate-500 text-sm mb-8">Explore soluções que ajudam você a implementar estas estratégias hoje mesmo.</p>
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-[#1D4ED8] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1D4ED8]/20 hover:scale-[1.02] transition-all"
            >
              Explorar Marketplace
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}