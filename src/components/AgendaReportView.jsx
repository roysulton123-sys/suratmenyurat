import React, { useState, useMemo } from 'react';
import { Printer, Download, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import { formatDate } from '../utils/constants';

export default function AgendaReportView({ letters = [] }) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredLetters = useMemo(() => {
    return letters.filter((l) => {
      if (typeFilter !== 'all' && l.type !== typeFilter) return false;
      if (dateStart && l.date < dateStart) return false;
      if (dateEnd && l.date > dateEnd) return false;
      return true;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [letters, typeFilter, dateStart, dateEnd]);

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (filteredLetters.length === 0) return;

    const headers = ['No Agenda', 'Jenis', 'Nomor Surat', 'Tanggal Surat', 'Pengirim/Tujuan', 'Perihal', 'Sifat', 'Status', 'Catatan'];
    const rows = filteredLetters.map((l) => [
      `"${l.agendaNumber || ''}"`,
      `"${l.type === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}"`,
      `"${l.letterNumber || ''}"`,
      `"${l.date || ''}"`,
      `"${(l.senderReceiver || '').replace(/"/g, '""')}"`,
      `"${(l.subject || '').replace(/"/g, '""')}"`,
      `"${l.urgency || ''}"`,
      `"${l.status || ''}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_agenda_sarpras_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 font-sans">
      {/* Controls Card */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft print:hidden space-y-4 transition-colors duration-300">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Buku Agenda & Rekapitulasi Surat Sarpras
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400">
            Saring data arsip surat sarana & prasarana berdasarkan periode tanggal untuk dicetak atau diekspor ke Excel / CSV
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              Jenis Dokumen
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
            >
              <option value="all" className="dark:bg-slate-900">Semua Jenis (Masuk & Keluar)</option>
              <option value="masuk" className="dark:bg-slate-900">Hanya Surat Masuk</option>
              <option value="keluar" className="dark:bg-slate-900">Hanya Surat Keluar</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-ocazte transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekap</span>
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl transition"
              title="Unduh Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Agenda Sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft p-6 print:p-2 print:border-none print:shadow-none transition-colors duration-300">
        <div className="text-center pb-4 mb-4 border-b border-slate-900 dark:border-slate-700 print:border-slate-900">
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-900 dark:text-white print:text-slate-900">
            BUKU AGENDA PERSURATAN SARPRAS
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-500 mt-0.5 font-medium">
            Bagian Sarana dan Prasarana
            {typeFilter === 'all'
              ? ' • Surat Masuk & Surat Keluar'
              : typeFilter === 'masuk'
              ? ' • Buku Agenda Surat Masuk'
              : ' • Buku Agenda Surat Keluar'}
            {dateStart || dateEnd
              ? ` • Periode: ${dateStart || 'Awal'} s/d ${dateEnd || 'Sekarang'}`
              : ' • Seluruh Periode'}
          </p>
        </div>

        {filteredLetters.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            Tidak ada arsip surat pada rentang filter yang dipilih.
          </div>
        ) : (
          <>
            {/* Mobile View: Clean Card List (Otomatis Aktif di Layar HP/Mobile) */}
            <div className="space-y-3 block md:hidden print:hidden">
              {filteredLetters.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.agendaNumber}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.type === 'masuk'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {item.type === 'masuk' ? 'Masuk' : 'Keluar'}
                    </span>
                  </div>

                  <p className="font-bold text-slate-800 dark:text-white line-clamp-2">
                    {item.subject}
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                    <p className="truncate">
                      <span className="text-slate-400">{item.type === 'masuk' ? 'Pengirim: ' : 'Tujuan: '}</span>
                      <strong className="text-slate-700 dark:text-slate-200">{item.senderReceiver}</strong>
                    </p>
                    <p className="font-mono text-slate-400 truncate">No: {item.letterNumber}</p>
                    <p className="text-slate-400">Tgl: {formatDate(item.date)}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Sifat: <strong>{item.urgency}</strong>
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop & Print View: Full Table (Otomatis di Desktop/Tablet) */}
            <div className="hidden md:block print:block overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300 dark:border-slate-700 print:border-slate-800 font-sans">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 print:bg-slate-200 text-slate-700 dark:text-slate-200 print:text-slate-700 font-bold border-b border-slate-300 dark:border-slate-700 print:border-slate-800">
                  <th className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 w-10 text-center">No</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 whitespace-nowrap">No. Agenda</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 whitespace-nowrap">Jenis</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 whitespace-nowrap">Nomor Surat</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 whitespace-nowrap">Tanggal</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800">Pengirim / Tujuan</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800">Perihal</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 text-center">Sifat</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredLetters.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 print:hover:bg-transparent">
                    <td className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {item.agendaNumber}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.type === 'masuk'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {item.type === 'masuk' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {item.letterNumber}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {formatDate(item.date)}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                      {item.senderReceiver}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 max-w-xs text-slate-700 dark:text-slate-300">
                      {item.subject}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 text-center text-slate-700 dark:text-slate-300">
                      {item.urgency}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 print:border-slate-800 text-center text-slate-700 dark:text-slate-300">
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

        {/* Footer signature */}
        <div className="hidden print:grid grid-cols-2 text-xs pt-8 text-center font-sans">
          <div>
            <p className="text-slate-500 font-medium">Mengetahui,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">Kepala Bagian Sarpras</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Petugas Arsiparis,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">Pengelola Administrasi Sarana Prasarana</p>
          </div>
        </div>
      </div>
    </div>
  );
}
