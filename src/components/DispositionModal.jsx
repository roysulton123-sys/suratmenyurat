import React, { useState } from 'react';
import { X, Send, MessageSquarePlus, User, Building } from 'lucide-react';

export default function DispositionModal({ letter, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    author: 'Koordinator Sarpras',
    target: '',
    instruction: ''
  });
  const [error, setError] = useState('');

  if (!isOpen || !letter) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.instruction.trim()) {
      setError('Harap isi catatan / instruksi keterangan');
      return;
    }

    const newDisposition = {
      id: 'disp-' + Date.now(),
      date: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      author: formData.author.trim() || 'Admin Sarpras',
      target: formData.target.trim() || 'Bagian Terkait',
      instruction: formData.instruction.trim()
    };

    const updatedDispositions = [...(letter.dispositions || []), newDisposition];
    const updatedStatus = letter.status === 'Baru' ? 'Diproses' : letter.status;

    onSave({
      ...letter,
      status: updatedStatus,
      dispositions: updatedDispositions
    });
    
    setFormData({ author: 'Koordinator Sarpras', target: '', instruction: '' });
    setError('');
    onClose();
  };

  const quickTemplates = [
    'Tindak lanjuti segera',
    'Cek ketersediaan fasilitas & sarana',
    'Tugaskan teknisi pemeliharaan',
    'Koordinasikan jadwal peminjaman',
    'Verifikasi kondisi dan inventaris'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-card border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 text-slate-800 dark:text-slate-100">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Tambah Catatan & Disposisi Sarpras
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium truncate max-w-xs">
                {letter.agendaNumber} • {letter.letterNumber}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-2xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pemberi Instruksi
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Contoh: Koordinator Sarpras"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Diteruskan Kepada
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="Contoh: Teknisi Listrik & Genset"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                />
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Isi Arahan Tindak Lanjut / Disposisi <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.instruction}
              onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
              placeholder="Tuliskan arahan tindak lanjut sarpras, pengecekan fasilitas, atau instruksi teknisi..."
              className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none font-medium"
            />
          </div>

          {/* Quick templates chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 block mb-1.5">
              Template Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      instruction: prev.instruction ? `${prev.instruction}. ${item}` : item
                    }))
                  }
                  className="px-3 py-1.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 rounded-xl transition border border-slate-200/60 dark:border-slate-700"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-ocazte transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
