import React from 'react';
import { X, Printer } from 'lucide-react';
import { formatDate } from '../utils/constants';

export default function PrintSheetModal({ letter, isOpen, onClose }) {
  if (!isOpen || !letter) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 print:p-0 print:bg-white print:fixed font-sans">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:border-none print:shadow-none print:my-0 print:max-w-none">
        {/* Controls - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Lembar Disposisi Surat Sarpras
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-ocazte transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="p-8 sm:p-12 text-slate-900 font-sans print:p-4">
          {/* Header Kop Sarpras */}
          <div className="border-b-4 border-double border-slate-900 pb-3 text-center mb-6">
            <h2 className="text-base font-extrabold uppercase tracking-widest text-slate-900">
              KARTU KENDALI & LEMBAR DISPOSISI SURAT SARPRAS
            </h2>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">
              Bagian Sarana dan Prasarana • Manajemen Fasilitas & Aset
            </p>
          </div>

          {/* Table Data */}
          <table className="w-full text-xs border border-slate-900 border-collapse mb-6 font-sans">
            <tbody>
              <tr>
                <td className="border border-slate-900 p-2 font-bold bg-slate-100/60 w-32">
                  Nomor Agenda
                </td>
                <td className="border border-slate-900 p-2 font-mono font-bold text-slate-900 w-1/3">
                  {letter.agendaNumber}
                </td>
                <td className="border border-slate-900 p-2 font-bold bg-slate-100/60 w-28">
                  Sifat Surat
                </td>
                <td className="border border-slate-900 p-2">
                  <div className="flex space-x-3 text-[11px]">
                    <span className={letter.urgency === 'Biasa' ? 'font-bold' : 'text-slate-400'}>
                      [{letter.urgency === 'Biasa' ? '✓' : ' '}] Biasa
                    </span>
                    <span className={letter.urgency === 'Penting' ? 'font-bold' : 'text-slate-400'}>
                      [{letter.urgency === 'Penting' ? '✓' : ' '}] Penting
                    </span>
                    <span className={letter.urgency === 'Segera' ? 'font-bold' : 'text-slate-400'}>
                      [{letter.urgency === 'Segera' ? '✓' : ' '}] Segera
                    </span>
                    <span className={letter.urgency === 'Rahasia' ? 'font-bold' : 'text-slate-400'}>
                      [{letter.urgency === 'Rahasia' ? '✓' : ' '}] Rahasia
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-bold bg-slate-100/60">
                  Nomor Surat Asli
                </td>
                <td className="border border-slate-900 p-2 font-mono font-semibold" colSpan={3}>
                  {letter.letterNumber}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-bold bg-slate-100/60">
                  Tanggal Surat
                </td>
                <td className="border border-slate-900 p-2">{formatDate(letter.date)}</td>
                <td className="border border-slate-900 p-2 font-bold bg-slate-100/60">
                  {letter.type === 'masuk' ? 'Diterima Tgl' : 'Dikirim Tgl'}
                </td>
                <td className="border border-slate-900 p-2">{formatDate(letter.receivedDate)}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-bold bg-slate-100/60">
                  {letter.type === 'masuk' ? 'Asal / Pengirim' : 'Tujuan Surat'}
                </td>
                <td className="border border-slate-900 p-2 font-bold" colSpan={3}>
                  {letter.senderReceiver}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-bold bg-slate-100/60">
                  Perihal
                </td>
                <td className="border border-slate-900 p-2 font-semibold" colSpan={3}>
                  {letter.subject}
                </td>
              </tr>
              {letter.file && (
                <tr>
                  <td className="border border-slate-900 p-2 font-bold bg-slate-100/60">
                    Lampiran Berkas
                  </td>
                  <td className="border border-slate-900 p-2 font-mono" colSpan={3}>
                    {letter.file.name}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Kolom Disposisi Instruksi */}
          <div className="border border-slate-900 p-4 mb-8 min-h-[160px]">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-slate-300 pb-1">
              Petunjuk / Arahan Disposisi Kepala Bagian Sarpras:
            </h4>
            {letter.dispositions && letter.dispositions.length > 0 ? (
              <div className="space-y-3 pt-1">
                {letter.dispositions.map((disp, i) => (
                  <div key={i} className="text-xs border-b border-dashed border-slate-200 pb-2">
                    <div className="flex justify-between font-bold text-[11px] text-slate-700">
                      <span>Dari: {disp.author} ➔ Kepada: {disp.target}</span>
                      <span>({disp.date})</span>
                    </div>
                    <p className="mt-1 font-medium">&quot;{disp.instruction}&quot;</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center text-slate-300 text-xs italic">
                (Ruang catatan disposisi tulisan tangan / paraf pimpinan)
              </div>
            )}
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-2 text-xs pt-4 font-sans">
            <div className="text-center">
              <p className="text-slate-500 font-medium">Petugas Agenda / Arsiparis Sarpras,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">Staf Administrasi Sarpras</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 font-medium">Kepala Bagian Sarana & Prasarana,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">Koordinator Sarpras</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
