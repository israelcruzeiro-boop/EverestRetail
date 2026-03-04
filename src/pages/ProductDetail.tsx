import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';
import { ArrowLeftIcon, CheckIcon } from '@/components/Icons';
import { motion } from 'framer-motion';
import { AdminProduct } from '@/types/admin';
import { formatBRLFromCents } from '@/lib/format';
import { analytics } from '@/lib/analytics';
import { useAuth } from '@/context/AuthContext';
import { coinRepo } from '@/lib/repositories/coinRepo';
import { productReviewsRepo } from '@/lib/repositories/productReviewsRepo';
import { ProductReview } from '@/types/admin';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, refreshBalance, showToast } = useAuth();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [hasHired, setHasHired] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [isPlaying, setIsPlaying] = useState(false);

  const loadProduct = async () => {
    const all = await supabaseService.getProducts();
    const found = all.find(p => p.id === id);
    if (found) {
      const [ratingSummary, productReviews, hired, reviewed] = await Promise.all([
        productReviewsRepo.getProductRatingSummary(found.id),
        productReviewsRepo.getProductReviews(found.id),
        isAuthenticated ? productReviewsRepo.checkUserHired(found.id) : Promise.resolve(false),
        isAuthenticated ? productReviewsRepo.checkUserReviewed(found.id) : Promise.resolve(false)
      ]);

      setProduct({
        ...found,
        averageRating: ratingSummary.average,
        reviewCount: ratingSummary.count
      });
      setReviews(productReviews);
      setHasHired(hired);
      setHasReviewed(reviewed);
      analytics.track('product_view', { productId: found.id, name: found.name });
    }
    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    setIsSubmittingReview(true);
    try {
      await productReviewsRepo.submitReview(product.id, rating, comment);
      setIsReviewing(false);
      setComment('');
      await loadProduct();
      alert('Avaliação enviada com sucesso!');
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (product?.videoUrl && !isPlaying) {
      const interval = setInterval(() => {
        setActiveMedia(prev => prev === 'image' ? 'video' : 'image');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [product?.videoUrl, isPlaying]);

  const handleShare = async () => {
    if (!product) return;
    setIsSharing(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (isAuthenticated) {
        try {
          const res = await coinRepo.rewardSolutionShare(product.id);
          await refreshBalance();
          if (res && res.awarded) {
            showToast('Everest Coins!', res.amount, 'coins');
            if (res.xp_awarded) {
              setTimeout(() => showToast('XP Ganho!', res.xp_awarded, 'xp'), 1000);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
      alert('Link copiado para o clipboard!');
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    } finally {
      setTimeout(() => setIsSharing(false), 2000);
    }
  };

  if (loading) return null;
  if (!product) return <div className="p-20 text-center font-black uppercase text-2xl">[ Produto Não Encontrado ]</div>;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Black Header Section - Unified with Branding */}
      {/* Black Header Section - Unified with Branding */}
      <div className="bg-black pt-4 pb-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-white/5 shadow-2xl">
        {/* Subtle Background Art */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4 text-cyan-500/60 text-[10px] font-black uppercase tracking-[0.4em]">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                Curadoria ENT / {product.category}
                {product.averageRating !== undefined && product.averageRating > 0 && (
                  <>
                    <span className="text-white/20">|</span>
                    <span className="text-amber-400 text-[11px]">★ {product.averageRating}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                {product.name}
              </h1>
            </div>

            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => navigate(-1)}
              className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-cyan-400 transition-all flex items-center gap-2 group bg-white/5 px-4 py-2 rounded-full border border-white/5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
              </svg>
              Voltar ao Marketplace
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 space-y-12"
          >
            <div className="bg-slate-50 border border-slate-100 p-2 rounded-[48px] shadow-sm">
              <div className="aspect-video overflow-hidden rounded-[44px] border border-white shadow-inner bg-white relative">
                {product.videoUrl && activeMedia === 'video' ? (
                  <div className="w-full h-full bg-black relative">
                    {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${product.videoUrl.split('v=')[1]?.split('&')[0] || product.videoUrl.split('/').pop()}?autoplay=${isPlaying ? 1 : 0}&mute=0&controls=1&loop=1&playlist=${product.videoUrl.split('v=')[1]?.split('&')[0] || product.videoUrl.split('/').pop()}`}
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        onLoad={() => isPlaying && setIsPlaying(true)}
                      ></iframe>
                    ) : (
                      <video
                        src={product.videoUrl}
                        autoPlay={isPlaying}
                        controls
                        className="w-full h-full object-cover"
                        onPlay={() => setIsPlaying(true)}
                      />
                    )}

                    {!isPlaying && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer group/play z-30"
                        onClick={() => setIsPlaying(true)}
                      >
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover/play:scale-110 transition-transform shadow-2xl">
                          <svg className="w-12 h-12 text-white fill-current translate-x-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : product.heroImageUrl ? (
                  <img src={product.heroImageUrl} alt={product.name} className="w-full h-full object-cover transition-all duration-1000" />
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-slate-50 text-[120px]">📦</div>
                )}

                {/* Media Indicator Tabs */}
                {product.videoUrl && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    <div className={`h-1 w-8 rounded-full transition-all duration-500 ${activeMedia === 'image' ? 'bg-cyan-500 w-12' : 'bg-white/30'}`}></div>
                    <div className={`h-1 w-8 rounded-full transition-all duration-500 ${activeMedia === 'video' ? 'bg-cyan-500 w-12' : 'bg-white/30'}`}></div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-10 md:px-16 space-y-8">
              <p className="text-2xl md:text-3xl font-medium text-slate-600 leading-tight tracking-tight">
                {product.shortDescription}
              </p>
              <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"></div>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">
                Esta solução foi submetida a um rigoroso processo de validação técnica e estratégica pelo ecossistema ENT, garantindo interoperabilidade e alta performance para varejistas de alto volume.
              </p>

              {/* Reviews Section */}
              <div className="pt-20 space-y-12">
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Avaliações da Comunidade</h3>
                  {hasHired && !isReviewing && !hasReviewed && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setIsReviewing(true)}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-6 py-3 rounded-full border border-blue-100"
                    >
                      Avaliar Solução
                    </motion.button>
                  )}
                  {hasReviewed && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 italic">
                      Você já avaliou esta solução
                    </span>
                  )}
                </div>

                {isReviewing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-10 bg-slate-50 rounded-[40px] border border-blue-100 space-y-8"
                  >
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nota Final (0 a 10)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => setRating(n)}
                            className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${rating === n ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu feedback estratégico</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Descreva sua experiência com a solução..."
                        className="w-full bg-white border border-slate-200 rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                        className="bg-blue-600 text-white font-black px-10 py-5 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                      >
                        {isSubmittingReview ? 'Enviando...' : 'Publicar Avaliação'}
                      </button>
                      <button
                        onClick={() => setIsReviewing(false)}
                        className="text-slate-400 font-black px-6 py-5 text-[11px] uppercase tracking-widest hover:text-slate-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-8">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm space-y-4 group hover:border-blue-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl overflow-hidden border border-slate-100">
                              {review.profile?.avatar_url ? (
                                <img src={review.profile.avatar_url} className="w-full h-full object-cover" />
                              ) : (
                                "👤"
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{review.profile?.name || 'Membro ENT'}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sócio Estratégico</p>
                            </div>
                          </div>
                          <div className="px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center gap-2">
                            <span className="text-amber-500 text-sm">★</span>
                            <span className="text-amber-600 font-black text-lg">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                          "{review.comment || 'Solução excepcional aplicada ao ecossistema varejista.'}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[48px]">
                      <p className="text-slate-300 font-black uppercase tracking-[0.4em] italic text-xs">Aguardando primeiras avaliações técnicas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 pt-4"
          >
            <div className="sticky top-20 bg-white/60 backdrop-blur-3xl border border-white p-6 md:p-8 rounded-[48px] shadow-2xl shadow-blue-500/10 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60">Investimento Estimado</span>
                <div className="flex flex-col">
                  {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
                    <span className="text-sm font-bold text-red-500 line-through mb-1">
                      De: {formatBRLFromCents(product.originalPriceCents)}
                    </span>
                  )}
                  <span className={`text-4xl md:text-6xl font-black tracking-tighter ${product.originalPriceCents ? 'text-green-600' : 'text-slate-900'}`}>
                    {product.originalPriceCents ? 'Por: ' : ''}{formatBRLFromCents(product.priceCents)}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 bg-slate-50 w-fit px-4 py-1.5 rounded-full border border-slate-100">
                    Modalidade {product.billingPeriod === 'yearly' ? 'Anual' : 'Mensal'}
                  </span>
                </div>
              </div>

              {((product.features && product.features.length > 0) || (product.benefits && product.benefits.length > 0)) && (
                <div className="space-y-6 pt-10 border-t border-slate-100">
                  {/* Priorizar Features, se não tiver, mostrar Benefits */}
                  {product.features && product.features.length > 0 ? (
                    product.features.map(feature => (
                      <div key={feature.id} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-white/40 transition-colors">
                        <div className="w-8 h-8 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-blue-500/20">✓</div>
                        <div className="pt-1">
                          <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-tight">{feature.title}</p>
                          {feature.description && (
                            <p className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-widest">{feature.description}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    product.benefits.map(benefit => (
                      <div key={benefit.id} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-white/40 transition-colors">
                        <div className="w-8 h-8 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-blue-500/20">✓</div>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-tight pt-1.5">{benefit.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="flex flex-col gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/checkout/${product.id}`)}
                  className="bg-slate-900 hover:bg-blue-600 text-white font-black py-8 rounded-[32px] text-sm uppercase tracking-[0.4em] transition-all shadow-xl shadow-slate-900/20"
                >
                  {product.ctaPrimaryLabel || 'Contratar Agora'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className={`bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-black py-6 rounded-[28px] text-[10px] uppercase tracking-[0.4em] transition-all shadow-sm flex items-center justify-center gap-3 ${isSharing ? 'text-blue-600 border-blue-100' : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.368 3 3 0 000 5.368zm0 10.736a3 3 0 100-5.368 3 3 0 000 5.368z" />
                  </svg>
                  {isSharing ? 'Link Copiado!' : 'Compartilhar Solução'}
                </motion.button>
              </div>

              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em] text-center pt-8">
                TERMINAL ENT-PLATFORM v2.25
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}