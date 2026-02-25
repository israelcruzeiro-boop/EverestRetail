import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storageService } from '../lib/storageService';
import { WeeklyHighlight } from '../types/content';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '../components/Icons';

export default function ContentDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [highlight, setHighlight] = useState<WeeklyHighlight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const config = storageService.getHomeContent();
    const found = config.highlights.find(h => h.slug === slug || h.id === slug);
    setHighlight(found || null);
    setLoading(false);
  }, [slug]);

  if (loading) return null;

  if (!highlight) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Conteúdo não encontrado</h2>
        <button onClick={() => navigate('/')} className="text-[#1D4ED8] font-bold hover:underline">Voltar para Home</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-[#0B1220] transition-colors mb-12 group"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Voltar</span>
        </button>
      </div>

      <article>
        {/* Header Section */}
        <header className="max-w-4xl mx-auto px-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <span className="inline-block bg-[#1D4ED8]/10 text-[#1D4ED8] text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              {highlight.tag}
            </span>
            
            <h1 className="text-3xl md:text-5xl font-black text-[#0B1220] leading-[1.1] tracking-tight">
              {highlight.title}
            </h1>

            {highlight.subtitle && (
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                {highlight.subtitle}
              </p>
            )}

            <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px] uppercase">
                {highlight.authorName?.split(' ').map(n => n[0]).join('') || 'RE'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#0B1220]">{highlight.authorName || 'Redação ENT'}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Publicado em {formatDateBR(new Date().toISOString())} • {highlight.readTimeLabel || '5 min leitura'}
                </span>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Hero Cover */}
        {(highlight.contentCoverUrl || highlight.imageUrl) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl mx-auto px-4 mb-16"
          >
            <div className="aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
              <img 
                src={highlight.contentCoverUrl || highlight.imageUrl} 
                alt={highlight.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          </motion.div>
        )}

        {/* Body Content */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-8">
            {highlight.body?.map((block) => {
              switch (block.type) {
                case 'heading':
                  return <h2 key={block.id} className="text-2xl md:text-3xl font-black text-[#0B1220] tracking-tight mt-12 mb-4">{block.text}</h2>;
                case 'paragraph':
                  return <p key={block.id} className="text-lg text-slate-600 leading-relaxed">{block.text}</p>;
                case 'quote':
                  return (
                    <blockquote key={block.id} className="border-l-4 border-[#1D4ED8] pl-8 py-4 italic text-xl md:text-2xl text-[#0B1220] font-medium bg-slate-50 rounded-r-2xl my-10">
                      "{block.text}"
                    </blockquote>
                  );
                case 'bullet':
                  return (
                    <div key={block.id} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-[#1D4ED8] mt-2.5 shrink-0" />
                      <p className="text-lg text-slate-600 leading-relaxed">{block.text}</p>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>

          {/* Footer CTA */}
          <div className="mt-24 p-10 bg-slate-50 rounded-3xl border border-slate-100 text-center">
            <h4 className="text-xl font-black text-[#0B1220] mb-3">Interessado nesta solução?</h4>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Nossa equipe de especialistas pode ajudar você a implementar esta estratégia no seu varejo.
            </p>
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-[#1D4ED8] text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-[#1D4ED8]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Explorar Marketplace
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}