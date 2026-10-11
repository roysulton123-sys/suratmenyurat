import React from 'react';
import { LogOut } from 'lucide-react';

export default function ExitConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-100 dark:border-slate-800 p-6 text-center animate-in zoom-in-95 text-slate-800 dark:text-slate-100">
        <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <LogOut className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Keluar dari Aplikasi?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
          Anda yakin ingin keluar dari aplikasi Surat Sarpras?
        </p>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition border border-slate-200 dark:border-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-2xl shadow-soft transition active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
