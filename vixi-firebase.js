// ══════════════════════════════════════════
// vixi-firebase.js  –  Vixi Maria Kids
// Firebase integration (ES Module)
// Extracted from index.html lines 3253-3338
// with timestamp-based conflict resolution.
// ══════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
  where,
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
  const keys = ['vixiProductImages', 'vixiVisualImages', 'vixiContent', 'vixiAdmin_v2', 'vixiCategories', 'vixiBadgeStyle', 'vixiProdOrder'];
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
      // Apply saved product order after rebuilding PRODS
      if(window.applyProdOrder) window.applyProdOrder();
    } catch(e){}
    try{if(window.syncCategoriesUI)window.syncCategoriesUI();}catch(e){}
    try{if(window.syncAdminNav)window.syncAdminNav();}catch(e){}
    try{if(window.renderProds)window.renderProds(window.currentFilter||'all');}catch(e){}
    try{if(window.loadContent)window.loadContent();}catch(e){}
    try{if(window.applyProductImages)window.applyProductImages();}catch(e){}
    try{if(window.startWeeklyFavoritesCarousel)window.startWeeklyFavoritesCarousel();}catch(e){}
    try{if(window.applyBadgeStyle)window.applyBadgeStyle();}catch(e){}
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

// ── Firebase Auth ──────────────────────────────
const auth = getAuth(app);
window.firebaseAuth = auth;

window.vixiRegister = async function(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user;
};

window.vixiLogin = async function(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

window.vixiLogout = async function() {
  await signOut(auth);
  window.currentUser = null;
};

window.vixiResetPassword = async function(email) {
  await sendPasswordResetEmail(auth, email);
};

window.vixiLoginWithGoogle = async function() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;
  // Create profile doc on first login if it doesn't exist
  const { getDoc, doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
  const snap = await getDoc(doc(db, 'customers', user.uid));
  if (!snap.exists()) {
    await setDoc(doc(db, 'customers', user.uid), {
      nome:      user.displayName || '',
      email:     user.email,
      createdAt: Date.now()
    });
  }
  return user;
};

// ── Customer profile (Firestore) ──────────────
window.vixiSaveProfile = async function(uid, data) {
  await setDoc(doc(db, 'customers', uid), data, { merge: true });
};

window.vixiLoadProfile = async function(uid) {
  const snap = await getDoc(doc(db, 'customers', uid));
  return snap.exists() ? snap.data() : null;
};

window.vixiLoadOrders = async function(uid) {
  const q = query(
    collection(db, 'customers', uid, 'orders'),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Admin: all orders ──────────────────────────
window.vixiGetAdminOrders = async function(limitCount = 80) {
  try {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.error('vixiGetAdminOrders error', e);
    return [];
  }
};

// ── Newsletter subscribe ───────────────────────
window.vixiSubscribeNewsletter = async function(email) {
  if (!email || !email.includes('@')) throw new Error('E-mail inválido');
  const normalized = email.trim().toLowerCase();
  // Use email as doc ID to prevent duplicates
  const docRef = doc(db, 'newsletter', normalized.replace(/[^a-z0-9]/g, '_'));
  const snap = await getDoc(docRef);
  if (snap.exists()) return 'ja_inscrito';
  await setDoc(docRef, { email: normalized, subscribedAt: serverTimestamp() });
  return 'ok';
};

// ── Page Builder ──────────────────────────────
window.vixiSavePage = async function(pageData) {
  const slug = (pageData.slug || '').replace(/[^a-z0-9-]/g, '-').toLowerCase();
  if (!slug) throw new Error('Slug inválido');
  const docRef = doc(db, 'pages', slug);
  await setDoc(docRef, { ...pageData, slug, updatedAt: serverTimestamp() }, { merge: true });
  return slug;
};

window.vixiLoadPage = async function(slug) {
  const snap = await getDoc(doc(db, 'pages', slug));
  return snap.exists() ? snap.data() : null;
};

window.vixiListPages = async function() {
  try {
    const q = query(collection(db, 'pages'), orderBy('updatedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.error('vixiListPages error', e);
    return [];
  }
};

window.vixiDeletePage = async function(slug) {
  await deleteDoc(doc(db, 'pages', slug));
};

// ── Auth state observer ────────────────────────
onAuthStateChanged(auth, function(user) {
  window.currentUser = user || null;
  if (typeof window.syncHeaderAuth === 'function') {
    window.syncHeaderAuth(user || null);
  }
  if (typeof window.onAuthStateChange === 'function') {
    window.onAuthStateChange(user || null);
  }
  // Auto-show admin trigger when admin account is logged in
  if (user && user.email === 'viximariakids@viximariakids.com') {
    if (typeof window.showAdminTrigger === 'function') window.showAdminTrigger();
    // Re-sync after cloud data may have rebuilt the nav
    setTimeout(function(){if(typeof window.syncAdminNav==='function')window.syncAdminNav();}, 800);
  }
});
