import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { HomeContentConfig, WeeklyHighlight, VideoCast } from '@/types/content';
import { homeContentRepo } from '@/lib/repositories/homeContentRepo';
import { AdminProduct } from '@/types/admin';
import VideoModal from '@/components/VideoModal';
import { getYouTubeThumbnail } from '@/lib/videoHelpers';
import { useAuth } from '@/context/AuthContext';
import { coinRepo } from '@/lib/repositories/coinRepo';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshBalance } = useAuth();
  const [config, setConfig] = useState<HomeContentConfig>({ hero: [], highlights: [], suggested: [], videocasts: [] });
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoCast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [homeConfig, allProducts] = await Promise.all([
          homeContentRepo.getHomeConfig(),
          supabase ? (await supabase.from('products').select('*')).data || [] : []
        ]);

        // Mapeamento mínimo necessário para o front
        const formattedProducts = (allProducts as any[]).map(p => ({
          ...p,
          logoImageUrl: p.logo_image_url || p.hero_image_url,
          heroImageUrl: p.hero_image_url
        })) as AdminProduct[];

        setConfig(homeConfig);
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeHighlights = config.highlights
    .filter(h => h.status === 'active')
    .sort((a, b) => a.order - b.order);

  const activeSuggested = config.suggested
    .filter(s => s.status === 'active')
    .sort((a, b) => a.order - b.order);

  const activeVideocasts = config.videocasts
    .filter(v => v.status === 'active')
    .sort((a, b) => a.order - b.order);

  const [currentHero, setCurrentHero] = useState(0);

  // Imagens dinâmicas do Admin
  const dynamicHeroSlides = config.hero.filter(h => h.status === 'active');

  // Imagens padrão (Fallback)
  const defaultHeroSlides = [
    { imageUrl: '/hero/hero-1.jpg', altText: 'Everest Retail Branding' },
    { imageUrl: '/hero/hero-2.jpg', altText: 'Everest Outdoor Billboard' },
    { imageUrl: '/hero/hero-3.jpg', altText: 'Everest Corporate Office' },
    { imageUrl: '/hero/hero-4.jpg', altText: 'Everest Strategic Advertising' },
    { imageUrl: '/hero/hero-5.jpg', altText: 'Everest Urban Media' },
  ];

  const currentSlides = dynamicHeroSlides.length > 0 ? dynamicHeroSlides : defaultHeroSlides;

  useEffect(() => {
    if (currentSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % currentSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlides.length]);

  const handleHighlightClick = async (h: WeeklyHighlight) => {
    const target = h.slug || h.id;
    if (isAuthenticated) {
      // Trigger reward silently
      coinRepo.rewardHighlightWeekly(h.id, 10).then(res => {
        if (res?.success) refreshBalance();
      });
    }
    navigate(`/conteudo/${target}`);
  };

  return (
    <div className="bg-white min-h-screen pb-32 relative overflow-hidden text-slate-900 font-sans selection:bg-cyan-500/30">
      {/* Black Hero Section - Unified with Header */}
      <div className="bg-black relative overflow-hidden">
        {/* Refined Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]"></div>
        </div>

        {/* Suttle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <section className="pt-24 md:pt-40 pb-32 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="flex-1 space-y-10 order-2 lg:order-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Enterprise Core V2.0</span>
                </motion.div>

                {currentSlides[currentHero]?.title ? (
                  <motion.h1
                    key={`title-${currentHero}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight uppercase"
                  >
                    {currentSlides[currentHero].title}
                  </motion.h1>
                ) : (
                  <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                    Arquitetura de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">Elite</span> para a sua loja.
                  </h1>
                )}

                {currentSlides[currentHero]?.subtitle ? (
                  <motion.p
                    key={`subtitle-${currentHero}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                  >
                    {currentSlides[currentHero].subtitle}
                  </motion.p>
                ) : (
                  <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                    Sistemas de alta performance desenhados para escalar operações complexas com simplicidade e precisão tecnológica.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(currentSlides[currentHero]?.linkUrl || '/marketplace')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
                  >
                    {currentSlides[currentHero]?.ctaLabel || 'Explorar Marketplace'}
                  </motion.button>
                  <button
                    onClick={() => navigate('/contato')}
                    className="text-white hover:text-cyan-400 px-8 py-4 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 border-slate-700 hover:border-cyan-500/50"
                  >
                    Falar com Especialista
                  </button>
                </div>
              </div>

              <div className="flex-1 order-1 lg:order-2 w-full lg:max-w-[600px] relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="relative aspect-square rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-800/50 group"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHero}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <img
                        src={currentSlides[currentHero]?.imageUrl}
                        alt={currentSlides[currentHero]?.altText || 'Everest Retail'}
                        className="w-full h-full object-cover brightness-110 saturate-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Carousel Indicators */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {currentSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentHero(i)}
                        className={`h-1.5 transition-all duration-500 rounded-full ${currentHero === i ? 'w-8 bg-cyan-500' : 'w-2 bg-white/20 hover:bg-white/40'
                          }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Highlights Section - Elite Editorial Board */}
      {activeHighlights.length > 0 && (
        <section className="py-24 md:py-40 px-4 sm:px-6 lg:px-8 bg-slate-50/80 relative overflow-hidden">
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          <div className="max-w-7xl mx-auto">
            <header className="mb-20 md:mb-32 flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="text-cyan-500 font-mono text-[9px] uppercase tracking-[0.4em]">Editorial Intel v2.0</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-[0.85] uppercase italic">
                Destaques da <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-700">Semana.</span>
              </h2>
              <p className="max-w-2xl text-slate-500 font-medium text-sm md:text-lg leading-relaxed">
                Insights estratégicos e inovações capturadas pelo nosso radar global de tecnologia e varejo.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="md:col-span-4 h-[400px] bg-slate-200 animate-pulse rounded-[40px]"></div>
                ))
              ) : (
                activeHighlights.map((h, index) => {
                  const isMain = index === 0;
                  return (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      onClick={() => handleHighlightClick(h)}
                      className={`group cursor-pointer rounded-[40px] md:rounded-[56px] overflow-hidden bg-white border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:shadow-cyan-500/20 hover:border-cyan-500/40 transition-all duration-700 relative flex flex-col ${isMain ? 'md:col-span-8 h-[500px] md:h-[650px]' : 'md:col-span-4 h-[450px] md:h-[650px]'
                        }`}
                    >
                      <div className="flex-1 overflow-hidden relative">
                        {/* Imagem com efeito Zoom sutil */}
                        <img
                          src={h.imageUrl}
                          alt={h.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s] ease-out brightness-[0.85] group-hover:brightness-100"
                        />

                        {/* Gradient Overlay Otimizado */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent md:hidden"></div>

                        {/* Conteúdo flutuante (Mobile Safe) */}
                        <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end">
                          <div className="space-y-4 md:space-y-6">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-cyan-500 text-slate-950 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] rounded-md transition-colors group-hover:bg-white">
                                {h.tag}
                              </span>
                              {h.readTimeLabel && (
                                <span className="text-white/70 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm px-2 py-1 rounded bg-white/5 border border-white/10">
                                  {h.readTimeLabel}
                                </span>
                              )}
                            </div>

                            <h3 className={`font-black text-white leading-[0.9] tracking-tighter uppercase transition-all duration-500 ${isMain ? 'text-4xl md:text-7xl lg:text-8xl' : 'text-3xl md:text-5xl'
                              }`}>
                              {h.title}
                            </h3>

                            <p className={`text-white/60 font-medium leading-relaxed transition-all duration-700 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 ${isMain ? 'text-sm md:text-lg max-w-xl line-clamp-2' : 'text-xs md:text-sm max-w-xs line-clamp-3'
                              }`}>
                              {h.subtitle || 'Explore os detalhes técnicos e estratégicos deste insight exclusivo da rede Everest.'}
                            </p>

                            <div className="pt-2 flex items-center gap-3 text-cyan-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                              Access Intel Report
                              <div className="w-8 h-px bg-cyan-500 group-hover:w-12 transition-all"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Floating Indicator (Mobile Only) */}
                      <div className="absolute top-6 right-6 md:hidden">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <footer className="mt-20 flex justify-center">
              <button
                onClick={() => navigate('/conteudos')}
                className="group flex flex-col items-center gap-4"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 group-hover:text-cyan-600 transition-colors">Ver todos os relatórios</span>
                <div className="w-12 h-12 rounded-2xl border-2 border-slate-200 flex items-center justify-center group-hover:bg-slate-950 group-hover:border-slate-950 group-hover:text-white transition-all transform group-hover:rotate-45">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </div>
              </button>
            </footer>
          </div>
        </section>
      )}

      {/* Suggested Products - Elite Tech Assembly */}
      {activeSuggested.length > 0 && (
        <section className="bg-[#0B1220] py-32 md:py-48 px-4 relative overflow-hidden">
          {/* Tech Background - Industrial Blueprint */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}></div>

          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <header className="mb-20 md:mb-32 flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="text-cyan-500 font-mono text-[9px] uppercase tracking-[0.4em]">Unit Assembly v4.0</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
                Módulos <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Indicados.</span>
              </h2>
              <p className="max-w-2xl text-slate-400 font-medium text-sm md:text-lg leading-relaxed">
                Hardware e sistemas customizados, selecionados sob demanda para otimizar fluxos de trabalho de alta complexidade.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-96 bg-slate-900/50 animate-pulse rounded-3xl border border-white/5"></div>
                ))
              ) : (
                activeSuggested.map((s, index) => {
                  const product = products.find(p => p.id === s.productId);
                  if (!product) return null;
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-[#0F172A] border border-white/10 p-10 rounded-[40px] hover:border-cyan-500/50 transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
                    >
                      {/* Scanline Effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-[2s] pointer-events-none"></div>

                      {/* Technical Meta info */}
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-center opacity-40">
                        <span className="font-mono text-[8px] text-cyan-400 tracking-widest">{product.id.split('-')[0]}</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-white"></div>
                          <div className="w-1 h-1 bg-white opacity-50"></div>
                        </div>
                      </div>

                      <div className="mt-8 mb-10 relative">
                        {/* Glow Behind Image */}
                        <div className="absolute inset-0 bg-cyan-500/20 blur-[40px] rounded-full scale-50 group-hover:scale-110 transition-transform duration-700"></div>

                        <div className="relative w-36 h-36 bg-[#1E293B] rounded-3xl p-6 border border-white/10 group-hover:border-cyan-500/30 transition-all transform group-hover:rotate-3 shadow-2xl">
                          {product.logoImageUrl || product.heroImageUrl ? (
                            <img
                              src={product.logoImageUrl || product.heroImageUrl}
                              alt={product.name}
                              className="w-full h-full object-contain filter brightness-110"
                            />
                          ) : <div className="text-white font-black text-4xl">?</div>}
                        </div>
                      </div>

                      <div className="space-y-3 flex-1">
                        <span className="text-[9px] text-cyan-500 font-black uppercase tracking-[0.3em]">{product.category || 'MÓDULO'}</span>
                        <h4 className="text-2xl font-black text-white leading-tight uppercase italic">{s.customTitle || product.name}</h4>
                        <div className="w-8 h-1 bg-slate-800 mx-auto rounded-full group-hover:w-16 group-hover:bg-cyan-500 transition-all duration-500"></div>
                      </div>

                      <div className="mt-12 w-full">
                        <Link
                          to={`/product/${product.id}`}
                          className="relative py-4 w-full bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-3 overflow-hidden"
                        >
                          <span className="relative z-10">{s.customCta || 'Ver Solução'}</span>
                          <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                      </div>

                      {/* Technical Footnote */}
                      <div className="mt-6 flex items-center gap-2 opacity-20 group-hover:opacity-60 transition-opacity">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-[8px] font-mono text-white tracking-widest uppercase italic">Operational Status: Verified</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}

      {/* EverCast - Cinematic Stream */}
      {activeVideocasts.length > 0 && (
        <section className="py-24 md:py-40 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <header className="mb-20 md:mb-32 flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-red-600 font-mono text-[9px] uppercase tracking-[0.4em]">Live Stream v1.2</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-[0.85] uppercase italic">
                Ever<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">Cast.</span>
              </h2>
              <p className="max-w-2xl text-slate-500 font-medium text-sm md:text-lg leading-relaxed">
                Acompanhe os principais players do mercado em transmissões exclusivas sobre o futuro do ecossistema varejista.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {activeVideocasts.map((v, index) => (
                <div
                  key={v.id}
                  className="group cursor-pointer space-y-6"
                  onClick={() => setSelectedVideo(v)}
                >
                  <div className="relative aspect-video rounded-[32px] overflow-hidden border border-slate-200 bg-white shadow-xl">
                    <img
                      src={getYouTubeThumbnail(v.videoUrl) || v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/40 backdrop-blur-md border border-white/50 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-xl">
                        <svg className="w-8 h-8 text-slate-900 fill-current translate-x-1 group-hover:text-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        {v.categoryLabel}
                      </span>
                    </div>
                  </div>
                  <div className="px-2 space-y-2">
                    <p className="text-cyan-600 text-[10px] font-bold uppercase tracking-[0.3em]">Feat. {v.speakerLabel}</p>
                    <h4 className="text-2xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors leading-tight uppercase tracking-tight">{v.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.videoUrl || ''}
        title={selectedVideo?.title || ''}
        id={selectedVideo?.id || ''}
        type="mission"
        onComplete={() => setSelectedVideo(null)}
      />
    </div>
  );
}