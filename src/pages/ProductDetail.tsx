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
    <div className="min-h-screen bg-[#f5f5f5] font-sans selection:bg-blue-500/30 text-slate-900" aria-label={product.name}>

      {/* Compact Top Header */}
      <div className="bg-black py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-white/5 shadow-xl">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-blue-500/80 text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              {product.category}
              {product.averageRating !== undefined && product.averageRating > 0 && (
                <>
                  <span className="text-white/20">|</span>
                  <span className="text-amber-400">★ {product.averageRating}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-tight">
              {product.name}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Visuals & Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-sm overflow-hidden">
              <div className="aspect-video relative bg-slate-100 rounded-xl overflow-hidden group">
                {product.videoUrl && activeMedia === 'video' ? (
                  <div className="w-full h-full bg-black">
                    {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${product.videoUrl.split('v=')[1]?.split('&')[0] || product.videoUrl.split('/').pop()}?autoplay=${isPlaying ? 1 : 0}&mute=0&controls=1&loop=1&playlist=${product.videoUrl.split('v=')[1]?.split('&')[0] || product.videoUrl.split('/').pop()}`}
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video src={product.videoUrl} autoPlay={isPlaying} controls className="w-full h-full object-cover" />
                    )}
                  </div>
                ) : (
                  <img src={product.heroImageUrl || product.logoImageUrl} alt={product.name} className="w-full h-full object-cover" />
                )}

                {/* Media Toggle */}
                {product.videoUrl && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <button
                      onClick={() => setActiveMedia('image')}
                      className={`w-2 h-2 rounded-full transition-all ${activeMedia === 'image' ? 'bg-blue-500 w-6' : 'bg-white/50'}`}
                    />
                    <button
                      onClick={() => setActiveMedia('video')}
                      className={`w-2 h-2 rounded-full transition-all ${activeMedia === 'video' ? 'bg-blue-500 w-6' : 'bg-white/50'}`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sobre a Solução</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                {product.shortDescription}
              </p>
              <div className="h-1 w-16 bg-blue-600 rounded-full"></div>
              <p className="text-sm text-slate-500 font-medium">
                Submetida a validação técnica ENT para garantir performance e escalabilidade.
              </p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Avaliações</h3>
                {hasHired && !isReviewing && !hasReviewed && (
                  <button onClick={() => setIsReviewing(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full border border-blue-100">Avaliar</button>
                )}
              </div>

              {isReviewing && (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button key={n} onClick={() => setRating(n)} className={`w-8 h-8 rounded-lg text-xs font-bold ${rating === n ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>{n}</button>
                    ))}
                  </div>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Seu feedback..." className="w-full p-4 text-sm border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500" />
                  <div className="flex gap-2">
                    <button onClick={handleSubmitReview} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest">Enviar</button>
                    <button onClick={() => setIsReviewing(false)} className="text-slate-400 px-4 py-2 text-xs font-bold uppercase tracking-widest">Cancelar</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map(r => (
                  <div key={r.id} className="p-4 border border-slate-100 rounded-xl flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">{r.profile?.avatar_url ? <img src={r.profile.avatar_url} className="w-full h-full object-cover" /> : "👤"}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">{r.profile?.name || 'Membro ENT'}</span>
                        <span className="text-blue-600 font-bold text-xs italic">★ {r.rating}</span>
                      </div>
                      <p className="text-slate-500 text-xs italic leading-tight">"{r.comment || 'Performance excepcional.'}"</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Aguardando avaliações técnicas</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Sidebar */}
          <aside className="lg:col-span-5">
            <div className="sticky top-24 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Investimento</span>
                <div className="flex flex-col">
                  {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
                    <span className="text-xs font-bold text-red-500 line-through mb-1">{formatBRLFromCents(product.originalPriceCents)}</span>
                  )}
                  <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                    {formatBRLFromCents(product.priceCents)}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{product.billingPeriod === 'yearly' ? 'Anual' : 'Mensal'}</span>
                </div>
              </div>

              {/* Benefits/Features List */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                {(product.features?.length ? product.features : product.benefits?.slice(0, 4))?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] shrink-0">✓</div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item.title || item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => navigate(`/checkout/${product.id}`)}
                  className="bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg"
                >
                  {product.ctaPrimaryLabel || 'Contratar'}
                </button>
                <button
                  onClick={handleShare}
                  className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.368 3 3 0 000 5.368zm0 10.736a3 3 0 100-5.368 3 3 0 000 5.368z" /></svg>
                  {isSharing ? 'Link Copiado' : 'Compartilhar'}
                </button>
              </div>

              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center pt-4">ENT-PLATFORM v2.25</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}