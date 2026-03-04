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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Conteúdo não encontrado</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen pb-32 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-[10%] -left-[5%] w-[45%] h-[45%] bg-blue-400/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-[20%] -right-10 w-[50%] h-[50%] bg-sky-400/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-xl text-slate-400 px-6 py-3 rounded-full border border-white shadow-sm hover:text-blue-600 transition-all mb-16 group font-black text-[10px] uppercase tracking-[0.3em]"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar
        </motion.button>

        <header className="mb-20 text-center md:text-left max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-2 justify-center md:justify-start mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.3em] rounded-full ring-1 ring-blue-100">
                {highlight.tag}
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black text-slate-900 leading-[0.9] tracking-[-0.04em] uppercase">
              {highlight.title}
            </h1>

            {highlight.subtitle && (
              <p className="text-xl md:text-3xl text-slate-500 leading-tight font-medium max-w-4xl opacity-80">
                {highlight.subtitle}
              </p>
            )}

            <div className="pt-12 flex flex-col md:flex-row md:items-center gap-8 border-t border-slate-100">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center font-black text-xl text-white shadow-xl shadow-slate-900/10">
                  {highlight.authorName?.split(' ').map(n => n[0]).join('') || 'RE'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-black text-slate-900 uppercase tracking-tight">{highlight.authorName || 'Redação Everest'}</span>
                  <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] opacity-60">
                    {highlight.readTimeLabel || '5 min leitura'}
                  </span>
                </div>
              </div>
              <div className="md:ml-auto">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] bg-white/50 px-4 py-1.5 rounded-full border border-white">
                  Publicado em {formatDateBR(new Date().toISOString())}
                </span>
              </div>
            </div>
          </motion.div>
        </header>
      </div>

      {/* Hero Image */}
      {(highlight.contentCoverUrl || highlight.imageUrl) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-7xl mx-auto px-4 mb-24 relative z-10"
        >
          <div className="aspect-[21/9] rounded-[48px] overflow-hidden shadow-2xl shadow-blue-500/5 group border-4 border-white/40 backdrop-blur-3xl">
            <img
              src={highlight.contentCoverUrl || highlight.imageUrl}
              alt={highlight.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        </motion.div>
      )}

      {/* Article Body */}
      <article className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="space-y-12">
          {highlight.body && highlight.body.length > 0 ? (
            highlight.body.map((block) => {
              switch (block.type) {
                case 'heading':
                  return <h2 key={block.id} className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mt-20 mb-8 uppercase border-l-4 border-cyan-500 pl-6">{block.text}</h2>;
                case 'quote':
                  return (
                    <blockquote key={block.id} className="relative p-10 md:p-14 my-16 bg-slate-900 rounded-[40px] overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 text-cyan-500/10 text-9xl font-serif">"</div>
                      <p className="relative text-2xl md:text-4xl text-white font-black leading-tight tracking-tight uppercase italic">
                        {block.text}
                      </p>
                    </blockquote>
                  );
                case 'bullet':
                  return (
                    <div key={block.id} className="flex gap-6 items-start group py-2">
                      <span className="text-cyan-500 font-black text-xl">/</span>
                      <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">{block.text}</p>
                    </div>
                  );
                case 'image':
                  return (
                    <figure key={block.id} className="my-16 space-y-4">
                      <div className="rounded-[40px] overflow-hidden border-2 border-slate-100 shadow-2xl">
                        <img src={block.imageUrl} alt={block.text} className="w-full h-full object-cover" />
                      </div>
                      {block.text && (
                        <figcaption className="text-center text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                          // {block.text}
                        </figcaption>
                      )}
                    </figure>
                  );
                case 'paragraph':
                default:
                  return <p key={block.id} className="text-lg md:text-xl text-slate-600 leading-[1.8] font-medium opacity-90">{block.text}</p>;
              }
            })
          ) : (
            <p className="text-xl text-slate-400 italic font-medium">Este conteúdo ainda não possui texto detalhado.</p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-32 p-12 md:p-20 bg-white/40 backdrop-blur-3xl border border-white rounded-[64px] shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <h4 className="text-4xl md:text-7xl font-black mb-8 text-slate-900 tracking-tighter leading-none uppercase">
            Impulsione sua<br />
            <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent italic">Estratégia</span>
          </h4>
          <p className="text-slate-500 text-lg md:text-xl mb-12 max-w-md font-medium leading-relaxed opacity-80">
            Descubra como o ecossistema Everest pode integrar estas tendências diretamente na sua operação.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/marketplace')}
            className="bg-slate-900 hover:bg-blue-600 text-white px-16 py-7 rounded-[28px] font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl shadow-slate-900/20"
          >
            Explorar Marketplace
          </motion.button>
        </div>
      </article>
    </div>
  );
}