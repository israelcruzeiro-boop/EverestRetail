import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config/appConfig';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Produtos', icon: '📦' },
  { path: '/admin/store', label: 'Loja EC', icon: '🪙' },
  { path: '/admin/content', label: 'Conteúdo', icon: '✨' },
  { path: '/admin/partners', label: 'Parceiros', icon: '🤝' },
  { path: '/admin/blog', label: 'Blog', icon: '📝' },
  { path: '/admin/sponsored-videos', label: 'Vídeos', icon: '🎞️' },
  { path: '/admin/users', label: 'Usuários', icon: '👥' },
  { path: '/admin/settings', label: 'Ajustes', icon: '⚙️' },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };
  return (
    <aside className="w-72 bg-white border-r-2 border-[#0B1220] flex flex-col h-full">
      <div className="p-8 flex items-center justify-between border-b-2 border-[#0B1220]">
        <NavLink to="/" className="flex items-center h-8 shrink-0 group">
          <img
            src={APP_CONFIG.logoPath}
            alt={APP_CONFIG.name}
            className="h-full w-auto object-contain grayscale group-hover:grayscale-0 transition-all"
          />
        </NavLink>
        <button onClick={onClose} className="md:hidden p-2 text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-colors border-2 border-[#0B1220]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 flex flex-col py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-4 px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-2 border-[#0B1220]/5 last:border-b-0
              ${isActive
                ? 'bg-[#1D4ED8] text-white'
                : 'text-[#0B1220] hover:bg-[#1D4ED8]/10'}
            `}
          >
            <span className="text-xl grayscale">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 bg-[#0B1220] text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-12 h-12 bg-[#1D4ED8] flex items-center justify-center text-white font-black text-lg border-2 border-white shrink-0">
              {user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-tighter truncate">{user?.name}</p>
              <p className="text-[9px] text-[#1D4ED8] uppercase tracking-widest font-black">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 bg-[#FF4D00] text-white hover:bg-white hover:text-[#FF4D00] transition-all border-2 border-[#FF4D00] shrink-0"
            title="Sair"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}