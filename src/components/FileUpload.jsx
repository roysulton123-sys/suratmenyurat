import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '../utils/constants';

export default function FileUpload({ file, onFileChange, onFileRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleInputChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
      />

      {file ? (
        <div className="flex items-center justify-between p-3.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <File className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                {formatFileSize(file.size)} • {file.type || 'Dokumen lampiran'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <span className="flex items-center text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Terlampir
            </span>
            <button
              type="button"
              onClick={onFileRemove}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition"
              title="Hapus Lampiran"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-2xs">
            <UploadCloud className="w-6 h-6 stroke-[2.2]" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Klik untuk memilih berkas atau seret ke sini
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-0.5">
            Mendukung PDF, Word, Excel, JPG, PNG (Maksimal 25MB)
          </p>
        </div>
      )}
    </div>
  );
}
