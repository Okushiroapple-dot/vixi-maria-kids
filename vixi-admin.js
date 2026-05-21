// ══════════════════════════════════════════
// vixi-admin.js  –  Vixi Maria Kids
// Admin panel: password, product CRUD,
// export, categories, visual editor hooks.
// Extracted from index.html lines 2256-2551
// + admin IIFE additions lines 2647-2680.
// ══════════════════════════════════════════

// ── Admin constants ──
const ADM_PW = 'viximaria2026';
const ADM_SIZES_ALL = ['RN','P','M','G','GG','2','4','6','8','10','12','14','16','18','20','Único'];
const CAT_LABELS = {meninos:'Meninos',acessorios:'Acessórios',bebes:'Bebês',meninas:'Meninas',juvenil:'Juvenil'};
let liveProducts = null;  // working copy
let currentPhotoB64 = null;
let editingProductId = null;
let logoTaps = 0, logoTimer;

// ── Secret logo tap ──
(function(){
  const logo = document.querySelector('.logo-icon');
  if(logo) logo.addEventListener('click', ()=>{
    logoTaps++;
    clearTimeout(logoTimer);
    if(logoTaps>=5){ logoTaps=0; showAdminTrigger(); }
    logoTimer = setTimeout(()=>logoTaps=0, 2000);
  });
  if(location.search.includes('admin')){ showAdminTrigger(); }
})();

function showAdminTrigger(){
  document.getElementById('adminTrigger').classList.add('visible');
  showToast('🔐 Acesso admin liberado!');
}
function openAdminPw(){
  document.getElementById('adminPwModal').classList.add('open');
  setTimeout(()=>document.getElementById('pwInput').focus(),300);
}
function closeAdminPw(){
  document.getElementById('adminPwModal').classList.remove('open');
  document.getElementById('pwInput').value='';
  document.getElementById('pwErr').style.display='none';
}
function checkPw(){
  const v = document.getElementById('pwInput').value.trim();
  if(v === ADM_PW){ closeAdminPw(); openAdmin(); }
  else{
    document.getElementById('pwErr').style.display='block';
    document.getElementById('pwInput').value='';
    document.getElementById('pwInput').focus();
  }
}

// ── Admin Open/Close ──
function openAdmin(){
  liveProducts = JSON.parse(JSON.stringify(PRODS)); // deep copy
  // Merge localStorage overrides
  try{
    const saved = JSON.parse(localStorage.getItem('vixiAdmin_v2')||'[]');
    saved.forEach(s=>{
      const idx = liveProducts.findIndex(p=>p.id===s.id);
      if(idx>=0) liveProducts[idx]={...liveProducts[idx],...s};
      else liveProducts.push(s);
    });
    // Remove deleted
    const deleted = JSON.parse(localStorage.getItem('vixiAdmin_deleted')||'[]');
    liveProducts = liveProducts.filter(p=>!deleted.includes(p.id));
  }catch(e){}
  document.getElementById('adminDash').classList.add('open');
  updateStats();
  renderAdminGrid();
  window.vixiAdminLogged = true;
  if(typeof applyProductImages==='function'){
    applyProductImages();
    if(liveProducts){
      const imgs = readJson(window.PRODUCT_IMAGE_KEY||'vixiProductImages',{});
      liveProducts.forEach(p=>{if(imgs[p.id]) p.img=imgs[p.id];});
      renderAdminGrid();
    }
  }
  buildAdminExtras();
  syncCategoriesUI();
}
function closeAdmin(){
  document.getElementById('adminDash').classList.remove('open');
  if(typeof stopVisualEditor==='function') stopVisualEditor();
}

// ── Stats ──
function updateStats(){
  document.getElementById('statTotal').textContent = liveProducts.length;
  document.getElementById('statMeninos').textContent = liveProducts.filter(p=>p.cat==='meninos').length;
  document.getElementById('statAcess').textContent = liveProducts.filter(p=>p.cat==='acessorios').length;
  document.getElementById('statBebes').textContent = liveProducts.filter(p=>p.cat==='bebes').length;
}

// ── Admin Grid ──
function renderAdminGrid(){
  if(!liveProducts) return;
  const q=(document.getElementById('admSearchInput')?.value||'').toLowerCase();
  const list=liveProducts.filter(p=>!q||p.name.toLowerCase().includes(q)||(getCatLabel?getCatLabel(p.cat):p.cl||'').toLowerCase().includes(q));
  const grid=document.getElementById('adminGrid'); if(!grid)return;
  grid.innerHTML=list.map(p=>`<div class="adm-pcard">${p.badge?`<div class="apc-badge">${p.badge}</div>`:''}<img src="${p.img}" alt="${typeof escapeHtml==='function'?escapeHtml(p.name):p.name}" loading="lazy"/><div class="apc-body"><div class="apc-cat">${typeof getCatIcon==='function'?getCatIcon(p.cat):''} ${typeof getCatLabel==='function'?getCatLabel(p.cat):p.cl||p.cat}</div><div class="apc-name">${typeof escapeHtml==='function'?escapeHtml(p.name):p.name}</div><div class="apc-price">${typeof money==='function'?money(p.price):'R$ '+Number(p.price).toFixed(2)}</div><div class="apc-btns"><button class="apc-btn edit" onclick="openEditModal('${p.id}')">✏️ Editar</button><button class="apc-btn del" onclick="confirmDelete('${p.id}')">🗑️</button></div></div></div>`).join('')||'<p style="color:var(--gray);font-weight:600;grid-column:1/-1;text-align:center;padding:40px 0">Nenhum produto encontrado 🔍</p>';
}

// ── Edit Modal ──
function openEditModal(id){
  const p = (liveProducts||PRODS).find(x=>x.id===id);
  if(!p) return;
  editingProductId = id;
  currentPhotoB64 = p.img;
  document.getElementById('admModalTitle').textContent = '✏️ Editar Produto';
  document.getElementById('admName').value = p.name;
  syncCategoriesUI();
  document.getElementById('admCat').value = p.cat || (typeof getCats==='function'?getCats()[0]?.id:'meninos') || 'meninos';
  document.getElementById('admPrice').value = p.price;
  document.getElementById('admOld').value = p.old||'';
  document.getElementById('admBadge').value = p.badge||'';
  // Photo preview
  const area = document.getElementById('photoUploadArea');
  const preview = document.getElementById('photoPreview');
  preview.src = p.img||'';
  if(p.img){
    area.classList.add('has-img');
  } else {
    area.classList.remove('has-img');
  }
  // Sizes
  buildSizesGrid(p.sizes||[]);
  document.getElementById('admModal').classList.add('open');
}
function openAddModal(){
  editingProductId = null;
  currentPhotoB64 = null;
  document.getElementById('admModalTitle').textContent = '➕ Novo Produto';
  document.getElementById('admName').value='';
  syncCategoriesUI();
  const cats = typeof getCats==='function' ? getCats() : [];
  document.getElementById('admCat').value = cats[0]?.id || 'meninas';
  document.getElementById('admPrice').value='';
  document.getElementById('admOld').value='';
  document.getElementById('admBadge').value='';
  document.getElementById('photoPreview').src='';
  document.getElementById('photoUploadArea').classList.remove('has-img');
  buildSizesGrid([]);
  document.getElementById('admModal').classList.add('open');
}
function closeAdmModal(){
  document.getElementById('admModal').classList.remove('open');
}
function buildSizesGrid(selected){
  document.getElementById('sizesGrid').innerHTML = ADM_SIZES_ALL.map(sz=>`
    <div class="sz-check">
      <input type="checkbox" id="sz_${sz}" value="${sz}" ${selected.includes(sz)?'checked':''}>
      <label for="sz_${sz}">${sz}</label>
    </div>
  `).join('');
}
function getSelectedSizes(){
  return ADM_SIZES_ALL.filter(sz=>{
    const el = document.getElementById('sz_'+sz);
    return el && el.checked;
  });
}

// ── Photo upload ──
async function handlePhotoUpload(e){
  const file = e.target.files[0];
  if(!file) return;
  const area = document.getElementById('photoUploadArea');
  const preview = document.getElementById('photoPreview');
  try{
    showToast('Enviando imagem para o Firebase...');
    const url = await window.vixiUploadImage(file, 'produtos');
    currentPhotoB64 = url;
    preview.src = url;
    area.classList.add('has-img');
    showToast('Imagem enviada ✅');
  }catch(err){
    console.error(err);
    showToast('Firebase falhou. Usando prévia local.');
    const reader = new FileReader();
    reader.onload = function(ev){
      currentPhotoB64 = ev.target.result;
      preview.src = currentPhotoB64;
      area.classList.add('has-img');
    };
    reader.readAsDataURL(file);
  }
}

// ── Save product ──
function saveProduct(){
  const name = document.getElementById('admName').value.trim();
  const price = parseFloat(document.getElementById('admPrice').value);
  if(!name){ showToast('Por favor, escreva o nome do produto! 🏷️'); return; }
  if(!price||price<=0){ showToast('Por favor, coloque o preço! 💰'); return; }
  const sizes = getSelectedSizes();
  if(!sizes.length){ showToast('Selecione pelo menos um tamanho! 📏'); return; }
  const cat = document.getElementById('admCat').value;
  const old = parseFloat(document.getElementById('admOld').value)||null;
  const badge = document.getElementById('admBadge').value||null;
  const img = currentPhotoB64 || (editingProductId ? (liveProducts||PRODS).find(p=>p.id===editingProductId)?.img : null);
  if(!img){ showToast('Por favor, adicione uma foto do produto! 📸'); return; }
  if(!liveProducts) liveProducts=JSON.parse(JSON.stringify(PRODS));
  if(editingProductId){
    const idx = liveProducts.findIndex(p=>p.id===editingProductId);
    if(idx>=0){
      liveProducts[idx]={...liveProducts[idx],name,cat,cl:(typeof getCatLabel==='function'?getCatLabel(cat):CAT_LABELS[cat]||cat),price,old,badge,sizes,img};
    }
  } else {
    const newId = 'custom_'+Date.now();
    liveProducts.push({id:newId,name,cat,cl:(typeof getCatLabel==='function'?getCatLabel(cat):CAT_LABELS[cat]||cat),price,old,badge,sizes,img});
  }
  if(typeof saveToStorage==='function') saveToStorage();
  renderAdminGrid();
  updateStats();
  // Apply to live store
  PRODS.length = 0;
  liveProducts.forEach(p=>PRODS.push(p));
  if(typeof visibleCount!=='undefined') window.visibleCount = 12;
  if(typeof renderProds==='function') renderProds(document.querySelector('.tab.on')?.dataset?.f||'all');
  if(typeof applyProductImages==='function') applyProductImages();
  if(typeof startWeeklyFavoritesCarousel==='function') startWeeklyFavoritesCarousel();
  closeAdmModal();
  showToast('✅ Produto salvo com sucesso!');
}

// ── Delete ──
function confirmDelete(id){
  const p = liveProducts.find(x=>x.id===id);
  document.getElementById('admConfirmName').textContent = `"${p?.name}" será removido da loja.`;
  document.getElementById('admConfirmDelBtn').onclick = ()=>deleteProduct(id);
  document.getElementById('admConfirm').classList.add('open');
}
function deleteProduct(id){
  liveProducts = liveProducts.filter(p=>p.id!==id);
  // Track deleted IDs
  try{
    const deleted = JSON.parse(localStorage.getItem('vixiAdmin_deleted')||'[]');
    deleted.push(id);
    localStorage.setItem('vixiAdmin_deleted', JSON.stringify(deleted));
  }catch(e){}
  if(typeof saveToStorage==='function') saveToStorage();
  renderAdminGrid();
  updateStats();
  PRODS.length=0;
  liveProducts.forEach(p=>PRODS.push(p));
  if(typeof visibleCount!=='undefined') window.visibleCount = 12;
  if(typeof renderProds==='function') renderProds(document.querySelector('.tab.on')?.dataset?.f||'all');
  document.getElementById('admConfirm').classList.remove('open');
  showToast('🗑️ Produto removido!');
}

// ── Export ──
function exportSite(){
  if(typeof saveVisualNow==='function') saveVisualNow();
  if(typeof loadContent==='function') loadContent();
  if(typeof syncCategoriesUI==='function') syncCategoriesUI();
  const toast = document.getElementById('admExportToast');
  document.getElementById('admExportMsg').textContent = 'Preparando download...';
  toast.classList.add('show');
  setTimeout(()=>{
    try{
      let src = document.documentElement.outerHTML;
      const prodJs = JSON.stringify(liveProducts||PRODS);
      const start = src.indexOf('let visibleCount = 12;\nconst PRODS = [');
      const end = src.indexOf('\n];', start) + 3;
      if(start>-1 && end>start){
        src = src.slice(0,start) + `let visibleCount = 12;\nconst PRODS = ${prodJs};` + src.slice(end);
      }
      const catsJs = JSON.stringify(typeof getCats==='function'?getCats():[],null,2);
      src = src.replace(/const DEFAULT_CATEGORIES = \[[\s\S]*?\n\];/, 'const DEFAULT_CATEGORIES = '+catsJs+';');
      const blob = new Blob([src],{type:'text/html;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href=url; a.download='vixi-maria-kids-atualizado.html';
      a.click();
      URL.revokeObjectURL(url);
      document.getElementById('admExportMsg').textContent = 'Download iniciado ✅';
      setTimeout(()=>toast.classList.remove('show'),3000);
    }catch(e){
      document.getElementById('admExportMsg').textContent = 'Erro no download 😢';
      setTimeout(()=>toast.classList.remove('show'),3000);
    }
  },400);
}

// ── buildAdminExtras (from IIFE additions, lines 2647-2680) ──
function buildAdminExtras(){
  const dash = document.getElementById('adminDash');
  if(!dash) return;
  document.getElementById('adminExtra')?.remove();
  const extra = document.createElement('div');
  extra.id = 'adminExtra';
  extra.className = 'admin-extra';
  extra.innerHTML = `<div class="admin-extra-tabs">
    <button class="on" data-admin-tab="products">Produtos</button>
    <button data-admin-tab="visual">✏️ Edit Page</button>
    <button data-admin-tab="categories">Categorias</button>
    <button data-admin-tab="images">Banners/Imagens</button>
  </div>
  <div id="adminVisual" class="admin-extra-panel">
    <div class="admin-visual-actions">
      <button class="mini-btn primary" onclick="startVisualEditor&&startVisualEditor()">✏️ Edit Page</button>
      <button class="mini-btn soft" onclick="closeAdmin();startVisualEditor&&startVisualEditor()">Editar visualmente</button>
    </div>
  </div>
  <div id="adminCats" class="admin-extra-panel"><div class="cat-editor" id="catEditor"></div><button class="mini-btn" onclick="addCategoryRow()">+ Nova categoria</button><button class="mini-btn primary" onclick="saveCategoriesFromAdmin()">Salvar categorias</button></div>
  <div id="adminImages" class="admin-extra-panel"><div class="admin-visual-actions"><button class="mini-btn primary" onclick="closeAdmin();startVisualEditor&&startVisualEditor();setTimeout(()=>document.querySelector('.hero')?.scrollIntoView({behavior:'smooth'}),80)">Editar imagens na página</button><button class="mini-btn soft" onclick="openAddModal()">Novo produto com foto</button></div></div>`;
  dash.insertBefore(extra,dash.children[1]||dash.firstChild);
  extra.querySelectorAll('[data-admin-tab]').forEach(b=>b.onclick=()=>{
    extra.querySelectorAll('[data-admin-tab]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    document.getElementById('adminVisual').classList.toggle('on',b.dataset.adminTab==='visual');
    document.getElementById('adminCats').classList.toggle('on',b.dataset.adminTab==='categories');
    document.getElementById('adminImages').classList.toggle('on',b.dataset.adminTab==='images');
  });
  renderCatEditor();
}

// ── Category editor helpers ──
function renderCatEditor(){
  const box = document.getElementById('catEditor');
  if(!box) return;
  const cats = typeof getCats==='function'?getCats():[];
  box.innerHTML = cats.map(c=>`<div class="cat-row"><input placeholder="Ícone" value="${typeof escapeHtml==='function'?escapeHtml(c.icon):c.icon}"><input placeholder="ID" value="${typeof escapeHtml==='function'?escapeHtml(c.id):c.id}"><input placeholder="Nome" value="${typeof escapeHtml==='function'?escapeHtml(c.label):c.label}"><button class="move" onclick="moveCategoryRow(this,-1)">↑</button><button class="move" onclick="moveCategoryRow(this,1)">↓</button><button onclick="this.closest('.cat-row').remove()">Remover</button></div>`).join('');
}
function addCategoryRow(){
  document.getElementById('catEditor')?.insertAdjacentHTML('beforeend','<div class="cat-row"><input placeholder="🛍️" value="🛍️"><input placeholder="ex: praia"><input placeholder="Nome da categoria"><button class="move" onclick="moveCategoryRow(this,-1)">↑</button><button class="move" onclick="moveCategoryRow(this,1)">↓</button><button onclick="this.closest(\'.cat-row\').remove()">Remover</button></div>');
}
function moveCategoryRow(btn,dir){
  const row = btn.closest('.cat-row');
  const sib = dir<0 ? row.previousElementSibling : row.nextElementSibling;
  if(!sib) return;
  row.parentNode.insertBefore(dir<0 ? row : sib, dir<0 ? sib : row);
}
function saveCategoriesFromAdmin(){
  const rows = [...document.querySelectorAll('#catEditor .cat-row')];
  const cats = rows.map(r=>{
    const i = r.querySelectorAll('input');
    const id = (i[1].value||i[2].value||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    return {icon:i[0].value||'🛍️', id, label:i[2].value||id};
  }).filter(c=>c.id&&c.label);
  if(!cats.length){showToast('Crie pelo menos uma categoria.');return;}
  if(typeof saveCats==='function') saveCats(cats);
  if(typeof syncCategoriesUI==='function') syncCategoriesUI();
  renderCatEditor();
  if(typeof renderProds==='function') renderProds(window.currentFilter||'all');
  showToast('Categorias atualizadas');
}
function saveContentFromAdmin(){
  const data={};
  const FIELDS = typeof CONTENT_FIELDS!=='undefined'?CONTENT_FIELDS:[];
  FIELDS.forEach(f=>{const inp=document.getElementById('content_'+f.key); if(inp)data[f.key]=inp.value;});
  localStorage.setItem('vixiContent',JSON.stringify(data));
  if(typeof loadContent==='function') loadContent();
  showToast('Textos atualizados ✅');
}

// ── Window exports ──
window.openAdminPw=openAdminPw||window.openAdminPw;
window.checkPw=typeof checkPw!=='undefined'?checkPw:window.checkPw;
window.closeAdmin=typeof closeAdmin!=='undefined'?closeAdmin:window.closeAdmin;
window.saveProduct=typeof saveProduct!=='undefined'?saveProduct:window.saveProduct;
window.deleteProduct=typeof deleteProduct!=='undefined'?deleteProduct:window.deleteProduct;
window.openEditModal=typeof openEditModal!=='undefined'?openEditModal:window.openEditModal;
window.closeAdmModal=typeof closeAdmModal!=='undefined'?closeAdmModal:window.closeAdmModal;
window.exportSite=typeof exportSite!=='undefined'?exportSite:window.exportSite;
window.handlePhotoUpload=typeof handlePhotoUpload!=='undefined'?handlePhotoUpload:window.handlePhotoUpload;
window.buildAdminExtras=typeof buildAdminExtras!=='undefined'?buildAdminExtras:window.buildAdminExtras;
window.renderAdminGrid=typeof renderAdminGrid!=='undefined'?renderAdminGrid:window.renderAdminGrid;
window.saveToStorage=typeof saveToStorage!=='undefined'?saveToStorage:window.saveToStorage;
window.openAddModal=typeof openAddModal!=='undefined'?openAddModal:window.openAddModal;
window.openAdmin=typeof openAdmin!=='undefined'?openAdmin:window.openAdmin;
window.confirmDelete=typeof confirmDelete!=='undefined'?confirmDelete:window.confirmDelete;
window.liveProducts=liveProducts;
