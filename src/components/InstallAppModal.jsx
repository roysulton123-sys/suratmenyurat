import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-card border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 text-slate-800 dark:text-slate-100 p-6 space-y-5">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-ocazte p-0.5 bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center">
              <img src="/app-icon.png" alt="Surat Sarpras" className="w-full h-full object-cover rounded-[14px]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Pasang Aplikasi Android (Surat Sarpras)
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Gunakan di smartphone Android secara native & cepat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method 1: Instant PWA Install */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
              Metode 1: Pasang Langsung di HP (PWA)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              Paling Cepat
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Buka link <strong className="text-blue-600 dark:text-blue-400">https://suratmenyuratq.netlify.app/</strong> di Google Chrome HP Anda:
          </p>

          <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal pl-4 pt-1">
            <li>Ketuk menu <strong>titik tiga (⋮)</strong> di pojok kanan atas Chrome.</li>
            <li>Pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> atau <strong>&quot;Pasang Aplikasi&quot;</strong>.</li>
            <li>Aplikasi otomatis muncul di menu aplikasi HP dengan ikon Surat Sarpras & layar penuh tanpa browser!</li>
          </ol>

          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-ocazte transition"
            >
              <Download className="w-4 h-4" />
              <span>Pasang Sekarang di Perangkat Ini</span>
            </button>
          )}
        </div>

        {/* Method 2: GitHub Actions APK Builder */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">
            Metode 2: Unduh File APK Native (Capacitor)
          </span>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Kode proyek native Android lengkap (`android/`) dan build workflow GitHub Actions otomatis telah disiapkan di repositori GitHub Anda.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <a
              href="https://github.com/roysulton123-sys/suratmenyurat/releases/download/latest-apk/SuratSarpras.apk"
              download="SuratSarpras.apk"
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-ocazte transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Langsung APK Android</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
            </a>

            <a
              href="https://github.com/roysulton123-sys/suratmenyurat/actions"
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
            >
              <span>Pantau Status Build</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-2xl text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
