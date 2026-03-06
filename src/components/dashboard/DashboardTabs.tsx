import React from 'react';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    icon?: string | React.ReactNode;
}

interface DashboardTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export default function DashboardTabs({
    tabs,
    activeTab,
    onTabChange,
    className = ''
}: DashboardTabsProps) {
    return (
        <div className={`flex items-center gap-3 md:gap-8 overflow-x-auto no-scrollbar border-b border-slate-200 snap-x snap-mandatory ${className}`}>
            {tabs.map((tab, index) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 py-4 relative text-[11px] md:text-[13px] font-bold transition-all snap-start ${index === tabs.length - 1 ? 'pr-6' : ''} ${activeTab === tab.id
                        ? 'text-[#ee4d2d]'
                        : 'text-slate-500 hover:text-[#ee4d2d] grayscale-[0.5] opacity-80 hover:grayscale-0 hover:opacity-100'
                        }`}
                >
                    {tab.icon && <span className="text-sm md:text-base">{tab.icon}</span>}
                    <span className="whitespace-nowrap uppercase tracking-tight">{tab.label}</span>
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ee4d2d] rounded-t-sm"
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
