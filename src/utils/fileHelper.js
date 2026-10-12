import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { dbService } from '../services/db';

/**
 * Converts a Base64 data URL to a binary Blob.
 */
export function dataUrlToBlob(dataUrl) {
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binaryStr = atob(parts[1]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } catch (err) {
    console.warn('dataUrlToBlob failed:', err);
    return new Blob([], { type: 'application/octet-stream' });
  }
}

/**
 * Converts a Blob or File to a Base64 data URL.
 */
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Universal file downloader / exporter.
 * Seamlessly handles:
 * - Native Android via Capacitor Filesystem & Share
 * - Mobile Chrome / Safari via Blob Object URLs (bypasses data: URL top-frame block)
 * - Desktop Web via Blob download
 * - Mock sample document generation
 * - On-demand Firestore attachment retrieval if not yet loaded in UI state
 */
export async function downloadAttachment({
  letter,
  file,
  dataUrl,
  blob,
  cloudUrl,
  onProgress
}) {
  const targetFile = file || letter?.file;
  if (!targetFile && !letter) {
    throw new Error('Data surat atau berkas tidak tersedia.');
  }

  const rawFileName = targetFile?.name || 'dokumen_lampiran';
  const cleanFileName = rawFileName.replace(/[/\\?%*:|"<>]/g, '_');
  const mimeType = targetFile?.type || 'application/octet-stream';

  // 1. Handle Mock Sample Documents
  if (targetFile?.mockSample && letter) {
    const sampleContent = `SURAT SARPRAS - ARSIP ELEKTRONIK RESMI
========================================
Nomor Surat: ${letter.letterNumber || '-'}
Nomor Agenda: ${letter.agendaNumber || '-'}
Tanggal: ${letter.date || '-'}
Perihal: ${letter.subject || '-'}
${letter.type === 'masuk' ? 'Pengirim' : 'Penerima'}: ${letter.senderReceiver || '-'}
Kategori: ${letter.category || '-'}
Sifat: ${letter.urgency || '-'}
Status: ${letter.status || '-'}
Catatan: ${letter.notes || '-'}
========================================
Lampiran: ${rawFileName}
Divisi Sarana & Prasarana
Dicetak / Diunduh pada: ${new Date().toLocaleString('id-ID')}
`;
    const textBlob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
    const downloadName = rawFileName.toLowerCase().endsWith('.pdf')
      ? rawFileName.replace(/\.pdf$/i, '.txt')
      : `${rawFileName}.txt`;
    return triggerDownloadBlob(textBlob, downloadName);
  }

  // 2. Resolve source data (blob, dataUrl, or cloudUrl)
  let activeDataUrl = dataUrl;
  let activeBlob = blob;
  let activeCloudUrl = cloudUrl || targetFile?.cloudUrl;

  // If not yet available in caller state, fetch directly from dbService
  if (!activeDataUrl && !activeBlob && letter?.id) {
    if (onProgress) onProgress('Mengambil berkas dari penyimpanan...');
    try {
      const stored = await dbService.getAttachmentFile(letter.id);
      if (stored) {
        if (stored.blob) activeBlob = stored.blob;
        if (stored.dataUrl) activeDataUrl = stored.dataUrl;
        if (stored.cloudUrl) activeCloudUrl = stored.cloudUrl;
      }
    } catch (fetchErr) {
      console.warn('Failed to fetch attachment from dbService:', fetchErr);
    }
  }

  // 3. Fallback: fetch cloudUrl if blob/dataUrl not available
  if (!activeDataUrl && !activeBlob && activeCloudUrl) {
    try {
      if (onProgress) onProgress('Mengunduh berkas dari cloud...');
      const response = await fetch(activeCloudUrl);
      activeBlob = await response.blob();
    } catch (cloudErr) {
      console.warn('Cloud URL fetch error, falling back to window.open:', cloudErr);
      window.open(activeCloudUrl, '_blank');
      return { success: true, method: 'cloud-open' };
    }
  }

  // If still missing, return error
  if (!activeDataUrl && !activeBlob) {
    throw new Error('Data berkas belum ditemukan atau belum selesai dimuat.');
  }

  // Ensure both base64 and blob exist
  if (!activeDataUrl && activeBlob) {
    try {
      activeDataUrl = await blobToDataUrl(activeBlob);
    } catch (convErr) {
      console.warn('blobToDataUrl conversion error:', convErr);
    }
  }
  if (!activeBlob && activeDataUrl) {
    activeBlob = dataUrlToBlob(activeDataUrl);
  }

  // 4. Native Android / Capacitor Handler
  if (Capacitor.isNativePlatform()) {
    try {
      if (onProgress) onProgress('Menyimpan ke perangkat...');
      const base64Content = activeDataUrl
        ? activeDataUrl.split(',')[1]
        : await blobToBase64(activeBlob);

      // Write to Cache directory first for sharing / opening
      const fileResult = await Filesystem.writeFile({
        path: cleanFileName,
        data: base64Content,
        directory: Directory.Cache
      });

      // Launch native Share / Open chooser (supports saving to Downloads, Drive, WhatsApp, viewing in PDF apps)
      try {
        await Share.share({
          title: cleanFileName,
          text: `Berkas Surat: ${cleanFileName}`,
          url: fileResult.uri,
          dialogTitle: `Unduh / Buka ${cleanFileName}`
        });
        return { success: true, method: 'native-share', uri: fileResult.uri };
      } catch (shareErr) {
        // Fallback: write to Documents folder
        await Filesystem.writeFile({
          path: cleanFileName,
          data: base64Content,
          directory: Directory.Documents
        });
        return { success: true, method: 'native-documents' };
      }
    } catch (nativeErr) {
      console.warn('Native download failed, falling back to blob download:', nativeErr);
    }
  }

  // 5. Standard Web & Mobile Browser Handler (Blob Object URL)
  return triggerDownloadBlob(activeBlob, cleanFileName);
}

/**
 * Triggers browser download via Object URL (safe for mobile browsers and large files).
 */
function triggerDownloadBlob(blob, fileName) {
  const objUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = objUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    try {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objUrl);
    } catch {
      // ignore
    }
  }, 2000);

  return { success: true, method: 'blob-download' };
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
