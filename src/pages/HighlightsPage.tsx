import React, { useState, useEffect } from 'react';
import { homeContentRepo } from '@/lib/repositories/homeContentRepo';
import { WeeklyHighlight } from '@/types/content';
import MarketplaceCard from '@/components/MarketplaceCard';
import MarketplaceGrid from '@/components/MarketplaceGrid';

export default function HighlightsPage() {
    const [highlights, setHighlights] = useState<WeeklyHighlight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const config = await homeContentRepo.getHomeConfig();
                const activeOnes = config.highlights
                    .filter(h => h.status === 'active')
                    .sort((a, b) => a.order - b.order);
                setHighlights(activeOnes);
            } catch (err) {
                console.error('Error loading highlights:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f5f5] pb-20">
            {/* Small Top Header */}
            <div className="bg-black py-8 px-4 shadow-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight italic">
                        Destaques <span className="text-blue-500">da Semana</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        {Array(12).fill(0).map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-slate-200 animate-pulse rounded-lg"></div>
                        ))}
                    </div>
                ) : highlights.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-4 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black uppercase tracking-widest">[ Nenhum destaque ativo no momento ]</p>
                    </div>
                ) : (
                    <MarketplaceGrid>
                        {highlights.map((h) => (
                            <MarketplaceCard
                                key={h.id}
                                image={h.imageUrl}
                                title={h.title}
                                category={h.tag || 'Destaque'}
                                href={`/conteudo/${h.slug || h.id}`}
                            />
                        ))}
                    </MarketplaceGrid>
                )}
            </div>
        </div>
    );
}
