import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image as ImageIcon, ExternalLink, Eye, Check, Loader2 } from 'lucide-react';
import { dbService } from '../services/db';
import { formatFileSize } from '../utils/constants';
import { downloadAttachment } from '../utils/fileHelper';
import PdfViewer from './PdfViewer';

export default function FileViewerModal({ letter, onClose }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [dataUrl, setDataUrl] = useState(null);
  const [storedBlob, setStoredBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const file = letter?.file;

  useEffect(() => {
    let activeUrl = null;
    let isCancelled = false;

    async function loadAttachment() {
      if (!letter || !file) {
        setLoading(false);
        return;
      }

      if (file.mockSample) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const stored = await dbService.getAttachmentFile(letter.id);
        if (isCancelled) return;

        if (stored) {
          if (stored.blob) {
            setStoredBlob(stored.blob);
            activeUrl = URL.createObjectURL(stored.blob);
            setFileUrl(activeUrl);
          }
          if (stored.dataUrl) {
            setDataUrl(stored.dataUrl);
            if (!activeUrl) {
              setFileUrl(stored.dataUrl);
            }
          }
        } else if (file.cloudUrl) {
          setFileUrl(file.cloudUrl);
        }
      } catch (err) {
        console.error('Failed to load attachment:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadAttachment();

    return () => {
      isCancelled = true;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [letter, file]);

  if (!letter || !file) return null;

  const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name || '');
  const isPdf = file.type === 'application/pdf' || (file.name || '').toLowerCase().endsWith('.pdf');

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      await downloadAttachment({
        letter,
        file,
        dataUrl,
        blob: storedBlob,
        cloudUrl: fileUrl
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mengunduh berkas: ' + (err.message || 'Silakan coba lagi.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="truncate min-w-0">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm truncate">
                {file.name}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                {formatFileSize(file.size)} • {file.type || 'Dokumen lampiran'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              type="button"
              disabled={downloading}
              onClick={handleDownload}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-2xl transition shadow-soft border ${
                downloadSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
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
              <span className="hidden sm:inline">
                {downloading ? 'Mengunduh...' : downloadSuccess ? 'Tersimpan' : 'Unduh'}
              </span>
            </button>
            {(fileUrl || dataUrl) && (
              <a
                href={fileUrl || dataUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-soft hidden md:inline-flex"
                title="Buka di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tab Baru</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto p-3 sm:p-5 bg-slate-100/70 dark:bg-slate-950/70 flex items-center justify-center min-h-[380px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-12">
              <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Memuat berkas lampiran...</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Mengambil data dokumen surat</p>
            </div>
          ) : isPdf && (dataUrl || fileUrl) ? (
            /* Modern HTML5 Canvas Native PDF Viewer */
            <div className="w-full flex justify-center">
              <PdfViewer
                fileUrl={fileUrl}
                dataUrl={dataUrl}
                fileName={file.name}
                onDownload={handleDownload}
              />
            </div>
          ) : isImage && (fileUrl || dataUrl) ? (
            /* Image Preview */
            <div className="max-w-full max-h-[75vh] flex items-center justify-center bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-800">
              <img
                src={fileUrl || dataUrl}
                alt={file.name}
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-soft"
              />
            </div>
          ) : file.mockSample ? (
            /* Mock Sample Sheet */
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 text-slate-800 dark:text-slate-100 my-auto font-sans">
              <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-6">
                <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  {letter.type === 'masuk' ? letter.senderReceiver : 'BAGIAN SARANA DAN PRASARANA (SARPRAS)'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Gedung Rektorat Lt. 2 • Jl. Pendidikan No. 45 • Telp: (021) 789-2211
                </p>
                <div className="h-0.5 bg-slate-900 dark:bg-slate-100 mt-2"></div>
                <div className="h-px bg-slate-900 dark:bg-slate-100 mt-0.5"></div>
              </div>

              <div className="flex justify-between items-start text-xs mb-6">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-20 text-slate-400 font-semibold">Nomor</span>
                    <span className="font-bold">: {letter.letterNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-slate-400 font-semibold">Sifat</span>
                    <span className="font-medium">: {letter.urgency}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-slate-400 font-semibold">Lampiran</span>
                    <span className="font-medium">: 1 (satu) Berkas Lampiran</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-slate-400 font-semibold">Perihal</span>
                    <span className="font-bold">: {letter.subject}</span>
                  </div>
                </div>
                <div className="text-right text-slate-500 dark:text-slate-400 font-semibold">
                  <p>{letter.date}</p>
                </div>
              </div>

              <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-3 mb-6">
                <p>Kepada Yth.</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {letter.type === 'masuk' ? 'Koordinator Bagian Sarpras' : letter.senderReceiver}
                </p>
                <p>Di Tempat</p>
                <p className="pt-1">
                  Sehubungan dengan perihal surat di atas, kami sampaikan bahwa arsip ini terdaftar secara resmi dalam sistem administrasi Surat Sarpras nomor agenda{' '}
                  <span className="font-bold text-blue-700 dark:text-blue-400">{letter.agendaNumber}</span>.
                </p>
                {letter.notes && (
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 border-l-3 border-blue-600 rounded-r-xl text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Catatan Sarpras: &quot;{letter.notes}&quot;
                  </div>
                )}
                <p>Demikian surat ini disampaikan untuk diproses dan ditindaklanjuti sebagaimana mestinya.</p>
              </div>

              <div className="flex justify-end pt-2 text-xs">
                <div className="text-center w-52">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Hormat kami,</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-xs text-blue-900 dark:text-blue-300 border-b border-blue-200 dark:border-blue-800 px-3 font-semibold">
                      [Tanda Tangan Digital Terverifikasi]
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {letter.type === 'masuk' ? letter.senderReceiver : 'Kepala Bagian Sarana & Prasarana'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Non-previewable Document Formats (Word, Excel, Zip) */
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-card border border-slate-200 dark:border-slate-800 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-full px-2">
                {file.name}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 mb-5">
                Format berkas ini ({file.type || 'Dokumen'}) dapat dibuka langsung dengan mengunduh ke perangkat Anda.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition shadow-ocazte"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas Sekarang</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
