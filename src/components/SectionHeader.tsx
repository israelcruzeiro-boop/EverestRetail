import React from 'react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
    title: string;
    link?: {
        to: string;
        label: string;
    };
}

export default function SectionHeader({ title, link }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-[16px] md:text-[18px] font-bold text-slate-800 uppercase tracking-tight">
                {title}
            </h2>
            {link && (
                <Link to={link.to} className="text-blue-600 text-[12px] font-black uppercase tracking-widest hover:underline">
                    {link.label}
                </Link>
            )}
        </div>
    );
}
