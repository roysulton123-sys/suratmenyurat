import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({
  letter,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false
}) {
  if (!isOpen || !letter) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-100 dark:border-slate-800 p-6 text-center animate-in zoom-in-95 text-slate-800 dark:text-slate-100">
        <div className="w-13 h-13 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          Hapus Dokumen Surat?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-4 leading-relaxed">
          Apakah Anda yakin ingin menghapus arsip{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {letter.agendaNumber || 'ini'}
          </strong>?
          Tindakan ini juga akan menghapus berkas lampiran yang terkait secara permanen.
        </p>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl text-left text-xs mb-5 border border-slate-100/80 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          <p className="font-bold text-slate-800 dark:text-white truncate">
            {letter.subject || '(Tanpa Perihal)'}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
            {letter.type === 'masuk' ? 'Pengirim' : 'Tujuan'}:{' '}
            {letter.senderReceiver || '-'}
          </p>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onConfirm(letter.id || letter)}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-soft transition active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
