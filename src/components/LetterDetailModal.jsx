import React, { useState } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Printer,
  FileText,
  Calendar,
  Building,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  PlusCircle,
  MessageSquare,
  Paperclip,
  Download,
  Loader2,
  Check
} from 'lucide-react';
import { formatDate, formatDateTime, formatFileSize, STATUS_CONFIG, URGENCY_CONFIG } from '../utils/constants';
import { downloadAttachment } from '../utils/fileHelper';

export default function LetterDetailModal({
  letter,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddDisposition,
  onViewFile,
  onPrintSheet
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !letter) return null;

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      await downloadAttachment({ letter });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mengunduh berkas: ' + (err.message || 'Silakan coba lagi.'));
    } finally {
      setDownloading(false);
    }
  };

  const urgencyStyle = URGENCY_CONFIG[letter.urgency] || URGENCY_CONFIG.Biasa;
  const statusStyle = STATUS_CONFIG[letter.status] || STATUS_CONFIG.Baru;
  const isIncoming = letter.type === 'masuk';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-card border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-5 text-slate-800 dark:text-slate-100">
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
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
            <div>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                {letter.agendaNumber}
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold mt-0.5">
                {isIncoming ? 'Surat Masuk' : 'Surat Keluar'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onPrintSheet(letter)}
              className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Cetak Lembar Disposisi"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(letter)}
              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition"
              title="Sunting Surat"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(letter);
              }}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition"
              title="Hapus Surat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${urgencyStyle.bg}`}
              >
                Sifat: {letter.urgency}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyle.bg}`}
              >
                Status: {letter.status}
              </span>
              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {letter.category}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {letter.subject}
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
              Nomor Surat: <strong className="text-slate-800 dark:text-slate-200">{letter.letterNumber}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/50 dark:border-slate-700">
                <Building className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  {isIncoming ? 'Pengirim' : 'Tujuan Surat'}
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 truncate">
                  {letter.senderReceiver}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/50 dark:border-slate-700">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  Tanggal Surat
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                  {formatDate(letter.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/50 dark:border-slate-700">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  {isIncoming ? 'Diterima Tgl' : 'Dikirim Tgl'}
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                  {formatDate(letter.receivedDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/50 dark:border-slate-700">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  Tgl Input Sistem
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                  {formatDateTime(letter.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Keterangan Dokumen
            </h4>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
              {letter.notes || <span className="text-slate-400 italic">Tidak ada catatan keterangan khusus.</span>}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Berkas Lampiran Digital
            </h4>
            {letter.file ? (
              <div className="flex items-center justify-between p-3.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {letter.file.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {formatFileSize(letter.file.size)} • {letter.file.type || 'Dokumen'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 ml-2 shrink-0">
                  <button
                    type="button"
                    disabled={downloading}
                    onClick={handleDownload}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition shadow-soft ${
                      downloadSuccess
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    title="Unduh Berkas ke Perangkat"
                  >
                    {downloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : downloadSuccess ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{downloading ? 'Mengunduh...' : downloadSuccess ? 'Tersimpan' : 'Unduh'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewFile(letter)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-xl shadow-soft transition"
                    title="Buka Pratinjau Berkas"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Buka Berkas</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                Tidak ada berkas lampiran yang diunggah.
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Catatan & Disposisi ({letter.dispositions?.length || 0})
              </h4>
              <button
                onClick={() => onAddDisposition(letter)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Berikan Arahan</span>
              </button>
            </div>

            {letter.dispositions && letter.dispositions.length > 0 ? (
              <div className="space-y-2">
                {letter.dispositions.map((disp, idx) => (
                  <div
                    key={disp.id || idx}
                    className="p-3 bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 rounded-2xl shadow-soft space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400">
                      <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-200 font-bold">
                        <MessageSquare className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                        <span>{disp.author}</span>
                        <span className="text-slate-300 dark:text-slate-600">➔</span>
                        <span>{disp.target || 'Bagian Terkait'}</span>
                      </div>
                      <span>{disp.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100/80 dark:border-slate-800">
                      &quot;{disp.instruction}&quot;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-xs text-slate-400">
                Belum ada instruksi disposisi lanjutan.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => onPrintSheet(letter)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 shadow-soft transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak Lembar Disposisi</span>
            <span className="sm:hidden">Cetak</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(letter)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-ocazte transition active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
