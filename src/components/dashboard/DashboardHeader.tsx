import React, { useState } from 'react';
import { AdminUser } from '@/types/admin';
import { getLevelByScore } from '@/lib/rankingHelpers';

interface DashboardHeaderProps {
    user: AdminUser | null;
    balance: number;
    isUploading: boolean;
    onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSaveProfile: (name: string) => void;
    onLogout?: () => void;
}

export default function DashboardHeader({
    user,
    balance,
    isUploading,
    onAvatarUpload,
    onSaveProfile,
    onLogout
}: DashboardHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(user?.name || '');
    const level = getLevelByScore(user?.xpTotal || 0);

    const handleSave = () => {
        onSaveProfile(tempName);
        setIsEditing(false);
    };

    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Avatar Section */}
                <div className="relative shrink-0">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-slate-200 transition-all duration-500 ${isUploading ? 'border-blue-500 animate-pulse' : ''
                        }`}>
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-lg font-black uppercase">
                                {user?.name[0]}
                            </div>
                        )}

                        <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-full">
                            <input type="file" className="hidden" onChange={onAvatarUpload} accept="image/*" disabled={isUploading} />
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                        </label>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                autoFocus
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm font-bold text-slate-800 outline-none w-full max-w-[150px]"
                            />
                            <button onClick={handleSave} className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="group/edit-name flex items-center gap-1.5">
                            <h1 className="text-base font-bold text-slate-900 leading-tight truncate">
                                {user?.name}
                            </h1>
                            <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover/edit-name:opacity-100 p-1 hover:bg-slate-100 rounded transition-all text-blue-500">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-slate-500 text-[11px] font-medium truncate max-w-[120px] md:max-w-none">{user?.email}</p>
                        <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600">
                            {level.iconUrl && <img src={level.iconUrl} className="w-3 h-3 object-contain" alt="" />}
                            {level.name}
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance & Logout */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block leading-none mb-1">Moedas</span>
                    <div className="flex items-center justify-end gap-1 text-amber-500 font-bold">
                        <span className="text-sm">🪙</span>
                        <span className="text-base tabular-nums leading-none text-slate-800">{balance}</span>
                    </div>
                </div>

                {onLogout && (
                    <div className="pl-3 border-l border-slate-200 ml-1">
                        <button
                            onClick={onLogout}
                            className="text-slate-400 hover:text-red-500 transition-colors text-sm font-medium"
                            title="Sair da Conta"
                        >
                            Sair
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
