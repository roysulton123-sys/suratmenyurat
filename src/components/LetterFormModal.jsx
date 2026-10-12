import React, { useState, useEffect } from 'react';
import { X, Save, FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import FileUpload from './FileUpload';
import { dbService } from '../services/db';

export default function LetterFormModal({ isOpen, onClose, onSave, initialData, defaultType = 'masuk', letterCount = 0 }) {
  const [formData, setFormData] = useState({
    type: 'masuk',
    agendaNumber: '',
    letterNumber: '',
    date: new Date().toISOString().split('T')[0],
    receivedDate: new Date().toISOString().split('T')[0],
    senderReceiver: '',
    subject: '',
    category: 'Undangan',
    urgency: 'Biasa',
    status: 'Baru',
    notes: '',
    dispositions: [],
    file: null
  });

  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date || new Date().toISOString().split('T')[0],
        receivedDate: initialData.receivedDate || new Date().toISOString().split('T')[0]
      });
      setSelectedFileObj(null);
    } else {
      const year = new Date().getFullYear();
      const code = defaultType === 'masuk' ? 'AG/SARPRAS' : 'AGK/SARPRAS';
      const seq = String(letterCount + 1).padStart(3, '0');
      
      setFormData({
        type: defaultType,
        agendaNumber: `${code}/${year}/${seq}`,
        letterNumber: '',
        date: new Date().toISOString().split('T')[0],
        receivedDate: new Date().toISOString().split('T')[0],
        senderReceiver: '',
        subject: '',
        category: 'Undangan',
        urgency: 'Biasa',
        status: 'Baru',
        notes: '',
        dispositions: [],
        file: null
      });
      setSelectedFileObj(null);
    }
    setErrors({});
  }, [initialData, defaultType, letterCount, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.letterNumber.trim()) errs.letterNumber = 'Nomor surat wajib diisi';
    if (!formData.subject.trim()) errs.subject = 'Perihal surat wajib diisi';
    if (!formData.senderReceiver.trim()) {
      errs.senderReceiver = formData.type === 'masuk' ? 'Nama pengirim wajib diisi' : 'Tujuan surat wajib diisi';
    }
    if (!formData.date) errs.date = 'Tanggal surat wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = (file) => {
    setSelectedFileObj(file);
    setFormData((prev) => ({
      ...prev,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        mockSample: false
      }
    }));
  };

  const handleFileRemove = async () => {
    setSelectedFileObj(null);
    if (formData.id) {
      try {
        await dbService.deleteAttachment(formData.id);
      } catch (e) {
        console.error(e);
      }
    }
    setFormData((prev) => ({
      ...prev,
      file: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const letterId = initialData?.id || `${formData.type === 'masuk' ? 'sm' : 'sk'}-${Date.now()}`;
      
      let fileMeta = formData.file;
      if (selectedFileObj) {
        try {
          const savedAttachment = await dbService.saveAttachmentFile(
            letterId,
            selectedFileObj,
            selectedFileObj.name,
            selectedFileObj.type
          );
          fileMeta = {
            name: selectedFileObj.name,
            size: selectedFileObj.size,
            type: selectedFileObj.type,
            mockSample: false,
            hasAttachment: true,
            cloudUrl: savedAttachment?.cloudUrl || null
          };
        } catch (attachErr) {
          console.warn('Attachment upload fallback notice:', attachErr);
          fileMeta = {
            name: selectedFileObj.name,
            size: selectedFileObj.size,
            type: selectedFileObj.type,
            mockSample: false,
            hasAttachment: false
          };
        }
      }

      const letterPayload = {
        ...formData,
        id: letterId,
        file: fileMeta,
        createdAt: initialData?.createdAt || new Date().toISOString()
      };

      await onSave(letterPayload);
      onClose();
    } catch (err) {
      console.error('Error saving letter:', err);
      setErrors({ form: 'Terjadi kesalahan saat menyimpan data surat: ' + (err?.message || '') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-card border border-slate-100 dark:border-slate-800 overflow-hidden my-0 sm:my-6 flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-5 text-slate-800 dark:text-slate-100">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isEdit ? 'Sunting Data Surat Sarpras' : 'Pencatatan Surat Sarpras Baru'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                {isEdit ? `Memperbarui arsip ${formData.agendaNumber}` : 'Lengkapi metadata dan lampiran berkas sarpras'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errors.form && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-2xl">
              {errors.form}
            </div>
          )}

          {/* Type Selector */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jenis Dokumen Surat
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    const year = new Date().getFullYear();
                    const seq = String(letterCount + 1).padStart(3, '0');
                    setFormData({
                      ...formData,
                      type: 'masuk',
                      agendaNumber: `AG/SARPRAS/${year}/${seq}`
                    });
                  }}
                  className={`flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    formData.type === 'masuk'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-soft'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                  <span>Surat Masuk</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const year = new Date().getFullYear();
                    const seq = String(letterCount + 1).padStart(3, '0');
                    setFormData({
                      ...formData,
                      type: 'keluar',
                      agendaNumber: `AGK/SARPRAS/${year}/${seq}`
                    });
                  }}
                  className={`flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    formData.type === 'keluar'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-soft'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-blue-600 stroke-[2.2]" />
                  <span>Surat Keluar</span>
                </button>
              </div>
            </div>
          )}

          {/* Nomor Agenda & Nomor Surat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Agenda / Arsip
              </label>
              <input
                type="text"
                value={formData.agendaNumber}
                onChange={(e) => setFormData({ ...formData, agendaNumber: e.target.value })}
                placeholder="Contoh: AG/SARPRAS/2026/001"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Surat Asli <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.letterNumber}
                onChange={(e) => setFormData({ ...formData, letterNumber: e.target.value })}
                placeholder="Contoh: 005/UND/SARPRAS/II/2026"
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-2xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium ${
                  errors.letterNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200/70 dark:border-slate-700'
                }`}
              />
              {errors.letterNumber && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.letterNumber}</p>
              )}
            </div>
          </div>

          {/* Pengirim / Penerima */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {formData.type === 'masuk' ? 'Pengirim Surat' : 'Tujuan / Penerima Surat'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.senderReceiver}
              onChange={(e) => setFormData({ ...formData, senderReceiver: e.target.value })}
              placeholder={
                formData.type === 'masuk'
                  ? 'Contoh: Fakultas Teknik / BEM / PT PLN'
                  : 'Contoh: Vendor Multimedia / Kepala Bagian'
              }
              className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-2xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium ${
                errors.senderReceiver ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200/70 dark:border-slate-700'
              }`}
            />
            {errors.senderReceiver && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.senderReceiver}</p>
            )}
          </div>

          {/* Perihal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Perihal / Judul Surat <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Contoh: Permohonan Peminjaman Gedung & Proyektor Laser"
              className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-2xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none font-medium ${
                errors.subject ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200/70 dark:border-slate-700'
              }`}
            />
            {errors.subject && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Tanggal Surat & Tanggal Diterima/Dikirim */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Surat <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {formData.type === 'masuk' ? 'Tanggal Diterima' : 'Tanggal Dikirim'}
              </label>
              <input
                type="date"
                value={formData.receivedDate}
                onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              />
            </div>
          </div>

          {/* Kategori, Sifat & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sifat Surat
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              >
                <option value="Biasa" className="dark:bg-slate-900">Biasa</option>
                <option value="Penting" className="dark:bg-slate-900">Penting</option>
                <option value="Segera" className="dark:bg-slate-900">Segera</option>
                <option value="Rahasia" className="dark:bg-slate-900">Rahasia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              >
                <option value="Baru" className="dark:bg-slate-900">Baru</option>
                <option value="Diproses" className="dark:bg-slate-900">Diproses</option>
                <option value="Selesai" className="dark:bg-slate-900">Selesai</option>
                <option value="Diarsipkan" className="dark:bg-slate-900">Diarsipkan</option>
              </select>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Catatan Sarpras
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan fasilitas yang dipinjam, teknisi yang bertugas, atau instruksi awal..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none font-medium"
            />
          </div>

          {/* Upload Berkas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Unggah Berkas Lampiran
            </label>
            <FileUpload
              file={formData.file}
              onFileChange={handleFileChange}
              onFileRemove={handleFileRemove}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-ocazte transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Surat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
