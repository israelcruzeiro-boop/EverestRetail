import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const maxWidthClass = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    '4xl': 'max-w-7xl',
  }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1220]/90 z-[60]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[70] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className={`bg-white w-full ${maxWidthClass} border-[6px] border-[#0B1220] shadow-[20px_20px_0px_0px_rgba(29,78,216,1)] overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col relative`}
            >
              <div className="px-8 py-6 border-b-4 border-[#0B1220] flex items-center justify-between shrink-0 bg-[#0B1220] text-white">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 bg-[#FF4D00] text-white hover:bg-white hover:text-[#FF4D00] transition-colors border-2 border-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-8 md:p-12 overflow-y-auto no-scrollbar">
                {children}
              </div>
              {footer && (
                <div className="px-8 py-6 bg-slate-50 border-t-4 border-[#0B1220] flex justify-end gap-6 shrink-0">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
