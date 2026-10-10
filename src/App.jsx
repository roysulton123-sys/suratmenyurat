import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import LetterTable from './components/LetterTable';
import LetterDetailModal from './components/LetterDetailModal';
import LetterFormModal from './components/LetterFormModal';
import DispositionModal from './components/DispositionModal';
import FileViewerModal from './components/FileViewerModal';
import PrintSheetModal from './components/PrintSheetModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import AgendaReportView from './components/AgendaReportView';
import Toast from './components/Toast';
import { dbService } from './services/db';
import { Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCloudConnected, setIsCloudConnected] = useState(true);

  // Dark mode state with localStorage persistence
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDefaultType, setFormDefaultType] = useState('masuk');
  const [selectedLetterForEdit, setSelectedLetterForEdit] = useState(null);
  const [selectedLetterForView, setSelectedLetterForView] = useState(null);
  const [selectedLetterForDisposition, setSelectedLetterForDisposition] = useState(null);
  const [selectedLetterForFile, setSelectedLetterForFile] = useState(null);
  const [selectedLetterForDelete, setSelectedLetterForDelete] = useState(null);
  const [selectedLetterForPrint, setSelectedLetterForPrint] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Real-time Cloud Firebase Subscription + Offline Cache
  useEffect(() => {
    const unsubscribe = dbService.subscribeLetters(
      (updatedLetters, isOnline) => {
        setLetters(updatedLetters);
        setIsCloudConnected(isOnline);
        setLoading(false);
      },
      (err) => {
        console.warn('Firebase sync notification:', err?.message);
        setIsCloudConnected(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Save new or edited letter (synced to Firebase & Cache)
  const handleSaveLetter = async (letterData) => {
    try {
      const saved = await dbService.saveLetter(letterData);
      
      // Update selected letter if viewing
      if (selectedLetterForView && selectedLetterForView.id === saved.id) {
        setSelectedLetterForView(saved);
      }
      showToast(
        selectedLetterForEdit
          ? 'Perubahan surat berhasil disimpan ke Firebase Cloud'
          : 'Surat baru berhasil didaftarkan ke Firebase Cloud'
      );
    } catch (err) {
      console.error('Failed to save letter:', err);
      showToast('Gagal menyimpan surat', 'error');
    }
  };

  // Delete letter
  const handleConfirmDelete = async (id) => {
    try {
      await dbService.deleteLetter(id);
      setSelectedLetterForDelete(null);
      if (selectedLetterForView?.id === id) {
        setSelectedLetterForView(null);
      }
      showToast('Dokumen surat berhasil dihapus dari Cloud');
    } catch (err) {
      console.error('Failed to delete letter:', err);
      showToast('Gagal menghapus surat', 'error');
    }
  };

  // Add disposition / notes
  const handleSaveDisposition = async (updatedLetter) => {
    try {
      await dbService.saveLetter(updatedLetter);
      if (selectedLetterForView?.id === updatedLetter.id) {
        setSelectedLetterForView(updatedLetter);
      }
      showToast('Catatan / disposisi berhasil disimpan ke Cloud');
    } catch (err) {
      console.error('Failed to add disposition:', err);
      showToast('Gagal menambahkan catatan', 'error');
    }
  };

  // Reset sample data
  const handleResetData = async () => {
    if (window.confirm('Muat ulang data contoh persuratan Sarpras ke Firebase?')) {
      try {
        const seeded = await dbService.resetData();
        setLetters(seeded);
        showToast('Data contoh Sarpras berhasil dimuat ulang');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Modal openers
  const openAddNew = (type = 'masuk') => {
    setFormDefaultType(type);
    setSelectedLetterForEdit(null);
    setIsFormOpen(true);
  };

  const openEdit = (letter) => {
    setSelectedLetterForEdit(letter);
    setIsFormOpen(true);
  };

  const openView = (letter) => {
    setSelectedLetterForView(letter);
  };

  const openDisposition = (letter) => {
    setSelectedLetterForDisposition(letter);
  };

  const openFileViewer = (letter) => {
    setSelectedLetterForFile(letter);
  };

  const openPrintSheet = (letter) => {
    setSelectedLetterForPrint(letter);
  };

  const openDeleteConfirm = (letter) => {
    setSelectedLetterForDelete(letter);
  };

  const masukLettersCount = letters.filter((l) => l.type === 'masuk').length;
  const keluarLettersCount = letters.filter((l) => l.type === 'keluar').length;

  return (
    <div className="min-h-screen bg-[#f6f8fb] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Top Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        masukCount={masukLettersCount}
        keluarCount={keluarLettersCount}
        onAddNew={openAddNew}
        onResetData={handleResetData}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isCloudConnected={isCloudConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-400 font-bold">Sinkronisasi Surat Sarpras dengan Firebase Cloud...</p>
          </div>
        ) : (
          <>
            {/* Tab: Dashboard */}
            {activeTab === 'dashboard' && (
              <DashboardView
                letters={letters}
                onAddNew={openAddNew}
                onView={openView}
                onNavigateTab={setActiveTab}
              />
            )}

            {/* Tab: Surat Masuk */}
            {activeTab === 'masuk' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span>Arsip Surat Masuk Sarpras</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Daftar permohonan fasilitas, peminjaman sarana, dan pengajuan sarpras
                    </p>
                  </div>
                  <button
                    onClick={() => openAddNew('masuk')}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-ocazte transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Catat Surat Masuk</span>
                  </button>
                </div>

                <LetterTable
                  letters={letters}
                  type="masuk"
                  onView={openView}
                  onEdit={openEdit}
                  onDelete={openDeleteConfirm}
                  onAddDisposition={openDisposition}
                  onViewFile={openFileViewer}
                />
              </div>
            )}

            {/* Tab: Surat Keluar */}
            {activeTab === 'keluar' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span>Arsip Surat Keluar Sarpras</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Daftar surat tugas pemeliharaan, berita acara serah terima, dan surat resmi sarpras
                    </p>
                  </div>
                  <button
                    onClick={() => openAddNew('keluar')}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-ocazte transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Surat Keluar</span>
                  </button>
                </div>

                <LetterTable
                  letters={letters}
                  type="keluar"
                  onView={openView}
                  onEdit={openEdit}
                  onDelete={openDeleteConfirm}
                  onAddDisposition={openDisposition}
                  onViewFile={openFileViewer}
                />
              </div>
            )}

            {/* Tab: Buku Agenda & Rekap */}
            {activeTab === 'agenda' && <AgendaReportView letters={letters} />}
          </>
        )}
      </main>

      {/* Desktop Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-400 dark:text-slate-500 print:hidden hidden md:block font-sans transition-colors duration-300">
        <p>Surat Sarpras • Sistem Manajemen Persuratan Sarana & Prasarana • Terhubung ke Firebase Cloud</p>
      </footer>

      {/* Modals & Drawers */}
      <LetterFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedLetterForEdit(null);
        }}
        onSave={handleSaveLetter}
        initialData={selectedLetterForEdit}
        defaultType={formDefaultType}
        letterCount={letters.length}
      />

      <LetterDetailModal
        letter={selectedLetterForView}
        isOpen={Boolean(selectedLetterForView)}
        onClose={() => setSelectedLetterForView(null)}
        onEdit={(letter) => {
          setSelectedLetterForView(null);
          openEdit(letter);
        }}
        onDelete={(letter) => {
          openDeleteConfirm(letter);
        }}
        onAddDisposition={(letter) => {
          openDisposition(letter);
        }}
        onViewFile={(letter) => {
          openFileViewer(letter);
        }}
        onPrintSheet={(letter) => {
          openPrintSheet(letter);
        }}
      />

      <DispositionModal
        letter={selectedLetterForDisposition}
        isOpen={Boolean(selectedLetterForDisposition)}
        onClose={() => setSelectedLetterForDisposition(null)}
        onSave={handleSaveDisposition}
      />

      <FileViewerModal
        letter={selectedLetterForFile}
        onClose={() => setSelectedLetterForFile(null)}
      />

      <PrintSheetModal
        letter={selectedLetterForPrint}
        isOpen={Boolean(selectedLetterForPrint)}
        onClose={() => setSelectedLetterForPrint(null)}
      />

      <DeleteConfirmModal
        letter={selectedLetterForDelete}
        isOpen={Boolean(selectedLetterForDelete)}
        onClose={() => setSelectedLetterForDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
