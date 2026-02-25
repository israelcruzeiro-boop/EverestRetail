import { NavLink } from 'react-router-dom';
import { HubIcon } from '../Icons';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Produtos', icon: '📦' },
  { path: '/admin/content', label: 'Conteúdo', icon: '✨' },
  { path: '/admin/partners', label: 'Parceiros', icon: '🤝' },
  { path: '/admin/users', label: 'Usuários', icon: '👥' },
  { path: '/admin/settings', label: 'Ajustes', icon: '⚙️' },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0052cc] rounded-lg flex items-center justify-center text-white">
            <HubIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-wider">One Stop Shop</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Admin ENT</p>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
              ${isActive 
                ? 'bg-[#0052cc]/10 text-[#0052cc]' 
                : 'text-slate-600 hover:bg-slate-50'}
            `}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400 font-bold">
            RM
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">Ricardo Mendes</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tight font-bold">Managing Director</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
