import React, { useState } from 'react';
import {
  Inbox,
  Send,
  LayoutDashboard,
  BookOpen,
  Plus,
  Building2,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  X
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({
  activeTab,
  setActiveTab,
  masukCount = 0,
  keluarCount = 0,
  onAddNew,
  onResetData,
  isDark,
  onToggleTheme,
  isCloudConnected = true,
  onOpenInstall
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-soft font-sans transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Title */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-ocazte group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg sm:text-xl font-sans">
                    Surat Sarpras
                  </span>
                  <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-900/50">
                    Sarana & Prasarana
                  </span>

                  {/* Firebase Cloud Live Badge */}
                  <span className="hidden lg:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Firebase Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium hidden sm:block">
                  Sistem Informasi Persuratan Sarana & Prasarana • Terkoneksi Cloud
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-soft'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('masuk')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'masuk'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-soft'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>Surat Masuk</span>
                <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-900/50">
                  {masukCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('keluar')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'keluar'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-soft'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Surat Keluar</span>
                <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/50">
                  {keluarCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('agenda')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'agenda'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-soft'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Buku Agenda</span>
              </button>
            </nav>

            {/* Right Action Controls: Install App, Theme Toggle, Reset & Add Button */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              {/* Android App Button */}
              <button
                onClick={onOpenInstall}
                title="Pasang Aplikasi Android (APK)"
                className="p-2 sm:p-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition flex items-center space-x-1"
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hidden xl:inline">App Android</span>
              </button>

              {/* Theme Toggle Switch */}
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

              <button
                onClick={onResetData}
                title="Muat Ulang Data Contoh Sarpras"
                className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => onAddNew('masuk')}
                className="hidden sm:inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-ocazte transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Surat</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Floating Action Modal / Quick Menu */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200 md:hidden font-sans"
          onClick={() => setShowAddMenu(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-3 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-5 text-slate-800 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tambah Surat Sarpras</h3>
              <button
                onClick={() => setShowAddMenu(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onAddNew('masuk');
              }}
              className="w-full flex items-center space-x-3.5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/50 text-left transition"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-300">Catat Surat Masuk</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Permohonan, pengajuan fasilitas & sarana</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false);
                onAddNew('keluar');
              }}
              className="w-full flex items-center space-x-3.5 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-950/70 border border-blue-100 dark:border-blue-900/50 text-left transition"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950 dark:text-blue-300">Buat Surat Keluar</p>
                <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80">Pemberitahuan, surat tugas pemeliharaan</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-4 py-2 shadow-card flex items-center justify-between md:hidden pb-safe font-sans transition-colors duration-300">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center py-1 transition ${
            activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">Beranda</span>
        </button>

        {/* Tab 2: Surat Masuk */}
        <button
          onClick={() => setActiveTab('masuk')}
          className={`flex-1 flex flex-col items-center py-1 relative transition ${
            activeTab === 'masuk' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 font-medium'
          }`}
        >
          <Inbox className="w-5 h-5" />
          <span className="text-[10px] mt-1">Masuk</span>
          {masukCount > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {masukCount}
            </span>
          )}
        </button>

        {/* Center Floating Action Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => setShowAddMenu(true)}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-ocazte hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
            title="Tambah Dokumen Baru"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Surat Keluar */}
        <button
          onClick={() => setActiveTab('keluar')}
          className={`flex-1 flex flex-col items-center py-1 relative transition ${
            activeTab === 'keluar' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 font-medium'
          }`}
        >
          <Send className="w-5 h-5" />
          <span className="text-[10px] mt-1">Keluar</span>
          {keluarCount > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {keluarCount}
            </span>
          )}
        </button>

        {/* Tab 4: Agenda */}
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex-1 flex flex-col items-center py-1 transition ${
            activeTab === 'agenda' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-1">Agenda</span>
        </button>
      </div>
    </>
  );
}
