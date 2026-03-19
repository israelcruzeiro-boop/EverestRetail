import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const AccordionContext = createContext<{
  activeItem: string | null;
  toggleItem: (value: string) => void;
} | null>(null);

export const Accordion = ({ children, className = '', type = 'single', collapsible = true }: any) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleItem = (value: string) => {
    setActiveItem(prev => prev === value ? (collapsible ? null : prev) : value);
  };

  return (
    <AccordionContext.Provider value={{ activeItem, toggleItem }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = ({ children, value, className = '' }: any) => {
  return (
    <div className={className}>
      {React.Children.map(children, child => 
        React.isValidElement(child) ? React.cloneElement(child as any, { value }) : child
      )}
    </div>
  );
};

export const AccordionTrigger = ({ children, value, className = '' }: any) => {
  const context = useContext(AccordionContext);
  const isOpen = context?.activeItem === value;

  return (
    <button
      onClick={() => context?.toggleItem(value)}
      className={`flex w-full items-center justify-between py-4 font-medium transition-all ${className}`}
    >
      {children}
      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

export const AccordionContent = ({ children, value, className = '' }: any) => {
  const context = useContext(AccordionContext);
  const isOpen = context?.activeItem === value;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
