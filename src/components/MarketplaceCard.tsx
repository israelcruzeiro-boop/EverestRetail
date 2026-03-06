import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MarketplaceCardProps {
    image: string;
    title: string;
    category: string;
    badge?: string;
    href: string;
    onImageClick?: (e: React.MouseEvent) => void;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ image, title, category, badge, href, onImageClick }) => {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');

    const content = (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-full cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
            aria-label={title}
        >
            <div
                className="w-full aspect-[4/3] bg-slate-50 relative overflow-hidden flex-shrink-0"
                onClick={(e) => {
                    if (onImageClick) {
                        e.preventDefault();
                        e.stopPropagation();
                        onImageClick(e);
                    }
                }}
            >
                <img
                    src={image}
                    alt={title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${onImageClick ? 'hover:brightness-90 transition-all' : ''}`}
                    loading="lazy"
                />
                {badge && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        {badge}
                    </div>
                )}
                {onImageClick && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-blue-600 shadow-lg scale-90 group-hover:scale-100 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                        </div>
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
};

export default MarketplaceCard;
