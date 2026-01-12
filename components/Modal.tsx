import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};