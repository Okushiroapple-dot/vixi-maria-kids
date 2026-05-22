// ══════════════════════════════════════════
// vixi-firebase.js  –  Vixi Maria Kids
// Firebase integration (ES Module)
// Extracted from index.html lines 3253-3338
// with timestamp-based conflict resolution.
// ══════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOFmHT5v_HDn2i0sF-hiV2fG5uC5upP6w",
  authDomain: "vixi-maria-kids-8c494.firebaseapp.com",
  projectId: "vixi-maria-kids-8c494",
  storageBucket: "vixi-maria-kids-8c494.firebasestorage.app",
  messagingSenderId: "684237100263",
  appId: "1:684237100263:web:ff694c0dd36de80070be42"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

window.firebaseDB = db;
window.firebaseStorage = storage;

window.vixiUploadImage = async function(file, folder = 'uploads') {
  const safeName = String(file.name || 'imagem.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileRef = ref(storage, `${folder}/${Date.now()}_${safeName}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

window.vixiSaveCloud = async function(key, value) {
  try {
    await setDoc(doc(db, 'siteData', key), { value, updatedAt: Date.now() });
    localStorage.setItem(key + '_ts', String(Date.now()));
    console.log('Salvo no Firebase:', key);
  } catch (err) {
    console.error('Erro ao salvar no Firebase:', key, err);
  }
};

window.vixiLoadCloud = async function(key) {
  try {
    const snap = await getDoc(doc(db, 'siteData', key));
    return snap.exists() ? snap.data().value : null;
  } catch (err) {
    console.error('Erro ao carregar do Firebase:', key, err);
    return null;
  }
};

async function vixiApplyCloudData() {
  const keys = ['vixiProductImages', 'vixiVisualImages', 'vixiContent', 'vixiAdmin_v2', 'vixiCategories'];
  let changed = false;
  for (const key of keys) {
    const value = await window.vixiLoadCloud(key);
    if (value !== null && value !== undefined) {
      const snap2 = await getDoc(doc(db, 'siteData', key));
      const cloudTs = snap2.exists() ? (snap2.data().updatedAt||0) : 0;
      const localTs = parseInt(localStorage.getItem(key+'_ts')||'0',10);
      if(cloudTs > localTs){
        localStorage.setItem(key, JSON.stringify(value));
        localStorage.setItem(key+'_ts', String(cloudTs));
        changed = true;
      }
    }
  }
  if (changed) {
    // Reload PRODS in memory from the freshly-synced localStorage
    try {
      var saved = JSON.parse(localStorage.getItem('vixiAdmin_v2')||'[]');
      var deleted = JSON.parse(localStorage.getItem('vixiAdmin_deleted')||'[]');
      var imgs = JSON.parse(localStorage.getItem('vixiProductImages')||'{}');
      var dSet = new Set(deleted);
      if (Array.isArray(saved) && saved.length && window.PRODS) {
        window.PRODS.length = 0;
        saved.forEach(function(item){
          if(!dSet.has(item.id))
            window.PRODS.push(Object.assign({}, item, {img: imgs[item.id]||item.img||''}));
        });
      }
    } catch(e){}
    try{if(window.syncCategoriesUI)window.syncCategoriesUI();}catch(e){}
    try{if(window.renderProds)window.renderProds(window.currentFilter||'all');}catch(e){}
    try{if(window.loadContent)window.loadContent();}catch(e){}
    try{if(window.applyProductImages)window.applyProductImages();}catch(e){}
    try{if(window.startWeeklyFavoritesCarousel)window.startWeeklyFavoritesCarousel();}catch(e){}
  }
}

vixiApplyCloudData();

// ── Backup system ──────────────────────────────

window.vixiCreateBackup = async function(data) {
  const backupsCol = collection(db, 'backups');
  const ref = await addDoc(backupsCol, {
    products:       data.products       || [],
    siteContent:    data.siteContent    || {},
    categories:     data.categories     || [],
    layoutSettings: data.layoutSettings || {},
    version: '1.0',
    createdAt: serverTimestamp()
  });
  // Keep only the 7 most recent backups
  try {
    const q = query(backupsCol, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const docs = snap.docs;
    for (let i = 7; i < docs.length; i++) {
      await deleteDoc(docs[i].ref);
    }
  } catch(e) { console.warn('backup cleanup error', e); }
  return ref.id;
};

window.vixiListBackups = async function() {
  try {
    const q = query(collection(db, 'backups'), orderBy('createdAt', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.error('vixiListBackups error', e);
    return [];
  }
};

window.vixiDeleteBackup = async function(id) {
  await deleteDoc(doc(db, 'backups', id));
};

console.log("Firebase conectado!");
