import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { dbService } from '../services/db';
import { formatFileSize } from '../utils/constants';

export default function FileViewerModal({ letter, onClose }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const file = letter?.file;

  useEffect(() => {
    let activeUrl = null;
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
        if (stored && stored.blob) {
          activeUrl = URL.createObjectURL(stored.blob);
          setFileUrl(activeUrl);
        } else if (stored && stored.dataUrl) {
          setFileUrl(stored.dataUrl);
        } else if (file.cloudUrl) {
          setFileUrl(file.cloudUrl);
        }
      } catch (err) {
        console.error('Failed to load attachment:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAttachment();

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [letter, file]);

  if (!letter || !file) return null;

  const isImage = file.type?.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');

  const handleDownload = async () => {
    if (fileUrl) {
      if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        try {
          const res = await fetch(fileUrl);
          const blob = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objUrl;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(objUrl);
        } catch {
          window.open(fileUrl, '_blank');
        }
      }
    } else if (file.mockSample) {
      const content = `SURAT SARPRAS - ARSIP ELEKTRONIK RESMI
========================================
Nomor Surat: ${letter.letterNumber}
Nomor Agenda: ${letter.agendaNumber}
Tanggal: ${letter.date}
Perihal: ${letter.subject}
${letter.type === 'masuk' ? 'Pengirim' : 'Penerima'}: ${letter.senderReceiver}
Kategori: ${letter.category}
Sifat: ${letter.urgency}
Status: ${letter.status}
Catatan: ${letter.notes || '-'}
========================================
Lampiran Berkas: ${file.name}
Divisi Sarana & Prasarana
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '.txt');
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-card border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate font-sans">{file.name}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {formatFileSize(file.size)} • {file.type || 'Dokumen'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition shadow-soft"
              title="Unduh Berkas"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </button>
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition shadow-soft hidden sm:inline-flex"
                title="Buka di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tab Baru</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100/70 flex items-center justify-center min-h-[380px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-12">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-semibold">Memuat dokumen...</p>
            </div>
          ) : fileUrl && isImage ? (
            <div className="max-w-full max-h-[70vh] flex items-center justify-center bg-white p-2 rounded-2xl shadow-soft border border-slate-200/60">
              <img
                src={fileUrl}
                alt={file.name}
                className="max-h-[65vh] max-w-full object-contain rounded-xl"
              />
            </div>
          ) : fileUrl && isPdf ? (
            <iframe
              src={fileUrl}
              title={file.name}
              className="w-full h-[68vh] rounded-2xl border border-slate-200 bg-white shadow-soft"
            />
          ) : file.mockSample ? (
            /* Modern Sans-serif Mock Letter Sheet */
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-card border border-slate-200/80 p-6 sm:p-8 text-slate-800 my-auto font-sans">
              {/* Kop Surat Simulasi Sarpras */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-900">
                  {letter.type === 'masuk' ? letter.senderReceiver : 'BAGIAN SARANA DAN PRASARANA (SARPRAS)'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Gedung Rektorat Lt. 2 • Jl. Pendidikan No. 45 • Telp: (021) 789-2211
                </p>
                <div className="h-0.5 bg-slate-900 mt-2"></div>
                <div className="h-px bg-slate-900 mt-0.5"></div>
              </div>

              {/* Detail Surat */}
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
                <div className="text-right text-slate-500 font-semibold">
                  <p>{letter.date}</p>
                </div>
              </div>

              {/* Isi Surat Ringkas */}
              <div className="text-xs leading-relaxed text-slate-700 space-y-3 mb-6">
                <p>Kepada Yth.</p>
                <p className="font-bold text-slate-900">
                  {letter.type === 'masuk' ? 'Koordinator Bagian Sarpras' : letter.senderReceiver}
                </p>
                <p>Di Tempat</p>
                <p className="pt-1">
                  Sehubungan dengan perihal surat di atas, kami sampaikan bahwa arsip ini terdaftar secara resmi dalam sistem administrasi Surat Sarpras nomor agenda{' '}
                  <span className="font-bold text-blue-700">{letter.agendaNumber}</span>.
                </p>
                {letter.notes && (
                  <div className="p-3 bg-blue-50/60 border-l-3 border-blue-600 rounded-r-xl text-xs text-slate-700 font-medium">
                    Catatan Sarpras: &quot;{letter.notes}&quot;
                  </div>
                )}
                <p>Demikian surat ini disampaikan untuk diproses dan ditindaklanjuti sebagaimana mestinya.</p>
              </div>

              {/* Tanda Tangan Simulasi */}
              <div className="flex justify-end pt-2 text-xs">
                <div className="text-center w-52">
                  <p className="text-slate-500 font-medium">Hormat kami,</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-xs text-blue-900 border-b border-blue-200 px-3 font-semibold">
                      [Tanda Tangan Digital Terverifikasi]
                    </span>
                  </div>
                  <p className="font-bold text-slate-800">
                    {letter.type === 'masuk' ? letter.senderReceiver : 'Kepala Bagian Sarana & Prasarana'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-card border border-slate-200 max-w-sm">
              <FileText className="w-12 h-12 text-slate-400 mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Pratinjau langsung tidak tersedia untuk format file ini. Silakan unduh file untuk membukanya.
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition shadow-ocazte"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Sekarang</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
