import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Slide {
    imageUrl: string;
    altText?: string;
    linkUrl?: string;
}

interface BannerCarouselProps {
    slides: Slide[];
    bannerLink?: string; // Link global opcional solicitado pelo usuário
}

export default function BannerCarousel({ slides, bannerLink }: BannerCarouselProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (slides.length === 0) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    const currentSlide = slides[current];
    const finalLink = bannerLink || currentSlide.linkUrl;
    const isExternal = finalLink?.startsWith('http');

    const BannerContent = (
        <>
            <img
                src={currentSlide.imageUrl}
                alt={currentSlide.altText || 'Banner'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                draggable={false}
            />
            {/* Overlay sutil para o efeito de escurecimento no hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-10" />
        </>
    );

    return (
        <div className="w-full h-[180px] md:h-[260px] relative overflow-hidden bg-slate-200 flex-shrink-0 group rounded-lg md:rounded-xl shadow-sm border border-slate-200/60">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-0"
                >
                    {finalLink ? (
                        isExternal ? (
                            <a 
                                href={finalLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block w-full h-full cursor-pointer overflow-hidden"
                            >
                                {BannerContent}
                            </a>
                        ) : (
                            <Link 
                                to={finalLink} 
                                className="block w-full h-full cursor-pointer overflow-hidden"
                            >
                                {BannerContent}
                            </Link>
                        )
                    ) : (
                        <div className="w-full h-full overflow-hidden">
                            {BannerContent}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Arrastar (Drag) removido para não conflitar com o clique do link, 
                ou mantido se for apenas visual. Mas Link/A já lidam com gestos. 
                Vou manter a lógica de troca manual nos indicadores abaixo. */}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrent(i);
                        }}
                        className={`h-1.5 transition-all duration-300 rounded-full ${current === i ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
