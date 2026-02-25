import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 text-center">
      <div className="text-5xl mb-6">{icon}</div>
      <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-xs mb-8">{description}</p>
      {action}
    </div>
  );
}
