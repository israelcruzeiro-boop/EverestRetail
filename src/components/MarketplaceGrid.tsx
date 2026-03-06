import React from 'react';

interface MarketplaceGridProps {
    children: React.ReactNode;
    columns?: {
        mobile?: number;
        tablet?: number;
        desktop?: number;
    };
}

export default function MarketplaceGrid({
    children,
    columns = { mobile: 2, tablet: 3, desktop: 6 }
}: MarketplaceGridProps) {
    // Mapping to grid classes
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
    };

    const smGridCols = {
        1: 'sm:grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-3',
        4: 'sm:grid-cols-4',
        5: 'sm:grid-cols-5',
        6: 'sm:grid-cols-6',
    };

    const lgGridCols = {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
        5: 'lg:grid-cols-5',
        6: 'lg:grid-cols-6',
    };

    return (
        <div className={`grid ${gridCols[columns.mobile as keyof typeof gridCols] || 'grid-cols-2'} ${smGridCols[columns.tablet as keyof typeof smGridCols] || 'sm:grid-cols-3'} ${lgGridCols[columns.desktop as keyof typeof lgGridCols] || 'lg:grid-cols-6'} gap-3 md:gap-4`}>
            {children}
        </div>
    );
}
