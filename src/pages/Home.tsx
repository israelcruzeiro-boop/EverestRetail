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
import { blogRepo } from '@/lib/repositories/blogRepo';
import { BlogPost } from '@/types/blog';
import BannerCarousel from '@/components/BannerCarousel';
import SectionHeader from '@/components/SectionHeader';
import MarketplaceCard from '@/components/MarketplaceCard';
import MarketplaceGrid from '@/components/MarketplaceGrid';
import NewsCard from '@/components/NewsCard';
import CircularImageModal from '@/components/CircularImageModal';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshBalance, showToast } = useAuth();
  const [config, setConfig] = useState<HomeContentConfig>({ hero: [], highlights: [], suggested: [], videocasts: [] });
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [highlightedPosts, setHighlightedPosts] = useState<BlogPost[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoCast | null>(null);
  const [selectedImageData, setSelectedImageData] = useState<{ url: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [homeConfig, allProducts, allPosts] = await Promise.all([
          homeContentRepo.getHomeConfig(),
          supabase ? (await supabase.from('products').select('*')).data || [] : [],
          blogRepo.getPosts()
        ]);

        // Mapeamento mínimo necessário para o front
        const formattedProducts = (allProducts as any[]).map(p => ({
          ...p,
          logoImageUrl: p.logo_image_url || p.hero_image_url,
          heroImageUrl: p.hero_image_url
        })) as AdminProduct[];

        // Correção de parsing para Safari (Remove microsegundos do timestamp ISO)
        const parseDateSafe = (dateStr: string) => new Date(dateStr.replace(/\.\d+/, ''));
        const now = new Date();

        const boostedPosts = (allPosts || []).filter(p => {
          if (p.is_highlight) return true;
          if (!p.boosted_until) return false;
          return parseDateSafe(p.boosted_until) > now;
        }).sort((a, b) => {
          if (a.is_highlight && !b.is_highlight) return -1;
          if (!a.is_highlight && b.is_highlight) return 1;
          return 0;
        }).slice(0, 3);

        setConfig(homeConfig);
        setProducts(formattedProducts);
        setHighlightedPosts(boostedPosts);
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
    .filter(v => v.status === 'active' && (v.isHighlight === true || String(v.isHighlight) === 'true'))
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);

  // Log de depuração para o desenvolvedor
  if (config.videocasts.length > 0) {
    console.log('[Debug Home] Videocasts carregados:', config.videocasts.length);
    console.log('[Debug Home] Videocasts com isHighlight:', config.videocasts.filter(v => v.isHighlight).length);
  }

  const [currentHero, setCurrentHero] = useState(0);

  // Imagens dinâmicas do Admin
  const dynamicHeroSlides = config.hero.filter(h => h.status === 'active');

  // Imagens padrão (Fallback)
  const defaultHeroSlides = [
    { imageUrl: '/hero/hero-1.jpg', altText: 'Everest Retail Branding', linkUrl: '/imersao-ia' },
    { imageUrl: '/hero/hero-2.jpg', altText: 'Everest Outdoor Billboard', linkUrl: '/imersao-ia' },
    { imageUrl: '/hero/hero-3.jpg', altText: 'Everest Corporate Office', linkUrl: '/imersao-ia' },
    { imageUrl: '/hero/hero-4.jpg', altText: 'Everest Strategic Advertising', linkUrl: '/imersao-ia' },
    { imageUrl: '/hero/hero-5.jpg', altText: 'Everest Urban Media', linkUrl: '/imersao-ia' },
  ];

  const currentSlides = dynamicHeroSlides.length > 0 ? dynamicHeroSlides : defaultHeroSlides;

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-20 text-slate-900 font-sans">

      {/* 1. Hero Section — Headline + Banner */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 mt-4 md:mt-6">
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-6">
          {/* Headline à Esquerda */}
          <div className="flex flex-col md:w-[42%] py-4 md:py-6 px-2 md:px-0">
            <div className="flex-1 flex flex-col justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-[26px] sm:text-[30px] md:text-[36px] lg:text-[42px] font-black text-[#0B1220] leading-[1.1] tracking-tight"
              >
                Tudo o que o varejo precisa para{' '}
                <span className="text-orange-600">se atualizar</span>, aprender e evoluir.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-4 text-[11px] md:text-[12px] font-black text-slate-400 tracking-[0.05em]"
              >
                Acesse conteúdos, evercasts e soluções em uma plataforma criada para conectar estratégia, tecnologia e performance no varejo.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 md:mt-0"
            >
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-[12px] md:text-[14px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 active:scale-95"
              >
                Ir para o Marketplace
              </Link>
            </motion.div>
          </div>

          {/* Banner Carrossel à Direita */}
          <div className="md:w-[58%] flex-shrink-0">
            <BannerCarousel slides={currentSlides} bannerLink="/imersao-ia" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 space-y-4 md:space-y-6 mt-4 md:mt-6">

        {/* 2. Destaques da Semana */}
        {activeHighlights.length > 0 && (
          <section className="my-8">
            <SectionHeader
              title="Destaques da Semana"
              link={{ to: '/highlights', label: 'Ver Todos' }}
            />
            <p className="text-[12px] md:text-[13px] text-slate-500 -mt-2 mb-4 leading-relaxed max-w-2xl">
              Os principais conteúdos e soluções selecionados para quem quer acompanhar o que está movimentando o varejo.
            </p>
            {/* Grid 2 no mobile, 6 no desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 pb-2 md:pb-0">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="min-w-0 h-[180px] bg-slate-200 animate-pulse rounded-md"></div>
                ))
              ) : (
                activeHighlights.map((h) => (
                  <div key={h.id} className="min-w-0">
                    <NewsCard
                      image={h.imageUrl}
                      title={h.title}
                      category={h.tag || 'Notícia'}
                      date="Disponível Agora"
                      href={`/conteudo/${h.slug || h.id}`}
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        )}


        {/* 4. Módulos Indicados */}
        {activeSuggested.length > 0 && (
          <section className="my-8">
            <SectionHeader
              title="Módulos Indicados"
              link={{ to: '/modules', label: 'Ver Todos' }}
            />
            <MarketplaceGrid>
              {activeSuggested.map((s) => {
                const product = products.find(p => p.id === s.productId);
                if (!product) return null;
                return (
                  <MarketplaceCard
                    key={s.id}
                    image={product.logoImageUrl || ''}
                    title={s.customTitle || product.name}
                    category={product.category || 'Recomendado'}
                    href={`/product/${product.id}`}
                    onImageClick={() => setSelectedImageData({
                      url: product.logoImageUrl || '',
                      title: s.customTitle || product.name
                    })}
                  />
                );
              })}
            </MarketplaceGrid>
          </section>
        )}

        {/* 5. EverCast */}
        {activeVideocasts.length > 0 && (
          <section className="my-8">
            <h2 className="text-[16px] md:text-[18px] font-bold text-slate-800 mb-1 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              EverCast
            </h2>
            <p className="text-[12px] md:text-[13px] text-slate-500 mb-4 leading-relaxed max-w-2xl">
              Conversas, ideias e reflexões para quem vive o varejo na prática.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {activeVideocasts.map((v) => (
                <div
                  key={v.id}
                  className="group cursor-pointer flex flex-col md:flex-row gap-3 bg-white border border-slate-100 p-2 md:p-3 rounded-md hover:border-red-400 transition-all"
                  onClick={() => setSelectedVideo(v)}
                >
                  <div className="relative w-full md:w-48 aspect-video md:aspect-[16/9] rounded overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <img
                      src={getYouTubeThumbnail(v.videoUrl) || v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <svg className="w-4 h-4 text-red-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center flex-1 py-1 min-w-0">
                    <span className="text-[10px] font-bold text-red-600 uppercase mb-1 truncate">{v.categoryLabel} • {v.speakerLabel}</span>
                    <h4 className="text-[13px] md:text-[14px] font-bold text-slate-800 leading-snug line-clamp-2 md:line-clamp-3 group-hover:text-red-700 transition-colors">{v.title}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200/60 pt-4 text-left">
              <Link to="/videocasts" className="text-[10px] font-black text-[#0B1220] hover:text-red-600 uppercase tracking-[0.3em] transition-colors inline-flex items-center gap-2 group">
                ACESSAR TODOS OS EVERCASTS <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </section>
        )}

        {/* 6. Vozes em Destaque */}
        {highlightedPosts.length > 0 && (
          <section className="my-8">
            <h2 className="text-[18px] md:text-xl font-black text-[#0B1220] mb-1 uppercase tracking-tighter flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#1D4ED8] inline-block"></span>
              Vozes em Destaque
            </h2>
            <p className="text-[12px] md:text-[13px] text-slate-500 mb-4 md:mb-6 leading-relaxed max-w-2xl">
              Artigos, análises e pontos de vista de quem está construindo o mercado todos os dias.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {highlightedPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="group bg-white border-2 border-[#0B1220] p-4 md:p-5 overflow-hidden shadow-[4px_4px_0px_0px_rgba(11,18,32,1)] hover:-translate-y-1 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(11,18,32,1)] transition-all cursor-pointer flex flex-col h-full"
                >
                  <div className="flex items-center gap-3 mb-4 justify-between w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-[#0B1220] overflow-hidden flex-shrink-0">
                        {post.profile?.avatar_url ? (
                          <img src={post.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-tighter text-[#0B1220]">
                            {post.profile?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0B1220] truncate">
                          {post.profile?.name || 'Membro Everest'}
                        </p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#FF4D00] truncate mt-0.5">
                          Autor Top Creator
                        </p>
                      </div>
                    </div>
                    {post.image_url && (
                      <div className="w-24 h-16 md:w-32 md:h-20 bg-slate-100 border-2 border-[#0B1220] flex-shrink-0 ml-2 shadow-[2px_2px_0px_0px_rgba(11,18,32,1)]">
                        <img src={post.image_url} alt="Post Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-[15px] md:text-[16px] font-black text-[#0B1220] uppercase tracking-tighter leading-none mb-3 line-clamp-2 group-hover:text-[#1D4ED8] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-[12px] font-medium line-clamp-2 leading-relaxed mt-auto">
                    {(post.content || '').replace(/<[^>]+>/g, '')}
                  </p>

                  <div className="mt-4 pt-3 flex items-center border-t-2 border-slate-50">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1D4ED8] group-hover:underline">
                      LER COMPLETO →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t-2 border-[#0B1220] pt-4 text-left">
              <button onClick={() => navigate('/blog')} className="text-[10px] font-black text-[#0B1220] hover:text-[#1D4ED8] uppercase tracking-[0.3em] transition-colors hover:translate-x-1 duration-200 inline-flex items-center gap-2">
                VER TODAS AS PUBLICAÇÕES <span className="text-lg leading-none">→</span>
              </button>
            </div>
          </section>
        )}
      </div>

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.videoUrl || ''}
        title={selectedVideo?.title || ''}
        id={selectedVideo?.id || ''}
        type="videocast"
      />

      <CircularImageModal
        isOpen={!!selectedImageData}
        onClose={() => setSelectedImageData(null)}
        imageUrl={selectedImageData?.url || ''}
        title={selectedImageData?.title || ''}
      />
    </div>
  );
}