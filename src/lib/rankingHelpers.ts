export interface RankingLevel {
    name: string;
    minScore: number;
    color: string;
    iconUrl?: string;
}

export const RANKING_LEVELS: RankingLevel[] = [
    { name: 'Base Camp', minScore: 0, color: 'text-slate-400', iconUrl: '/medals/Everest - Base camp.png' },
    { name: 'Explorador', minScore: 500, color: 'text-blue-400', iconUrl: '/medals/Everest - Explorador.png' },
    { name: 'Escalador', minScore: 1500, color: 'text-emerald-400', iconUrl: '/medals/Everest - Escalador.png' },
    { name: 'Navegador', minScore: 3000, color: 'text-cyan-400', iconUrl: '/medals/Everest - Navegador.png' },
    { name: 'Estrategista', minScore: 6000, color: 'text-indigo-400', iconUrl: '/medals/Everest - Estrategista.png' },
    { name: 'Alpinista', minScore: 10000, color: 'text-orange-400', iconUrl: '/medals/Everest - Alpinista.png' },
    { name: 'Líder de Expedição', minScore: 16000, color: 'text-rose-400', iconUrl: '/medals/Everest - Lider de expedição.png' },
    { name: 'Comandante', minScore: 25000, color: 'text-purple-400', iconUrl: '/medals/Everest - Comandante.png' },
    { name: 'Elite Everest', minScore: 40000, color: 'text-amber-400', iconUrl: '/medals/Everest - Elite.png' },
    { name: 'Lenda do Cume', minScore: 60000, color: 'text-yellow-400', iconUrl: '/medals/Everest - Lenda do cume.png' },
];

export function getLevelByScore(earnedTotal: number): RankingLevel {
    return [...RANKING_LEVELS].reverse().find(level => earnedTotal >= level.minScore) || RANKING_LEVELS[0];
}

export function getLevelByNumber(level: number): RankingLevel {
    const index = Math.max(1, Math.min(level, RANKING_LEVELS.length)) - 1;
    return RANKING_LEVELS[index];
}

export function getNextLevel(earnedTotal: number): { level: RankingLevel | null, progress: number } {
    const currentLevel = getLevelByScore(earnedTotal);
    const currentIndex = RANKING_LEVELS.findIndex(l => l.name === currentLevel.name);
    const nextLevel = RANKING_LEVELS[currentIndex + 1] || null;

    if (!nextLevel) return { level: null, progress: 100 };

    const range = nextLevel.minScore - currentLevel.minScore;
    const currentProgress = earnedTotal - currentLevel.minScore;
    const progress = Math.min(Math.max((currentProgress / range) * 100, 0), 100);

    return { level: nextLevel, progress };
}
