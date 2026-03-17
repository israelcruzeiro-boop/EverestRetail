import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        {
            label: 'Home',
            path: '/',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            label: 'Market',
            path: '/marketplace',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
        },
        {
            label: 'Blog',
            path: '/blog',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM3 8h16M8 12h8m-8 4h5" />
                </svg>
            ),
        },
        {
            label: 'EverCast',
            path: '/videocasts',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            label: 'Perfil',
            path: '/painel',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f18]/80 backdrop-blur-xl border-t border-white/5 py-2 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="max-w-lg mx-auto flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center gap-1 min-w-[64px] transition-all relative"
                        >
                            <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'text-blue-500' : 'text-slate-500'
                                }`}>
                                {item.icon}
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-active"
                                        className="absolute inset-0 bg-blue-500/10 rounded-xl -z-10"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-blue-500' : 'text-slate-500'
                                }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
