// System constants and badge configuration matching Ocazte Modern Theme

export const CATEGORIES = [
  'Undangan',
  'Pemberitahuan',
  'Permohonan',
  'Surat Tugas',
  'Nota Dinas',
  'Surat Keputusan',
  'Laporan',
  'Penawaran',
  'Lainnya'
];

export const URGENCY_CONFIG = {
  Biasa: {
    label: 'Biasa',
    bg: 'bg-slate-100 text-slate-700 border-slate-200/80',
    dot: 'bg-slate-400'
  },
  Penting: {
    label: 'Penting',
    bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500'
  },
  Segera: {
    label: 'Segera',
    bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500'
  },
  Rahasia: {
    label: 'Rahasia',
    bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
    dot: 'bg-purple-500'
  }
};

export const STATUS_CONFIG = {
  Baru: {
    label: 'Baru',
    bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-600'
  },
  Diproses: {
    label: 'Diproses',
    bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500'
  },
  Selesai: {
    label: 'Selesai',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-600'
  },
  Diarsipkan: {
    label: 'Diarsipkan',
    bg: 'bg-slate-100 text-slate-600 border-slate-200/80',
    dot: 'bg-slate-400'
  }
};

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
