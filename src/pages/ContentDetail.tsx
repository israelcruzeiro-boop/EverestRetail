import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { homeContentRepo } from '@/lib/repositories/homeContentRepo';
import { useAuth } from '@/context/AuthContext';
import { coinRepo } from '@/lib/repositories/coinRepo';
import { WeeklyHighlight } from '@/types/content';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@/components/Icons';
import { formatDateBR } from '@/lib/format';

export default function ContentDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, refreshBalance, showToast } = useAuth();
  const [highlight, setHighlight] = useState<WeeklyHighlight | null>(null);
  const [loading, setLoading] = useState(true);
  const trackedSlug = useRef<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const config = await homeContentRepo.getHomeConfig();
      const found = config.highlights.find(h => h.slug === slug || h.id === slug);
      setHighlight(found || null);
      setLoading(false);

      if (found && isAuthenticated && trackedSlug.current !== slug) {
        trackedSlug.current = slug || null;
        // Tenta completar a missão de visualização
        coinRepo.completeMission('view_highlight', found.slug || found.id)
          .then((res) => {
            refreshBalance();
            if (res && res.awarded) {
              showToast('Everest Coins!', res.amount, 'coins');
              if (res.xp_awarded) {
                setTimeout(() => showToast('XP Ganho!', res.xp_awarded, 'xp'), 1000);
              }
            }
          })
          .catch(() => {
            trackedSlug.current = null;
          });
      }
    };
    loadContent();
  }, [slug, isAuthenticated]);

  if (loading) return null;

  if (!highlight) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[40px] text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full border border-red-500/20 flex flex-col items-center justify-center mx-auto mb-8 animate-pulse text-4xl">
            ⚠️
          </div>
          <h2 className="text-sm font-black text-red-400 uppercase tracking-[0.3em] mb-4">Acesso Negado ou Inválido</h2>
          <p className="text-slate-400 text-sm mb-10 font-medium">O relatório de inteligência solicitado não foi encontrado nos arquivos da rede Everest.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white hover:bg-cyan-400 text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          >
            Retornar à Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-20 font-sans text-slate-900">
      {/* Compact Top Header */}
      <div className="bg-black py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-white/5 shadow-xl">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1 uppercase tracking-widest rounded border border-blue-500/20 backdrop-blur-sm">
                {highlight.tag || 'Destaque'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-tight italic">
              {highlight.title}
            </h1>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl text-slate-400 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:border-blue-500/50 hover:text-blue-400 transition-all font-black text-[9px] uppercase tracking-widest group shrink-0 self-start md:self-center"
          >
            <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">

          {/* Main Content Article */}
          <article className="lg:col-span-8 space-y-6">
            {/* Meta info compact */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-black text-sm text-white">
                  {highlight.authorName?.split(' ').map(n => n[0]).join('') || 'E'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">{highlight.authorName || 'Everest Retail'}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{highlight.readTimeLabel || '5 min leitura'}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                {formatDateBR(new Date().toISOString())}
              </span>
            </div>

            {/* Content Cover - Reduced size */}
            {(highlight.contentCoverUrl || highlight.imageUrl) && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg aspect-video md:aspect-[21/9]">
                <img
                  src={highlight.contentCoverUrl || highlight.imageUrl}
                  alt={highlight.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {highlight.body && highlight.body.length > 0 ? (
                highlight.body.map((block) => {
                  switch (block.type) {
                    case 'heading':
                      return (
                        <h2 key={block.id} className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight mt-8 mb-4 uppercase italic border-l-4 border-blue-600 pl-4">
                          {block.text}
                        </h2>
                      );
                    case 'quote':
                      return (
                        <blockquote key={block.id} className="p-6 md:p-8 my-8 bg-slate-50 rounded-xl border-l-4 border-l-blue-600 border border-slate-200 italic shadow-sm">
                          <p className="text-lg md:text-xl text-slate-700 font-bold leading-tight tracking-tight uppercase">
                            "{block.text}"
                          </p>
                        </blockquote>
                      );
                    case 'bullet':
                      return (
                        <div key={block.id} className="flex gap-4 items-start group py-1 px-2">
                          <div className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></div>
                          <p className="text-base text-slate-600 leading-relaxed">{block.text}</p>
                        </div>
                      );
                    case 'image':
                      return (
                        <figure key={block.id} className="my-8 space-y-2">
                          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">
                            <img src={block.imageUrl} alt={block.text} className="w-full h-full object-cover" />
                          </div>
                          {block.text && (
                            <figcaption className="text-center text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-2">
                              {block.text}
                            </figcaption>
                          )}
                        </figure>
                      );
                    case 'paragraph':
                    default:
                      return <p key={block.id} className="text-base md:text-lg text-slate-600 leading-relaxed font-medium mb-4 whitespace-pre-wrap">{block.text}</p>;
                  }
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Sem conteúdo registrado</p>
                </div>
              )}
            </div>
          </article>

          {/* Side Banner CTA (Stickier) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 bg-slate-900 p-8 rounded-2xl border border-white/5 shadow-2xl overflow-hidden relative group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>

              <h4 className="text-2xl font-black mb-4 text-white tracking-tighter leading-none uppercase italic relative z-10">
                Impulsione sua<br />
                <span className="text-blue-400">Estratégia</span>
              </h4>
              <p className="text-slate-400 text-xs mb-6 font-medium leading-relaxed relative z-10">
                Integre estas tendências de alta performance diretamente na sua operação.
              </p>

              <button
                onClick={() => navigate('/marketplace')}
                className="w-full relative px-6 py-4 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-500 hover:text-white shadow-lg relative z-10"
              >
                Explorar Frameworks
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}