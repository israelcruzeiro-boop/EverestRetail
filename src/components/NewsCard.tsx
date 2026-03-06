import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NewsCardProps {
    image: string;
    title: string;
    category: string;
    date?: string;
    href: string;
}

export default function NewsCard({ image, title, category, date, href }: NewsCardProps) {
    return (
        <Link to={href} className="group block h-full">
            <motion.div
                whileHover={{ y: -4 }}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-full hover:border-[#0B1220] transition-all"
            >
                {/* Image Section - Editorial Proportion */}
                <div className="w-full aspect-[4/2.5] overflow-hidden bg-slate-100 flex-shrink-0 relative">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                        <span className="bg-[#0B1220] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em] shadow-lg">
                            {category}
                        </span>
                    </div>
                </div>

                {/* Content Section - News Style */}
                <div className="p-4 flex flex-col flex-1">
                    {date && (
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                            {date}
                        </span>
                    )}
                    <h3 className="text-[14px] md:text-[15px] font-black text-[#0B1220] leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {title}
                    </h3>

                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-600 group-hover:underline">
                            Ler Notícia →
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
