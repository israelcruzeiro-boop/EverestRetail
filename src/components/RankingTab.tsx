import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rankingRepo, RankingEntry, RankingCriteria } from '@/lib/repositories/rankingRepo';
import { useAuth } from '@/context/AuthContext';
import { getLevelByScore, getLevelByNumber } from '@/lib/rankingHelpers';


export default function RankingTab() {
    const [criteria, setCriteria] = useState<RankingCriteria>('balance');
    const [ranking, setRanking] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedal, setSelectedMedal] = useState<string | null>(null);
    const [selectedLevelName, setSelectedLevelName] = useState<string>('');
    const { user } = useAuth();

    const filters: { id: RankingCriteria, label: string, icon: string }[] = [
        { id: 'balance', label: 'Patrimônio', icon: '💰' },
        { id: 'earnings', label: 'Atividade', icon: '📈' },
        { id: 'spending', label: 'Relevância', icon: '💎' },
    ];

    useEffect(() => {
        loadRanking();
    }, [criteria]);

    const loadRanking = async () => {
        setLoading(true);
        const data = await rankingRepo.getRanking(criteria);
        setRanking(data);
        setLoading(false);
    };

    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3);

    const podiumColors = [
        { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-600', glow: 'bg-cyan-400', badge: 'bg-gradient-to-br from-cyan-400 to-blue-600', size: 'w-28 h-28 md:w-32 md:h-32' },
        { border: 'border-slate-300', bg: 'bg-slate-400', text: 'text-slate-500', glow: 'bg-slate-300', badge: 'bg-slate-400', size: 'w-22 h-22 md:w-24 md:h-24' },
        { border: 'border-amber-400', bg: 'bg-amber-400', text: 'text-amber-500', glow: 'bg-amber-300', badge: 'bg-amber-400', size: 'w-22 h-22 md:w-24 md:h-24' },
    ];

    return (
        <div className="space-y-6 text-slate-900">
            {/* Header + Filters - Clean */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                        Ranking Elite Everest
                    </h2>
                    <p className="text-slate-500 font-medium max-w-md text-sm">Os mais engajados da comunidade.</p>
                </div>

                <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setCriteria(f.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded text-[12px] font-bold transition-all ${criteria === f.id
                                ? 'bg-white text-[#ee4d2d] shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <span className="text-sm">{f.icon}</span>
                            <span className="hidden sm:inline">{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-56 bg-white animate-pulse rounded-3xl border border-slate-100" />
                    ))}
                </div>
            ) : ranking.length > 0 ? (
                <div className="space-y-12">
                    {/* Top 3 Podium */}
                    <div className="grid grid-cols-3 gap-4 md:gap-8 md:items-end pb-8">
                        {/* Order: 2nd, 1st, 3rd */}
                        {[1, 0, 2].map((podiumIdx, displayIdx) => {
                            const entry = top3[podiumIdx];
                            if (!entry) return <div key={podiumIdx} />;
                            const colors = podiumColors[podiumIdx];
                            const isFirst = podiumIdx === 0;

                            return (
                                <motion.div
                                    key={entry.profile_id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: displayIdx * 0.1 }}
                                    className={`flex flex-col items-center group ${isFirst ? 'order-2' : displayIdx === 0 ? 'order-1' : 'order-3'}`}
                                >
                                    <div className="relative mb-4 md:mb-6">
                                        <div className={`relative ${colors.size} rounded-full border-[3px] ${isFirst ? 'border-amber-400' : 'border-slate-300'} p-0.5 bg-white shadow-md overflow-hidden transition-transform group-hover:scale-105`}>
                                            {entry.avatar_url ? (
                                                <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center font-bold uppercase bg-slate-100 rounded-full ${isFirst ? 'text-4xl text-amber-500' : 'text-3xl text-slate-400'}`}>
                                                    {entry.name[0]}
                                                </div>
                                            )}
                                        </div>

                                        {/* Rank Badge */}
                                        <div className={`absolute -bottom-2 -right-1 w-8 h-8 md:w-10 md:h-10 ${isFirst ? 'bg-[#ee4d2d]' : 'bg-slate-600'} rounded-[8px] flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white`}>
                                            {isFirst ? '1º' : `${podiumIdx + 1}º`}
                                        </div>
                                    </div>

                                    <h5 className={`font-black text-slate-900 text-center truncate w-full px-2 uppercase tracking-tight ${isFirst ? 'text-lg md:text-2xl' : 'text-sm md:text-base'}`}>
                                        {entry.name}
                                    </h5>
                                    <div className="flex flex-col items-center">
                                        {getLevelByNumber(entry.current_level).iconUrl ? (
                                            <div
                                                className="relative group/medal cursor-zoom-in"
                                                onClick={() => {
                                                    setSelectedMedal(getLevelByNumber(entry.current_level).iconUrl || null);
                                                    setSelectedLevelName(getLevelByNumber(entry.current_level).name);
                                                }}
                                            >
                                                <img
                                                    src={getLevelByNumber(entry.current_level).iconUrl}
                                                    className="w-14 h-14 md:w-16 md:h-16 object-contain mb-1 transition-transform group-hover/medal:scale-110"
                                                    alt={getLevelByNumber(entry.current_level).name}
                                                />
                                                <div className="absolute top-0 right-0 bg-cyan-500 text-white p-0.5 rounded-full opacity-0 group-hover/medal:opacity-100 transition-opacity">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${getLevelByNumber(entry.current_level).color}`}>
                                                {getLevelByNumber(entry.current_level).name}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`mt-2 px-4 py-1.5 rounded-lg border ${isFirst ? 'bg-cyan-50 border-cyan-100' : podiumIdx === 2 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${colors.text}`}>
                                            {entry.score.toLocaleString()} EC
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Rest of Ranking - Clean Table */}
                    {rest.length > 0 && (
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="px-6 md:px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] w-20">#</th>
                                        <th className="px-6 md:px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Usuário</th>
                                        <th className="px-6 md:px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-right">Patrimônio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {rest.map((entry) => {
                                        const isMe = entry.profile_id === user?.id;
                                        return (
                                            <tr
                                                key={entry.profile_id}
                                                className={`group transition-all ${isMe ? 'bg-cyan-50/50' : 'hover:bg-slate-50'}`}
                                            >
                                                <td className="px-6 md:px-8 py-4">
                                                    <span className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-black ${isMe
                                                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                                                        : 'text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100'
                                                        }`}>
                                                        {entry.rank_position}º
                                                    </span>
                                                </td>
                                                <td className="px-6 md:px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 group-hover:border-cyan-200 transition-colors">
                                                            {entry.avatar_url ? (
                                                                <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover rounded-lg" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300 bg-white uppercase">
                                                                    {entry.name[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-black text-slate-900 block group-hover:text-cyan-600 transition-colors uppercase tracking-tight">
                                                                {entry.name} {isMe && <span className="text-cyan-500">(Você)</span>}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {getLevelByNumber(entry.current_level).iconUrl ? (
                                                                    <div
                                                                        className="cursor-zoom-in group/submedal relative"
                                                                        onClick={() => {
                                                                            setSelectedMedal(getLevelByNumber(entry.current_level).iconUrl || null);
                                                                            setSelectedLevelName(getLevelByNumber(entry.current_level).name);
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={getLevelByNumber(entry.current_level).iconUrl}
                                                                            className="w-10 h-10 object-contain transition-transform group-hover/submedal:scale-110"
                                                                            alt={getLevelByNumber(entry.current_level).name}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${getLevelByNumber(entry.current_level).color}`}>
                                                                        {getLevelByNumber(entry.current_level).name}
                                                                    </span>
                                                                )}
                                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                                                    Verificado
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-8 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 text-slate-900 font-black tabular-nums">
                                                        <span className="text-base">🪙</span>
                                                        <span className="text-lg tracking-tighter">{entry.score.toLocaleString()}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {!loading && ranking.length > 0 && !ranking.some(r => r.profile_id === user?.id) && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={3} className="px-8 py-6 text-center text-slate-500 text-sm font-medium">
                                                Inicie missões para entrar no ranking.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] italic text-xs">Dados indisponíveis para este protocolo</p>
                </div>
            )}
            {/* Medal Zoom Modal */}
            <AnimatePresence>
                {selectedMedal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-xl cursor-zoom-out"
                        onClick={() => setSelectedMedal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                            className="relative max-w-4xl w-full aspect-square flex items-center justify-center p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedMedal}
                                className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(34,211,238,0.4)]"
                                alt="Medal Preview"
                            />

                            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center w-full">
                                <h3 className="text-white text-4xl font-black uppercase tracking-tighter shadow-black drop-shadow-lg">
                                    {selectedLevelName}
                                </h3>
                                <p className="text-cyan-400 font-mono text-xs uppercase tracking-[0.4em] mt-3">Patente de Elite Everest</p>
                            </div>

                            <button
                                className="absolute -top-12 -right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
                                onClick={() => setSelectedMedal(null)}
                            >
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
