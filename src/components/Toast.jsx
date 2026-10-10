import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center space-x-2.5 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-card rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 animate-in slide-in-from-bottom-3 duration-200">
      {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      {isError && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-500 shrink-0" />}

      <span className="font-semibold text-slate-700 dark:text-slate-200">{toast.message}</span>

      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition ml-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
