import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  MessageSquarePlus,
  Paperclip,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { formatDate, STATUS_CONFIG, URGENCY_CONFIG, CATEGORIES } from '../utils/constants';

export default function LetterTable({
  letters = [],
  type = 'masuk',
  onView,
  onEdit,
  onDelete,
  onAddDisposition,
  onViewFile
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const filteredLetters = useMemo(() => {
    return letters.filter((item) => {
      if (item.type !== type) return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchSubject = item.subject?.toLowerCase().includes(query);
        const matchNumber = item.letterNumber?.toLowerCase().includes(query);
        const matchAgenda = item.agendaNumber?.toLowerCase().includes(query);
        const matchSender = item.senderReceiver?.toLowerCase().includes(query);
        const matchNotes = item.notes?.toLowerCase().includes(query);
        if (!matchSubject && !matchNumber && !matchAgenda && !matchSender && !matchNotes) {
          return false;
        }
      }

      if (filterCategory && item.category !== filterCategory) return false;
      if (filterUrgency && item.urgency !== filterUrgency) return false;
      if (filterStatus && item.status !== filterStatus) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
      }
      if (sortBy === 'date_asc') {
        return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
      }
      if (sortBy === 'agenda') {
        return (b.agendaNumber || '').localeCompare(a.agendaNumber || '');
      }
      return 0;
    });
  }, [letters, type, searchTerm, filterCategory, filterUrgency, filterStatus, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterUrgency('');
    setFilterStatus('');
  };

  const hasActiveFilters = Boolean(searchTerm || filterCategory || filterUrgency || filterStatus);

  return (
    <div className="space-y-4 pb-20 md:pb-6 font-sans">
      {/* Filter and Search Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-3.5 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Rounded Input with Search Icon */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Cari surat ${type === 'masuk' ? 'masuk' : 'keluar'} (perihal, pengirim, nomor)...`}
              className="w-full pl-11 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/80 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Quick Filters - Responsive Grid on Mobile, Flex on Desktop */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/80 rounded-2xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium truncate"
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="w-full sm:w-auto px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/80 rounded-2xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium truncate"
            >
              <option value="">Semua Sifat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Segera">Segera</option>
              <option value="Rahasia">Rahasia</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/80 rounded-2xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium truncate"
            >
              <option value="">Semua Status</option>
              <option value="Baru">Baru</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Diarsipkan">Diarsipkan</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="col-span-3 sm:col-auto px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 rounded-2xl transition font-semibold text-center"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Status Count & Sorting Sub-bar (Otomatis tanpa toggle manual) */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            Menampilkan <span className="font-bold text-slate-800 dark:text-white">{filteredLetters.length}</span> berkas
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="date_desc" className="dark:bg-slate-900">Terbaru</option>
              <option value="date_asc" className="dark:bg-slate-900">Terlama</option>
              <option value="agenda" className="dark:bg-slate-900">No. Agenda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredLetters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Layers className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tidak ada dokumen ditemukan</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Silakan sesuaikan kata kunci pencarian atau bersihkan filter di atas.'
              : `Belum ada arsip ${type === 'masuk' ? 'surat masuk' : 'surat keluar'} yang tersimpan.`}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 hover:bg-blue-100 rounded-2xl transition"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <>
          {/* VIEW 1: Mobile Friendly Card List (Otomatis Aktif di Layar HP/Mobile) */}
          <div className="space-y-3 block md:hidden">
            {filteredLetters.map((item) => {
              const isIncoming = item.type === 'masuk';
              const urgencyStyle = URGENCY_CONFIG[item.urgency] || URGENCY_CONFIG.Biasa;
              const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.Baru;

              return (
                <div
                  key={item.id}
                  onClick={() => onView(item)}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
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
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          {item.agendaNumber}
                        </span>
                        <div className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                          {formatDate(item.date)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${urgencyStyle.bg}`}
                      >
                        {item.urgency}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    {item.subject}
                  </h4>

                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    <p className="truncate">
                      <span className="text-slate-400 dark:text-slate-500">{isIncoming ? 'Pengirim: ' : 'Tujuan: '}</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.senderReceiver}</strong>
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      No: {item.letterNumber}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle.bg}`}
                    >
                      {item.status}
                    </span>

                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>

                    {item.file && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewFile(item);
                        }}
                        className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 transition"
                      >
                        <Paperclip className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span className="truncate max-w-[120px]">{item.file.name}</span>
                      </button>
                    )}

                    {item.dispositions && item.dispositions.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                        {item.dispositions.length} Disposisi
                      </span>
                    )}

                    <div
                      className="ml-auto flex items-center space-x-1 pt-1 sm:pt-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddDisposition(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition"
                        title="Beri Keterangan / Disposisi"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition"
                        title="Edit Surat"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition"
                        title="Hapus Surat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VIEW 2: Desktop Table (Otomatis Aktif di Layar Desktop & Tablet) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Agenda & Tanggal</th>
                    <th className="py-3.5 px-4">Nomor & Sifat</th>
                    <th className="py-3.5 px-4">{type === 'masuk' ? 'Pengirim' : 'Tujuan'}</th>
                    <th className="py-3.5 px-4">Perihal</th>
                    <th className="py-3.5 px-4">Lampiran</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredLetters.map((item, index) => {
                    const urgencyStyle = URGENCY_CONFIG[item.urgency] || URGENCY_CONFIG.Biasa;
                    const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.Baru;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        onClick={() => onView(item)}
                      >
                        <td
                          className="py-3.5 px-4 text-center text-slate-400 dark:text-slate-500 text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[11px]">
                            {item.agendaNumber}
                          </span>
                          <div className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                            {formatDate(item.date)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-white">{item.letterNumber}</div>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${urgencyStyle.bg}`}
                            >
                              <span className={`w-1 h-1 rounded-full mr-1 ${urgencyStyle.dot}`} />
                              {item.urgency}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-white line-clamp-1">
                            {item.senderReceiver}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-400 block mt-0.5">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                            {item.subject}
                          </p>
                          {item.dispositions && item.dispositions.length > 0 && (
                            <span className="mt-1 inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 rounded-md px-1.5 py-0.5">
                              {item.dispositions.length} Disposisi
                            </span>
                          )}
                        </td>
                        <td
                          className="py-3.5 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.file ? (
                            <button
                              onClick={() => onViewFile(item)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200/60 dark:border-blue-900/50 rounded-xl transition"
                            >
                              <Paperclip className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span className="truncate max-w-[100px]">{item.file.name}</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-[11px] italic">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle.bg}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td
                          className="py-3.5 px-4 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(item);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddDisposition(item);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition"
                              title="Beri Keterangan"
                            >
                              <MessageSquarePlus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item);
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition"
                              title="Edit Surat"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition"
                              title="Hapus Surat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
