import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { coinRepo } from '@/lib/repositories/coinRepo';
import { sponsoredVideosRepo } from '@/lib/repositories/sponsoredVideosRepo';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  id: string; // ID da missão/videocast ou do sponsored_video
  type?: 'mission' | 'sponsored';
  sponsorUrl?: string;
  onComplete?: (res?: any) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function VideoModal({ isOpen, onClose, videoUrl, title, id, type = 'mission', sponsorUrl, onComplete }: VideoModalProps) {
  const { isAuthenticated, refreshBalance, updateBalance } = useAuth();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [missionResult, setMissionResult] = useState<any>(null);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const MIN_WATCH_SECONDS = 30;

  // Helper para extrair ID do YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  useEffect(() => {
    if (!isOpen || !videoId) return;

    // Resetar os estados sempre que o modal for aberto para garantir o funcionamento do próximo vídeo
    setMissionCompleted(false);
    setMissionResult(null);
    setWatchedSeconds(0);
    isProcessingRef.current = false;

    // Carregar API do YouTube se necessário
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player(`youtube-player-${id}`, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          controls: 1,
        },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event: any) => {
            // Monitorar progresso quando estiver dando play
            if (event.data === window.YT.PlayerState.PLAYING) {
              startTracking();
            } else {
              stopTracking();
            }

            // Recompensar ao terminar também
            if (event.data === window.YT.PlayerState.ENDED) {
              handleComplete();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [isOpen, videoId]);

  const startTracking = () => {
    if (progressInterval.current || missionCompleted || !isAuthenticated) return;

    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        setWatchedSeconds(currentTime);

        // Trigger reward after 30 seconds watched
        if (currentTime >= MIN_WATCH_SECONDS) {
          handleComplete();
        }
      }
    }, 1000);
  };

  const stopTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const isProcessingRef = useRef(false);

  const handleComplete = async () => {
    if (missionCompleted || isProcessingRef.current || !isAuthenticated) return;

    try {
      isProcessingRef.current = true;
      let result = null;
      const currentTime = playerRef.current?.getCurrentTime() || 0;

      if (type === 'sponsored') {
        const res = await sponsoredVideosRepo.completeVideo(id, Math.floor(currentTime));
        if (res && res.awarded) {
          result = res;
        }
      } else {
        result = await coinRepo.rewardVideocast(id);
      }

      if (result && (result.success || result.awarded || typeof result.balance === 'number' || result > 0)) {
        // Ao invés de um updateBalance silencioso, garantimos um refreshBalance aqui 
        // para que o AuthContext dispare as notificações de MOEDAS e XP na tela.
        await refreshBalance();

        setMissionResult(result);
        setMissionCompleted(true);
        if (onComplete) onComplete(result);
      } else {
        // Se bater no limite diário ou o banco recusar na hora de finalizar
        isProcessingRef.current = false;
      }
    } catch (err) {
      console.error('Erro ao completar vídeo:', err);
      isProcessingRef.current = false; // Permitir tentar de novo se falhar
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1220]/90 backdrop-blur-md z-[100] cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 md:p-8 z-[110] pointer-events-none"
          >
            <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all z-10"
              >
                ✕
              </button>

              <div
                id={`youtube-player-${id}`}
                className="w-full h-full"
              />

              {/* Progress Overlay */}
              {!missionCompleted && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                      {watchedSeconds < MIN_WATCH_SECONDS ? `Assista ${MIN_WATCH_SECONDS - watchedSeconds}s para ganhar...` : 'Recompensa Liberada!'}
                    </span>
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                      {watchedSeconds}s / {MIN_WATCH_SECONDS}s
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${watchedSeconds >= MIN_WATCH_SECONDS ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((watchedSeconds / MIN_WATCH_SECONDS) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {missionCompleted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-blue-600/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-7xl mb-6"
                  >
                    🪙
                  </motion.div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Parabéns!</h3>
                  <p className="text-blue-100 font-medium mb-6">Sua recompensa já foi creditada em sua conta.</p>

                  {missionResult && missionResult.amount !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-4 bg-white/10 px-6 py-3 rounded-2xl border border-white/20 mb-8"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🪙</span>
                        <span className="text-xl font-black text-white">+{missionResult.amount} <span className="text-sm text-blue-200">EC</span></span>
                      </div>
                      <div className="w-1 h-6 bg-white/20 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        <span className="text-xl font-black text-white">+{missionResult.xp_awarded || missionResult.xp_amount || 0} <span className="text-sm text-blue-200">XP</span></span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    {sponsorUrl && (
                      <a
                        href={sponsorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-[#FF4D00] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all text-center"
                      >
                        Visitar Site do Patrocinador ↗
                      </a>
                    )}
                    <button
                      onClick={onClose}
                      className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                    >
                      Fechar e Continuar
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}