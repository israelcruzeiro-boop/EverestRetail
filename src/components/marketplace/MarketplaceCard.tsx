import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MarketplaceCardProps {
    image: string;
    title: string;
    category: string;
    badge?: string;
    href: string;
}

export default function MarketplaceCard({ image, title, category, badge, href }: MarketplaceCardProps) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');

    const content = (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-full cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
            aria-label={title}
        >
            <div className="w-full aspect-[4/3] bg-slate-50 relative overflow-hidden flex-shrink-0">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                {badge && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        {badge}
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-1 flex-1 min-h-[80px]">
                <h3 className="text-[13px] md:text-[14px] font-bold text-slate-800 leading-[1.2] line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>
                <span className="text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-widest mt-auto">
                    {category}
                </span>
            </div>
        </motion.div>
    );

    if (isExternal) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
                {content}
            </a>
        );
    }

    return (
        <Link to={href} className="block h-full">
            {content}
        </Link>
    );
}
