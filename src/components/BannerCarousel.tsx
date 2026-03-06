import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
    imageUrl: string;
    altText?: string;
}

interface BannerCarouselProps {
    slides: Slide[];
}

export default function BannerCarousel({ slides }: BannerCarouselProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (slides.length === 0) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    return (
        <div className="w-full h-[180px] md:h-[260px] relative overflow-hidden bg-slate-200 flex-shrink-0 group rounded-lg md:rounded-xl shadow-sm border border-slate-200/60">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, { offset }) => {
                        const swipe = offset.x;
                        if (swipe < -50) setCurrent((prev) => (prev + 1) % slides.length);
                        else if (swipe > 50) setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
                    }}
                >
                    <img
                        src={slides[current].imageUrl}
                        alt={slides[current].altText || 'Banner'}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`h-1.5 transition-all duration-300 rounded-full ${current === i ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
