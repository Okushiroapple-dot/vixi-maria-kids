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

// ── State ──
let favorites = JSON.parse(localStorage.getItem('vixiFavorites')||'[]');
let cart = JSON.parse(localStorage.getItem('vixiCart')||'[]');
let activeSizeFilter = null;
let currentFilter = 'all';
let visibleCount = 12;

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
function updateCartBadge(){const total=cart.reduce((s,i)=>s+i.qty,0); const b=document.getElementById('cartBadge'); if(b)b.textContent=total;}

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
    const outW = Number(opts.width || 1200);
    const outH = Number(opts.height || Math.round(outW / aspect));
    let modal = document.getElementById('vixiCropModal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'vixiCropModal';
      modal.className = 'vixi-crop-modal';
      modal.innerHTML = `<div class="vixi-crop-box" role="dialog" aria-modal="true">
        <div class="vixi-crop-head"><h3>Enquadrar imagem</h3><button class="vixi-crop-close" type="button">X</button></div>
        <div class="vixi-crop-frame"><img alt=""></div>
        <div class="vixi-crop-controls">
          <label>Zoom <input type="range" min="1" max="3" step=".01" value="1.12" data-crop-zoom></label>
          <label>Horizontal <input type="range" min="-100" max="100" step="1" value="0" data-crop-x></label>
          <label>Vertical <input type="range" min="-100" max="100" step="1" value="0" data-crop-y></label>
        </div>
        <div class="vixi-crop-actions"><button class="cancel" type="button">Cancelar</button><button class="save" type="button">Usar imagem</button></div>
      </div>`;
      document.body.appendChild(modal);
    }
    const title = modal.querySelector('h3');
    const frame = modal.querySelector('.vixi-crop-frame');
    const img = modal.querySelector('img');
    const zoom = modal.querySelector('[data-crop-zoom]');
    const posX = modal.querySelector('[data-crop-x]');
    const posY = modal.querySelector('[data-crop-y]');
    const close = modal.querySelector('.vixi-crop-close');
    const cancel = modal.querySelector('.cancel');
    const save = modal.querySelector('.save');
    const url = URL.createObjectURL(file);
    let baseScale = 1;
    let finished = false;
    title.textContent = opts.title || 'Enquadrar imagem';
    frame.style.aspectRatio = String(aspect);
    zoom.value = opts.zoom || 1.12;
    posX.value = 0;
    posY.value = 0;
    img.src = url;
    modal.classList.add('open');
    function cleanup(){
      modal.classList.remove('open');
      URL.revokeObjectURL(url);
      img.removeEventListener('load',onLoad);
      zoom.removeEventListener('input',render);
      posX.removeEventListener('input',render);
      posY.removeEventListener('input',render);
      close.removeEventListener('click',onCancel);
      cancel.removeEventListener('click',onCancel);
      save.removeEventListener('click',onSave);
    }
    function render(){
      const fw = frame.clientWidth || 420;
      const fh = frame.clientHeight || (fw / aspect);
      baseScale = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
      const x = Number(posX.value) / 100 * fw / 2;
      const y = Number(posY.value) / 100 * fh / 2;
      img.style.width = (img.naturalWidth * baseScale) + 'px';
      img.style.height = (img.naturalHeight * baseScale) + 'px';
      img.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px) scale(${zoom.value})`;
    }
    function onLoad(){render();}
    function onCancel(){if(finished)return;finished=true;cleanup();resolve(null);}
    function onSave(){
      if(finished)return;
      finished = true;
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(outW / img.naturalWidth, outH / img.naturalHeight) * Number(zoom.value || 1);
      const x = Number(posX.value) / 100 * outW / 2;
      const y = Number(posY.value) / 100 * outH / 2;
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (outW - dw) / 2 + x, (outH - dh) / 2 + y, dw, dh);
      canvas.toBlob(blob=>{
        if(!blob){cleanup();reject(new Error('Falha ao cortar imagem'));return;}
        const name = String(file.name || 'imagem.jpg').replace(/\.[^.]+$/,'') + '-enquadrada.jpg';
        const croppedFile = new File([blob], name, {type:'image/jpeg'});
        const dataUrl = canvas.toDataURL('image/jpeg', .9);
        cleanup();
        resolve({file:croppedFile, dataUrl});
      }, 'image/jpeg', .9);
    }
    img.addEventListener('load',onLoad);
    zoom.addEventListener('input',render);
    posX.addEventListener('input',render);
    posY.addEventListener('input',render);
    close.addEventListener('click',onCancel);
    cancel.addEventListener('click',onCancel);
    save.addEventListener('click',onSave);
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
        return {id:p.id,name:p.name,cat:p.cat,cl:p.cl,price:p.price,old:p.old,badge:p.badge,sizes:p.sizes,desc:p.desc||''};
      }
      return p;
    });
    writeJson(PRODUCT_IMAGE_KEY, productImgs);
    if(window.vixiSaveCloud) window.vixiSaveCloud('vixiProductImages', productImgs);
    localStorage.setItem('vixiAdmin_v2', JSON.stringify(toSave));
    if(window.vixiSaveCloud) window.vixiSaveCloud('vixiAdmin_v2', toSave);
  }catch(e){showToast('Armazenamento cheio. Baixe o site para salvar permanentemente.');}
}

// ── Cart operations ──
function addCart(id,e){if(e)e.stopPropagation(); const p=getProduct(id); if(!p)return; const item=cart.find(x=>x.id===id); if(item)item.qty++; else cart.push({id,qty:1}); saveCart(); showToast(`${p.name} adicionado ao carrinho 🛍️`);}
function changeQty(id,delta){const item=cart.find(x=>x.id===id); if(!item)return; item.qty+=delta; if(item.qty<=0) cart=cart.filter(x=>x.id!==id); saveCart(); renderCart();}
function removeCart(id){cart=cart.filter(x=>x.id!==id); saveCart(); renderCart();}

function renderCart(){
  const box=document.getElementById('cartResults'); if(!box)return;
  let total=0;
  box.innerHTML=cart.map(i=>{
    const p=getProduct(i.id); if(!p)return'';
    total+=Number(p.price)*i.qty;
    return `<div class="store-row"><img src="${p.img}" alt="${escapeHtml(p.name)}"><div><h4>${escapeHtml(p.name)}</h4><p>${money(p.price)} × ${i.qty}</p></div><div class="store-actions"><button class="store-mini light" onclick="changeQty('${i.id}',-1)">−</button><strong>${i.qty}</strong><button class="store-mini light" onclick="changeQty('${i.id}',1)">+</button><button class="store-mini" onclick="removeCart('${i.id}')">Remover</button></div></div>`;
  }).join('')||'<div class="empty-state">Seu carrinho está vazio.</div>';
  const ct=document.getElementById('cartTotal'); if(ct) ct.textContent='Total: '+money(total);
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
  box.innerHTML=list.map(p=>`<div class="store-row"><img src="${p.img}" alt="${escapeHtml(p.name)}"><div><h4>${escapeHtml(p.name)}</h4><p>${getCatLabel(p.cat)} • ${money(p.price)}</p></div><div class="store-actions"><button class="store-mini" onclick="addCart('${p.id}')">Adicionar</button><button class="store-mini light" onclick="toggleFav('${p.id}');renderFavs()">Remover</button></div></div>`).join('')||'<div class="empty-state">Você ainda não favoritou nenhum produto.</div>';
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
  box.innerHTML = list.map(p=>`<div class="store-row"><img src="${p.img}" alt="${escapeHtml(p.name)}"><div><h4>${escapeHtml(p.name)}</h4><p>${getCatLabel(p.cat)} • ${money(p.price)}</p></div><div class="store-actions"><button class="store-mini" onclick="addCart('${p.id}')">Carrinho</button><button class="store-mini light" onclick="toggleFav('${p.id}')">Favoritar</button></div></div>`).join('')||'<div class="empty-state">Nenhum produto encontrado.</div>';
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
        +'<div class="acct-sep"></div>'
        +'<button class="acct-item" style="color:#c0392b" onclick="window.vixiLogout&&window.vixiLogout()">Sair da conta</button>'
      +'</div>';
    var toggle=document.getElementById('acctToggle');
    if(toggle){
      toggle.addEventListener('click',function(e){e.stopPropagation();dd.classList.toggle('open');});
      document.addEventListener('click',function(e){if(!dd.contains(e.target))dd.classList.remove('open');},{once:false});
    }
  }
}
window.syncHeaderAuth=syncHeaderAuth;

// ── checkoutWhatsApp ──
function checkoutWhatsApp(){
  if(!cart.length){showToast('Seu carrinho está vazio 🛒');return;}
  const lines = cart.map(i=>{const p=getProduct(i.id);return p?`• ${p.name} — ${i.qty}x — ${money(p.price)}`:''}).filter(Boolean);
  const total = cart.reduce((s,i)=>{const p=getProduct(i.id);return s+(p?Number(p.price)*i.qty:0)},0);
  const msg = encodeURIComponent(`Olá! Tenho interesse nestes produtos:\n\n${lines.join('\n')}\n\nTotal aproximado: ${money(total)}`);
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
      return { id: i.id, name: p.name, qty: i.qty || 1, price: Number(p.promo || p.price || 0) };
    }).filter(Boolean);

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
}
function filterSize(sz){
  activeSizeFilter=sz;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.f==='all'));
  visibleCount=12;
  renderProds('all');
  document.getElementById('colecao')?.scrollIntoView({behavior:'smooth'});
  showToast(`Mostrando tamanho ${sz} 📏`);
}
function loadMore(){visibleCount+=8;renderProds(document.querySelector('.tab.on')?.dataset.f||'all');}

function renderProds(filter='all'){
  currentFilter=filter;
  const grid=document.getElementById('prodGrid'); if(!grid) return;
  let list=PRODS.filter(p=>filter==='all'||p.cat===filter);
  if(activeSizeFilter) list=list.filter(p=>(p.sizes||[]).includes(activeSizeFilter));
  const show=list.slice(0,visibleCount);
  grid.innerHTML=show.map(p=>{
    const liked=favorites.includes(p.id);
    return `<article class="prod-card" data-cat="${p.cat}" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer">
      <div class="prod-img-wrap">
        ${(p.badge&&p.badge!=='FAV')?`<span class="pbadge ${String(p.badge).includes('%')?'off':'novo'}">${p.badge==='NOVO'?'Novo!':escapeHtml(p.badge)}</span>`:''}
        <button class="fav-btn ${liked?'liked':''}" onclick="toggleFav('${p.id}',this,event)" aria-label="Favoritar">${liked?'❤️':'🤍'}</button>
        <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" data-edit-product="${p.id}" data-edit-field="img"/>
      </div>
      <div class="prod-info">
        <div class="prod-cat">${getCatLabel(p.cat)}</div>
        <h4 class="prod-name" data-edit-product="${p.id}" data-edit-field="name">${escapeHtml(p.name)}</h4>
        <p class="prod-desc" data-edit-product="${p.id}" data-edit-field="desc">${escapeHtml(p.desc||'')}</p>
        <div class="prod-sizes">${(p.sizes||[]).map(s=>`<span class="psz" onclick="selectSize(this)">${escapeHtml(s)}</span>`).join('')}</div>
        <div class="prod-foot"><div class="prod-price">${p.old?`<span class="pold">${money(p.old)}</span>`:''}<span class="pnew" data-edit-product="${p.id}" data-edit-field="price">${money(p.price)}</span></div><button class="padd" onclick="addCart('${p.id}',event)" aria-label="Adicionar ao carrinho">+</button></div>
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
    nav.innerHTML='<a href="index.html">🏠 Início</a><div class="nav-dd"><button class="nav-dd-btn" type="button">🛍️ Roupas ▾</button><div class="nav-dd-menu"><a href="clothes.html">Todas as roupas</a>'+dd+'</div></div><a href="clothes.html" class="hot">🔥 Novidades</a><a href="conta.html">👤 Minha Conta</a>';
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
  if(sb)sb.addEventListener('click',function(){openStoreModal('searchModal');});
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
  // Prevent accidental drag on images and layout elements
  document.addEventListener('dragstart',function(e){
    if(e.target.tagName==='IMG'||e.target.closest('.prod-card,.hdr,header,.footer-sec,.ann')){
      e.preventDefault();
    }
  });
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
