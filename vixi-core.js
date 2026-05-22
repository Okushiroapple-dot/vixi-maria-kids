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
  {key:'whatsappCta', label:'Header WhatsApp CTA', selector:'.hdr-cta', type:'text'}
];

const VISUAL_FIELDS = [
  {key:'heroBadge', selector:'.hero-badge', type:'text'},
  {key:'heroTitle', selector:'.hero h1', type:'html'},
  {key:'heroSubtitle', selector:'.hero-sub', type:'text'},
  {key:'heroPrimaryCta', selector:'.hero-btns .btn-main', type:'text'},
  {key:'heroSecondaryCta', selector:'.hero-btns .btn-ghost', type:'text'},
  {key:'productsEyebrow', selector:'#colecao .eyebrow', type:'text'},
  {key:'productsTitle', selector:'#colecao h2', type:'text'},
  {key:'productsDesc', selector:'#colecao .sec-head p', type:'text'},
  {key:'promo1Eyebrow', selector:'.promo-card:nth-child(1) .eyebrow', type:'text'},
  {key:'promo1Title', selector:'.promo-card:nth-child(1) h3', type:'html'},
  {key:'promo1Cta', selector:'.promo-card:nth-child(1) .btn-main', type:'text'},
  {key:'promo2Eyebrow', selector:'.promo-card:nth-child(2) .eyebrow', type:'text'},
  {key:'promo2Title', selector:'.promo-card:nth-child(2) h3', type:'html'},
  {key:'promo2Cta', selector:'.promo-card:nth-child(2) .btn-main', type:'text'},
  {key:'aboutTitle', selector:'#sobre h2', type:'text'},
  {key:'aboutDesc', selector:'#sobre p', type:'text'},
  {key:'instagramTitle', selector:'#instagram h3', type:'text'},
  {key:'instagramDesc', selector:'#instagram > p:first-of-type', type:'html'},
  {key:'instagramFooter', selector:'#instagram > p:last-of-type', type:'text'},
  {key:'instagramCta', selector:'#instagram .ig-btn', type:'text'},
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
      const el = document.querySelector(`[data-banner-key="${key.slice(7)}"]`);
      if(el) el.style.backgroundImage = `linear-gradient(135deg,rgba(242,39,110,.72),rgba(30,0,26,.32)),url("${imgs[key]}")`;
    }else{
      const el = document.querySelector(`[data-image-key="${key}"]`);
      if(el) el.src = imgs[key];
    }
  });
}

// ── loadVisualContent / loadContent ──
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

// ── checkoutWhatsApp ──
function checkoutWhatsApp(){
  if(!cart.length){showToast('Seu carrinho está vazio 🛒');return;}
  const lines = cart.map(i=>{const p=getProduct(i.id);return p?`• ${p.name} — ${i.qty}x — ${money(p.price)}`:''}).filter(Boolean);
  const total = cart.reduce((s,i)=>{const p=getProduct(i.id);return s+(p?Number(p.price)*i.qty:0)},0);
  const msg = encodeURIComponent(`Olá! Tenho interesse nestes produtos:\n\n${lines.join('\n')}\n\nTotal aproximado: ${money(total)}`);
  window.open(`https://wa.me/${VIXI_WHATSAPP}?text=${msg}`,'_blank');
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
        ${p.badge?`<span class="pbadge ${p.badge==='FAV'?'fav':String(p.badge).includes('%')?'off':'novo'}">${escapeHtml(p.badge)}</span>`:''}
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
    nav.innerHTML='<a href="index.html">🏠 Início</a><div class="nav-dd"><button class="nav-dd-btn" type="button">🛍️ Roupas ▾</button><div class="nav-dd-menu"><a href="clothes.html">Todas as roupas</a>'+dd+'</div></div><a href="clothes.html" class="hot">🔥 Novidades</a>';
  }
  var mob=document.getElementById('mobMenu');
  if(mob){
    var close='<button class="mob-close" id="mobClose">✕</button>';
    var links=cats.map(function(c){return '<a href="clothes.html?cat='+c.id+'" onclick="closeMob()">'+c.icon+' '+escapeHtml(c.label)+'</a>';}).join('');
    mob.innerHTML=close+'<a href="index.html" onclick="closeMob()">🏠 Início</a><a href="clothes.html" onclick="closeMob()">🛍️ Todas as roupas</a>'+links+'<a href="cart.html" onclick="closeMob()">🛒 Carrinho</a><a href="https://wa.me/5516991781559" target="_blank">💬 WhatsApp</a>';
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
document.addEventListener('DOMContentLoaded', function(){
  updateCartBadge();
  syncCategoriesUI();
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
window.checkoutWhatsApp=checkoutWhatsApp;window.syncCategoriesUI=syncCategoriesUI;window.renderProds=renderProds;
window.closeMob=closeMob;window.updateCartBadge=updateCartBadge;window.getCats=getCats;window.saveCats=saveCats;
window.saveCart=saveCart;window.saveFavorites=saveFavorites;window.saveToStorage=saveToStorage;
window.loadContent=loadContent;window.applyProductImages=applyProductImages;window.applyVisualImages=applyVisualImages;
window.readJson=readJson;window.writeJson=writeJson;window.goBackOrHome=goBackOrHome;

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
