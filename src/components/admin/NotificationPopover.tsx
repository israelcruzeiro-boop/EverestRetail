import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseService } from '../../lib/supabaseService';
import { AdminNotification } from '../../types/notifications';

export default function NotificationPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await supabaseService.getNotifications();
            setNotifications(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Escuta atualizações de storage para manter sincronizado
        const handleUpdate = () => fetchNotifications();
        window.addEventListener('ENT_STORAGE_UPDATED', handleUpdate);
        return () => window.removeEventListener('ENT_STORAGE_UPDATED', handleUpdate);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await supabaseService.markAsRead(id);
        fetchNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await supabaseService.markAllAsRead();
        fetchNotifications();
    };

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'agora mesmo';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `há ${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `há ${diffInDays} dias`;
        return date.toLocaleDateString('pt-BR');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 bg-white border-2 border-[#0B1220] hover:bg-[#FF4D00] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(11,18,32,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
                <span className="text-xl text-inherit">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#FF4D00] border-2 border-white text-white text-[10px] font-black flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-80 sm:w-96 bg-white border-4 border-[#0B1220] shadow-[8px_8px_0px_0px_rgba(11,18,32,1)] z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b-2 border-[#0B1220] flex items-center justify-between bg-[#F8FAFC]">
                                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#0B1220]">Notificações</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-[9px] font-black uppercase tracking-tighter text-[#1D4ED8] hover:underline"
                                    >
                                        Marcar tudo como lido
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {loading && notifications.length === 0 ? (
                                    <div className="p-8 text-center text-[10px] font-black uppercase text-slate-400">Carregando...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <span className="text-4xl block mb-4 opacity-20">📭</span>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nenhuma notificação</p>
                                    </div>
                                ) : (
                                    <div className="divide-y-2 divide-[#0B1220]/5">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                                className={`p-4 transition-colors cursor-pointer group ${!notification.read ? 'bg-[#1D4ED8]/5 hover:bg-[#1D4ED8]/10' : 'bg-white hover:bg-slate-50'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <span className="text-xl shrink-0">{getIcon(notification.type)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-[11px] font-black uppercase tracking-tight leading-tight mb-1 ${!notification.read ? 'text-[#0B1220]' : 'text-slate-500'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed mb-2">
                                                            {notification.description}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <span className="text-[9px] font-black uppercase text-slate-400">
                                                                {formatRelativeTime(new Date(notification.createdAt))}
                                                            </span>
                                                            {!notification.read && (
                                                                <span className="w-2 h-2 bg-[#FF4D00] rounded-full"></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t-2 border-[#0B1220] bg-slate-50 text-center">
                                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1220] hover:text-[#FF4D00] transition-colors">
                                    Ver histórico completo
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
