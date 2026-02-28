import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <label className="block text-[10px] font-black text-[#0B1220] uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mt-2 ml-1">
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
      w-full h-14 px-6 bg-white border-2 border-[#0B1220] rounded-none text-[10px] 
      font-black uppercase tracking-widest focus:bg-slate-50 focus:border-[#1D4ED8] focus:ring-0 transition-all
      placeholder:text-slate-300 placeholder:uppercase
      ${props.className || ''}
    `}
  />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`
      w-full h-14 px-6 bg-white border-2 border-[#0B1220] rounded-none text-[10px] 
      font-black uppercase tracking-widest focus:bg-slate-50 focus:border-[#1D4ED8] focus:ring-0 transition-all
      cursor-pointer
      ${props.className || ''}
    `}
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`
      w-full p-6 bg-white border-2 border-[#0B1220] rounded-none text-[10px] 
      font-black uppercase tracking-widest focus:bg-slate-50 focus:border-[#1D4ED8] focus:ring-0 transition-all
      placeholder:text-slate-300 placeholder:uppercase
      ${props.className || ''}
    `}
  />
);
