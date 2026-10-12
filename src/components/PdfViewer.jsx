import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const CDN_WORKER_URL = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker || CDN_WORKER_URL;
  } catch (e) {
    console.warn('PDF worker init warning:', e);
  }
}

export default function PdfViewer({ fileUrl, dataUrl, fileName, onDownload }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rendering, setRendering] = useState(false);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    async function getDocumentTask(useCdnWorker = false) {
      if (useCdnWorker) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = CDN_WORKER_URL;
      }

      if (dataUrl && dataUrl.startsWith('data:')) {
        const base64 = dataUrl.split(',')[1];
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return pdfjsLib.getDocument({
          data: bytes,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true
        });
      } else if (fileUrl) {
        return pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true
        });
      } else {
        throw new Error('Sumber data PDF tidak ditemukan.');
      }
    }

    async function loadPdf() {
      try {
        let doc = null;
        try {
          const loadingTask = await getDocumentTask(false);
          doc = await loadingTask.promise;
        } catch (initialErr) {
          console.warn('Initial PDF load failed, trying CDN worker fallback:', initialErr);
          const fallbackTask = await getDocumentTask(true);
          doc = await fallbackTask.promise;
        }

        if (isCancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);

        // Auto fit width for initial rendering
        if (containerRef.current) {
          try {
            const firstPage = await doc.getPage(1);
            const containerWidth = containerRef.current.clientWidth - 40;
            const defaultViewport = firstPage.getViewport({ scale: 1.0 });
            if (defaultViewport.width > 0 && containerWidth > 200) {
              const fitRatio = Math.min(Math.max(containerWidth / defaultViewport.width, 0.5), 1.8);
              setScale(Math.round(fitRatio * 10) / 10);
            }
          } catch {
            // ignore
          }
        }

        setLoading(false);
      } catch (err) {
        if (isCancelled) return;
        console.error('PDF load error:', err);
        setError('Gagal membaca dokumen PDF: ' + (err.message || 'Format tidak didukung'));
        setLoading(false);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl, dataUrl]);

  // Render Current Page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let renderTask = null;
    let isCancelled = false;

    async function renderPage() {
      setRendering(true);
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const viewport = page.getViewport({ scale, rotation });
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.warn('Page render warning:', err);
        }
      } finally {
        if (!isCancelled) {
          setRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask && typeof renderTask.cancel === 'function') {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale, rotation]);

  const changePage = (offset) => {
    const next = currentPage + offset;
    if (next >= 1 && next <= numPages) {
      setCurrentPage(next);
    }
  };

  const handleZoom = (delta) => {
    setScale((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.min(Math.max(next, 0.4), 3.0);
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFitWidth = async () => {
    if (!pdfDoc || !containerRef.current) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const containerWidth = containerRef.current.clientWidth - 40;
      const defaultViewport = page.getViewport({ scale: 1.0, rotation });
      if (defaultViewport.width > 0 && containerWidth > 200) {
        const fitRatio = Math.round((containerWidth / defaultViewport.width) * 10) / 10;
        setScale(Math.min(Math.max(fitRatio, 0.4), 2.5));
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-9 h-9 text-blue-600 animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Menyiapkan pratinjau PDF...</p>
        <p className="text-[11px] text-slate-400 mt-1">Merender halaman berkas surat secara langsung</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-sm mx-auto my-auto shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">Tidak Dapat Merender Pratinjau</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{error}</p>
        {onDownload && (
          <button
            onClick={onDownload}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition shadow-ocazte"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Berkas PDF</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full max-w-full">
      {/* Floating Toolbar Controls */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-center gap-1.5 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-card mb-3 text-xs">
        {/* Page navigation */}
        <div className="flex items-center space-x-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => changePage(-1)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-xl transition"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 px-1.5 whitespace-nowrap">
            {currentPage} / {numPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => changePage(1)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-xl transition"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => handleZoom(-0.2)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Perkecil (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 px-1 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(0.2)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Perbesar (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Fit width & rotate */}
        <div className="flex items-center space-x-1 border-l border-slate-200 dark:border-slate-700 pl-2 ml-1">
          <button
            type="button"
            onClick={handleFitWidth}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition hidden sm:inline-flex"
            title="Sesuaikan Lebar Layar"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Putar Dokumen (90°)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Wrapper */}
      <div className="relative overflow-auto max-w-full flex justify-center items-center p-2 rounded-2xl bg-slate-200/50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800">
        {rendering && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-10 rounded-2xl">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="rounded-xl shadow-card bg-white transition-all max-w-full"
        />
      </div>
    </div>
  );
}
