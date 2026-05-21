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
  getDoc
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
    try{if(window.syncCategoriesUI)window.syncCategoriesUI();}catch(e){}
    try{if(window.renderProds)window.renderProds(window.currentFilter||'all');}catch(e){}
    try{if(window.loadContent)window.loadContent();}catch(e){}
    try{if(window.applyProductImages)window.applyProductImages();}catch(e){}
    try{if(window.startWeeklyFavoritesCarousel)window.startWeeklyFavoritesCarousel();}catch(e){}
  }
}

vixiApplyCloudData();

console.log("Firebase conectado!");
