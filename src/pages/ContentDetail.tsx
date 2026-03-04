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
    <div className="bg-[#0B1220] min-h-screen pb-32 relative overflow-hidden font-sans selection:bg-cyan-500/30 text-slate-300">
      {/* Background Blobs (Premium Intel Vibe) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] -right-[10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[200px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl text-slate-400 px-6 py-3 rounded-full border border-white/10 shadow-lg hover:bg-white/10 hover:border-cyan-500/50 hover:text-cyan-400 transition-all mb-16 group font-black text-[10px] uppercase tracking-[0.3em]"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retornar
        </motion.button>

        <header className="mb-20 text-center md:text-left max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 relative"
          >
            {/* Tag Elite */}
            <div className="flex items-center gap-3 justify-center md:justify-start mb-8">
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]"></span>
              <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-4 py-2 uppercase tracking-[0.4em] rounded-md ring-1 ring-cyan-500/20 backdrop-blur-sm">
                {highlight.tag || 'Intel Report'}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[90px] font-black text-white leading-[0.9] tracking-tighter uppercase italic">
              {highlight.title}
            </h1>

            {highlight.subtitle && (
              <p className="text-lg md:text-2xl text-slate-400 leading-relaxed font-medium max-w-4xl border-l-2 border-slate-800 pl-6">
                {highlight.subtitle}
              </p>
            )}

            <div className="pt-10 mt-10 flex flex-col md:flex-row md:items-center gap-6 border-t border-white/5">
              <div className="flex bg-[#121A2A] p-4 rounded-3xl items-center gap-5 border border-white/5 shadow-inner">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-[20px] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-cyan-500/20 border border-white/10">
                  {highlight.authorName?.split(' ').map(n => n[0]).join('') || 'RE'}
                </div>
                <div className="flex flex-col text-left pr-4">
                  <span className="text-sm font-black text-white uppercase tracking-widest">{highlight.authorName || 'Redação Everest'}</span>
                  <span className="text-[9px] text-cyan-500 font-black uppercase tracking-[0.3em] mt-1 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {highlight.readTimeLabel || '5 min leitura'}
                  </span>
                </div>
              </div>

              <div className="md:ml-auto">
                <span className="flex items-center gap-2 text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em]">
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  Timestamp: {formatDateBR(new Date().toISOString())}
                </span>
              </div>
            </div>
          </motion.div>
        </header>
      </div>

      {/* Hero Image Cinematic */}
      {(highlight.contentCoverUrl || highlight.imageUrl) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-7xl mx-auto px-4 mb-24 relative z-10"
        >
          {/* Edge Glow */}
          <div className="absolute inset-4 bg-cyan-500/20 rounded-[56px] blur-2xl"></div>

          <div className="relative aspect-[21/9] rounded-[48px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 group">
            {/* Dark Overlay inside image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent opacity-80 z-10 pointer-events-none"></div>

            <img
              src={highlight.contentCoverUrl || highlight.imageUrl}
              alt={highlight.title}
              className="w-full h-full object-cover brightness-[0.8] saturate-150 group-hover:scale-105 transition-transform duration-[4s]"
            />
          </div>
        </motion.div>
      )}

      {/* Article Body Precision Stylized */}
      <article className="max-w-4xl mx-auto px-6 relative z-10 selection:bg-cyan-500 selection:text-slate-900">
        <div className="space-y-12">
          {highlight.body && highlight.body.length > 0 ? (
            highlight.body.map((block) => {
              switch (block.type) {
                case 'heading':
                  return (
                    <h2 key={block.id} className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none mt-24 mb-10 uppercase italic border-l-4 border-cyan-500 pl-8 pb-1">
                      {block.text}
                    </h2>
                  );
                case 'quote':
                  return (
                    <blockquote key={block.id} className="relative p-10 md:p-14 my-20 bg-[#121A2A] rounded-[40px] overflow-hidden border border-white/5 border-l-cyan-500 border-l-4 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] group transform hover:scale-[1.01] transition-transform">
                      {/* Watermark quote symbol */}
                      <div className="absolute -top-10 right-4 text-cyan-500/5 text-[250px] font-serif leading-none pointer-events-none h-full flex items-center">"</div>
                      <p className="relative z-10 text-2xl md:text-4xl text-white font-black leading-[1.2] tracking-tighter uppercase italic">
                        {block.text}
                      </p>
                    </blockquote>
                  );
                case 'bullet':
                  return (
                    <div key={block.id} className="flex gap-6 items-start group py-3 px-6 hover:bg-white/5 rounded-2xl transition-colors">
                      <div className="mt-2 flex items-center justify-center w-4 h-4 rounded-sm bg-cyan-500/20 text-cyan-400">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-sm"></span>
                      </div>
                      <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">{block.text}</p>
                    </div>
                  );
                case 'image':
                  return (
                    <figure key={block.id} className="my-20 space-y-4">
                      <div className="rounded-[40px] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative group">
                        <div className="absolute inset-0 bg-transparent group-hover:bg-cyan-500/10 transition-colors pointer-events-none z-10"></div>
                        <img src={block.imageUrl} alt={block.text} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                      </div>
                      {block.text && (
                        <figcaption className="text-center text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] font-mono mt-6">
                          // FIGURA: {block.text}
                        </figcaption>
                      )}
                    </figure>
                  );
                case 'paragraph':
                default:
                  return <p key={block.id} className="text-lg md:text-2xl text-slate-400 leading-[1.8] font-medium my-6">{block.text}</p>;
              }
            })
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[40px] bg-white/5">
              <span className="text-4xl mb-4">📠</span>
              <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Acesso Restrito - Registros Corrompidos</p>
            </div>
          )}
        </div>

        {/* CTA Elite */}
        <div className="mt-32 p-12 md:p-20 bg-gradient-to-t from-[#121A2A] to-[#0D1525] border border-white/10 rounded-[64px] shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] flex flex-col items-center text-center relative overflow-hidden group mb-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-[2s]" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

          <h4 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tighter leading-none uppercase italic">
            Impulsione sua<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent inline-block mt-2">Estratégia</span>
          </h4>
          <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-xl font-medium leading-relaxed">
            Descubra como os módulos do <span className="text-white">Everest</span> podem integrar estas tendências de alta performance diretamente na sua operação.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/marketplace')}
            className="relative px-16 py-7 bg-white text-slate-950 rounded-[28px] font-black text-xs uppercase tracking-[0.4em] transition-all hover:bg-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.2)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Explorar Frameworks
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </motion.button>
        </div>
      </article>
    </div>
  );
}