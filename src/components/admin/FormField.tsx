import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`
      w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm 
      focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all
      placeholder:text-slate-400
      ${props.className || ''}
    `}
  />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`
      w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm 
      focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all
      ${props.className || ''}
    `}
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`
      w-full p-4 bg-white border border-slate-200 rounded-xl text-sm 
      focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all
      placeholder:text-slate-400
      ${props.className || ''}
    `}
  />
);
