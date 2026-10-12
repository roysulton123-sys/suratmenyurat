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
const DB_VERSION = 2;
const STORE_LETTERS = 'letters';
const STORE_ATTACHMENTS = 'attachments';

const PENDING_UPLOADS_KEY = 'sarpras_pending_uploads';
const PENDING_DELETES_KEY = 'sarpras_pending_deletes';
const DELETED_IDS_KEY = 'sarpras_deleted_ids';

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

// Local IndexedDB storage
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
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
  // Cloud connectivity and sync state
  isFirebaseActive: false,
  syncStatus: 'connecting', // 'connected' | 'permission_denied' | 'offline' | 'connecting'
  lastSyncTime: null,
  lastError: null,
  syncListeners: new Set(),
  activeUnsubscribe: null,
  retryTimer: null,

  // Persistent blacklist for deleted letter IDs
  getDeletedIds() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = localStorage.getItem(DELETED_IDS_KEY);
        return new Set(val ? JSON.parse(val) : []);
      }
    } catch {
      // ignore
    }
    return new Set();
  },

  addDeletedId(id) {
    if (!id) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const set = this.getDeletedIds();
        set.add(id);
        localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
      }
    } catch {
      // ignore
    }
  },

  removeDeletedId(id) {
    if (!id) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const set = this.getDeletedIds();
        if (set.has(id)) {
          set.delete(id);
          localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
        }
      }
    } catch {
      // ignore
    }
  },

  // Subscribe to sync status changes
  onSyncStatusChange(callback) {
    this.syncListeners.add(callback);
    callback(this.getSyncState());
    return () => this.syncListeners.delete(callback);
  },

  notifySyncState() {
    const state = this.getSyncState();
    this.syncListeners.forEach((cb) => {
      try {
        cb(state);
      } catch (e) {
        console.warn('Sync listener error:', e);
      }
    });
  },

  getSyncState() {
    const pendingUploads = this.getPendingUploads();
    const pendingDeletes = this.getPendingDeletes();
    return {
      isFirebaseActive: this.isFirebaseActive,
      status: this.syncStatus,
      lastSyncTime: this.lastSyncTime,
      pendingCount: pendingUploads.length + pendingDeletes.length,
      pendingUploadsCount: pendingUploads.length,
      pendingDeletesCount: pendingDeletes.length,
      lastError: this.lastError
    };
  },

  // Queue helper methods
  getPendingUploads() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = localStorage.getItem(PENDING_UPLOADS_KEY);
        return val ? JSON.parse(val) : [];
      }
    } catch {
      // ignore
    }
    return [];
  },

  addPendingUpload(id) {
    if (!id) return;
    try {
      const list = this.getPendingUploads();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  },

  removePendingUpload(id) {
    if (!id) return;
    try {
      const list = this.getPendingUploads().filter((item) => item !== id);
      localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  },

  clearPendingUploads() {
    try {
      localStorage.removeItem(PENDING_UPLOADS_KEY);
    } catch {
      // ignore
    }
  },

  getPendingDeletes() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = localStorage.getItem(PENDING_DELETES_KEY);
        return val ? JSON.parse(val) : [];
      }
    } catch {
      // ignore
    }
    return [];
  },

  addPendingDelete(id) {
    if (!id) return;
    try {
      const list = this.getPendingDeletes();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(PENDING_DELETES_KEY, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  },

  removePendingDelete(id) {
    if (!id) return;
    try {
      const list = this.getPendingDeletes().filter((item) => item !== id);
      localStorage.setItem(PENDING_DELETES_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  },

  clearPendingDeletes() {
    try {
      localStorage.removeItem(PENDING_DELETES_KEY);
    } catch {
      // ignore
    }
  },

  // Synchronous cache reader for 0ms instant startup without stuck screen
  getInitialLettersSync() {
    try {
      const deletedIds = this.getDeletedIds();
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('sarpras_letters_sync_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            return parsed.filter((l) => !deletedIds.has(l.id));
          }
        }
      }
      return INITIAL_DATA.filter((l) => !deletedIds.has(l.id));
    } catch (e) {
      console.warn('Sync cache read error:', e);
    }
    return INITIAL_DATA.filter((l) => !this.getDeletedIds().has(l.id));
  },

  // Test live connection to Firestore
  async testConnection() {
    try {
      const lettersCol = collection(db, 'letters');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Koneksi waktu habis (Timeout)')), 6000)
      );
      const snapshot = await Promise.race([getDocs(lettersCol), timeoutPromise]);

      this.isFirebaseActive = true;
      this.syncStatus = 'connected';
      this.lastSyncTime = new Date().toISOString();
      this.lastError = null;
      this.notifySyncState();
      return { success: true, count: snapshot.docs.length };
    } catch (err) {
      this.isFirebaseActive = false;
      this.lastError = err?.message || 'Gagal terhubung ke Firebase';
      if (err?.code === 'permission-denied') {
        this.syncStatus = 'permission_denied';
      } else {
        this.syncStatus = 'offline';
      }
      this.notifySyncState();
      return {
        success: false,
        code: err?.code || 'UNKNOWN',
        message: err?.message || 'Koneksi gagal'
      };
    }
  },

  // Real-time listener for Firestore collection with Instant Local Cache Fallback & Background Auto-Sync
  subscribeLetters(onUpdate, onError) {
    const deletedIds = this.getDeletedIds();

    // 1. Immediately provide synchronous cache so UI is ready in 0ms
    const initialSync = this.getInitialLettersSync();
    if (initialSync && initialSync.length > 0) {
      onUpdate(initialSync, false);
    }

    // 2. Check IndexedDB asynchronously
    this.getLocalLetters()
      .then((local) => {
        if (local && local.length > 0) {
          onUpdate(local.filter((l) => !deletedIds.has(l.id)), false);
        }
      })
      .catch(() => {
        onUpdate(INITIAL_DATA.filter((l) => !deletedIds.has(l.id)), false);
      });

    let currentUnsubscribe = null;
    let isSubscribed = true;

    const connectListener = () => {
      if (!isSubscribed) return;

      try {
        const lettersCol = collection(db, 'letters');
        if (currentUnsubscribe) {
          try {
            currentUnsubscribe();
          } catch {
            // ignore
          }
        }

        currentUnsubscribe = onSnapshot(
          lettersCol,
          async (snapshot) => {
            if (!isSubscribed) return;
            this.isFirebaseActive = true;
            this.syncStatus = 'connected';
            this.lastSyncTime = new Date().toISOString();
            this.lastError = null;
            this.notifySyncState();

            const currentDeletedIds = this.getDeletedIds();

            if (!snapshot.empty) {
              const items = [];
              snapshot.forEach((d) => {
                const data = d.data();
                if (!currentDeletedIds.has(data.id)) {
                  items.push(data);
                } else {
                  // Silently remove deleted item from Firestore in background
                  deleteDoc(doc(db, 'letters', data.id)).catch(() => {});
                }
              });

              items.sort(
                (a, b) =>
                  new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
              );

              // Background reconciliation: push any pending local items to cloud
              this.reconcileLocalPendingToCloud(items).catch(() => {});

              await this.saveToLocalCache(items);
              onUpdate(items, true);
            } else {
              // Firestore is connected but empty -> migrate local data to cloud
              try {
                const localLetters = await this.getLocalLetters();
                const toUpload =
                  localLetters && localLetters.length > 0
                    ? localLetters.filter((l) => !currentDeletedIds.has(l.id))
                    : INITIAL_DATA.filter((l) => !currentDeletedIds.has(l.id));

                if (toUpload.length > 0) {
                  await Promise.all(
                    toUpload.map((item) => setDoc(doc(db, 'letters', item.id), item))
                  );
                }
                await this.saveToLocalCache(toUpload);
                onUpdate(toUpload, true);
              } catch (seedErr) {
                console.warn('Firestore seeding notice:', seedErr);
                const local = await this.getLocalLetters();
                onUpdate(local.filter((l) => !currentDeletedIds.has(l.id)), false);
              }
            }
          },
          (error) => {
            if (!isSubscribed) return;
            console.warn('Firebase onSnapshot notice:', error.message);
            this.isFirebaseActive = false;
            if (error.code === 'permission-denied') {
              this.syncStatus = 'permission_denied';
            } else {
              this.syncStatus = 'offline';
            }
            this.lastError = error.message;
            this.notifySyncState();

            if (onError) onError(error);
            this.getLocalLetters().then((local) => {
              const currentDeletedIds = this.getDeletedIds();
              onUpdate(local.filter((l) => !currentDeletedIds.has(l.id)), false);
            });

            // Schedule auto-reconnect retry every 15 seconds
            clearTimeout(this.retryTimer);
            this.retryTimer = setTimeout(() => {
              if (isSubscribed) {
                connectListener();
              }
            }, 15000);
          }
        );
      } catch (err) {
        console.warn('Failed to subscribe to Firebase:', err);
        this.isFirebaseActive = false;
        this.syncStatus = err.code === 'permission-denied' ? 'permission_denied' : 'offline';
        this.lastError = err.message;
        this.notifySyncState();

        if (onError) onError(err);
        this.getLocalLetters().then((local) => {
          const currentDeletedIds = this.getDeletedIds();
          onUpdate(local.filter((l) => !currentDeletedIds.has(l.id)), false);
        });

        clearTimeout(this.retryTimer);
        this.retryTimer = setTimeout(() => {
          if (isSubscribed) {
            connectListener();
          }
        }, 15000);
      }
    };

    connectListener();

    // Automatic Background Auto-Sync Loop (runs completely in background without any buttons)
    const autoSyncTimer = setInterval(async () => {
      if (!isSubscribed) return;
      try {
        const pendingUploads = this.getPendingUploads();
        const pendingDeletes = this.getPendingDeletes();
        // If there are pending changes or if connection status needs refresh, sync automatically
        if (pendingUploads.length > 0 || pendingDeletes.length > 0 || !this.isFirebaseActive) {
          const res = await this.syncLocalToCloud();
          if (res.success && res.letters && isSubscribed) {
            const currentDeleted = this.getDeletedIds();
            onUpdate(res.letters.filter((l) => !currentDeleted.has(l.id)), true);
          }
        }
      } catch {
        // silent background failure
      }
    }, 10000);

    // Reconnect and auto-sync immediately when window gains focus or online event fires
    const handleWindowFocus = () => {
      connectListener();
      this.syncLocalToCloud().then((res) => {
        if (res.success && res.letters && isSubscribed) {
          const currentDeleted = this.getDeletedIds();
          onUpdate(res.letters.filter((l) => !currentDeleted.has(l.id)), true);
        }
      }).catch(() => {});
    };

    const handleOnline = () => {
      connectListener();
      this.syncLocalToCloud().then((res) => {
        if (res.success && res.letters && isSubscribed) {
          const currentDeleted = this.getDeletedIds();
          onUpdate(res.letters.filter((l) => !currentDeleted.has(l.id)), true);
        }
      }).catch(() => {});
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleWindowFocus);
      window.addEventListener('online', handleOnline);
    }

    return () => {
      isSubscribed = false;
      clearTimeout(this.retryTimer);
      clearInterval(autoSyncTimer);
      if (currentUnsubscribe) {
        try {
          currentUnsubscribe();
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleWindowFocus);
        window.removeEventListener('online', handleOnline);
      }
    };
  },

  // Upload any local items that haven't been synced to Firestore yet
  async reconcileLocalPendingToCloud(remoteLetters) {
    try {
      const deletedIds = this.getDeletedIds();
      const pendingUploads = this.getPendingUploads();
      const pendingDeletes = this.getPendingDeletes();

      // Process pending deletes
      for (const delId of [...pendingDeletes, ...deletedIds]) {
        try {
          await deleteDoc(doc(db, 'letters', delId));
          this.removePendingDelete(delId);
        } catch {
          // ignore
        }
      }

      const remoteIds = new Set(remoteLetters.map((l) => l.id));
      const localLetters = await this.getLocalLetters();

      for (const local of localLetters) {
        if (deletedIds.has(local.id)) continue;
        if (!remoteIds.has(local.id) || pendingUploads.includes(local.id)) {
          try {
            await setDoc(doc(db, 'letters', local.id), local);
            this.removePendingUpload(local.id);
          } catch (e) {
            console.warn('Pending upload sync notice:', e);
          }
        }
      }
    } catch (e) {
      console.warn('Reconcile error:', e);
    }
  },

  // Background Full Auto-Sync & Reconciliation
  async syncLocalToCloud() {
    this.syncStatus = 'connecting';
    this.notifySyncState();

    // 1. Live ping test
    const testResult = await this.testConnection();
    if (!testResult.success) {
      return {
        success: false,
        code: testResult.code,
        message: testResult.message
      };
    }

    try {
      const deletedIds = this.getDeletedIds();

      // 2. Process all pending deletes
      const pendingDeletes = this.getPendingDeletes();
      for (const delId of [...pendingDeletes, ...deletedIds]) {
        try {
          await deleteDoc(doc(db, 'letters', delId));
          this.removePendingDelete(delId);
        } catch {
          // ignore
        }
      }

      // 3. Fetch remote docs
      const lettersCol = collection(db, 'letters');
      const remoteSnapshot = await getDocs(lettersCol);
      const remoteMap = new Map();
      remoteSnapshot.forEach((d) => {
        if (!deletedIds.has(d.id)) {
          remoteMap.set(d.id, d.data());
        } else {
          deleteDoc(doc(db, 'letters', d.id)).catch(() => {});
        }
      });

      // 4. Fetch local letters
      const localLetters = await this.getLocalLetters();
      const localMap = new Map();
      localLetters.forEach((l) => {
        if (!deletedIds.has(l.id)) {
          localMap.set(l.id, l);
        }
      });

      const mergedMap = new Map();

      // If remote is empty, seed active local letters
      if (remoteMap.size === 0) {
        const toUpload = localLetters.filter((l) => !deletedIds.has(l.id));
        for (const item of toUpload) {
          await setDoc(doc(db, 'letters', item.id), item);
          mergedMap.set(item.id, item);
        }
      } else {
        // Upload any local letter not present in remote or newer
        for (const [id, localItem] of localMap.entries()) {
          if (deletedIds.has(id)) continue;
          const remoteItem = remoteMap.get(id);
          if (!remoteItem) {
            await setDoc(doc(db, 'letters', id), localItem);
            mergedMap.set(id, localItem);
          } else {
            const localDate = new Date(localItem.updatedAt || localItem.createdAt || 0);
            const remoteDate = new Date(remoteItem.updatedAt || remoteItem.createdAt || 0);
            if (localDate > remoteDate) {
              await setDoc(doc(db, 'letters', id), localItem);
              mergedMap.set(id, localItem);
            } else {
              mergedMap.set(id, remoteItem);
            }
          }
        }

        // Include any remote letters not present in local
        for (const [id, remoteItem] of remoteMap.entries()) {
          if (deletedIds.has(id)) continue;
          if (!mergedMap.has(id)) {
            mergedMap.set(id, remoteItem);
          }
        }
      }

      // 5. Clear pending upload queues
      this.clearPendingUploads();
      this.clearPendingDeletes();

      // 6. Save merged list locally
      const mergedList = Array.from(mergedMap.values())
        .filter((l) => !deletedIds.has(l.id))
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

      await this.saveToLocalCache(mergedList);

      this.isFirebaseActive = true;
      this.syncStatus = 'connected';
      this.lastSyncTime = new Date().toISOString();
      this.lastError = null;
      this.notifySyncState();

      return {
        success: true,
        count: mergedList.length,
        letters: mergedList
      };
    } catch (err) {
      console.error('syncLocalToCloud failed:', err);
      this.lastError = err.message;
      if (err.code === 'permission-denied') {
        this.syncStatus = 'permission_denied';
      } else {
        this.syncStatus = 'offline';
      }
      this.notifySyncState();
      return {
        success: false,
        code: err.code || 'SYNC_ERROR',
        message: err.message
      };
    }
  },

  async getAllLetters() {
    try {
      const deletedIds = this.getDeletedIds();
      const lettersCol = collection(db, 'letters');
      const snapshot = await getDocs(lettersCol);
      if (!snapshot.empty) {
        const results = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (!deletedIds.has(d.id)) {
            results.push(d);
          }
        });
        results.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        this.isFirebaseActive = true;
        this.syncStatus = 'connected';
        this.lastSyncTime = new Date().toISOString();
        this.notifySyncState();
        this.saveToLocalCache(results);
        return results;
      } else {
        return await this.seedInitialData();
      }
    } catch (error) {
      console.warn('Firebase getDocs error, falling back to IndexedDB:', error.message);
      this.isFirebaseActive = false;
      if (error.code === 'permission-denied') {
        this.syncStatus = 'permission_denied';
      } else {
        this.syncStatus = 'offline';
      }
      this.lastError = error.message;
      this.notifySyncState();
      return await this.getLocalLetters();
    }
  },

  async getLocalLetters() {
    try {
      const deletedIds = this.getDeletedIds();
      const syncCache = this.getInitialLettersSync();
      if (typeof window === 'undefined' || !window.indexedDB) {
        return syncCache;
      }
      const idb = await openDB();
      return new Promise((resolve) => {
        try {
          const transaction = idb.transaction(STORE_LETTERS, 'readonly');
          const store = transaction.objectStore(STORE_LETTERS);
          const request = store.getAll();

          request.onsuccess = () => {
            let results = request.result || [];
            results = results.filter((l) => !deletedIds.has(l.id));

            if (results.length === 0 && deletedIds.size === 0) {
              if (syncCache && syncCache.length > 0) {
                this.saveToLocalCache(syncCache);
                resolve(syncCache);
              } else {
                this.seedInitialData()
                  .then((seeded) => resolve(seeded))
                  .catch(() => resolve(INITIAL_DATA));
              }
            } else {
              results.sort(
                (a, b) =>
                  new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
              );
              this.saveToLocalCache(results);
              resolve(results);
            }
          };
          request.onerror = () => resolve(syncCache);
        } catch {
          resolve(syncCache);
        }
      });
    } catch {
      return this.getInitialLettersSync();
    }
  },

  async saveToLocalCache(lettersList) {
    try {
      const deletedIds = this.getDeletedIds();
      const activeList = Array.isArray(lettersList)
        ? lettersList.filter((l) => !deletedIds.has(l.id))
        : [];

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          // Keep a lightweight synchronous copy for 0ms cold starts
          const slim = activeList.map((l) => {
            if (l.file && l.file.base64 && l.file.base64.length > 50000) {
              const { base64, ...restFile } = l.file;
              return { ...l, file: restFile };
            }
            return l;
          });
          localStorage.setItem(
            'sarpras_letters_sync_cache',
            JSON.stringify(slim)
          );
        } catch (storageErr) {
          console.warn('LocalStorage cache write error:', storageErr);
        }
      }

      const idb = await openDB();
      const transaction = idb.transaction(STORE_LETTERS, 'readwrite');
      const store = transaction.objectStore(STORE_LETTERS);
      for (const item of activeList) {
        store.put(item);
      }
    } catch (e) {
      console.error('Failed to cache letters locally:', e);
    }
  },

  async seedInitialData() {
    const deletedIds = this.getDeletedIds();
    const activeInitial = INITIAL_DATA.filter((l) => !deletedIds.has(l.id));

    try {
      const idb = await openDB();
      const transaction = idb.transaction(STORE_LETTERS, 'readwrite');
      const store = transaction.objectStore(STORE_LETTERS);
      for (const item of activeInitial) {
        store.put(item);
      }
    } catch (e) {
      console.warn('Local seed error:', e);
    }

    // Seeding to Firestore without blocking UI
    Promise.all(activeInitial.map((item) => setDoc(doc(db, 'letters', item.id), item)))
      .then(() => {
        this.isFirebaseActive = true;
        this.syncStatus = 'connected';
        this.lastSyncTime = new Date().toISOString();
        this.notifySyncState();
      })
      .catch((err) => {
        console.warn('Firestore seeding notice:', err.message);
        if (err.code === 'permission-denied') {
          this.syncStatus = 'permission_denied';
        }
        this.notifySyncState();
      });

    return activeInitial;
  },

  async saveLetter(letter) {
    const letterId =
      letter.id || `${letter.type === 'masuk' ? 'sm' : 'sk'}-${Date.now()}`;
    const letterData = {
      ...letter,
      id: letterId,
      updatedAt: new Date().toISOString()
    };

    // Ensure it is not marked as deleted
    this.removeDeletedId(letterData.id);

    // 1. Immediately update localStorage cache (instant UI persistence)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('sarpras_letters_sync_cache');
        let list = cached ? JSON.parse(cached) : [];
        if (!Array.isArray(list)) list = [];
        const index = list.findIndex((item) => item.id === letterData.id);
        if (index >= 0) {
          list[index] = letterData;
        } else {
          list.unshift(letterData);
        }
        const slim = list.map((l) => {
          if (l.file && l.file.base64 && l.file.base64.length > 50000) {
            const { base64, ...restFile } = l.file;
            return { ...l, file: restFile };
          }
          return l;
        });
        localStorage.setItem('sarpras_letters_sync_cache', JSON.stringify(slim));
      }
    } catch (storageErr) {
      console.warn('LocalStorage save error:', storageErr);
    }

    // 2. Save to local IndexedDB
    try {
      const idb = await openDB();
      const transaction = idb.transaction(STORE_LETTERS, 'readwrite');
      const store = transaction.objectStore(STORE_LETTERS);
      store.put(letterData);
    } catch (idbErr) {
      console.warn('IndexedDB save error:', idbErr);
    }

    // 3. Mark in pending queue until confirmed by Firestore
    this.addPendingUpload(letterData.id);
    this.notifySyncState();

    // 4. Try saving to Firebase Firestore in the background
    try {
      await setDoc(doc(db, 'letters', letterData.id), letterData);
      this.removePendingUpload(letterData.id);
      this.isFirebaseActive = true;
      this.syncStatus = 'connected';
      this.lastSyncTime = new Date().toISOString();
      this.lastError = null;
      this.notifySyncState();
    } catch (err) {
      console.warn('Firebase Firestore save notice (saved to local cache):', err.message);
      this.isFirebaseActive = false;
      if (err.code === 'permission-denied') {
        this.syncStatus = 'permission_denied';
      } else {
        this.syncStatus = 'offline';
      }
      this.lastError = err.message;
      this.notifySyncState();
    }

    return letterData;
  },

  async deleteLetter(id) {
    const letterId = typeof id === 'object' && id !== null ? (id.id || id) : id;
    if (!letterId) return false;

    // 1. Permanently mark as deleted
    this.addDeletedId(letterId);
    this.removePendingUpload(letterId);
    this.addPendingDelete(letterId);

    // 2. Immediately remove from localStorage cache
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('sarpras_letters_sync_cache');
        if (cached) {
          let list = JSON.parse(cached);
          if (Array.isArray(list)) {
            list = list.filter((item) => item.id !== letterId);
            localStorage.setItem('sarpras_letters_sync_cache', JSON.stringify(list));
          }
        }
      }
    } catch (storageErr) {
      console.warn('LocalStorage delete error:', storageErr);
    }

    // 3. Delete from local IndexedDB safely
    try {
      const idb = await openDB();
      await new Promise((resolve) => {
        try {
          if (!idb.objectStoreNames.contains(STORE_LETTERS)) {
            return resolve();
          }
          const stores = [STORE_LETTERS];
          if (idb.objectStoreNames.contains(STORE_ATTACHMENTS)) {
            stores.push(STORE_ATTACHMENTS);
          }
          const transaction = idb.transaction(stores, 'readwrite');
          transaction.objectStore(STORE_LETTERS).delete(letterId);
          if (stores.includes(STORE_ATTACHMENTS)) {
            transaction.objectStore(STORE_ATTACHMENTS).delete(letterId);
          }
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch (idbErr) {
      console.warn('IndexedDB delete error:', idbErr);
    }

    // 4. Try deleting from Firebase Cloud Storage
    this.deleteAttachment(letterId).catch(() => {});

    // 5. Try deleting from Firebase Firestore
    try {
      await deleteDoc(doc(db, 'letters', letterId));
      this.removePendingDelete(letterId);
      this.isFirebaseActive = true;
      this.syncStatus = 'connected';
      this.lastSyncTime = new Date().toISOString();
      this.lastError = null;
      this.notifySyncState();
    } catch (err) {
      console.warn('Firestore delete notice (marked as deleted locally):', err.message);
      this.isFirebaseActive = false;
      if (err.code === 'permission-denied') {
        this.syncStatus = 'permission_denied';
      } else {
        this.syncStatus = 'offline';
      }
      this.lastError = err.message;
      this.notifySyncState();
    }

    return true;
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
    try {
      const fileRef = ref(storage, `attachments/${letterId}`);
      await deleteObject(fileRef);
    } catch {
      // ignore
    }

    try {
      const idb = await openDB();
      return new Promise((resolve) => {
        try {
          if (!idb.objectStoreNames.contains(STORE_ATTACHMENTS)) {
            return resolve(true);
          }
          const transaction = idb.transaction(STORE_ATTACHMENTS, 'readwrite');
          const store = transaction.objectStore(STORE_ATTACHMENTS);
          const request = store.delete(letterId);
          request.onsuccess = () => resolve(true);
          request.onerror = () => resolve(true);
        } catch {
          resolve(true);
        }
      });
    } catch {
      return true;
    }
  }
};
