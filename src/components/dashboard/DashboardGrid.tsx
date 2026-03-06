import React from 'react';

interface DashboardGridProps {
    children: React.ReactNode;
    className?: string;
    cols?: number;
}

export default function DashboardGrid({
    children,
    className = '',
    cols = 4
}: DashboardGridProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }[cols as 1 | 2 | 3 | 4] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    return (
        <div className={`grid ${gridCols} gap-4 ${className}`}>
            {children}
        </div>
    );
}
