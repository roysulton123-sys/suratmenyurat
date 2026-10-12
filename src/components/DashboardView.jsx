import React from 'react';
import {
  Inbox,
  Send,
  AlertCircle,
  BookOpen,
  FileCheck2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Paperclip,
  Sparkles,
  Printer,
  Clock,
  CheckCircle2,
  Archive,
  CloudOff
} from 'lucide-react';
import { formatDate, STATUS_CONFIG, URGENCY_CONFIG } from '../utils/constants';

export default function DashboardView({
  letters = [],
  onAddNew,
  onView,
  onNavigateTab,
  syncState,
  onOpenSyncModal
}) {
  const masukLetters = letters.filter((l) => l.type === 'masuk');
  const keluarLetters = letters.filter((l) => l.type === 'keluar');
  const pendingLetters = letters.filter((l) => l.status === 'Baru' || l.status === 'Diproses');
  const lettersWithFiles = letters.filter((l) => Boolean(l.file));

  // Status breakdown counts
  const baruCount = letters.filter((l) => l.status === 'Baru').length;
  const diprosesCount = letters.filter((l) => l.status === 'Diproses').length;
  const selesaiCount = letters.filter((l) => l.status === 'Selesai').length;
  const diarsipkanCount = letters.filter((l) => l.status === 'Diarsipkan').length;

  const recentLetters = [...letters]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-5 pb-32 sm:pb-16 font-sans">
      {/* 1. Surat Sarpras Hero Gradient Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 p-5 sm:p-7 text-white shadow-ocazte">
        {/* Soft decorative background glows */}
        <div className="absolute -right-10 -top-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-blue-100 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Administrasi Sarana & Prasarana</span>
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mt-0.5 text-white">
                Surat Sarpras
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/25 shrink-0">
              {letters.length} Berkas
            </span>
          </div>

          {/* 4-Item Metrics Row */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3 py-2.5 border-t border-white/15 my-1.5">
            <div
              onClick={() => onNavigateTab('masuk')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-xl sm:rounded-2xl p-2 text-center border border-white/10 cursor-pointer transition"
            >
              <span className="text-[10px] text-blue-100 block font-medium truncate">Masuk</span>
              <span className="text-sm sm:text-lg font-bold">{masukLetters.length}</span>
            </div>
            <div
              onClick={() => onNavigateTab('keluar')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-xl sm:rounded-2xl p-2 text-center border border-white/10 cursor-pointer transition"
            >
              <span className="text-[10px] text-blue-100 block font-medium truncate">Keluar</span>
              <span className="text-sm sm:text-lg font-bold">{keluarLetters.length}</span>
            </div>
            <div
              onClick={() => onNavigateTab('masuk')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-xl sm:rounded-2xl p-2 text-center border border-white/10 cursor-pointer transition"
            >
              <span className="text-[10px] text-amber-200 block font-medium truncate">Disposisi</span>
              <span className="text-sm sm:text-lg font-bold text-amber-100">{pendingLetters.length}</span>
            </div>
            <div
              onClick={() => onNavigateTab('agenda')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-xl sm:rounded-2xl p-2 text-center border border-white/10 cursor-pointer transition"
            >
              <span className="text-[10px] text-blue-100 block font-medium truncate">Agenda</span>
              <span className="text-sm sm:text-lg font-bold">{letters.length}</span>
            </div>
          </div>

          {/* Quick Action Buttons inside Banner */}
          <div className="flex items-center gap-2 pt-1.5">
            <button
              onClick={() => onAddNew('masuk')}
              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 sm:py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl sm:rounded-2xl shadow-soft transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
              <span className="truncate">Catat Masuk</span>
            </button>
            <button
              onClick={() => onAddNew('keluar')}
              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl sm:rounded-2xl backdrop-blur-md transition border border-white/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="truncate">Buat Keluar</span>
            </button>
            <button
              onClick={() => onNavigateTab('agenda')}
              className="hidden sm:inline-flex items-center justify-center space-x-1.5 px-3 py-2 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl sm:rounded-2xl backdrop-blur-md transition border border-white/20 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Rekap Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Sync Diagnostic Banner (shown if permission is denied or pending sync) */}
      {syncState?.status === 'permission_denied' && (
        <div
          onClick={onOpenSyncModal}
          className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 p-3 sm:p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition group active:scale-[0.99]"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <CloudOff className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Sinkronisasi Multi-Perangkat Belum Aktif
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                Data tersimpan di HP ini. Klik di sini untuk panduan 1 menit agar data HP & Website otomatis tersinkron.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1 shrink-0 ml-2">
            <span className="hidden sm:inline">Aktifkan</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </span>
        </div>
      )}

      {/* 2. Menu Pilihan Lengkap Dashboard (2x2 Grid on Mobile, 4-Cols on Desktop) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Menu Pilihan Dokumen Sarpras
          </h3>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Semua Pilihan</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Pilihan 1: Surat Masuk */}
          <div
            onClick={() => onNavigateTab('masuk')}
            className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card transition cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Inbox className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                {masukLetters.length}
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Surat Masuk
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-medium truncate mt-0.5">
                Permohonan sarana & surat dinas
              </p>
            </div>
          </div>

          {/* Pilihan 2: Surat Keluar */}
          <div
            onClick={() => onNavigateTab('keluar')}
            className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card transition cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                {keluarLetters.length}
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Surat Keluar
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-medium truncate mt-0.5">
                Surat tugas, edaran & pengadaan
              </p>
            </div>
          </div>

          {/* Pilihan 3: Buku Agenda (Kini Hadir Lengkap di Dashboard!) */}
          <div
            onClick={() => onNavigateTab('agenda')}
            className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card transition cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                Rekap
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Buku Agenda
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-medium truncate mt-0.5">
                Rekapitulasi nomor & cetak laporan
              </p>
            </div>
          </div>

          {/* Pilihan 4: Perlu Tindak Lanjut */}
          <div
            onClick={() => onNavigateTab('masuk')}
            className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card transition cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                {pendingLetters.length} Butuh
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Tindak Lanjut
              </p>
              <p className="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate mt-0.5">
                {pendingLetters.length} surat menunggu disposisi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Status Berkas Lengkap Sarpras */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Status Berkas Sarpras
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Alur Proses</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Status Baru */}
          <div
            onClick={() => onNavigateTab('masuk')}
            className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 cursor-pointer hover:bg-blue-100/70 dark:hover:bg-blue-950/60 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">Baru</span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
              {baruCount}
            </p>
            <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">Belum diproses</p>
          </div>

          {/* Status Diproses */}
          <div
            onClick={() => onNavigateTab('masuk')}
            className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-950/60 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Diproses</span>
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
              {diprosesCount}
            </p>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Sedang tindak lanjut</p>
          </div>

          {/* Status Selesai */}
          <div
            onClick={() => onNavigateTab('masuk')}
            className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 cursor-pointer hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Selesai</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
              {selesaiCount}
            </p>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Telah diselesaikan</p>
          </div>

          {/* Status Diarsipkan */}
          <div
            onClick={() => onNavigateTab('masuk')}
            className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-800 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Diarsipkan</span>
              <Archive className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {diarsipkanCount}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Disimpan permanen</p>
          </div>
        </div>
      </div>

      {/* 4. Aktivitas Surat Sarpras Terkini */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 sm:p-6 shadow-soft space-y-3.5 transition-colors duration-300">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Aktivitas Surat Sarpras Terkini
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400">
              Dokumen masuk & keluar terbaru divisi sarana prasarana
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('masuk')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-0.5 transition shrink-0"
          >
            <span>Semua</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentLetters.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
              Belum ada surat yang terdaftar.
            </div>
          ) : (
            recentLetters.map((item) => {
              const isIncoming = item.type === 'masuk';
              const urgencyStyle = URGENCY_CONFIG[item.urgency] || URGENCY_CONFIG.Biasa;
              const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.Baru;

              return (
                <div
                  key={item.id}
                  onClick={() => onView(item)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 rounded-2xl px-1.5 sm:px-2 transition cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isIncoming
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {isIncoming ? (
                        <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400">
                        <span>{formatDate(item.date)}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">
                          {item.agendaNumber}
                        </span>
                        {item.file && (
                          <Paperclip className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.subject}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {isIncoming ? 'Dari: ' : 'Tujuan: '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.senderReceiver}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${statusStyle.bg}`}
                    >
                      {item.status}
                    </span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
