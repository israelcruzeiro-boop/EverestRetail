import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 md:p-24 bg-white border-4 border-[#0B1220] text-center shadow-[12px_12px_0px_0px_rgba(11,18,32,1)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-[#FF4D00]"></div>
      <div className="text-7xl mb-10 grayscale">{icon}</div>
      <h3 className="text-3xl font-black text-[#0B1220] mb-4 uppercase tracking-tighter leading-none">{title}</h3>
      <p className="text-slate-400 max-w-sm mb-12 font-medium uppercase text-sm tracking-tight">{description}</p>
      {action && (
        <div className="group">
          {action}
        </div>
      )}
    </div>
  );
}
