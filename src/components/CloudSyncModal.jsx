import React, { useState } from 'react';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Smartphone,
  Globe,
  Database,
  X
} from 'lucide-react';
import { dbService } from '../services/db';

export default function CloudSyncModal({
  isOpen,
  onClose,
  syncState,
  lettersCount = 0,
  onSyncCompleted
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const handleCopyRules = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(firestoreRulesSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  const handleTestAndSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await dbService.syncLocalToCloud();
      if (result.success) {
        setSyncFeedback({
          type: 'success',
          message: `Koneksi Cloud Sukses! ${result.count} surat berhasil disinkronkan ke Firestore.`
        });
        if (onSyncCompleted && result.letters) {
          onSyncCompleted(result.letters);
        }
      } else if (result.code === 'permission-denied') {
        setSyncFeedback({
          type: 'error',
          message:
            'Akses Firebase Ditolak (Permission Denied). Aturan Firebase Firestore di Firebase Console masih terkunci. Silakan ikuti panduan di bawah.'
        });
      } else {
        setSyncFeedback({
          type: 'error',
          message: `Gagal sinkron: ${result.message || 'Periksa koneksi internet Anda.'}`
        });
      }
    } catch (err) {
      setSyncFeedback({
        type: 'error',
        message: 'Terjadi kesalahan: ' + (err.message || 'Gagal sinkron')
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const isConnected = syncState?.status === 'connected';
  const isPermissionDenied = syncState?.status === 'permission_denied';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-100 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh] animate-in zoom-in-95 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isConnected ? (
                <Cloud className="w-5 h-5 animate-pulse" />
              ) : (
                <CloudOff className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Sinkronisasi Multi-Perangkat
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                Penyelarasan data HP Android, Laptop & Website
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Main Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
              isConnected
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
                : isPermissionDenied
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : isPermissionDenied ? (
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {isConnected
                  ? 'Firebase Firestore Online'
                  : isPermissionDenied
                  ? 'Izin Firebase Terkunci (Penyimpanan Lokal Aktif)'
                  : 'Status: Menghubungkan ke Cloud'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isConnected
                  ? 'Sinkronisasi real-time dua arah aktif. Setiap surat baru atau editan di HP Android langsung tampil otomatis di Website & perangkat lainnya.'
                  : isPermissionDenied
                  ? 'Surat yang Anda catat tetap tersimpan aman di HP ini. Agar surat dapat otomatis muncul di website Netlify dan HP lain, aktifkan izin Rules di Firebase Console.'
                  : 'Perangkat sedang berupaya menghubungi server Firebase Firestore.'}
              </p>
            </div>
          </div>

          {/* Device Architecture Diagram */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-center">
            <div className="flex-1 flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                Aplikasi HP
              </span>
              <span className="text-[9px] text-slate-400">Android APK</span>
            </div>

            <div className="px-2 flex flex-col items-center">
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
              >
                {isConnected ? '⇄ Sinkron ⇄' : 'Menunggu Rules'}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">Firebase Cloud</span>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                Website
              </span>
              <span className="text-[9px] text-slate-400">Netlify Web</span>
            </div>
          </div>

          {/* Sync Stats Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-center">
              <span className="block text-[10px] font-medium text-slate-400">
                Total Surat
              </span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                {lettersCount}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-center">
              <span className="block text-[10px] font-medium text-slate-400">
                Data Tertunda
              </span>
              <span
                className={`text-sm font-extrabold ${
                  (syncState?.pendingCount || 0) > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-800 dark:text-white'
                }`}
              >
                {syncState?.pendingCount || 0}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-center">
              <span className="block text-[10px] font-medium text-slate-400">
                Project ID
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 truncate block">
                project3-edf0f
              </span>
            </div>
          </div>

          {/* Sync Feedback Message */}
          {syncFeedback && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center space-x-2 border ${
                syncFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
            >
              {syncFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{syncFeedback.message}</span>
            </div>
          )}

          {/* Primary Action Button: Tes & Sinkronkan Sekarang */}
          <button
            onClick={handleTestAndSync}
            disabled={isSyncing}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-soft transition active:scale-98 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menguji & Menyinkronkan...' : 'Tes & Sinkronkan Sekarang'}</span>
          </button>

          {/* Step-by-Step Firebase Rules Guide (Always available for reference) */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Langkah Mengaktifkan Izin Firebase (1 Menit)</span>
              </span>
              <a
                href="https://console.firebase.google.com/project/project3-edf0f/firestore/rules"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
              >
                <span>Buka Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="text-[11px] text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Buka tab <strong>Rules</strong> di Firestore Database Firebase Console project{' '}
                <code className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">
                  project3-edf0f
                </code>
                .
              </li>
              <li>
                Ganti isi aturan menjadi kode di bawah ini:
                <div className="relative mt-2 mb-2 bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[10px] leading-relaxed overflow-x-auto border border-slate-800">
                  <pre>{firestoreRulesSnippet}</pre>
                  <button
                    onClick={handleCopyRules}
                    className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[9px] font-medium transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Rules</span>
                      </>
                    )}
                  </button>
                </div>
              </li>
              <li>
                Klik tombol biru <strong>Publish (Publikasikan)</strong> di Firebase Console.
              </li>
              <li>
                Kembali ke aplikasi lalu klik tombol <strong>"Tes & Sinkronkan Sekarang"</strong> di atas. Semua data otomatis langsung tersinkron di HP dan website!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
