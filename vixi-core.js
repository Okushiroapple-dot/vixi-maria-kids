// ══════════════════════════════════════════
// vixi-core.js  –  Vixi Maria Kids
// Core store logic: cart, favorites, search,
// categories, rendering, and UI utilities.
// Assembled from index.html functional blocks.
// ══════════════════════════════════════════

// ── Constants ──
const VIXI_WHATSAPP = '5516991781559';
const DEFAULT_CATEGORIES = [
  {id:'meninas', icon:'👗', label:'Meninas'},
  {id:'meninos', icon:'⚽', label:'Meninos'},
  {id:'acessorios', icon:'🎀', label:'Acessórios'},
  {id:'bebes', icon:'🍼', label:'Bebês'},
  {id:'juvenil', icon:'✨', label:'Juvenil'}
];
const CONTENT_FIELDS = [
  {key:'heroBadge', label:'Hero badge', selector:'.hero-badge', type:'text'},
  {key:'heroTitle', label:'Hero title', selector:'.hero h1', type:'html'},
  {key:'heroSubtitle', label:'Hero subtitle', selector:'.hero-sub', type:'text'},
  {key:'heroPrimaryCta', label:'Hero main button', selector:'.hero-btns .btn-main', type:'text'},
  {key:'heroSecondaryCta', label:'Hero secondary button', selector:'.hero-btns .btn-ghost', type:'text'},
  {key:'productsEyebrow', label:'Products eyebrow', selector:'#colecao .eyebrow', type:'text'},
  {key:'productsTitle', label:'Products title', selector:'#colecao h2', type:'text'},
  {key:'productsDesc', label:'Products description', selector:'#colecao .sec-head p', type:'text'},
  {key:'promo1', label:'Announcement 1', selector:'.ann-item:nth-child(1)', type:'text'},
  {key:'promo2', label:'Announcement 2', selector:'.ann-item:nth-child(2)', type:'text'},
  {key:'promo3', label:'Announcement 3', selector:'.ann-item:nth-child(3)', type:'text'},
  {key:'whatsappCta', label:'Header WhatsApp CTA', selector:'.hdr-cta', type:'text'},
  {key:'pageHeroTitle', label:'Titulo da pagina interna', selector:'.clothes-hero h1', type:'text'},
  {key:'pageHeroDesc', label:'Descricao da pagina interna', selector:'.clothes-hero p', type:'text'},
  {key:'relatedEyebrow', label:'Chamada relacionados', selector:'#relatedSection .eyebrow', type:'text'},
  {key:'relatedTitle', label:'Titulo relacionados', selector:'#relatedSection h2', type:'text'},
  {key:'instagramTitle', label:'Titulo Instagram', selector:'.ig-bar h3', type:'text'},
  {key:'instagramDesc', label:'Texto Instagram', selector:'.ig-bar > p:first-of-type', type:'html'},
  {key:'instagramFooter', label:'Rodape Instagram', selector:'.ig-bar > p:last-of-type', type:'text'},
  {key:'instagramCta', label:'Botao Instagram', selector:'.ig-bar .ig-btn', type:'text'},
  {key:'footerBrandDesc', label:'Texto do rodape', selector:'.foot-brand > p', type:'text'}
];

const VISUAL_FIELDS = [
  {key:'heroBadge', selector:'.hero-badge', type:'text'},
  {key:'heroTitle', selector:'.hero h1', type:'html'},
  {key:'heroSubtitle', selector:'.hero-sub', type:'text'},
  {key:'heroPrimaryCta', selector:'.hero-btns .btn-main', type:'text'},
  {key:'heroSecondaryCta', selector:'.hero-btns .btn-ghost', type:'text'},
  {key:'headerLogoName', selector:'.hdr .logo-name', type:'text'},
  {key:'headerLogoSub', selector:'.hdr .logo-sub', type:'text'},
  {key:'footerLogoName', selector:'.foot-brand .logo-name', type:'text'},
  {key:'footerLogoSub', selector:'.foot-brand .logo-sub', type:'text'},
  {key:'headerWhatsappCta', selector:'.hdr-cta', type:'text'},
  {key:'pageHeroTitle', selector:'.clothes-hero h1', type:'text'},
  {key:'pageHeroDesc', selector:'.clothes-hero p', type:'text'},
  {key:'relatedEyebrow', selector:'#relatedSection .eyebrow', type:'text'},
  {key:'relatedTitle', selector:'#relatedSection h2', type:'text'},
  {key:'ann1Icon', selector:'.ann-item:nth-child(1) .ann-icon', type:'text'},
  {key:'ann1Text', selector:'.ann-item:nth-child(1) .ann-copy', type:'text'},
  {key:'ann2Icon', selector:'.ann-item:nth-child(2) .ann-icon', type:'text'},
  {key:'ann2Text', selector:'.ann-item:nth-child(2) .ann-copy', type:'text'},
  {key:'ann3Icon', selector:'.ann-item:nth-child(3) .ann-icon', type:'text'},
  {key:'ann3Text', selector:'.ann-item:nth-child(3) .ann-copy', type:'text'},
  {key:'ann4Icon', selector:'.ann-item:nth-child(4) .ann-icon', type:'text'},
  {key:'ann4Text', selector:'.ann-item:nth-child(4) .ann-copy', type:'text'},
  {key:'ann5Icon', selector:'.ann-item:nth-child(5) .ann-icon', type:'text'},
  {key:'ann5Text', selector:'.ann-item:nth-child(5) .ann-copy', type:'text'},
  {key:'promise1Icon', selector:'.prom-item:nth-child(1) .prom-icon', type:'text'},
  {key:'promise1Title', selector:'.prom-item:nth-child(1) .pt', type:'text'},
  {key:'promise1Desc', selector:'.prom-item:nth-child(1) .ps', type:'text'},
  {key:'promise2Icon', selector:'.prom-item:nth-child(2) .prom-icon', type:'text'},
  {key:'promise2Title', selector:'.prom-item:nth-child(2) .pt', type:'text'},
  {key:'promise2Desc', selector:'.prom-item:nth-child(2) .ps', type:'text'},
  {key:'promise3Icon', selector:'.prom-item:nth-child(3) .prom-icon', type:'text'},
  {key:'promise3Title', selector:'.prom-item:nth-child(3) .pt', type:'text'},
  {key:'promise3Desc', selector:'.prom-item:nth-child(3) .ps', type:'text'},
  {key:'promise4Icon', selector:'.prom-item:nth-child(4) .prom-icon', type:'text'},
  {key:'promise4Title', selector:'.prom-item:nth-child(4) .pt', type:'text'},
  {key:'promise4Desc', selector:'.prom-item:nth-child(4) .ps', type:'text'},
  {key:'categoriesEyebrow', selector:'#categorias .eyebrow', type:'text'},
  {key:'categoriesTitle', selector:'#categorias h2', type:'text'},
  {key:'categoriesDesc', selector:'#categorias .sec-head p', type:'text'},
  {key:'catMeninasName', selector:'#meninas .cat-name', type:'text'},
  {key:'catMeninasRange', selector:'#meninas .cat-range', type:'text'},
  {key:'catMeninosName', selector:'#meninos .cat-name', type:'text'},
  {key:'catMeninosRange', selector:'#meninos .cat-range', type:'text'},
  {key:'catBebesName', selector:'#bebes .cat-name', type:'text'},
  {key:'catBebesRange', selector:'#bebes .cat-range', type:'text'},
  {key:'catJuvenilName', selector:'#juvenil .cat-name', type:'text'},
  {key:'catJuvenilRange', selector:'#juvenil .cat-range', type:'text'},
  {key:'categoriesCta', selector:'#categorias .btn-main', type:'text'},
  {key:'sizesEyebrow', selector:'.sizes-section .eyebrow', type:'text'},
  {key:'sizesTitle', selector:'.sizes-section h2', type:'text'},
  {key:'sizesDesc', selector:'.sizes-section .sec-head p', type:'text'},
  {key:'productsEyebrow', selector:'#colecao .eyebrow', type:'text'},
  {key:'productsTitle', selector:'#colecao h2', type:'text'},
  {key:'productsDesc', selector:'#colecao .sec-head p', type:'text'},
  {key:'promo1Eyebrow', selector:'.promo-card:nth-child(1) .eyebrow', type:'text'},
  {key:'promo1Title', selector:'.promo-card:nth-child(1) h3', type:'html'},
  {key:'promo1Cta', selector:'.promo-card:nth-child(1) .btn-main', type:'text'},
  {key:'promo2Eyebrow', selector:'.promo-card:nth-child(2) .eyebrow', type:'text'},
  {key:'promo2Title', selector:'.promo-card:nth-child(2) h3', type:'html'},
  {key:'promo2Cta', selector:'.promo-card:nth-child(2) .btn-main', type:'text'},
  {key:'aboutEyebrow', selector:'#sobre .about-text .eyebrow', type:'text'},
  {key:'aboutTitle', selector:'#sobre h2', type:'text'},
  {key:'aboutFounderRole', selector:'#sobre .np-role', type:'text'},
  {key:'aboutFounderName', selector:'#sobre .np-name', type:'text'},
  {key:'aboutFounderLocation', selector:'#sobre .np-loc', type:'text'},
  {key:'aboutDesc', selector:'#sobre .about-text p:nth-of-type(1)', type:'text'},
  {key:'aboutDesc2', selector:'#sobre .about-text p:nth-of-type(2)', type:'text'},
  {key:'aboutDesc3', selector:'#sobre .about-text p:nth-of-type(3)', type:'html'},
  {key:'newsletterEyebrow', selector:'#newsletter .eyebrow', type:'text'},
  {key:'newsletterTitle', selector:'#newsletter h2', type:'text'},
  {key:'newsletterDesc', selector:'#newsletter p', type:'text'},
  {key:'newsletterButton', selector:'#newsletter button', type:'text'},
  {key:'instagramTitle', selector:'#instagram h3', type:'text'},
  {key:'instagramDesc', selector:'#instagram > p:first-of-type', type:'html'},
  {key:'instagramFooter', selector:'#instagram > p:last-of-type', type:'text'},
  {key:'instagramCta', selector:'#instagram .ig-btn', type:'text'},
  {key:'footerBrandDesc', selector:'.foot-brand > p', type:'text'},
  {key:'footerWhatsapp', selector:'.foot-contact p:last-child span:last-child', type:'text'}
];

const PRODUCT_IMAGE_KEY = 'vixiProductImages';
const VISUAL_IMAGE_KEY = 'vixiVisualImages';
const TEXT_STORE_KEY = 'vixiContent';

// ── PIX discount (configurable from admin) ──
function getPixDiscount(){ return Math.max(0, Math.min(99, parseInt(localStorage.getItem('vixiPixDiscount')||'10',10)||10)); }
function getPixMult(){ return (100-getPixDiscount())/100; }
function isPixEnabled(){ return localStorage.getItem('vixiPixEnabled') !== 'false'; }
window.getPixDiscount = getPixDiscount;
window.getPixMult = getPixMult;
window.isPixEnabled = isPixEnabled;

// Auto-update PIX % text and visibility on all pages
document.addEventListener('DOMContentLoaded', function(){
  var pct = getPixDiscount();
  var enabled = isPixEnabled();
  // Update percentage spans
  document.querySelectorAll('.pix-pct-ann').forEach(function(el){ el.textContent = pct; });
  // Update ann-copy spans that contain PIX discount text
  document.querySelectorAll('.ann-copy').forEach(function(el){
    if(el.textContent.includes('PIX com') && el.textContent.includes('desconto')){
      if(!enabled){ el.closest('.ann-item') && (el.closest('.ann-item').style.display='none'); }
      else el.textContent = 'PIX com '+pct+'% de desconto';
    }
  });
  // Hide PIX ann-items when disabled
  if(!enabled){
    document.querySelectorAll('.pix-ann-item').forEach(function(el){ el.style.display='none'; });
  }
  // Hide PIX button and price in checkout
  var pixBtn = document.getElementById('coPixBtn');
  var pixRow = document.querySelector('.co-pix-row');
  if(pixBtn) pixBtn.style.display = enabled ? '' : 'none';
  if(pixRow) pixRow.style.display = enabled ? '' : 'none';
  // Hide PIX price in product page
  var sbPix = document.getElementById('sbPix');
  if(sbPix && !enabled) sbPix.style.display = 'none';
});

// ── State ──
let favorites = JSON.parse(localStorage.getItem('vixiFavorites')||'[]');
let cart = JSON.parse(localStorage.getItem('vixiCart')||'[]');
let activeSizeFilter = null;
let currentFilter = 'all';
let visibleCount = 12;
let currentSort = 'default';
let _cartBadgeFirst = true;

// ── Utilities ──
function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function escapeHtml(str){return String(str||'').replace(/[&<>'"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));}
function saveFavorites(){localStorage.setItem('vixiFavorites', JSON.stringify(favorites));}
function saveCart(){localStorage.setItem('vixiCart', JSON.stringify(cart)); updateCartBadge();}
function getCats(){try{return JSON.parse(localStorage.getItem('vixiCategories')||'null')||DEFAULT_CATEGORIES;}catch(e){return DEFAULT_CATEGORIES;}}
function saveCats(cats){localStorage.setItem('vixiCategories', JSON.stringify(cats));}
function getCatLabel(id){const c=getCats().find(x=>x.id===id); return c ? c.label : id;}
function getCatIcon(id){const c=getCats().find(x=>x.id===id); return c ? c.icon : '🛍️';}
function getProduct(id){return PRODS.find(p=>p.id===id);}
function openStoreModal(id){document.getElementById(id)?.classList.add('open');}
function closeStoreModal(id){document.getElementById(id)?.classList.remove('open');}
function updateCartBadge(){
  const total=cart.reduce((s,i)=>s+i.qty,0);
  const b=document.getElementById('cartBadge');
  if(b){
    b.textContent=total;
    if(!_cartBadgeFirst){b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');setTimeout(()=>b.classList.remove('pop'),400);}
    _cartBadgeFirst=false;
  }
}

// ── readJson / writeJson (from IIFE block) ──
function readJson(key, fallback){
  try{return JSON.parse(localStorage.getItem(key)||'null')||fallback;}catch(e){return fallback;}
}
function writeJson(key, value){
  localStorage.setItem(key, JSON.stringify(value));
  if(window.vixiSaveCloud) window.vixiSaveCloud(key, value);
}

function vixiCropImageFile(file, opts={}){
  return new Promise((resolve,reject)=>{
    if(!file || !String(file.type||'').startsWith('image/')){resolve(null);return;}
    const aspect = Number(opts.aspect || 1);
    const outW   = Number(opts.width  || 1200);
    const outH   = Math.round(outW / aspect);

    let modal = document.getElementById('vixiCropModal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'vixiCropModal';
      modal.className = 'vixi-crop-modal';
      modal.innerHTML = `<div class="vixi-crop-box" role="dialog" aria-modal="true">
        <div class="vixi-crop-head">
          <h3>Enquadrar imagem</h3>
          <button class="vixi-crop-close" type="button">✕</button>
        </div>
        <div class="vixi-crop-frame" style="touch-action:none;cursor:grab"><img alt="" draggable="false" style="position:absolute;left:50%;top:50%;max-width:none;user-select:none;pointer-events:none;transform-origin:center"></div>
        <div class="vixi-crop-controls">
          <label>Zoom <input type="range" min="0.5" max="8" step="0.01" value="1" data-crop-zoom></label>
        </div>
        <p style="font-size:11px;color:var(--gray);font-weight:600;text-align:center;margin:-4px 0 4px">Arraste com o dedo / mouse • Belisque para zoom</p>
        <div class="vixi-crop-actions">
          <button class="cancel" type="button">Cancelar</button>
          <button class="save"   type="button">✅ Usar imagem</button>
        </div>
      </div>`;
      document.body.appendChild(modal);
    }

    const titleEl = modal.querySelector('h3');
    const frame   = modal.querySelector('.vixi-crop-frame');
    const img     = modal.querySelector('img');
    const zoomEl  = modal.querySelector('[data-crop-zoom]');
    const closeEl = modal.querySelector('.vixi-crop-close');
    const cancelEl= modal.querySelector('.cancel');
    const saveEl  = modal.querySelector('.save');

    titleEl.textContent = opts.title || 'Enquadrar imagem';
    frame.style.aspectRatio = String(aspect);

    let state = {x:0, y:0, scale:1, dragging:false, sx:0, sy:0, pinchDist:null};
    let finished = false;
    const url = URL.createObjectURL(file);

    function applyT(){
      img.style.transform = `translate(-50%,-50%) translate(${state.x}px,${state.y}px) scale(${state.scale})`;
      zoomEl.value = state.scale;
    }
    function initScale(){
      const fw = frame.offsetWidth  || 420;
      const fh = frame.offsetHeight || Math.round(fw/aspect);
      const s  = Math.max(fw/img.naturalWidth, fh/img.naturalHeight);
      state = {x:0,y:0,scale:s,dragging:false,sx:0,sy:0,pinchDist:null};
      zoomEl.min  = String(Math.max(0.1, s*0.5));
      zoomEl.max  = String(s*10);
      zoomEl.step = String(s*0.01);
      applyT();
    }

    img.onload = initScale;
    zoomEl.oninput = function(){ state.scale = parseFloat(this.value); applyT(); };

    // Mouse drag
    frame.addEventListener('mousedown', function(e){
      state.dragging=true; state.sx=e.clientX-state.x; state.sy=e.clientY-state.y;
      frame.style.cursor='grabbing'; e.preventDefault();
    });
    const mmove = function(e){ if(!state.dragging)return; state.x=e.clientX-state.sx; state.y=e.clientY-state.sy; applyT(); };
    const mup   = function(){ state.dragging=false; frame.style.cursor='grab'; };
    window.addEventListener('mousemove',mmove);
    window.addEventListener('mouseup',mup);

    // Wheel zoom
    frame.addEventListener('wheel', function(e){
      e.preventDefault();
      state.scale = Math.max(parseFloat(zoomEl.min), Math.min(parseFloat(zoomEl.max), state.scale*(e.deltaY<0?1.1:0.9)));
      applyT();
    },{passive:false});

    // Touch drag + pinch
    frame.addEventListener('touchstart', function(e){
      e.preventDefault();
      if(e.touches.length===1){
        state.dragging=true;
        state.sx=e.touches[0].clientX-state.x; state.sy=e.touches[0].clientY-state.y;
        state.pinchDist=null;
      }else if(e.touches.length===2){
        state.dragging=false;
        state.pinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      }
    },{passive:false});
    frame.addEventListener('touchmove', function(e){
      e.preventDefault();
      if(e.touches.length===1&&state.dragging){
        state.x=e.touches[0].clientX-state.sx; state.y=e.touches[0].clientY-state.sy;
      }else if(e.touches.length===2&&state.pinchDist){
        const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        state.scale=Math.max(parseFloat(zoomEl.min),Math.min(parseFloat(zoomEl.max),state.scale*(d/state.pinchDist)));
        state.pinchDist=d;
      }
      applyT();
    },{passive:false});
    frame.addEventListener('touchend',function(e){
      if(e.touches.length<1) state.dragging=false;
      if(e.touches.length<2) state.pinchDist=null;
    });

    function cleanup(){
      modal.classList.remove('open');
      URL.revokeObjectURL(url);
      window.removeEventListener('mousemove',mmove);
      window.removeEventListener('mouseup',mup);
    }
    function onCancel(){ if(finished)return; finished=true; cleanup(); resolve(null); }
    function onSave(){
      if(finished)return; finished=true;
      const fw = frame.offsetWidth, fh = frame.offsetHeight;
      const cropW = fw/state.scale, cropH = fh/state.scale;
      const cx = img.naturalWidth/2 - state.x/state.scale;
      const cy = img.naturalHeight/2 - state.y/state.scale;
      const canvas = document.createElement('canvas');
      canvas.width=outW; canvas.height=outH;
      canvas.getContext('2d').drawImage(img, cx-cropW/2, cy-cropH/2, cropW, cropH, 0, 0, outW, outH);
      canvas.toBlob(blob=>{
        if(!blob){cleanup();reject(new Error('Falha ao cortar imagem'));return;}
        const name = String(file.name||'imagem.jpg').replace(/\.[^.]+$/,'')+'-enquadrada.jpg';
        const dataUrl = canvas.toDataURL('image/jpeg',.9);
        cleanup();
        resolve({file:new File([blob],name,{type:'image/jpeg'}), dataUrl});
      },'image/jpeg',.9);
    }

    closeEl.onclick  = onCancel;
    cancelEl.onclick = onCancel;
    saveEl.onclick   = onSave;

    img.src = url;
    modal.classList.add('open');
  });
}

// ── applyProductImages ──
function applyProductImages(){
  const imgs = readJson(PRODUCT_IMAGE_KEY,{});
  PRODS.forEach(p=>{ if(imgs[p.id]) p.img = imgs[p.id]; });
}

// ── applyVisualImages ──
function applyVisualImages(){
  const imgs = readJson(VISUAL_IMAGE_KEY,{});
  Object.keys(imgs).forEach(key=>{
    if(key.startsWith('banner:')){
      document.querySelectorAll(`[data-banner-key="${key.slice(7)}"]`).forEach(el=>{
        el.style.backgroundImage = `linear-gradient(135deg,rgba(242,39,110,.72),rgba(30,0,26,.32)),url("${imgs[key]}")`;
        el.classList.add('has-custom-image');
      });
    }else if(key.startsWith('bg:')){
      const bgKey = key.slice(3);
      const extras = bgKey === 'logo' ? ',.logo-icon' : '';
      document.querySelectorAll(`[data-visual-bg-key="${bgKey}"]${extras}`).forEach(el=>{
        el.style.backgroundImage = `url("${imgs[key]}")`;
        el.classList.add('has-custom-image');
      });
    }else{
      const el = document.querySelector(`[data-image-key="${key}"]`);
      if(el) el.src = imgs[key];
    }
  });
}

// ── loadVisualContent / loadContent ──
function syncAnnouncementMirrors(){
  const items = [...document.querySelectorAll('.ann-track .ann-item')];
  const originals = items.filter(el=>!el.dataset.annMirror);
  originals.forEach((source,i)=>{
    const mirror = document.querySelector(`.ann-track .ann-item[data-ann-mirror="${i+1}"]`);
    if(!mirror) return;
    ['ann-icon','ann-copy'].forEach(cls=>{
      const from = source.querySelector('.'+cls);
      const to = mirror.querySelector('.'+cls);
      if(from && to) to.textContent = from.textContent;
    });
  });
}

function loadVisualContent(){
  const data = readJson(TEXT_STORE_KEY,{});
  VISUAL_FIELDS.forEach(f=>{
    const el = document.querySelector(f.selector);
    if(!el) return;
    el.dataset.vixiEdit = f.key;
    if(data[f.key]!==undefined){
      if(f.type==='html') el.innerHTML = data[f.key];
      else el.textContent = data[f.key];
    }
  });
  syncAnnouncementMirrors();
}
function loadContent(){ loadVisualContent(); }

// ── saveToStorage (most complete version from IIFE) ──
const ORIGINAL_PRODUCT_IMAGES = {};
(function(){if(typeof PRODS!=='undefined')PRODS.forEach(p=>ORIGINAL_PRODUCT_IMAGES[p.id]=p.img);})();

function saveToStorage(){
  try{
    const origIds = new Set(window._ORIG_PRODS_IDS||[]);
    const productImgs = readJson(PRODUCT_IMAGE_KEY,{});
    const toSave = (window.liveProducts||PRODS).map(p=>{
      if(origIds.has(p.id)){
        if(p.img && p.img !== ORIGINAL_PRODUCT_IMAGES[p.id]) productImgs[p.id]=p.img;
        return {id:p.id,name:p.name,cat:p.cat,cl:p.cl,price:p.price,old:p.old,badge:p.badge,sizes:p.sizes,desc:p.desc||'',img:p.img||''};
      }
      return p;
    });
    writeJson(PRODUCT_IMAGE_KEY, productImgs);
    writeJson('vixiAdmin_v2', toSave);
    // Always persist product order so it survives page reloads
    try{
      var order = (window.liveProducts||PRODS).map(function(p){return p.id;});
      writeJson('vixiProdOrder', order);
      localStorage.setItem('vixiProdOrder_ts', String(Date.now()+2000));
      if(window.vixiSaveCloud) window.vixiSaveCloud('vixiProdOrder', order);
      if(window.vixiSaveCloud) window.vixiSaveCloud('vixiAdmin_v2', toSave);
    }catch(e2){}
  }catch(e){showToast('Armazenamento cheio. Baixe o site para salvar permanentemente.');}
}

// ── Cart operations ──
function addCart(id,e,size){if(e)e.stopPropagation(); const p=getProduct(id); if(!p)return; const sz=size||''; const item=cart.find(x=>x.id===id&&(x.size||'')===sz); if(item)item.qty++; else cart.push(sz?{id,qty:1,size:sz}:{id,qty:1}); saveCart(); showToast(`${p.name}${sz?' (tam. '+escapeHtml(sz)+')':''} adicionado ao carrinho 🛍️`);}
function changeQty(id,delta,size){const sz=size||''; const item=cart.find(x=>x.id===id&&(x.size||'')===sz); if(!item)return; item.qty+=delta; if(item.qty<=0) cart=cart.filter(x=>!(x.id===id&&(x.size||'')===sz)); saveCart(); renderCart();}
function removeCart(id,size){const sz=size||''; cart=cart.filter(x=>!(x.id===id&&(x.size||'')===sz)); saveCart(); renderCart();}

function renderCart(){
  const box=document.getElementById('cartResults'); if(!box)return;
  let total=0;
  box.innerHTML=cart.map(i=>{
    const p=getProduct(i.id); if(!p)return'';
    total+=Number(p.price)*i.qty;
    const sz=i.size||'';
    return `<div class="store-row"><img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async"><div><h4>${escapeHtml(p.name)}${sz?` <span style="font-size:11px;font-weight:800;color:var(--pink);background:var(--pink-pale);border-radius:4px;padding:1px 6px">${escapeHtml(sz)}</span>`:''}</h4><p>${money(p.price)} × ${i.qty}</p></div><div class="store-actions"><button class="store-mini light" onclick="changeQty('${i.id}',-1,'${escapeHtml(sz)}')">−</button><strong>${i.qty}</strong><button class="store-mini light" onclick="changeQty('${i.id}',1,'${escapeHtml(sz)}')">+</button><button class="store-mini" onclick="removeCart('${i.id}','${escapeHtml(sz)}')">Remover</button></div></div>`;
  }).join('')||'<div class="empty-state">Seu carrinho está vazio.</div>';
  const ct=document.getElementById('cartTotal');
  if(ct) ct.innerHTML='<span>Total: <strong>'+money(total)+'</strong></span><span class="cart-pix-badge">PIX: '+money(Math.round(total*getPixMult()*100)/100)+'</span>';
}

// ── Favorites ──
function toggleFav(idOrBtn,btn,e){
  if(e)e.stopPropagation();
  let id=typeof idOrBtn==='string'?idOrBtn:null;
  if(!id){const card=btn?.closest?.('.prod-card'); const name=card?.querySelector('.prod-name')?.textContent; id=PRODS.find(p=>p.name===name)?.id;}
  if(!id)return;
  const liked=favorites.includes(id);
  favorites=liked?favorites.filter(x=>x!==id):[...favorites,id];
  saveFavorites();
  renderProds(currentFilter||'all');
  showToast(liked?'Removido dos favoritos':'Adicionado aos favoritos ❤️');
}
function renderFavs(){
  const box=document.getElementById('favResults'); if(!box)return;
  const list=favorites.map(getProduct).filter(Boolean);
  box.innerHTML=list.map(p=>`<div class="store-row"><img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async"><div><h4>${escapeHtml(p.name)}</h4><p>${getCatLabel(p.cat)} • ${money(p.price)} <span class="pix-price">PIX ${money(Math.round(p.price*getPixMult()*100)/100)}</span></p></div><div class="store-actions"><button class="store-mini" onclick="addCart('${p.id}')">🛒 Carrinho</button><button class="store-mini light" onclick="window.location.href='product.html?id=${p.id}'">Ver →</button></div></div>`).join('')||'<div class="empty-state"><div style="font-size:48px;margin-bottom:8px">🤍</div>Você ainda não favoritou nenhum produto.</div>';
}

// ── Search ──
function foldText(text){
  return String(text||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
}
function runSearch(){
  const q = foldText(document.getElementById('searchInput')?.value||'').trim();
  const box = document.getElementById('searchResults');
  if(!box) return;
  if(!q){box.innerHTML='<div class="empty-state">Digite algo para buscar.</div>';return;}
  const list = PRODS.filter(p=>foldText([p.name,p.desc,p.badge,p.cl,getCatLabel(p.cat),p.cat,(p.sizes||[]).join(' ')].join(' ')).includes(q)).slice(0,20);
  box.innerHTML = list.map(p=>`<div class="store-row"><img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async"><div><h4>${escapeHtml(p.name)}</h4><p>${getCatLabel(p.cat)} • ${money(p.price)} <span class="pix-price">PIX ${money(Math.round(p.price*getPixMult()*100)/100)}</span></p></div><div class="store-actions"><button class="store-mini" onclick="addCart('${p.id}')">🛒 Carrinho</button><button class="store-mini light" onclick="window.location.href='product.html?id=${p.id}'">Ver →</button></div></div>`).join('')||'<div class="empty-state">Nenhum produto encontrado para "<em>'+escapeHtml(q)+'</em>".</div>';
}

// ── CPF encryption (AES-GCM + PBKDF2) ──
async function encryptField(text, uid){
  var enc=new TextEncoder();
  var km=await crypto.subtle.importKey('raw',enc.encode(uid),{name:'PBKDF2'},false,['deriveKey']);
  var key=await crypto.subtle.deriveKey(
    {name:'PBKDF2',salt:enc.encode('vixi-cpf-2026'),iterations:120000,hash:'SHA-256'},
    km,{name:'AES-GCM',length:256},false,['encrypt']);
  var iv=crypto.getRandomValues(new Uint8Array(12));
  var ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(text));
  var out=new Uint8Array(12+ct.byteLength);
  out.set(iv,0); out.set(new Uint8Array(ct),12);
  return btoa(String.fromCharCode(...out));
}
async function decryptField(b64, uid){
  try{
    var enc=new TextEncoder();
    var buf=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    var km=await crypto.subtle.importKey('raw',enc.encode(uid),{name:'PBKDF2'},false,['deriveKey']);
    var key=await crypto.subtle.deriveKey(
      {name:'PBKDF2',salt:enc.encode('vixi-cpf-2026'),iterations:120000,hash:'SHA-256'},
      km,{name:'AES-GCM',length:256},false,['decrypt']);
    var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:buf.slice(0,12)},key,buf.slice(12));
    return new TextDecoder().decode(pt);
  }catch(e){return '';}
}
window.encryptField=encryptField;
window.decryptField=decryptField;

// ── Header account dropdown ── (styles in vixi-shared.css)

function syncHeaderAuth(user){
  var dd=document.getElementById('acctDd');
  if(!dd){
    var icons=document.querySelector('.hdr-icons');
    if(!icons)return;
    dd=document.createElement('div');
    dd.id='acctDd'; dd.className='acct-dd';
    var burger=document.getElementById('burgerBtn');
    if(burger) icons.insertBefore(dd,burger);
    else icons.appendChild(dd);
  }
  dd.classList.remove('open');
  if(!user){
    dd.innerHTML='<a href="conta.html" class="ibt" title="Minha Conta">👤</a>';
  }else{
    var nome=(user.displayName||'').split(' ')[0]||'Conta';
    dd.innerHTML='<button class="ibt acct-in" id="acctToggle" title="Olá, '+escapeHtml(nome)+'">👤</button>'
      +'<div class="acct-menu" id="acctMenu">'
        +'<div class="acct-hd">Olá, '+escapeHtml(nome)+'!</div>'
        +'<a class="acct-item" href="conta.html#pedidos">📦 Meus Pedidos</a>'
        +'<a class="acct-item" href="conta.html#perfil">👤 Meu Perfil</a>'
        +'<a class="acct-item" href="conta.html#favoritos">❤️ Meus Favoritos</a>'
        +'<a class="acct-item" href="conta.html#carrinho">🛒 Meu Carrinho</a>'
        +(user.email==='viximariakids@viximariakids.com' ? '<div class="acct-sep"></div><a class="acct-item" href="admin.html">⚙️ Painel de Admin</a>' : '')
        +'<div class="acct-sep"></div>'
        +'<button class="acct-item" style="color:#c0392b" onclick="window.vixiLogout&&window.vixiLogout()">Sair da conta</button>'
      +'</div>';
    var toggle=document.getElementById('acctToggle');
    if(toggle){
      toggle.addEventListener('click',function(e){e.stopPropagation();dd.classList.toggle('open');});
      if(dd._outsideClick) document.removeEventListener('click',dd._outsideClick);
      dd._outsideClick = function(e){if(!dd.contains(e.target))dd.classList.remove('open');};
      document.addEventListener('click',dd._outsideClick);
    }
  }
  if(typeof syncAdminNav==='function') syncAdminNav();
}
window.syncHeaderAuth=syncHeaderAuth;

// ── Admin nav dropdown (all pages when admin is logged in) ──
function syncAdminNav(){
  var nav=document.querySelector('header nav');
  if(!nav) return;
  nav.querySelector('.nav-admin-dd')?.remove();
  if(window.currentUser?.email!=='viximariakids@viximariakids.com') return;
  var items=[
    ['admin.html','📦','Produtos'],
    ['admin.html?sec=add','➕','Adicionar'],
    ['admin.html?sec=categories','🗂️','Categorias'],
    ['index.html?admin=visual','🎨','Editar Página'],
    ['admin.html?sec=orders','📊','Pedidos'],
    ['admin.html?sec=backup','💾','Backups'],
  ];
  var links=items.map(function(i){
    if(!i[0]) return '<a href="#" onclick="(typeof startVisualEditor===\'function\'?startVisualEditor():window.location.href=\'admin.html?sec=visual\');return false">'+i[1]+' '+i[2]+'</a>';
    return '<a href="'+i[0]+'">'+i[1]+' '+i[2]+'</a>';
  }).join('');
  var html='<div class="nav-dd nav-admin-dd"><button class="nav-dd-btn nav-admin-btn" type="button">⚙️ Admin ▾</button><div class="nav-dd-menu">'+links+'</div></div>';
  var allDDs=nav.querySelectorAll('.nav-dd:not(.nav-admin-dd)');
  var lastDD=allDDs[allDDs.length-1];
  if(lastDD) lastDD.insertAdjacentHTML('afterend',html);
  else nav.insertAdjacentHTML('beforeend',html);
  var dd=nav.querySelector('.nav-admin-dd');
  if(dd){
    dd.addEventListener('mouseenter',function(){dd.classList.add('open');});
    dd.addEventListener('mouseleave',function(){dd.classList.remove('open');});
    var btn=dd.querySelector('.nav-dd-btn');
    if(btn) btn.addEventListener('click',function(){dd.classList.toggle('open');});
  }
}
window.syncAdminNav=syncAdminNav;

// ── checkoutWhatsApp ──
function checkoutWhatsApp(){
  if(!cart.length){showToast('Seu carrinho está vazio 🛒');return;}
  const lines = cart.map(i=>{const p=getProduct(i.id);return p?`• ${p.name}${i.size?' (tam. '+i.size+')':''} — ${i.qty}x — ${money(p.price)}`:''}).filter(Boolean);
  const total = cart.reduce((s,i)=>{const p=getProduct(i.id);return s+(p?Number(p.price)*i.qty:0)},0);
  const pix = Math.round(total * getPixMult() * 100) / 100;
  const msg = encodeURIComponent(`Olá! Tenho interesse nestes produtos:\n\n${lines.join('\n')}\n\nTotal: ${money(total)} (ou ${money(pix)} no PIX 💚)`);
  window.open(`https://wa.me/${VIXI_WHATSAPP}?text=${msg}`,'_blank');
}

// ── checkoutMercadoPago ──
const MP_FUNCTION_URL = 'https://us-central1-vixi-maria-kids-8c494.cloudfunctions.net/createMpPreference';

function openMpCheckoutModal(){
  if(!cart.length){showToast('Seu carrinho está vazio 🛒');return;}
  window.location.href = 'checkout.html';
}

async function submitMpCheckout(payerData){
  try {
    var items = cart.map(function(i){
      var p = getProduct(i.id);
      if(!p) return null;
      return { id: i.id, name: p.name, qty: i.qty || 1, price: Number(p.price || 0) };
    }).filter(Boolean);
    if(window.coFreight > 0){
      items.push({ id: 'frete', name: 'Frete', qty: 1, price: Number(window.coFreight) });
    }

    var res = await fetch(MP_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items, payer: payerData, baseUrl: window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') })
    });

    var data = await res.json();

    if(data.init_point){
      window.location.href = data.init_point;
    } else {
      throw new Error(data.error || 'Erro desconhecido');
    }
  } catch(err) {
    showToast('Erro ao iniciar pagamento. Tente novamente. 😕');
    console.error('MP checkout error:', err);
    throw err;
  }
}

// ── Product filtering / rendering ──
function filterCategory(cat){
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.dataset.f===cat));
  visibleCount=12; activeSizeFilter=null; renderProds(cat);
  document.getElementById('colecao')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function filterSize(sz){
  activeSizeFilter=sz;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.f==='all'));
  visibleCount=12;
  renderProds('all');
  var cb=document.getElementById('clearSizeBtn');
  if(cb){cb.classList.add('show');cb.textContent='✕ Tamanho: '+sz;}
  document.getElementById('colecao')?.scrollIntoView({behavior:'smooth'});
  showToast(`Mostrando tamanho ${sz} 📏`);
}
function clearSizeFilter(){
  activeSizeFilter=null;
  visibleCount=12;
  var cb=document.getElementById('clearSizeBtn');
  if(cb) cb.classList.remove('show');
  renderProds(currentFilter||'all');
  showToast('Filtro de tamanho removido');
}
window.clearSizeFilter=clearSizeFilter;
function loadMore(){visibleCount+=8;renderProds(document.querySelector('.tab.on')?.dataset.f||'all');}
function sortBy(val){currentSort=val;visibleCount=12;renderProds(currentFilter||'all');}
window.sortBy=sortBy;

function renderProds(filter='all'){
  currentFilter=filter;
  const grid=document.getElementById('prodGrid'); if(!grid) return;
  // 'novidades' filter = products with NOVO or NOVO_HIDDEN badge
  let list=PRODS.filter(p=>{
    if(filter==='novidades') return p.badge==='NOVO'||p.badge==='NOVO_HIDDEN';
    return filter==='all'||p.cat===filter;
  });
  if(activeSizeFilter) list=list.filter(p=>(p.sizes||[]).includes(activeSizeFilter));
  if(currentSort==='price-asc') list=[...list].sort((a,b)=>a.price-b.price);
  else if(currentSort==='price-desc') list=[...list].sort((a,b)=>b.price-a.price);
  else if(currentSort==='name') list=[...list].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  var countEl=document.getElementById('prodCount');
  if(countEl) countEl.textContent=list.length+' produto'+(list.length!==1?'s':'');
  const show=list.slice(0,visibleCount);
  grid.innerHTML=show.map(p=>{
    const liked=favorites.includes(p.id);
    // Auto-generate % badge when old price exists but no badge set
    var autoBadge='';
    if(!p.badge&&p.old&&Number(p.old)>Number(p.price)){
      var autoPct=Math.floor((1-Number(p.price)/Number(p.old))*100);
      if(autoPct>0&&autoPct<100) autoBadge='-'+autoPct+'%';
    }
    var effectiveBadge=p.badge||autoBadge;
    // Calculate displayed old price for % badges
    var dispOld=p.old||null;
    var badgeStr=String(effectiveBadge);
    var pctMatch=badgeStr.match(/^-?(\d+)%$/);
    if(pctMatch&&!dispOld&&p.price){
      var pct=parseInt(pctMatch[1],10);
      if(pct>0&&pct<100) dispOld=Math.ceil(p.price/(1-pct/100));
    }
    return `<article class="prod-card" data-cat="${p.cat}" data-id="${p.id}" onclick="if(document.body.classList.contains('vixi-editing'))return;window.location.href='product.html?id=${p.id}'" style="cursor:pointer">
      <div class="prod-img-wrap">
        ${(effectiveBadge&&effectiveBadge!=='FAV'&&effectiveBadge!=='NOVO_HIDDEN')?`<span class="pbadge ${pctMatch?'off':'novo'}">${effectiveBadge==='NOVO'?'✨ Novo!':pctMatch?'🔥 '+escapeHtml(effectiveBadge):escapeHtml(effectiveBadge)}</span>`:''}
        <button class="fav-btn ${liked?'liked':''}" onclick="toggleFav('${p.id}',this,event)" aria-label="Favoritar">${liked?'❤️':'🤍'}</button>
        <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" data-edit-product="${p.id}" data-edit-field="img"/>
        <a class="prod-quick-link" href="product.html?id=${p.id}" onclick="if(document.body.classList.contains('vixi-editing')){event.preventDefault();return;}event.stopPropagation()">Ver produto →</a>
      </div>
      <div class="prod-info">
        <div class="prod-cat">${getCatLabel(p.cat)}</div>
        <h4 class="prod-name" data-edit-product="${p.id}" data-edit-field="name">${escapeHtml(p.name)}</h4>
        <p class="prod-desc" data-edit-product="${p.id}" data-edit-field="desc">${escapeHtml(p.desc||'')}</p>
        <div class="prod-sizes">${(p.sizes||[]).map(s=>`<span class="psz" onclick="selectSize(this)">${escapeHtml(s)}</span>`).join('')}</div>
        <div class="prod-price">${dispOld?`<span class="pold">${money(dispOld)}</span>`:''}<span class="pnew" data-edit-product="${p.id}" data-edit-field="price">${money(p.price)}</span><span class="pix-price">PIX ${money(Math.round(p.price*getPixMult()*100)/100)}</span></div>
        <div class="prod-foot-btns">
          <a class="pbuy-btn" href="product.html?id=${p.id}" onclick="if(document.body.classList.contains('vixi-editing')){event.preventDefault();return;}event.stopPropagation()">Compre Agora!</a>
          <button class="padd" onclick="addCart('${p.id}',event)" aria-label="Adicionar ao carrinho">+</button>
        </div>
      </div>
    </article>`;
  }).join('') || '<p class="empty-state" style="grid-column:1/-1">Nenhum produto encontrado nessa seleção.</p>';
  const more=document.getElementById('viewMoreBtn'); if(more) more.style.display=list.length>visibleCount?'flex':'none';
}

// ── syncCategoriesUI (new multi-page version) ──
function syncCategoriesUI(){
  var cats=getCats();
  var nav=document.querySelector('header nav');
  if(nav){
    nav.className='vixi-main-nav';
    var dd=cats.map(function(c){return '<a href="clothes.html?cat='+c.id+'">'+c.icon+' '+escapeHtml(c.label)+'</a>';}).join('');
    var menuHtml='<div class="nav-dd-label">Loja</div><a href="index.html">🏠 Início</a><a href="clothes.html" class="hot">🔥 Novidades</a><div class="nav-dd-sep"></div><div class="nav-dd-label">Minha Conta</div><a href="conta.html">👤 Minha Conta</a><a href="cart.html">🛒 Carrinho</a><div class="nav-dd-sep"></div><div class="nav-dd-label">Contato</div><a href="https://wa.me/5516991781559" target="_blank">💬 WhatsApp</a>';
    nav.innerHTML='<div class="nav-dd nav-menu-dd"><button class="nav-dd-btn" type="button">📋 Menu ▾</button><div class="nav-dd-menu">'+menuHtml+'</div></div><div class="nav-dd"><button class="nav-dd-btn" type="button">🛍️ Roupas ▾</button><div class="nav-dd-menu"><a href="clothes.html">Todas as roupas</a>'+dd+'</div></div>';
  }
  var mob=document.getElementById('mobMenu');
  if(mob){
    var close='<button class="mob-close" id="mobClose">✕</button>';
    var links=cats.map(function(c){return '<a href="clothes.html?cat='+c.id+'" onclick="closeMob()">'+c.icon+' '+escapeHtml(c.label)+'</a>';}).join('');
    mob.innerHTML=close+'<a href="index.html" onclick="closeMob()">🏠 Início</a><a href="clothes.html" onclick="closeMob()">🛍️ Todas as roupas</a>'+links+'<a href="cart.html" onclick="closeMob()">🛒 Meu Carrinho</a><a href="conta.html" onclick="closeMob()">👤 Minha Conta</a><a href="https://wa.me/5516991781559" target="_blank">💬 WhatsApp</a>';
    document.getElementById('mobClose')&&document.getElementById('mobClose').addEventListener('click',closeMob);
  }
  var tabs=document.querySelector('.prod-tabs');
  if(tabs){
    var cur=(document.querySelector('.tab.on')||{dataset:{f:'all'}}).dataset.f;
    tabs.innerHTML='<button class="tab" data-f="all">Todos</button>'+cats.map(function(c){return '<button class="tab" data-f="'+c.id+'">'+c.icon+' '+c.label+'</button>';}).join('');
    tabs.querySelectorAll('.tab').forEach(function(t){
      if(t.dataset.f===cur)t.classList.add('on');
      t.addEventListener('click',function(){document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on');});t.classList.add('on');filterCategory(t.dataset.f);});
    });
    if(!tabs.querySelector('.tab.on')&&tabs.querySelector('.tab'))tabs.querySelector('.tab').classList.add('on');
  }
  var sel=document.getElementById('admCat');
  if(sel){sel.innerHTML=cats.map(function(c){return '<option value="'+c.id+'">'+c.icon+' '+escapeHtml(c.label)+'</option>';}).join('');}
  if(typeof syncAdminNav==='function') syncAdminNav();
}

// ── Toast ──
let tt;
function showToast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  document.getElementById('toastMsg').textContent=msg;
  t.classList.add('on');
  clearTimeout(tt);
  tt=setTimeout(()=>t.classList.remove('on'),2600);
}

// ── Back-to-top button ──
function initBackToTop(){
  var btn=document.createElement('button');
  btn.className='back-to-top';
  btn.setAttribute('aria-label','Voltar ao topo');
  btn.textContent='↑';
  document.body.appendChild(btn);
  window.addEventListener('scroll',function(){
    btn.classList.toggle('show',window.scrollY>400);
  },{passive:true});
  btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
}

// ── LGPD cookie consent banner ──
function initLgpd(){
  if(localStorage.getItem('vixiLgpdOk')) return;
  var bar=document.createElement('div');
  bar.className='lgpd-bar';
  bar.innerHTML='<p>🍪 Usamos cookies para melhorar sua experiência de compra. Ao continuar, você concorda com nossa <a href="https://wa.me/5516991781559?text=Oi%2C+quero+saber+sobre+a+pol%C3%ADtica+de+privacidade" target="_blank" rel="noopener">Política de Privacidade</a> (LGPD).</p>'
    +'<div class="lgpd-bar-btns">'
    +'<button class="lgpd-btn-ess" onclick="this.closest(\'.lgpd-bar\').classList.remove(\'show\');setTimeout(()=>this.closest(\'.lgpd-bar\').remove(),400)">Só essenciais</button>'
    +'<button class="lgpd-btn-ok" onclick="acceptLgpd(this)">Aceitar tudo ✓</button>'
    +'</div>';
  document.body.appendChild(bar);
  setTimeout(function(){bar.classList.add('show');},600);
}
function acceptLgpd(btn){
  localStorage.setItem('vixiLgpdOk','1');
  var bar=btn.closest('.lgpd-bar');
  bar.classList.remove('show');
  setTimeout(function(){bar.remove();},400);
}
window.acceptLgpd=acceptLgpd;

// ── Size select (visual feedback on product cards) ──
function selectSize(el){
  const container=el.closest('.prod-sizes');
  if(container) container.querySelectorAll('.psz').forEach(s=>s.classList.remove('active-sz'));
  el.classList.add('active-sz');
}

// ── Mobile menu ──
function closeMob(){
  const m=document.getElementById('mobMenu');
  if(m) m.classList.remove('open');
}

// ── Back navigation ──
function goBackOrHome(){
  if(window.history.length>1){window.history.back();}
  else{window.location.href='index.html';}
}

// ── Product order persistence ──
function applyProdOrder(){
  try{
    var saved=JSON.parse(localStorage.getItem('vixiProdOrder')||'null');
    if(!Array.isArray(saved)||!saved.length) return;
    var map=new Map(PRODS.map(function(p){return [p.id,p];}));
    var ordered=saved.map(function(id){return map.get(id);}).filter(Boolean);
    saved.forEach(function(id){map.delete(id);});
    map.forEach(function(p){ordered.push(p);});
    PRODS.length=0;
    ordered.forEach(function(p){PRODS.push(p);});
  }catch(e){}
}
window.applyProdOrder=applyProdOrder;

// ── DOMContentLoaded bootstrap ──
function applyBadgeStyle(){
  var s=localStorage.getItem('vixiBadgeStyle')||'';
  document.body.dataset.badgeStyle=s;
}
window.applyBadgeStyle=applyBadgeStyle;

document.addEventListener('DOMContentLoaded', function(){
  applyBadgeStyle();
  updateCartBadge();
  syncCategoriesUI();
  syncHeaderAuth(window.currentUser || null); // show immediately, Firebase will update it
  if(typeof loadContent==='function')loadContent();
  if(typeof applyProductImages==='function')applyProductImages();
  var sb=document.getElementById('searchBtn');
  if(sb)sb.addEventListener('click',function(){openStoreModal('searchModal');setTimeout(function(){var si=document.getElementById('searchInput');if(si)si.focus();},80);});
  var fb=document.getElementById('favBtn');
  if(fb)fb.addEventListener('click',function(){renderFavs();openStoreModal('favModal');});
  var cb=document.getElementById('cartBtn');
  if(cb)cb.addEventListener('click',function(){renderCart();openStoreModal('cartModal');});
  var bb=document.getElementById('burgerBtn');
  if(bb)bb.addEventListener('click',function(){var m=document.getElementById('mobMenu');if(m)m.classList.add('open');});
  var mc=document.getElementById('mobClose');
  if(mc)mc.addEventListener('click',closeMob);
  // Add nav dropdown hover behavior
  document.querySelectorAll('.nav-dd').forEach(function(dd){
    dd.addEventListener('mouseenter',function(){dd.classList.add('open');});
    dd.addEventListener('mouseleave',function(){dd.classList.remove('open');});
    var btn=dd.querySelector('.nav-dd-btn');
    if(btn)btn.addEventListener('click',function(){dd.classList.toggle('open');});
  });
  // Close store modals on backdrop click
  document.querySelectorAll('.store-modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');}));
  // Prevent accidental drag on images and layout elements (skip when visual editor is active)
  document.addEventListener('dragstart',function(e){
    if(document.body.classList.contains('vixi-editing')) return;
    if(e.target.tagName==='IMG'||e.target.closest('.prod-card,.hdr,header,.footer-sec,.ann')){
      e.preventDefault();
    }
  });
  // Keyboard shortcuts: Escape closes modals; 's' opens search
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      document.querySelectorAll('.store-modal.open').forEach(function(m){m.classList.remove('open');});
      var mob=document.getElementById('mobMenu');
      if(mob&&mob.classList.contains('open'))closeMob();
      return;
    }
    var tag=(document.activeElement||{}).tagName||'';
    if(e.key==='s'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&tag!=='INPUT'&&tag!=='TEXTAREA'&&tag!=='SELECT'){
      e.preventDefault();
      openStoreModal('searchModal');
      setTimeout(function(){var si=document.getElementById('searchInput');if(si){si.value='';si.focus();}},80);
    }
  });
  // Image load error: show pink placeholder
  document.addEventListener('error',function(e){
    var img=e.target;
    if(img.tagName==='IMG'&&!img.dataset.errHandled&&img.src&&!img.src.startsWith('data:')){
      img.dataset.errHandled='1';
      img.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23FFF0F6'/%3E%3Ctext x='100' y='115' text-anchor='middle' font-size='80'%3E%F0%9F%8C%B8%3C/text%3E%3C/svg%3E";
      img.style.objectFit='contain';
    }
  },true);
  // Inject PWA manifest link
  if(!document.querySelector('link[rel="manifest"]')){
    var ml=document.createElement('link');ml.rel='manifest';ml.href='manifest.json';document.head.appendChild(ml);
  }
  // Inject theme-color for mobile browser UI
  if(!document.querySelector('meta[name="theme-color"]')){
    var tc=document.createElement('meta');tc.name='theme-color';tc.content='#F2276E';document.head.appendChild(tc);
  }
  // Init global enhancements
  initBackToTop();
  initLgpd();
  // Track page view in recently viewed (product pages only)
  if(location.pathname.includes('product.html')){
    var pid=new URLSearchParams(location.search).get('id');
    if(pid){
      var rv=JSON.parse(localStorage.getItem('vixiRecentlyViewed')||'[]');
      rv=rv.filter(function(x){return x!==pid;});
      rv.unshift(pid);
      localStorage.setItem('vixiRecentlyViewed',JSON.stringify(rv.slice(0,8)));
    }
  }
});

// ── Window exports ──
window.money=money;window.escapeHtml=escapeHtml;window.getCatLabel=getCatLabel;window.getCatIcon=getCatIcon;
window.getProduct=getProduct;window.addCart=addCart;window.removeCart=removeCart;window.changeQty=changeQty;
window.toggleFav=toggleFav;window.renderCart=renderCart;window.renderFavs=renderFavs;window.runSearch=runSearch;
window.showToast=showToast;window.filterCategory=filterCategory;window.filterSize=filterSize;window.loadMore=loadMore;
window.selectSize=selectSize;window.openStoreModal=openStoreModal;window.closeStoreModal=closeStoreModal;
window.checkoutWhatsApp=checkoutWhatsApp;window.openMpCheckoutModal=openMpCheckoutModal;window.submitMpCheckout=submitMpCheckout;window.syncCategoriesUI=syncCategoriesUI;window.renderProds=renderProds;
window.closeMob=closeMob;window.updateCartBadge=updateCartBadge;window.getCats=getCats;window.saveCats=saveCats;
window.saveCart=saveCart;window.saveFavorites=saveFavorites;window.saveToStorage=saveToStorage;
window.loadContent=loadContent;window.applyProductImages=applyProductImages;window.applyVisualImages=applyVisualImages;
window.readJson=readJson;window.writeJson=writeJson;window.vixiCropImageFile=vixiCropImageFile;window.goBackOrHome=goBackOrHome;

// Expose mutable state via getters so other files can access current values.
// Guard prevents TypeError if script is evaluated more than once (e.g. hot-reload).
(function defineStateProps(){
  var defs = {
    favorites:      {get:function(){return favorites;},     set:function(v){favorites=v;}},
    cart:           {get:function(){return cart;},           set:function(v){cart=v;}},
    currentFilter:  {get:function(){return currentFilter;},  set:function(v){currentFilter=v;}},
    activeSizeFilter:{get:function(){return activeSizeFilter;},set:function(v){activeSizeFilter=v;}},
    visibleCount:   {get:function(){return visibleCount;},   set:function(v){visibleCount=v;}}
  };
  Object.keys(defs).forEach(function(prop){
    if(!Object.getOwnPropertyDescriptor(window, prop)){
      Object.defineProperty(window, prop, Object.assign({configurable:true}, defs[prop]));
    }
  });
})();
