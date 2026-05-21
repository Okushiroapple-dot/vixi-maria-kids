// ══════════════════════════════════════════
// vixi-products.js  –  Vixi Maria Kids
// Loads products from localStorage/Firebase.
// Used by all pages EXCEPT index.html
// (index.html has PRODS hardcoded inline).
// Load ORDER: this file first, then vixi-core.js
// ══════════════════════════════════════════

var PRODS = [];

(function loadFromStorage(){
  try {
    var saved   = JSON.parse(localStorage.getItem('vixiAdmin_v2')||'[]');
    var deleted = JSON.parse(localStorage.getItem('vixiAdmin_deleted')||'[]');
    var imgs    = JSON.parse(localStorage.getItem('vixiProductImages')||'{}');
    var deletedSet = new Set(deleted);
    if(Array.isArray(saved) && saved.length){
      saved.forEach(function(item){
        if(!deletedSet.has(item.id)){
          PRODS.push(Object.assign({}, item, {img: imgs[item.id]||item.img||''}));
        }
      });
    }
    // Note: if PRODS is empty here, vixi-firebase.js will sync from Firebase
    // and call window.renderProds() once data arrives.
  }catch(e){ console.warn('vixi-products: load error', e); }
})();

window._ORIG_PRODS_IDS = PRODS.map(function(p){ return p.id; });
