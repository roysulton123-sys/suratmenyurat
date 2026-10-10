// Unified Cloud Firebase (Firestore & Storage) + Local IndexedDB Cache Service
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './firebase';

const DB_NAME = 'SuratSarprasDB';
const DB_VERSION = 1;
const STORE_LETTERS = 'letters';
const STORE_ATTACHMENTS = 'attachments';

// Initial realistic Sarpras mock data
const INITIAL_DATA = [
  {
    id: 'sm-001',
    type: 'masuk',
    agendaNumber: 'AG/SARPRAS/2026/001',
    letterNumber: '028/BEM/UNIV/II/2026',
    date: '2026-02-15',
    receivedDate: '2026-02-16',
    senderReceiver: 'Badan Eksekutif Mahasiswa (BEM)',
    subject: 'Permohonan Peminjaman Gedung Serbaguna & Sound System Seminar Nasional',
    category: 'Permohonan',
    urgency: 'Penting',
    status: 'Diproses',
    notes: 'Jadwal peminjaman tanggal 25-26 Februari 2026. Diperlukan 2 mikrofon wireless dan 1 proyektor laser.',
    dispositions: [
      {
        id: 'disp-1',
        date: '2026-02-16 10:30',
        author: 'Koordinator Sarpras',
        instruction: 'Cek ketersediaan gedung pada tanggal tersebut dan siapkan teknisi sound system.',
        target: 'Sub-bagian Pemeliharaan Gedung'
      }
    ],
    file: {
      name: 'Surat_Permohonan_Pinjam_Gedung_BEM.pdf',
      size: 345000,
      type: 'application/pdf',
      mockSample: true
    },
    createdAt: '2026-02-16T10:00:00.000Z'
  },
  {
    id: 'sm-002',
    type: 'masuk',
    agendaNumber: 'AG/SARPRAS/2026/002',
    letterNumber: '112/DIR-OPS/PLN/II/2026',
    date: '2026-02-18',
    receivedDate: '2026-02-19',
    senderReceiver: 'PT PLN (Persero) Distribusi Utama',
    subject: 'Pemberitahuan Pemeliharaan Berkala Gardu Listrik & Genset Gedung B',
    category: 'Pemberitahuan',
    urgency: 'Biasa',
    status: 'Selesai',
    notes: 'Pemeliharaan dijadwalkan hari Sabtu, 28 Februari 2026 pukul 08:00 - 15:00 WIB.',
    dispositions: [
      {
        id: 'disp-2',
        date: '2026-02-19 14:15',
        author: 'Kasubag Sarpras',
        instruction: 'Pastikan genset cadangan beroperasi normal selama pemadaman listrik berkala.',
        target: 'Teknisi Kelistrikan & Genset'
      }
    ],
    file: {
      name: 'Pemberitahuan_Pemeliharaan_PLN.pdf',
      size: 198000,
      type: 'application/pdf',
      mockSample: true
    },
    createdAt: '2026-02-19T09:30:00.000Z'
  },
  {
    id: 'sk-001',
    type: 'keluar',
    agendaNumber: 'AGK/SARPRAS/2026/001',
    letterNumber: '421.2/088/SARPRAS/II/2026',
    date: '2026-02-20',
    receivedDate: '2026-02-20',
    senderReceiver: 'PT Media Prima Multimedia (Vendor IT)',
    subject: 'Permohonan Pengadaan dan Instalasi 30 Unit PC Laboratorium Komputer',
    category: 'Permohonan',
    urgency: 'Penting',
    status: 'Selesai',
    notes: 'Spesifikasi CPU Core i7, RAM 16GB, SSD 512GB, dan monitor 24 inci sesuai e-Katalog.',
    dispositions: [
      {
        id: 'disp-3',
        date: '2026-02-20 16:00',
        author: 'Kepala Bagian Sarpras',
        instruction: 'Surat resmi telah dikirim ke rekanan vendor. Lakukan verifikasi faktur setelah barang tiba.',
        target: 'Pengelola Aset & Inventaris'
      }
    ],
    file: {
      name: 'Surat_Pengadaan_PC_Laboratorium.pdf',
      size: 420000,
      type: 'application/pdf',
      mockSample: true
    },
    createdAt: '2026-02-20T11:00:00.000Z'
  },
  {
    id: 'sm-003',
    type: 'masuk',
    agendaNumber: 'AG/SARPRAS/2026/003',
    letterNumber: '089/DEK-FT/UND/I/2026',
    date: '2026-02-22',
    receivedDate: '2026-02-23',
    senderReceiver: 'Fakultas Teknik - Jurusan Mesin',
    subject: 'Pengajuan Perbaikan & Servis Berkala 12 Unit AC Central Ruang Kuliah',
    category: 'Permohonan',
    urgency: 'Segera',
    status: 'Diproses',
    notes: 'AC di ruang 301, 302, dan 305 mengalami kebocoran freon dan kurang dingin.',
    dispositions: [
      {
        id: 'disp-4',
        date: '2026-02-23 09:00',
        author: 'Koordinator Sarpras',
        instruction: 'Jadwalkan teknisi vendor servis pendingin ruangan hari Rabu besok.',
        target: 'Teknisi Pemeliharaan AC'
      }
    ],
    file: {
      name: 'Pengajuan_Servis_AC_Ruang_Kuliah.pdf',
      size: 512000,
      type: 'application/pdf',
      mockSample: true
    },
    createdAt: '2026-02-23T08:45:00.000Z'
  },
  {
    id: 'sk-002',
    type: 'keluar',
    agendaNumber: 'AGK/SARPRAS/2026/002',
    letterNumber: '800/094/ST-SARPRAS/II/2026',
    date: '2026-02-25',
    receivedDate: '2026-02-25',
    senderReceiver: 'Tim Teknisi Pemeliharaan Sarpras',
    subject: 'Surat Perintah Tugas Inspeksi Kelayakan Fasilitas Gedung dan Lift Kampus',
    category: 'Surat Tugas',
    urgency: 'Biasa',
    status: 'Selesai',
    notes: 'Pemeriksaan keselamatan dan kelayakan teknis lift Gedung Rektorat dan Gedung Kuliah.',
    dispositions: [],
    file: {
      name: 'Surat_Tugas_Inspeksi_Lift.pdf',
      size: 280000,
      type: 'application/pdf',
      mockSample: true
    },
    createdAt: '2026-02-25T14:20:00.000Z'
  }
];

// Local IndexedDB fallback
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbObj = event.target.result;
      if (!dbObj.objectStoreNames.contains(STORE_LETTERS)) {
        dbObj.createObjectStore(STORE_LETTERS, { keyPath: 'id' });
      }
      if (!dbObj.objectStoreNames.contains(STORE_ATTACHMENTS)) {
        dbObj.createObjectStore(STORE_ATTACHMENTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const dbService = {
  // Check if online cloud Firebase is active
  isFirebaseActive: true,

  // Synchronous cache reader for 0ms instant startup without stuck screen
  getInitialLettersSync() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('sarpras_letters_sync_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Sync cache read error:', e);
    }
    return INITIAL_DATA;
  },

  // Real-time listener for Firestore collection with Instant Local Cache Fallback
  subscribeLetters(onUpdate, onError) {
    // 1. Immediately provide synchronous cache so UI is ready in 0ms
    const initialSync = this.getInitialLettersSync();
    if (initialSync && initialSync.length > 0) {
      onUpdate(initialSync, false);
    }

    // 2. Also check IndexedDB asynchronously in case it has updated offline data
    this.getLocalLetters().then((local) => {
      if (local && local.length > 0) {
        onUpdate(local, false);
      }
    }).catch(() => {
      onUpdate(INITIAL_DATA, false);
    });

    try {
      const lettersCol = collection(db, 'letters');
      const unsubscribe = onSnapshot(
        lettersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = [];
            snapshot.forEach((d) => items.push(d.data()));
            items.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
            this.isFirebaseActive = true;
            this.saveToLocalCache(items);
            onUpdate(items, true);
          } else {
            // Firestore is connected but collection is empty -> seed it
            this.seedInitialData().then((seeded) => {
              this.saveToLocalCache(seeded);
              onUpdate(seeded, true);
            }).catch(() => {
              this.getLocalLetters().then((local) => onUpdate(local, false));
            });
          }
        },
        (error) => {
          console.warn('Firebase onSnapshot warning (using local cache):', error.message);
          this.isFirebaseActive = false;
          if (onError) onError(error);
          this.getLocalLetters().then((local) => onUpdate(local, false));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to subscribe to Firebase:', err);
      this.isFirebaseActive = false;
      if (onError) onError(err);
      this.getLocalLetters().then((local) => onUpdate(local, false));
      return () => {};
    }
  },

  async getAllLetters() {
    // Try Firestore first
    try {
      const lettersCol = collection(db, 'letters');
      const snapshot = await getDocs(lettersCol);
      if (!snapshot.empty) {
        const results = [];
        snapshot.forEach((docSnap) => results.push(docSnap.data()));
        results.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        this.isFirebaseActive = true;
        // Update local cache
        this.saveToLocalCache(results);
        return results;
      } else {
        // Firestore is empty, seed it
        return await this.seedInitialData();
      }
    } catch (error) {
      console.warn('Firebase getDocs error, falling back to IndexedDB:', error.message);
      this.isFirebaseActive = false;
      return await this.getLocalLetters();
    }
  },

  async getLocalLetters() {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return INITIAL_DATA;
      }
      const idb = await openDB();
      return new Promise((resolve) => {
        try {
          const transaction = idb.transaction(STORE_LETTERS, 'readonly');
          const store = transaction.objectStore(STORE_LETTERS);
          const request = store.getAll();

          request.onsuccess = () => {
            let results = request.result;
            if (!results || results.length === 0) {
              this.seedInitialData().then((seeded) => resolve(seeded)).catch(() => resolve(INITIAL_DATA));
            } else {
              results.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
              resolve(results);
            }
          };
          request.onerror = () => resolve(INITIAL_DATA);
        } catch {
          resolve(INITIAL_DATA);
        }
      });
    } catch {
      return INITIAL_DATA;
    }
  },

  async saveToLocalCache(lettersList) {
    try {
      if (typeof window !== 'undefined' && window.localStorage && Array.isArray(lettersList)) {
        try {
          // Keep a lightweight synchronous copy for 0ms cold starts (omit giant base64 data)
          const slim = lettersList.map((l) => {
            if (l.file && l.file.base64 && l.file.base64.length > 50000) {
              const { base64, ...restFile } = l.file;
              return { ...l, file: restFile };
            }
            return l;
          });
          localStorage.setItem('sarpras_letters_sync_cache', JSON.stringify(slim));
        } catch (storageErr) {
          console.warn('LocalStorage cache write error:', storageErr);
        }
      }

      const idb = await openDB();
      const transaction = idb.transaction(STORE_LETTERS, 'readwrite');
      const store = transaction.objectStore(STORE_LETTERS);
      for (const item of lettersList) {
        store.put(item);
      }
    } catch (e) {
      console.error('Failed to cache letters locally:', e);
    }
  },

  async seedInitialData() {
    try {
      const idb = await openDB();
      const transaction = idb.transaction(STORE_LETTERS, 'readwrite');
      const store = transaction.objectStore(STORE_LETTERS);
      for (const item of INITIAL_DATA) {
        store.put(item);
      }
    } catch (e) {
      console.warn('Local seed error:', e);
    }

    // Background asynchronous seeding to Firestore without blocking UI
    Promise.all(INITIAL_DATA.map(item => setDoc(doc(db, 'letters', item.id), item)))
      .then(() => { this.isFirebaseActive = true; })
      .catch((err) => console.warn('Firestore seeding notice:', err.message));

    return INITIAL_DATA;
  },

  async saveLetter(letter) {
    const letterData = {
      ...letter,
      updatedAt: new Date().toISOString()
    };

    // 1. Save to Firebase Firestore
    try {
      await setDoc(doc(db, 'letters', letter.id), letterData);
      this.isFirebaseActive = true;
    } catch (err) {
      console.warn('Failed to save to Firestore (saved to local cache):', err.message);
    }

    // 2. Save to local IndexedDB
    const idb = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(STORE_LETTERS, 'readwrite');
      const store = transaction.objectStore(STORE_LETTERS);
      const request = store.put(letterData);
      request.onsuccess = () => resolve(letterData);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteLetter(id) {
    // 1. Delete from Firebase Firestore
    try {
      await deleteDoc(doc(db, 'letters', id));
    } catch (err) {
      console.warn('Failed to delete from Firestore:', err.message);
    }

    // 2. Delete from local IndexedDB
    const idb = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction([STORE_LETTERS, STORE_ATTACHMENTS], 'readwrite');
      transaction.objectStore(STORE_LETTERS).delete(id);
      transaction.objectStore(STORE_ATTACHMENTS).delete(id);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async saveAttachmentFile(letterId, fileBlob, fileName, fileType) {
    let cloudDownloadUrl = null;

    // 1. Try uploading to Firebase Cloud Storage
    try {
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = ref(storage, `attachments/${letterId}_${cleanFileName}`);
      const uploadResult = await uploadBytes(fileRef, fileBlob);
      cloudDownloadUrl = await getDownloadURL(uploadResult.ref);
    } catch (err) {
      console.warn('Firebase Storage upload notice (using local storage):', err.message);
    }

    // 2. Save locally to IndexedDB as reliable cache
    const idb = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(STORE_ATTACHMENTS, 'readwrite');
      const store = transaction.objectStore(STORE_ATTACHMENTS);
      const data = {
        id: letterId,
        blob: fileBlob,
        name: fileName,
        type: fileType,
        cloudUrl: cloudDownloadUrl,
        uploadedAt: new Date().toISOString()
      };
      const request = store.put(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  },

  async getAttachmentFile(letterId) {
    const idb = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(STORE_ATTACHMENTS, 'readonly');
      const store = transaction.objectStore(STORE_ATTACHMENTS);
      const request = store.get(letterId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteAttachment(letterId) {
    // Try delete from Firebase Storage
    try {
      const fileRef = ref(storage, `attachments/${letterId}`);
      await deleteObject(fileRef);
    } catch (err) {
      // ignore
    }

    // Delete from IndexedDB
    const idb = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(STORE_ATTACHMENTS, 'readwrite');
      const store = transaction.objectStore(STORE_ATTACHMENTS);
      const request = store.delete(letterId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async resetData() {
    // Reset Firestore if possible
    try {
      const lettersCol = collection(db, 'letters');
      const snapshot = await getDocs(lettersCol);
      for (const d of snapshot.docs) {
        await deleteDoc(d.ref);
      }
    } catch (err) {
      console.warn('Reset Firestore error:', err);
    }

    // Reset IndexedDB
    const idb = await openDB();
    const transaction = idb.transaction([STORE_LETTERS, STORE_ATTACHMENTS], 'readwrite');
    transaction.objectStore(STORE_LETTERS).clear();
    transaction.objectStore(STORE_ATTACHMENTS).clear();
    return new Promise((resolve) => {
      transaction.oncomplete = async () => {
        const seeded = await this.seedInitialData();
        resolve(seeded);
      };
    });
  }
};
