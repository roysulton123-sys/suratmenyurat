import React from 'react';
import {
  Inbox,
  Send,
  AlertCircle,
  FileCheck2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Paperclip,
  Sparkles,
  Building2
} from 'lucide-react';
import { formatDate, STATUS_CONFIG, URGENCY_CONFIG } from '../utils/constants';

export default function DashboardView({
  letters = [],
  onAddNew,
  onView,
  onNavigateTab
}) {
  const masukLetters = letters.filter((l) => l.type === 'masuk');
  const keluarLetters = letters.filter((l) => l.type === 'keluar');
  const pendingLetters = letters.filter((l) => l.status === 'Baru' || l.status === 'Diproses');
  const lettersWithFiles = letters.filter((l) => Boolean(l.file));

  const recentLetters = [...letters]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-20 md:pb-6 font-sans">
      {/* Surat Sarpras Hero Gradient Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-ocazte">
        {/* Soft decorative background waves / glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-100 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Administrasi Sarana & Prasarana</span>
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                Surat Sarpras{' '}
                <span className="text-sm sm:text-base font-normal text-blue-100">
                  ({letters.length} Berkas)
                </span>
              </h2>
            </div>
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/25">
              Divisi Sarpras
            </span>
          </div>

          {/* Quick Metrics Pills inside Hero Card */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3 border-t border-white/15 my-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 text-center border border-white/10">
              <span className="text-[11px] text-blue-100 block font-medium">Surat Masuk</span>
              <span className="text-base sm:text-xl font-bold">{masukLetters.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 text-center border border-white/10">
              <span className="text-[11px] text-blue-100 block font-medium">Surat Keluar</span>
              <span className="text-base sm:text-xl font-bold">{keluarLetters.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 text-center border border-white/10">
              <span className="text-[11px] text-blue-100 block font-medium">Perlu Tindak Lanjut</span>
              <span className="text-base sm:text-xl font-bold">{pendingLetters.length}</span>
            </div>
          </div>

          {/* Action Buttons inside Card */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => onAddNew('masuk')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-2xl shadow-soft transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Catat Surat Masuk</span>
            </button>
            <button
              onClick={() => onAddNew('keluar')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-2xl backdrop-blur-md transition border border-white/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Surat Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Category Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Kategori Arsip Sarpras
          </h3>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Pintasan Cepat</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Surat Masuk */}
          <div
            onClick={() => onNavigateTab('masuk')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Surat Masuk</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                  {masukLetters.length} berkas permohonan
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Surat Keluar */}
          <div
            onClick={() => onNavigateTab('keluar')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Surat Keluar</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                  {keluarLetters.length} surat tugas / edaran
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Perlu Tindak Lanjut */}
          <div
            onClick={() => onNavigateTab('masuk')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Tindak Lanjut</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  {pendingLetters.length} butuh disposisi
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/60 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Berkas Digital Terunggah */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Dokumen Sarpras</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                  {lettersWithFiles.length} file terlampir
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50">
              PDF/DOC
            </span>
          </div>
        </div>
      </div>

      {/* Surat Terkini Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-soft space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Aktivitas Surat Sarpras Terkini
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400">Pembaruan dokumen masuk dan keluar divisi sarana prasarana</p>
          </div>
          <button
            onClick={() => onNavigateTab('masuk')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-0.5 transition"
          >
            <span>Lihat Semua</span>
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
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 rounded-2xl px-2 transition cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5 min-w-0 pr-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isIncoming
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {isIncoming ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 dark:text-slate-400">
                        <span>{formatDate(item.date)}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.agendaNumber}
                        </span>
                        {item.file && (
                          <Paperclip className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.subject}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {isIncoming ? 'Dari: ' : 'Tujuan: '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.senderReceiver}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusStyle.bg}`}
                    >
                      {item.status}
                    </span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      <ChevronRight className="w-4 h-4" />
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
