import React, { useState, useEffect } from 'react';
import { homeContentRepo } from '@/lib/repositories/homeContentRepo';
import { supabase } from '@/lib/supabase';
import { AdminProduct } from '@/types/admin';
import { SuggestedProductBlock } from '@/types/content';
import MarketplaceCard from '@/components/MarketplaceCard';
import MarketplaceGrid from '@/components/MarketplaceGrid';

export default function ModulesPage() {
    const [modules, setModules] = useState<Array<{ config: SuggestedProductBlock; product: AdminProduct }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [config, { data: allProducts }] = await Promise.all([
                    homeContentRepo.getHomeConfig(),
                    supabase.from('products').select('*')
                ]);

                const activeSuggested = config.suggested
                    .filter(s => s.status === 'active')
                    .sort((a, b) => a.order - b.order);

                const productsMap = (allProducts || []).reduce((acc: any, p: any) => {
                    acc[p.id] = {
                        ...p,
                        logoImageUrl: p.logo_image_url || p.hero_image_url
                    };
                    return acc;
                }, {});

                const combined = activeSuggested
                    .map(s => ({
                        config: s,
                        product: productsMap[s.productId]
                    }))
                    .filter(item => item.product);

                setModules(combined);
            } catch (err) {
                console.error('Error loading modules:', err);
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
                        Módulos <span className="text-blue-500">Indicados</span>
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
                ) : modules.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-4 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black uppercase tracking-widest">[ Nenhum módulo indicado no momento ]</p>
                    </div>
                ) : (
                    <MarketplaceGrid>
                        {modules.map((m) => (
                            <MarketplaceCard
                                key={m.config.id}
                                image={m.product.logoImageUrl || ''}
                                title={m.config.customTitle || m.product.name}
                                category={m.product.category || 'Módulo'}
                                href={`/product/${m.product.id}`}
                            />
                        ))}
                    </MarketplaceGrid>
                )}
            </div>
        </div>
    );
}
