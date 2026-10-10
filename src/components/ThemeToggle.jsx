import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-15 h-8 rounded-full p-1 transition-all duration-300 flex items-center justify-between cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
        isDark
          ? 'bg-slate-800 border border-slate-700/80 shadow-inner'
          : 'bg-slate-200/90 border border-slate-300/60 shadow-inner'
      }`}
      title={isDark ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Malam (Night Mode)'}
      aria-label="Toggle Night Mode / Light Mode"
    >
      {/* Background static icons */}
      <span className="flex items-center justify-center w-6 h-6 z-0">
        <Sun
          className={`w-3.5 h-3.5 transition-opacity duration-200 ${
            isDark ? 'text-slate-500 opacity-60' : 'text-amber-500 opacity-0'
          }`}
        />
      </span>

      <span className="flex items-center justify-center w-6 h-6 z-0">
        <Moon
          className={`w-3.5 h-3.5 transition-opacity duration-200 ${
            isDark ? 'text-indigo-400 opacity-0' : 'text-slate-400 opacity-60'
          }`}
        />
      </span>

      {/* Sliding bullet / knob */}
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md transform transition-all duration-300 ease-in-out ${
          isDark
            ? 'translate-x-7 bg-slate-900 text-indigo-300 border border-slate-700'
            : 'translate-x-0 bg-white text-amber-500 border border-amber-100'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 stroke-[2.2] animate-in spin-in-180 duration-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 stroke-[2.2] animate-in spin-in-180 duration-300" />
        )}
      </div>
    </button>
  );
}
