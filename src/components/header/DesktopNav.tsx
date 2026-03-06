import { Link } from 'react-router-dom';

interface DesktopNavProps {
    isAuthenticated: boolean;
    isAdmin: boolean;
    navLinks: Array<{ path: string; label: string }>;
}

export default function DesktopNav({ isAuthenticated, isAdmin, navLinks }: DesktopNavProps) {
    return (
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-lg shadow-2xl">
            {navLinks.map(link => (
                <Link
                    key={link.path}
                    to={link.path}
                    className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-sky-200 hover:bg-white/10 hover:text-orange-400 transition-all font-sans"
                >
                    {link.label}
                </Link>
            ))}
            {isAuthenticated && (
                <>
                    <Link
                        to="/painel"
                        className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-sky-200 hover:bg-white/10 hover:text-orange-400 transition-all font-sans"
                    >
                        Painel
                    </Link>
                    <Link
                        to="/request-publication"
                        className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-sky-200 hover:bg-white/10 hover:text-orange-400 transition-all font-sans"
                    >
                        Publicar
                    </Link>
                </>
            )}
            {isAdmin && (
                <Link
                    to="/admin"
                    className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all font-black font-sans"
                >
                    Admin
                </Link>
            )}
        </nav>
    );
}
