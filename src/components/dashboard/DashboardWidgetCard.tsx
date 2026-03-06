import React from 'react';

interface DashboardWidgetCardProps {
    title: string;
    value?: string | number;
    icon?: string | React.ReactNode;
    badge?: string;
    badgeColor?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export default function DashboardWidgetCard({
    title,
    value,
    icon,
    badge,
    badgeColor = 'bg-blue-50 text-blue-600',
    children,
    onClick,
    className = ''
}: DashboardWidgetCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white border border-slate-100 p-3 md:p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between h-full ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[70%]">
                    {title}
                </span>
                {icon && (
                    <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex-1">
                {value !== undefined && (
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xl font-black text-slate-900 tracking-tighter tabular-nums">
                            {value}
                        </span>
                        {badge && (
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${badgeColor}`}>
                                {badge}
                            </span>
                        )}
                    </div>
                )}
                {children && <div className={`${value !== undefined ? 'mt-3' : ''}`}>{children}</div>}
            </div>
        </div>
    );
}
