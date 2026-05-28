// ══════════════════════════════════════════
// vixi-admin.js  –  Vixi Maria Kids
// Admin panel: password, product CRUD,
// export, categories, visual editor hooks.
// Extracted from index.html lines 2256-2551
// + admin IIFE additions lines 2647-2680.
// ══════════════════════════════════════════

// ── Admin constants ──
const ADMIN_EMAIL = 'viximariakids@viximariakids.com';
const ADM_SIZES_ALL = ['RN','1','2','4','6','8','10','12','14','16','18','20','Único'];
const CAT_LABELS = {meninos:'Meninos',acessorios:'Acessórios',bebes:'Bebês',meninas:'Meninas',juvenil:'Juvenil'};
let liveProducts = null;  // working copy
let currentPhotoB64 = null;
let editingProductId = null;
let logoTaps = 0, logoTimer;

function ensureAdminShell(){
  if(!document.body) return;
  if(!document.getElementById('adminPwModal')){
    document.body.insertAdjacentHTML('beforeend',`<div id="adminPwModal">
      <div class="pw-card">
        <div class="pw-logo">🌸</div>
        <div class="pw-title">Área da Débora</div>
        <div class="pw-sub">Faça login para editar a loja</div>
        <input class="pw-input" type="text" id="adminUser" placeholder="Usuário" autocomplete="username" onkeydown="if(event.key==='Enter')document.getElementById('adminPass').focus()">
        <input class="pw-input" type="password" id="adminPass" placeholder="Senha" autocomplete="current-password" onkeydown="if(event.key==='Enter')checkAdminLogin()" style="margin-top:10px">
        <p class="pw-err" id="pwErr" style="display:none;">Usuário ou senha incorretos.</p>
        <button class="pw-btn" onclick="checkAdminLogin()">Entrar 🌸</button>
        <button class="pw-cancel" onclick="closeAdminPw()">Cancelar</button>
      </div>
    </div>`);
  }
  if(!document.getElementById('adminDash')){
    document.body.insertAdjacentHTML('beforeend',`<div id="adminDash">
      <div class="adm-hdr">
        <div class="logo-adm">🌸 vixi maria <span class="adm-badge">ADMIN</span></div>
        <div class="adm-hdr-btns">
          <button class="adm-hbtn" onclick="closeAdmin()">Ver pagina</button>
          <button class="adm-hbtn export" onclick="exportSite()">Baixar site</button>
          <button class="adm-hbtn" onclick="closeAdmin()">Sair</button>
        </div>
      </div>
      <div class="adm-stats" id="admStats"></div>
      <div class="adm-search">
        <input type="text" placeholder="Buscar produto..." id="admSearchInput" oninput="renderAdminGrid()">
        <button class="adm-add-btn" onclick="openAddModal()">+ Novo produto</button>
      </div>
      <div class="adm-body"><div class="adm-grid" id="adminGrid"></div></div>
    </div>`);
  }
  if(!document.getElementById('admModal')){
    document.body.insertAdjacentHTML('beforeend',`<div id="admModal">
      <div class="adm-modal-box">
        <div class="adm-modal-title"><span id="admModalTitle">+ Novo Produto</span><button class="adm-modal-close" onclick="closeAdmModal()">x</button></div>
        <div class="adm-field">
          <span class="adm-label">Foto do Produto</span>
          <div class="adm-photo-upload" id="photoUploadArea" onclick="document.getElementById('photoFileInput').click()">
            <img id="photoPreview" src="" alt="">
            <div class="adm-photo-placeholder"><span class="big">📸</span>Clique para escolher uma foto da galeria</div>
            <input type="file" id="photoFileInput" accept="image/*" onchange="handlePhotoUpload(event)" style="display:none">
          </div>
        </div>
        <div class="adm-field"><span class="adm-label">Nome do Produto</span><input class="adm-input" type="text" id="admName" placeholder="Ex: Vestido Floral Rosa"></div>
        <div class="adm-field"><span class="adm-label">Categoria</span><select class="adm-input" id="admCat"></select></div>
        <div class="adm-row">
          <div class="adm-field"><span class="adm-label">Preco (R$)</span><input class="adm-input" type="number" id="admPrice" placeholder="0" min="0" step="0.01"></div>
          <div class="adm-field"><span class="adm-label">Preco antigo (R$)</span><input class="adm-input" type="number" id="admOld" placeholder="Deixe vazio" min="0" step="0.01"></div>
        </div>
        <div class="adm-field"><span class="adm-label">Destaque (badge)</span><select class="adm-input" id="admBadge"><option value="">Nenhum</option><option value="NOVO">NOVO</option><option value="FAV">FAVORITO</option><option value="-10%">-10%</option><option value="-20%">-20%</option><option value="-30%">-30%</option><option value="-40%">-40%</option><option value="-50%">-50%</option></select></div>
        <div class="adm-field"><span class="adm-label">Tamanhos disponiveis</span><div class="adm-sizes-grid" id="sizesGrid"></div></div>
        <div class="adm-field"><span class="adm-label">Descrição (opcional)</span><textarea class="adm-input" id="admDesc" placeholder="Ex: Vestido com detalhes em renda, ideal para festas..." rows="2" style="resize:vertical;min-height:60px;font-family:inherit"></textarea></div>
        <div class="adm-modal-btns"><button class="adm-cancel-btn" onclick="closeAdmModal()">Cancelar</button><button class="adm-save-btn" onclick="saveProduct()">Salvar produto</button></div>
      </div>
    </div>`);
  }
  if(!document.getElementById('admConfirm')){
    document.body.insertAdjacentHTML('beforeend',`<div id="admConfirm"><div class="adm-confirm-box"><h3>Excluir produto?</h3><p id="admConfirmName">Este produto sera removido da loja.</p><div class="adm-confirm-btns"><button class="adm-confirm-cancel" onclick="document.getElementById('admConfirm').classList.remove('open')">Cancelar</button><button class="adm-confirm-del" id="admConfirmDelBtn">Excluir</button></div></div></div>`);
  }
  if(!document.getElementById('admExportToast')){
    document.body.insertAdjacentHTML('beforeend','<div id="admExportToast">⬇ <span id="admExportMsg">Preparando download...</span></div>');
  }
}

// ── Secret logo tap → goes to admin.html ──
(function(){
  const logo = document.querySelector('.logo-icon');
  if(logo) logo.addEventListener('click', ()=>{
    logoTaps++;
    clearTimeout(logoTimer);
    if(logoTaps>=5){ logoTaps=0; window.location.href='admin.html'; }
    logoTimer = setTimeout(()=>logoTaps=0, 2000);
  });
})();

function showAdminTrigger(){
  if(typeof syncAdminNav==='function') syncAdminNav();
}
function openAdminPw(){
  ensureAdminShell();
  document.getElementById('adminPwModal').classList.add('open');
  setTimeout(()=>{ var u=document.getElementById('adminUser'); if(u) u.focus(); },300);
}
function closeAdminPw(){
  document.getElementById('adminPwModal').classList.remove('open');
  var u=document.getElementById('adminUser'); if(u) u.value='';
  var p=document.getElementById('adminPass'); if(p) p.value='';
  document.getElementById('pwErr').style.display='none';
}
async function checkAdminLogin(){
  var user = (document.getElementById('adminUser')||{}).value?.trim();
  var pass = (document.getElementById('adminPass')||{}).value;
  var errEl = document.getElementById('pwErr');
  var btn   = document.querySelector('#adminPwModal .pw-btn');
  errEl.style.display='none';
  if(!user||!pass){ errEl.textContent='Preencha usuário e senha.'; errEl.style.display='block'; return; }
  if(!window.vixiLogin){ errEl.textContent='Aguarde o carregamento e tente novamente.'; errEl.style.display='block'; return; }
  btn.textContent='Entrando...'; btn.disabled=true;
  var email = user==='viximariakids' ? ADMIN_EMAIL : null;
  if(!email){
    errEl.textContent='Usuário ou senha incorretos.'; errEl.style.display='block';
    btn.textContent='Entrar 🌸'; btn.disabled=false; return;
  }
  try{
    var logged = await window.vixiLogin(email, pass);
    if(logged.email===ADMIN_EMAIL){
      sessionStorage.setItem('vixiAdminLogged','1');
      closeAdminPw(); openAdmin();
    }else{
      if(window.vixiLogout) await window.vixiLogout();
      errEl.textContent='Acesso não autorizado.'; errEl.style.display='block';
    }
  }catch(e){
    var msg = (e.code==='auth/wrong-password'||e.code==='auth/invalid-credential')
      ? 'Usuário ou senha incorretos.'
      : 'Erro ao entrar. Tente novamente.';
    errEl.textContent=msg; errEl.style.display='block';
  }
  btn.textContent='Entrar 🌸'; btn.disabled=false;
}

// ── Admin Open/Close ──
function openAdmin(){
  ensureAdminShell();
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
  window.liveProducts = liveProducts;
  var loginBg = document.getElementById('adminLoginBg');
  if (loginBg) loginBg.style.display = 'none';
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
  ensureAdminShell();
  document.getElementById('adminDash').classList.remove('open');
  if(typeof stopVisualEditor==='function') stopVisualEditor();
}

// ── Stats (fully dynamic) ──
function updateStats(){
  const box = document.getElementById('admStats');
  if(!box || !liveProducts) return;
  const cats = typeof getCats==='function' ? getCats() : [];
  const counts = {};
  liveProducts.forEach(p=>{ counts[p.cat]=(counts[p.cat]||0)+1; });
  let html = `<div class="adm-stat"><span class="sn">${liveProducts.length}</span><span class="sl">Total</span></div>`;
  cats.forEach(c=>{
    html += `<div class="adm-stat"><span class="sn">${counts[c.id]||0}</span><span class="sl">${c.icon} ${c.label}</span></div>`;
  });
  // Any category not in the defined list
  Object.keys(counts).forEach(id=>{
    if(!cats.find(c=>c.id===id)){
      html += `<div class="adm-stat"><span class="sn">${counts[id]}</span><span class="sl">🛍️ ${id}</span></div>`;
    }
  });
  box.innerHTML = html;
}

// ── Admin Grid ──
function renderAdminGrid(){
  if(!liveProducts) return;
  const q=(document.getElementById('admSearchInput')?.value||'').toLowerCase();
  const list=liveProducts.filter(p=>!q||p.name.toLowerCase().includes(q)||(getCatLabel?getCatLabel(p.cat):p.cl||'').toLowerCase().includes(q));
  const grid=document.getElementById('adminGrid'); if(!grid)return;
  grid.innerHTML=list.map((p,i)=>`<div class="adm-pcard" data-id="${p.id}" draggable="true"><div class="apc-drag-handle" title="Arraste para reordenar">⠿⠿</div>${p.badge?`<div class="apc-badge">${p.badge}</div>`:''}<img src="${p.img}" alt="${typeof escapeHtml==='function'?escapeHtml(p.name):p.name}" loading="lazy"/><div class="apc-body"><div class="apc-cat">${typeof getCatIcon==='function'?getCatIcon(p.cat):''} ${typeof getCatLabel==='function'?getCatLabel(p.cat):p.cl||p.cat}</div><div class="apc-name">${typeof escapeHtml==='function'?escapeHtml(p.name):p.name}</div><div class="apc-price">${typeof money==='function'?money(p.price):'R$ '+Number(p.price).toFixed(2)}</div><div class="apc-btns"><button class="apc-btn move" onclick="moveProduct('${p.id}',-1)" title="Mover para cima">↑</button><button class="apc-btn move" onclick="moveProduct('${p.id}',1)" title="Mover para baixo">↓</button><button class="apc-btn edit" onclick="openEditModal('${p.id}')">✏️ Editar</button><button class="apc-btn del" onclick="confirmDelete('${p.id}')">🗑️</button></div></div></div>`).join('')||'<p style="color:var(--gray);font-weight:600;grid-column:1/-1;text-align:center;padding:40px 0">Nenhum produto encontrado 🔍</p>';
  _attachAdmDragHandlers();
}

// ── Admin grid drag-and-drop ──
var _admDragSrc = null;

function _attachAdmDragHandlers(){
  var grid = document.getElementById('adminGrid');
  if(!grid) return;
  grid.querySelectorAll('.adm-pcard').forEach(function(card){
    card.addEventListener('dragstart', _admDragStart);
    card.addEventListener('dragover',  _admDragOver);
    card.addEventListener('dragleave', _admDragLeave);
    card.addEventListener('drop',      _admDrop);
    card.addEventListener('dragend',   _admDragEnd);
  });
}

function _admDragStart(e){
  if(e.target.tagName === 'BUTTON'){ e.preventDefault(); return; }
  _admDragSrc = this.dataset.id;
  var self = this;
  setTimeout(function(){ self.classList.add('adm-dragging'); }, 0);
  if(e.dataTransfer){ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain', _admDragSrc||''); }
}

function _admDragOver(e){
  e.preventDefault();
  if(e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  if(this.dataset.id !== _admDragSrc) this.classList.add('adm-drag-over');
}

function _admDragLeave(e){
  if(!this.contains(e.relatedTarget)) this.classList.remove('adm-drag-over');
}

function _admDrop(e){
  e.preventDefault(); e.stopPropagation();
  var targetId = this.dataset.id;
  this.classList.remove('adm-drag-over');
  if(!_admDragSrc || _admDragSrc === targetId || !liveProducts) return;
  var srcIdx = liveProducts.findIndex(function(p){ return p.id === _admDragSrc; });
  var tgtIdx = liveProducts.findIndex(function(p){ return p.id === targetId; });
  if(srcIdx < 0 || tgtIdx < 0) return;
  var moved = liveProducts.splice(srcIdx, 1)[0];
  liveProducts.splice(tgtIdx, 0, moved);
  PRODS.length = 0;
  liveProducts.forEach(function(p){ PRODS.push(p); });
  window.liveProducts = liveProducts;
  if(typeof saveToStorage === 'function') saveToStorage();
  renderAdminGrid();
  if(typeof showToast === 'function') showToast('Ordem dos produtos atualizada ✅');
}

function _admDragEnd(){
  _admDragSrc = null;
  document.querySelectorAll('.adm-pcard').forEach(function(c){
    c.classList.remove('adm-dragging', 'adm-drag-over');
  });
}

// ── Reorder products ──
function moveProduct(id, dir) {
  if (!liveProducts) return;
  var idx = liveProducts.findIndex(p => p.id === id);
  if (idx < 0) return;
  var newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= liveProducts.length) return;
  var tmp = liveProducts[idx];
  liveProducts[idx] = liveProducts[newIdx];
  liveProducts[newIdx] = tmp;
  if (typeof saveToStorage === 'function') saveToStorage();
  PRODS.length = 0;
  liveProducts.forEach(p => PRODS.push(p));
  window.liveProducts = liveProducts;
  renderAdminGrid();
}
window.moveProduct = moveProduct;

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
  var descEl = document.getElementById('admDesc');
  if (descEl) descEl.value = p.desc||'';
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
  var descEl=document.getElementById('admDesc'); if(descEl) descEl.value='';
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
  const cropped = window.vixiCropImageFile
    ? await window.vixiCropImageFile(file,{aspect:1,width:1200,title:'Enquadrar foto do produto'})
    : null;
  if(window.vixiCropImageFile && !cropped) return;
  const uploadFile = cropped?.file || file;
  try{
    showToast('Enviando imagem para o Firebase...');
    const url = await window.vixiUploadImage(uploadFile, 'produtos');
    currentPhotoB64 = url;
    preview.src = url;
    area.classList.add('has-img');
    showToast('Imagem enviada ✅');
  }catch(err){
    console.error(err);
    showToast('Firebase falhou. Usando prévia local.');
    const reader = new FileReader();
    reader.onload = function(ev){
      currentPhotoB64 = cropped?.dataUrl || ev.target.result;
      preview.src = currentPhotoB64;
      area.classList.add('has-img');
    };
    if(cropped?.dataUrl) reader.onload({target:{result:cropped.dataUrl}});
    else reader.readAsDataURL(file);
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
  const badge = document.getElementById('admBadge').value||null;
  const oldRaw = parseFloat(document.getElementById('admOld').value)||null;
  const pctMatch = badge ? String(badge).match(/^-?(\d+)%$/) : null;
  const old = oldRaw || (pctMatch && price > 0 ? Math.ceil(price / (1 - parseInt(pctMatch[1],10)/100)) : null);
  const descEl = document.getElementById('admDesc');
  const desc = descEl ? descEl.value.trim() : '';
  const img = currentPhotoB64 || (editingProductId ? (liveProducts||PRODS).find(p=>p.id===editingProductId)?.img : null);
  if(!img){ showToast('Por favor, adicione uma foto do produto! 📸'); return; }
  if(!liveProducts) liveProducts=JSON.parse(JSON.stringify(PRODS));
  if(editingProductId){
    const idx = liveProducts.findIndex(p=>p.id===editingProductId);
    if(idx>=0){
      liveProducts[idx]={...liveProducts[idx],name,cat,cl:(typeof getCatLabel==='function'?getCatLabel(cat):CAT_LABELS[cat]||cat),price,old,badge,sizes,img,desc};
    }
  } else {
    const newId = 'custom_'+Date.now();
    liveProducts.push({id:newId,name,cat,cl:(typeof getCatLabel==='function'?getCatLabel(cat):CAT_LABELS[cat]||cat),price,old,badge,sizes,img,desc});
  }
  if(typeof saveToStorage==='function') saveToStorage();
  renderAdminGrid();
  updateStats();
  // Apply to live store
  PRODS.length = 0;
  liveProducts.forEach(p=>PRODS.push(p));
  window.liveProducts = liveProducts;
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
  window.liveProducts = liveProducts;
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
    <button data-admin-tab="orders">📦 Pedidos</button>
    <button data-admin-tab="visual">✏️ Editar Textos</button>
    <button data-admin-tab="categories">Categorias</button>
    <button data-admin-tab="badges">🏷️ Tags</button>
    <button data-admin-tab="backup">💾 Backups</button>
  </div>
  <div id="adminOrdersPanel" class="admin-extra-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <p style="font-size:13px;font-weight:700;color:var(--gray);margin:0">Últimos pedidos recebidos na loja</p>
      <button class="mini-btn soft" onclick="loadAdminOrders()">↺ Atualizar</button>
    </div>
    <div id="adminOrdersList" style="display:grid;gap:10px;max-height:380px;overflow-y:auto;padding-right:4px"></div>
  </div>
  <div id="adminBadgesPanel" class="admin-extra-panel">
    <p style="font-size:13px;font-weight:700;color:var(--gray);margin:0 0 14px">Estilo das tags dos produtos</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px" id="badgeStyleBtns">
      <button class="badge-preset-btn" data-style="" onclick="setBadgeStyle('')" style="padding:12px 8px;border-radius:14px;border:2px solid var(--line);background:#fff;cursor:pointer;font-family:var(--font-b);font-weight:700;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .2s">
        <span style="background:#1e101e;color:#fff;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:800">Novo!</span>Sólido
      </button>
      <button class="badge-preset-btn" data-style="soft" onclick="setBadgeStyle('soft')" style="padding:12px 8px;border-radius:14px;border:2px solid var(--line);background:#fff;cursor:pointer;font-family:var(--font-b);font-weight:700;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .2s">
        <span style="background:rgba(22,16,28,.72);color:#fff;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:800">Novo!</span>Suave
      </button>
      <button class="badge-preset-btn" data-style="outline" onclick="setBadgeStyle('outline')" style="padding:12px 8px;border-radius:14px;border:2px solid var(--line);background:#fff;cursor:pointer;font-family:var(--font-b);font-weight:700;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .2s">
        <span style="box-shadow:inset 0 0 0 1.5px #1e101e;color:#1e101e;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:800">Novo!</span>Contorno
      </button>
    </div>
    <p style="font-size:12px;color:var(--gray);font-weight:600;margin:0">FAV é uma tag interna — não aparece nos cards, usada para destacar produtos no carrossel.</p>
  </div>
  <div id="adminVisual" class="admin-extra-panel">
    <div class="admin-visual-actions" style="margin-bottom:12px">
      <button class="mini-btn primary" onclick="closeAdmin();startVisualEditor()">Editar textos na pagina atual</button>
      <button class="mini-btn soft" onclick="closeAdmin();startVisualEditor()">Alterar banners/imagens</button>
    </div>
    <div id="contentEditorFields" style="display:grid;gap:10px;max-height:320px;overflow-y:auto;padding-right:4px;margin-bottom:12px"></div>
    <button class="mini-btn primary" onclick="saveContentFromAdmin()" style="width:100%">💾 Salvar textos da página</button>
  </div>
  <div id="adminCats" class="admin-extra-panel"><div class="cat-editor" id="catEditor"></div><button class="mini-btn" onclick="addCategoryRow()">+ Nova categoria</button><button class="mini-btn primary" onclick="saveCategoriesFromAdmin()">Salvar categorias</button></div>
  <div id="adminBackupPanel" class="admin-extra-panel">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      <button class="mini-btn primary" onclick="createBackupNow()">💾 Criar backup agora</button>
      <button class="mini-btn soft" onclick="viewBackups()">📋 Ver backups</button>
    </div>
    <div id="backupList" style="display:grid;gap:8px;max-height:280px;overflow-y:auto"></div>
  </div>`;
  dash.insertBefore(extra,dash.children[1]||dash.firstChild);
  extra.querySelectorAll('[data-admin-tab]').forEach(b=>b.onclick=()=>{
    extra.querySelectorAll('[data-admin-tab]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    document.getElementById('adminOrdersPanel').classList.toggle('on',b.dataset.adminTab==='orders');
    document.getElementById('adminVisual').classList.toggle('on',b.dataset.adminTab==='visual');
    document.getElementById('adminCats').classList.toggle('on',b.dataset.adminTab==='categories');
    document.getElementById('adminBackupPanel').classList.toggle('on',b.dataset.adminTab==='backup');
    document.getElementById('adminBadgesPanel').classList.toggle('on',b.dataset.adminTab==='badges');
    if(b.dataset.adminTab==='orders') loadAdminOrders();
    if(b.dataset.adminTab==='visual') buildContentEditorFields();
    if(b.dataset.adminTab==='backup') viewBackups();
    if(b.dataset.adminTab==='badges'){
      var cur=localStorage.getItem('vixiBadgeStyle')||'';
      document.querySelectorAll('.badge-preset-btn').forEach(function(btn){
        var on=btn.dataset.style===cur;
        btn.style.borderColor=on?'var(--pink)':'var(--line)';
        btn.style.background=on?'var(--pink-pale)':'#fff';
      });
    }
  });
  renderCatEditor();
  // Auto-backup once per 24h
  autoBackup();
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
// ── Content editor: build inputs for fields present on the current page ──
function buildContentEditorFields(){
  const container = document.getElementById('contentEditorFields');
  if(!container) return;
  const fields = typeof CONTENT_FIELDS!=='undefined' ? CONTENT_FIELDS : [];
  const data = typeof readJson==='function' ? readJson('vixiContent',{}) : {};
  const esc = typeof escapeHtml==='function' ? escapeHtml : s=>String(s||'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  // Show all content fields (greyed out if selector not on this page)
  container.innerHTML = fields.map(f=>{
    const el = document.querySelector(f.selector);
    const rawVal = data[f.key]!==undefined ? data[f.key] : (el ? el.textContent.trim() : '');
    const disabled = !el ? 'style="opacity:.45"' : '';
    const hint = !el ? ' <small>(não está nesta página)</small>' : '';
    return `<div ${disabled}><label style="font-size:11px;font-weight:900;color:var(--gray);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">${esc(f.label)}${hint}</label><input class="adm-input" id="content_${f.key}" style="font-size:13px;padding:8px 12px" value="${esc(rawVal)}" placeholder="${esc(f.label)}"${!el?' disabled':''}></div>`;
  }).join('') || '<p style="color:var(--gray);font-size:13px">Nenhum campo configurado.</p>';
}

function saveContentFromAdmin(){
  const fields = typeof CONTENT_FIELDS!=='undefined'?CONTENT_FIELDS:[];
  // Load existing saved data, then only overwrite enabled fields
  const data = typeof readJson==='function' ? readJson('vixiContent',{}) : {};
  fields.forEach(f=>{
    const inp=document.getElementById('content_'+f.key);
    if(inp && !inp.disabled) data[f.key]=inp.value;
  });
  localStorage.setItem('vixiContent',JSON.stringify(data));
  if(window.vixiSaveCloud) window.vixiSaveCloud('vixiContent', data);
  if(typeof loadContent==='function') loadContent();
  showToast('Textos atualizados ✅');
}

// ── Backup helpers ──
let visualEditorOn = false;
let visualImageTarget = null;
let _dragSrcId = null;

function getEditableContentFields(){
  const seen = new Set();
  const all = [];
  const add = f=>{
    if(!f || !f.key || !f.selector || seen.has(f.key)) return;
    seen.add(f.key);
    all.push(f);
  };
  try{(VISUAL_FIELDS||[]).forEach(add);}catch(e){}
  try{(CONTENT_FIELDS||[]).forEach(add);}catch(e){}
  return all;
}

function ensureVisualChrome(){
  if(!document.getElementById('vixiImageInput')){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.id = 'vixiImageInput';
    input.style.display = 'none';
    input.addEventListener('change', handleVisualImageUpload);
    document.body.appendChild(input);
  }
  if(!document.getElementById('vixiEditorBar')){
    const bar = document.createElement('div');
    bar.id = 'vixiEditorBar';
    bar.className = 'vixi-editor-bar';
    bar.innerHTML = '<button class="ve-sidebar-btn" title="Seções" onclick="window.toggleSidebar&&window.toggleSidebar()">☰</button><span class="ve-brand">🎨 Vixi Editor</span><div class="ve-spacer"></div><div class="ve-mode-toggle"><button class="ve-toggle-btn" id="veTglView" onclick="window.setEditorMode&&window.setEditorMode(\'view\')">👁 Visualizar</button><button class="ve-toggle-btn ve-active" id="veTglEdit" onclick="window.setEditorMode&&window.setEditorMode(\'edit\')">✏️ Editando</button></div><div class="ve-spacer"></div><button class="ve-btn ve-back-btn" onclick="stopVisualEditor();if(typeof openAdmin===\'function\')openAdmin()">⚙️ Admin</button><button class="ve-btn ve-save-btn" onclick="saveVisualNow()">💾 Salvar</button><button class="ve-btn ve-exit-btn" onclick="stopVisualEditor()">✕</button>';
    document.body.appendChild(bar);
  }
}

function setEditorMode(mode){
  if(!visualEditorOn) return;
  const editBtn = document.getElementById('veTglEdit');
  const viewBtn = document.getElementById('veTglView');
  if(mode === 'view'){
    editBtn?.classList.remove('ve-active');
    viewBtn?.classList.add('ve-active');
    document.body.classList.add('vixi-preview');
    disableVisualEditing();
  } else {
    viewBtn?.classList.remove('ve-active');
    editBtn?.classList.add('ve-active');
    document.body.classList.remove('vixi-preview');
    enableVisualEditing();
  }
}
window.setEditorMode = setEditorMode;

const VSB_META_ADM = {
  hero:{icon:'🌟',name:'Hero'}, promises:{icon:'✨',name:'Promessas'},
  categorias:{icon:'📂',name:'Categorias'}, sizes:{icon:'📏',name:'Tamanhos'},
  colecao:{icon:'👗',name:'Coleção'}, promos:{icon:'🏷️',name:'Promoções'},
  sobre:{icon:'💌',name:'Sobre'}, instagram:{icon:'📸',name:'Instagram'},
  featured:{icon:'⭐',name:'Destaques'}
};

function buildSidebar(){
  let sb = document.getElementById('vixiSidebar');
  if(!sb){
    sb = document.createElement('div');
    sb.id = 'vixiSidebar';
    sb.className = 'vixi-sidebar';
    document.body.appendChild(sb);
  }
  const sections = [...document.querySelectorAll('[data-section-key]')];
  const sectItems = sections.map(el=>{
    const key = el.dataset.sectionKey;
    const meta = VSB_META_ADM[key] || {icon:'📄', name: key};
    return `<div class="vsb-item" data-sbkey="${key}" onclick="window._vsbClickAdm&&window._vsbClickAdm('${key}',event)">
      <div class="vsb-item-row">
        <span class="vsb-grip" draggable="true" data-sect-grip="${key}" title="Arrastar">⠿</span>
        <span>${meta.icon}</span>
        <span style="flex:1">${meta.name}</span>
      </div>
    </div>`;
  }).join('');
  sb.innerHTML = `<div class="vsb-header">
    <span class="vsb-title">Seções</span>
    <button class="vsb-hdr-btn" onclick="window.toggleSidebar&&window.toggleSidebar()" title="Fechar">✕</button>
  </div>
  <div class="vsb-scroll">${sectItems || '<div style="padding:16px;color:#999;font-size:13px">Nenhuma seção encontrada</div>'}</div>
  <div class="vsb-footer">
    <button class="vsb-add-section-btn" onclick="alert('Adicione seções pelo editor da home')">+ Adicionar seção</button>
  </div>`;
  _setupSidebarDragAdm();
}
window.buildSidebar = buildSidebar;

window._vsbClickAdm = function(key, e){
  const el = document.querySelector('[data-section-key="'+key+'"]');
  if(!el) return;
  el.scrollIntoView({behavior:'smooth', block:'start'});
  el.classList.add('vsb-flash');
  setTimeout(()=>el.classList.remove('vsb-flash'), 1200);
};

function _setupSidebarDragAdm(){
  const sb = document.getElementById('vixiSidebar');
  if(!sb) return;
  let dragKey = null;
  sb.querySelectorAll('[data-sect-grip]').forEach(grip=>{
    grip.addEventListener('dragstart', e=>{
      dragKey = grip.dataset.sectGrip;
      e.dataTransfer.effectAllowed = 'move';
    });
    grip.addEventListener('dragend', ()=>{ dragKey = null; });
    grip.closest('.vsb-item').addEventListener('dragover', e=>{
      if(!dragKey) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    grip.closest('.vsb-item').addEventListener('drop', e=>{
      if(!dragKey) return;
      const targetKey = grip.dataset.sectGrip;
      if(dragKey === targetKey) return;
      const src = document.querySelector('[data-section-key="'+dragKey+'"]');
      const tgt = document.querySelector('[data-section-key="'+targetKey+'"]');
      if(src && tgt) tgt.parentNode.insertBefore(src, tgt);
      if(typeof saveSectionOrder === 'function') saveSectionOrder();
      buildSidebar();
    });
  });
}

function toggleSidebar(){
  document.body.classList.toggle('vixi-sidebar-open');
  if(document.body.classList.contains('vixi-sidebar-open')) buildSidebar();
}
window.toggleSidebar = toggleSidebar;

function decorateVisualTargets(){
  const data = typeof readJson==='function' ? readJson('vixiContent',{}) : {};
  getEditableContentFields().forEach(f=>{
    const el = document.querySelector(f.selector);
    if(!el) return;
    el.dataset.vixiEdit = f.key;
    if(data[f.key]!==undefined){
      if(f.type==='html') el.innerHTML = data[f.key];
      else el.textContent = data[f.key];
    }
  });
  document.querySelectorAll('.logo-icon').forEach(el=>el.dataset.visualBgKey='logo');
  document.querySelectorAll('.promo-card').forEach((el,i)=>el.dataset.bannerKey='promo'+(i+1));
  if(typeof applyVisualImages==='function') applyVisualImages();
}

function enableVisualEditing(){
  document.querySelectorAll('[data-vixi-edit],[data-edit-product]').forEach(el=>{
    if(el.tagName === 'IMG') return;
    el.contentEditable = 'true';
    el.spellcheck = true;
    el.addEventListener('click', stopVisualClick, true);
    el.addEventListener('blur', saveInlineVisualEdit);
    el.addEventListener('keydown', visualEditableKeydown);
  });
  document.querySelectorAll('img[data-image-key],img[data-edit-product],[data-banner-key],[data-visual-bg-key]').forEach(el=>{
    el.addEventListener('click', openVisualImagePicker, true);
  });
}

function disableVisualEditing(){
  document.querySelectorAll('[contenteditable="true"]').forEach(el=>{
    el.contentEditable = 'false';
    el.removeEventListener('click', stopVisualClick, true);
    el.removeEventListener('blur', saveInlineVisualEdit);
    el.removeEventListener('keydown', visualEditableKeydown);
  });
  document.querySelectorAll('img[data-image-key],img[data-edit-product],[data-banner-key],[data-visual-bg-key]').forEach(el=>{
    el.removeEventListener('click', openVisualImagePicker, true);
  });
}

function stopVisualClick(e){ if(visualEditorOn) e.stopPropagation(); }

function visualEditableKeydown(e){
  if(e.key === 'Enter' && !e.shiftKey && !['H1','H2','H3','P'].includes(e.currentTarget.tagName)){
    e.preventDefault();
    e.currentTarget.blur();
  }
}

function normalizeAdminPrice(text){
  const raw = String(text||'').replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.');
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function saveInlineVisualEdit(e){
  const el = e.currentTarget;
  if(el.dataset.vixiEdit){
    const field = getEditableContentFields().find(f=>f.key===el.dataset.vixiEdit);
    const data = typeof readJson==='function' ? readJson('vixiContent',{}) : {};
    data[el.dataset.vixiEdit] = field?.type === 'html' ? el.innerHTML.trim() : el.textContent.trim();
    if(typeof writeJson==='function') writeJson('vixiContent', data);
    else localStorage.setItem('vixiContent', JSON.stringify(data));
  }
  if(el.dataset.editProduct){
    const p = PRODS.find(x=>x.id===el.dataset.editProduct);
    if(p){
      const field = el.dataset.editField;
      if(field === 'price'){p.price = normalizeAdminPrice(el.textContent); el.textContent = money(p.price);}
      if(field === 'name') p.name = el.textContent.trim();
      if(field === 'desc') p.desc = el.textContent.trim();
      if(!liveProducts) liveProducts = JSON.parse(JSON.stringify(PRODS));
      const idx = liveProducts.findIndex(x=>x.id===p.id);
      if(idx >= 0) liveProducts[idx] = {...liveProducts[idx], ...p};
      else liveProducts.push({...p});
      window.liveProducts = liveProducts;
      if(typeof saveToStorage==='function') saveToStorage();
    }
  }
  showToast('Alteracao salva');
}

function openVisualImagePicker(e){
  if(!visualEditorOn) return;
  if(e.target.closest('[data-vixi-edit],[data-edit-product]') && e.target !== e.currentTarget) return;
  e.preventDefault();
  e.stopPropagation();
  visualImageTarget = e.currentTarget;
  const input = document.getElementById('vixiImageInput');
  input.value = '';
  input.click();
}

function cropOptionsForVisualTarget(target){
  if(target?.dataset?.editProduct) return {aspect:1,width:1200,title:'Enquadrar foto do produto'};
  if(target?.dataset?.visualBgKey === 'logo') return {aspect:1,width:600,title:'Enquadrar logo'};
  if(target?.dataset?.bannerKey) return {aspect:16/9,width:1400,title:'Enquadrar banner'};
  return {aspect:1,width:1200,title:'Enquadrar imagem'};
}

async function handleVisualImageUpload(e){
  const file = e.target.files?.[0];
  if(!file || !visualImageTarget) return;
  try{
    const cropped = window.vixiCropImageFile ? await window.vixiCropImageFile(file, cropOptionsForVisualTarget(visualImageTarget)) : null;
    if(window.vixiCropImageFile && !cropped) return;
    const uploadFile = cropped?.file || file;
    let src = cropped?.dataUrl || '';
    try{
      if(typeof window.vixiUploadImage !== 'function') throw new Error('Firebase upload indisponivel');
      src = await window.vixiUploadImage(uploadFile, visualImageTarget.dataset.editProduct ? 'produtos' : 'layout');
    }catch(uploadErr){
      console.error(uploadErr);
      if(!src){
        src = await new Promise(resolve=>{
          const reader = new FileReader();
          reader.onload = ev=>resolve(ev.target.result);
          reader.readAsDataURL(file);
        });
      }
    }
    if(visualImageTarget.dataset.editProduct){
      const p = PRODS.find(x=>x.id===visualImageTarget.dataset.editProduct);
      if(p){
        p.img = src;
        visualImageTarget.src = src;
        if(!liveProducts) liveProducts = JSON.parse(JSON.stringify(PRODS));
        const idx = liveProducts.findIndex(x=>x.id===p.id);
        if(idx >= 0) liveProducts[idx] = {...liveProducts[idx], ...p};
        else liveProducts.push({...p});
        window.liveProducts = liveProducts;
        if(typeof saveToStorage==='function') saveToStorage();
      }
    }else if(visualImageTarget.dataset.bannerKey){
      const images = typeof readJson==='function' ? readJson('vixiVisualImages',{}) : {};
      images['banner:'+visualImageTarget.dataset.bannerKey] = src;
      if(typeof writeJson==='function') writeJson('vixiVisualImages', images);
      else localStorage.setItem('vixiVisualImages', JSON.stringify(images));
      if(typeof applyVisualImages==='function') applyVisualImages();
    }else if(visualImageTarget.dataset.visualBgKey){
      const images = typeof readJson==='function' ? readJson('vixiVisualImages',{}) : {};
      images['bg:'+visualImageTarget.dataset.visualBgKey] = src;
      if(typeof writeJson==='function') writeJson('vixiVisualImages', images);
      else localStorage.setItem('vixiVisualImages', JSON.stringify(images));
      if(typeof applyVisualImages==='function') applyVisualImages();
    }else if(visualImageTarget.dataset.imageKey){
      const images = typeof readJson==='function' ? readJson('vixiVisualImages',{}) : {};
      images[visualImageTarget.dataset.imageKey] = src;
      if(typeof writeJson==='function') writeJson('vixiVisualImages', images);
      else localStorage.setItem('vixiVisualImages', JSON.stringify(images));
      visualImageTarget.src = src;
    }
    showToast('Imagem salva');
  }catch(err){
    console.error(err);
    showToast('Erro ao preparar imagem.');
  }
}

function startVisualEditor(){
  const _isAdm = window.vixiAdminLogged ||
                 sessionStorage.getItem('vixiAdminLogged')==='1' ||
                 window.currentUser?.email==='viximariakids@viximariakids.com';
  if(!_isAdm){
    openAdminPw();
    return;
  }
  // Close admin panel if open
  const dash = document.getElementById('adminDash');
  if(dash && dash.classList.contains('open')) dash.classList.remove('open');

  ensureVisualChrome();
  visualEditorOn = true;
  window.visualEditorOn = true;
  window.vixiAdminLogged = true;
  sessionStorage.setItem('vixiEditorActive','1');
  document.body.classList.add('vixi-editing');
  document.body.classList.remove('vixi-preview');
  document.getElementById('veTglEdit')?.classList.add('ve-active');
  document.getElementById('veTglView')?.classList.remove('ve-active');
  decorateVisualTargets();
  enableVisualEditing();
  initProductDragDrop();
  buildSidebar();
  document.body.classList.add('vixi-sidebar-open');
  window.scrollTo({top:0, behavior:'smooth'});
  showToast('Editor ativo 🎨 — use o painel lateral para navegar e reorganizar');
}

function stopVisualEditor(){
  visualEditorOn = false;
  window.visualEditorOn = false;
  sessionStorage.removeItem('vixiEditorActive');
  document.body.classList.remove('vixi-editing', 'vixi-preview', 'vixi-sidebar-open');
  disableVisualEditing();
  destroyProductDragDrop();
}

function saveVisualNow(){
  document.activeElement?.blur?.();
  if(typeof loadContent==='function') loadContent();
  if(typeof applyVisualImages==='function') applyVisualImages();
  if(typeof saveToStorage==='function') saveToStorage();
  showToast('Página salva ✅');
}

// ── Product drag-and-drop (visual editor) ──────────────

function initProductDragDrop(){
  var grid = document.getElementById('prodGrid');
  if(!grid) return;
  grid.classList.add('vixi-drag-mode');
  _attachProdDragHandlers();
}

function _attachProdDragHandlers(){
  if(!visualEditorOn) return;
  var grid = document.getElementById('prodGrid');
  if(!grid) return;
  grid.querySelectorAll('.prod-card').forEach(function(card){
    card.setAttribute('draggable','true');
    card.removeEventListener('dragstart', _prodDragStart);
    card.removeEventListener('dragenter', _prodDragEnter);
    card.removeEventListener('dragover',  _prodDragOver);
    card.removeEventListener('drop',      _prodDrop);
    card.removeEventListener('dragend',   _prodDragEnd);
    card.addEventListener('dragstart', _prodDragStart);
    card.addEventListener('dragenter', _prodDragEnter);
    card.addEventListener('dragover',  _prodDragOver);
    card.addEventListener('drop',      _prodDrop);
    card.addEventListener('dragend',   _prodDragEnd);
    // Mobile sort arrows (hidden on desktop via CSS)
    if(!card.querySelector('.vixi-sort-arrows')){
      var arrows = document.createElement('div');
      arrows.className = 'vixi-sort-arrows';
      var upBtn = document.createElement('button');
      upBtn.className = 'vixi-sort-btn';
      upBtn.title = 'Mover para cima';
      upBtn.textContent = '↑';
      var downBtn = document.createElement('button');
      downBtn.className = 'vixi-sort-btn';
      downBtn.title = 'Mover para baixo';
      downBtn.textContent = '↓';
      arrows.appendChild(upBtn);
      arrows.appendChild(downBtn);
      card.insertBefore(arrows, card.firstChild);
      upBtn.addEventListener('click', function(e){ e.stopPropagation(); _sortCard(card.dataset.id, -1); });
      downBtn.addEventListener('click', function(e){ e.stopPropagation(); _sortCard(card.dataset.id, 1); });
    }
  });
}

function _sortCard(id, dir){
  var list = window.liveProducts || PRODS;
  var idx = list.findIndex(function(p){ return p.id === id; });
  var newIdx = idx + dir;
  if(idx < 0 || newIdx < 0 || newIdx >= list.length) return;
  var moved = list.splice(idx, 1)[0];
  list.splice(newIdx, 0, moved);
  PRODS.length = 0;
  list.forEach(function(p){ PRODS.push(p); });
  window.liveProducts = list;
  if(typeof saveToStorage === 'function') saveToStorage();
  if(typeof renderProds === 'function') renderProds(window.currentFilter || 'all');
  setTimeout(_attachProdDragHandlers, 80);
  showToast(dir < 0 ? 'Produto movido para cima ↑' : 'Produto movido para baixo ↓');
}

function _prodDragStart(e){
  _dragSrcId = this.dataset.id;
  this.classList.add('vixi-dragging');
  if(e.dataTransfer){ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain', _dragSrcId||''); }
}
function _prodDragEnter(e){ e.preventDefault(); }
function _prodDragOver(e){
  e.preventDefault();
  if(e.dataTransfer) e.dataTransfer.dropEffect='move';
  document.querySelectorAll('.prod-card.vixi-drag-target').forEach(function(c){ c.classList.remove('vixi-drag-target'); });
  if(this.dataset.id !== _dragSrcId) this.classList.add('vixi-drag-target');
}
function _prodDrop(e){
  e.preventDefault(); e.stopPropagation();
  var targetId = this.dataset.id;
  if(!_dragSrcId || _dragSrcId === targetId) return;
  var list = window.liveProducts || PRODS;
  var srcIdx = list.findIndex(function(p){ return p.id === _dragSrcId; });
  var tgtIdx = list.findIndex(function(p){ return p.id === targetId; });
  if(srcIdx < 0 || tgtIdx < 0) return;
  var moved = list.splice(srcIdx, 1)[0];
  list.splice(tgtIdx, 0, moved);
  PRODS.length = 0;
  list.forEach(function(p){ PRODS.push(p); });
  window.liveProducts = list;
  if(typeof saveToStorage==='function') saveToStorage();
  if(typeof renderProds==='function') renderProds(window.currentFilter||'all');
  setTimeout(_attachProdDragHandlers, 80);
  showToast('Ordem dos produtos atualizada ✅');
}
function _prodDragEnd(){
  _dragSrcId = null;
  document.querySelectorAll('.prod-card').forEach(function(c){
    c.classList.remove('vixi-dragging','vixi-drag-target');
  });
}

function destroyProductDragDrop(){
  var grid = document.getElementById('prodGrid');
  if(grid) grid.classList.remove('vixi-drag-mode');
  document.querySelectorAll('.prod-card').forEach(function(card){
    card.removeAttribute('draggable');
    card.removeEventListener('dragstart', _prodDragStart);
    card.removeEventListener('dragenter', _prodDragEnter);
    card.removeEventListener('dragover',  _prodDragOver);
    card.removeEventListener('drop',      _prodDrop);
    card.removeEventListener('dragend',   _prodDragEnd);
    card.classList.remove('vixi-dragging','vixi-drag-target');
    var arrows = card.querySelector('.vixi-sort-arrows');
    if(arrows) arrows.remove();
  });
}

async function waitFirebase(key, ms=6000){
  const end = Date.now()+ms;
  while(!window[key] && Date.now()<end) await new Promise(r=>setTimeout(r,300));
  return !!window[key];
}

// ── Backup functions ──
async function createBackupNow(silent){
  if(!window.vixiCreateBackup){
    if(!silent) showToast('Aguardando Firebase...');
    const ok = await waitFirebase('vixiCreateBackup');
    if(!ok){ if(!silent) showToast('Firebase não conectado. Recarregue a página.'); return; }
  }
  try{
    if(!silent) showToast('Criando backup...');
    const prods = (liveProducts||PRODS).map(p=>{
      const {img,...rest} = p;
      // only keep URLs (Firebase Storage), skip base64 blobs
      const safeImg = img && img.startsWith('http') ? img : '';
      return {...rest, img:safeImg};
    });
    const siteContent = JSON.parse(localStorage.getItem('vixiContent')||'{}');
    const categories  = JSON.parse(localStorage.getItem('vixiCategories')||'[]');
    const layoutSettings = JSON.parse(localStorage.getItem('vixiVisualImages')||'{}');
    await window.vixiCreateBackup({products:prods, siteContent, categories, layoutSettings});
    localStorage.setItem('vixiLastBackup', String(Date.now()));
    if(!silent) showToast('✅ Backup criado!');
    viewBackups();
  }catch(e){
    console.error('createBackupNow error',e);
    if(!silent) showToast('Erro ao criar backup 😢');
  }
}

async function autoBackup(){
  const last = parseInt(localStorage.getItem('vixiLastBackup')||'0',10);
  if(Date.now()-last > 86400000){ // >24h
    createBackupNow(true);
  }
}

async function viewBackups(){
  const box = document.getElementById('backupList');
  if(!box) return;
  if(!window.vixiListBackups){
    box.innerHTML='<p style="color:var(--gray);font-size:13px">Conectando ao Firebase...</p>';
    const ok = await waitFirebase('vixiListBackups');
    if(!ok){ box.innerHTML='<p style="color:var(--gray);font-size:13px">Firebase não conectado. Recarregue a página.</p>'; return; }
  }
  box.innerHTML='<p style="color:var(--gray);font-size:13px">Carregando...</p>';
  try{
    const list = await window.vixiListBackups();
    if(!list.length){
      box.innerHTML='<p style="color:var(--gray);font-size:13px">Nenhum backup criado ainda. Clique em "Criar backup agora" para começar.</p>';
      return;
    }
    box.innerHTML = list.map(b=>{
      const ts = b.createdAt?.seconds ? b.createdAt.seconds*1000 : (b.createdAt||0);
      const dateStr = ts ? new Date(ts).toLocaleString('pt-BR') : 'Data desconhecida';
      const count = Array.isArray(b.products)?b.products.length:0;
      return `<div class="backup-item">
        <div class="backup-info">
          <strong>📦 ${count} produto${count!==1?'s':''}</strong>
          <span>${dateStr}</span>
        </div>
        <div class="backup-btns">
          <button class="mini-btn soft" onclick="restoreBackup('${b.id}','${dateStr.replace(/'/g,'')}')">↩ Restaurar</button>
          <button class="mini-btn danger" onclick="deleteBackupItem('${b.id}')">🗑️</button>
        </div>
      </div>`;
    }).join('');
  }catch(e){
    console.error('viewBackups error',e);
    var errMsg = e?.code ? ('Erro Firebase: ' + e.code) : (e?.message || 'Erro desconhecido');
    box.innerHTML='<p style="color:#e53935;font-size:13px;font-weight:700">⚠️ '+errMsg+'</p><p style="color:var(--gray);font-size:12px;margin-top:6px">Verifique as regras de segurança do Firebase Console (coleção "backups").</p>';
  }
}

async function restoreBackup(id, dateLabel){
  if(!confirm(`Restaurar backup de ${dateLabel}?\n\nOs produtos e conteúdo atuais serão substituídos. Esta ação não pode ser desfeita.`)) return;
  if(!window.vixiListBackups){ showToast('Firebase não conectado.'); return; }
  try{
    showToast('Restaurando...');
    const list = await window.vixiListBackups();
    const b = list.find(x=>x.id===id);
    if(!b){ showToast('Backup não encontrado.'); return; }
    // Restore products
    if(Array.isArray(b.products)&&b.products.length){
      localStorage.setItem('vixiAdmin_v2', JSON.stringify(b.products));
      localStorage.setItem('vixiAdmin_deleted', '[]');
      liveProducts = JSON.parse(JSON.stringify(b.products));
      PRODS.length=0;
      liveProducts.forEach(p=>PRODS.push(p));
      // Rebuild vixiProductImages from backup so images are restored
      const restoredImgs = {};
      b.products.forEach(function(p){ if(p.img) restoredImgs[p.id]=p.img; });
      localStorage.setItem('vixiProductImages', JSON.stringify(restoredImgs));
      if(window.vixiSaveCloud){
        window.vixiSaveCloud('vixiAdmin_v2', b.products);
        window.vixiSaveCloud('vixiProductImages', restoredImgs);
      }
    }
    // Restore content
    if(b.siteContent&&Object.keys(b.siteContent).length){
      localStorage.setItem('vixiContent', JSON.stringify(b.siteContent));
    }
    // Restore categories
    if(Array.isArray(b.categories)&&b.categories.length){
      localStorage.setItem('vixiCategories', JSON.stringify(b.categories));
    }
    renderAdminGrid();
    updateStats();
    if(typeof syncCategoriesUI==='function') syncCategoriesUI();
    if(typeof renderProds==='function') renderProds('all');
    if(typeof loadContent==='function') loadContent();
    showToast('✅ Backup restaurado!');
  }catch(e){
    console.error('restoreBackup error',e);
    showToast('Erro ao restaurar 😢');
  }
}

async function deleteBackupItem(id){
  if(!confirm('Apagar este backup permanentemente?')) return;
  try{
    await window.vixiDeleteBackup(id);
    showToast('Backup removido.');
    viewBackups();
  }catch(e){
    showToast('Erro ao remover backup.');
    console.error('deleteBackupItem error',e);
  }
}

// ── Admin Orders ──
const ORDER_STATUS_LABELS = {
  pendente:'🕐 Pendente', pago:'✅ Pago', recusado:'❌ Recusado',
  processando:'⏳ Processando', cancelado:'🚫 Cancelado', estornado:'↩ Estornado'
};
const ORDER_STATUS_COLORS = {
  pendente:'#f59e0b', pago:'#10b981', recusado:'#ef4444',
  processando:'#6366f1', cancelado:'#6b7280', estornado:'#8b5cf6'
};

let _adminOrders = [];
let _orderSort = 'date';

async function loadAdminOrders(){
  const box = document.getElementById('adminOrdersList');
  if(!box) return;
  box.innerHTML = '<p style="color:var(--gray);font-size:13px;text-align:center;padding:20px 0">Carregando pedidos...</p>';
  if(!window.vixiGetAdminOrders){
    const ok = await waitFirebase('vixiGetAdminOrders');
    if(!ok){ box.innerHTML='<p style="color:var(--gray);font-size:13px">Firebase não conectado. Recarregue a página.</p>'; return; }
  }
  try{
    _adminOrders = await window.vixiGetAdminOrders(80);
    renderOrdersList();
  }catch(e){
    box.innerHTML='<p style="color:var(--gray);font-size:13px">Erro ao carregar pedidos 😢</p>';
    console.error('loadAdminOrders error',e);
  }
}

function renderOrdersList(){
  const box = document.getElementById('adminOrdersList');
  if(!box) return;
  const orders = [..._adminOrders];
  // Update count badge in header
  var hdr = document.querySelector('#admSecOrders .adm-sec-hdr');
  if(hdr){
    var badge = hdr.querySelector('.orders-count-badge');
    if(!badge){ badge=document.createElement('span'); badge.className='orders-count-badge'; badge.style.cssText='background:var(--pink);color:#fff;border-radius:99px;padding:3px 12px;font-size:12px;font-weight:900;margin-left:8px'; hdr.querySelector('.adm-sec-title').appendChild(badge); }
    badge.textContent=orders.length+' pedido'+(orders.length!==1?'s':'');
  }
  // Render sort buttons if not present
  if(!document.getElementById('orderSortBtns')){
    var sortRow = document.createElement('div');
    sortRow.id='orderSortBtns';
    sortRow.style.cssText='display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap';
    sortRow.innerHTML='<button class="mini-btn soft" onclick="sortOrders(\'date\')">📅 Por data</button><button class="mini-btn soft" onclick="sortOrders(\'name\')">🔤 A–Z nome</button>';
    box.parentNode.insertBefore(sortRow, box);
  }
  if(_orderSort==='name') orders.sort((a,b)=>{const na=a.payer?.nome||a.payer?.email||''; const nb=b.payer?.nome||b.payer?.email||''; return na.localeCompare(nb,'pt-BR');});
  else orders.sort((a,b)=>{const ta=a.createdAt?.seconds?a.createdAt.seconds*1000:(a.createdAt||0); const tb=b.createdAt?.seconds?b.createdAt.seconds*1000:(b.createdAt||0); return tb-ta;});
  if(!orders.length){
    box.innerHTML='<p style="color:var(--gray);font-size:13px;text-align:center;padding:20px 0">Nenhum pedido encontrado ainda.</p>';
    return;
  }
  box.innerHTML = orders.map((o,i)=>{
    const ts = o.createdAt?.seconds ? o.createdAt.seconds*1000 : (o.createdAt||0);
    const date = ts ? new Date(ts).toLocaleString('pt-BR') : '—';
    const status = o.status || 'pendente';
    const color = ORDER_STATUS_COLORS[status] || '#6b7280';
    const label = ORDER_STATUS_LABELS[status] || status;
    const total = typeof money==='function' ? money(o.total||0) : 'R$ '+(o.total||0).toFixed(2);
    const itens = (o.items||[]).map(i=>`${i.name||i.id} (${i.qty}x)`).join(', ');
    const nome = o.payer?.nome || o.payer?.email || '—';
    return `<div class="order-card" onclick="showOrderDetail(${i})" style="background:#fff;border-radius:16px;border:1.5px solid var(--line);padding:16px;font-size:13px;cursor:pointer;transition:box-shadow .2s" onmouseover="this.style.boxShadow='0 4px 20px rgba(242,39,110,.15)'" onmouseout="this.style.boxShadow=''">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px">
        <strong style="font-size:14px;color:var(--ink)">${nome}</strong>
        <span style="background:${color}22;color:${color};font-weight:800;padding:4px 12px;border-radius:99px;font-size:12px">${label}</span>
      </div>
      <div style="color:var(--gray);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${itens||'—'}</div>
      <div style="display:flex;justify-content:space-between;color:var(--gray)">
        <span>${date}</span>
        <strong style="color:var(--pink);font-size:15px">${total}</strong>
      </div>
    </div>`;
  }).join('');
}

function sortOrders(by){
  _orderSort=by;
  document.querySelectorAll('#orderSortBtns .mini-btn').forEach(function(b){
    b.style.background = b.textContent.includes(by==='date'?'data':'A–Z') ? 'var(--pink)' : '';
    b.style.color = b.textContent.includes(by==='date'?'data':'A–Z') ? '#fff' : '';
  });
  renderOrdersList();
}
window.sortOrders=sortOrders;

function showOrderDetail(idx){
  const o = _adminOrders[idx];
  if(!o) return;
  const ts = o.createdAt?.seconds ? o.createdAt.seconds*1000 : (o.createdAt||0);
  const date = ts ? new Date(ts).toLocaleString('pt-BR') : '—';
  const status = o.status || 'pendente';
  const color = ORDER_STATUS_COLORS[status] || '#6b7280';
  const label = ORDER_STATUS_LABELS[status] || status;
  const total = typeof money==='function' ? money(o.total||0) : 'R$ '+(o.total||0).toFixed(2);
  const payer = o.payer||{};
  const addr = o.address||o.endereco||payer.address||payer.endereco||{};

  // Address with complement
  const ruaNum = [addr.rua||addr.street||'', addr.numero||addr.number||''].filter(Boolean).join(', ');
  const compl  = addr.complemento||addr.complement||addr.compl||'';
  const bairro = addr.bairro||addr.neighborhood||'';
  const cidEst = [addr.cidade||addr.city||addr.municipio||'', addr.estado||addr.state||addr.uf||''].filter(Boolean).join(' — ');
  const cep    = addr.cep ? 'CEP ' + addr.cep : '';
  const addrLines = [ruaNum, compl, bairro, cidEst, cep].filter(Boolean);

  // WA link
  const phone = payer.telefone||payer.phone||'';
  const waLink = phone ? `<a href="https://wa.me/55${phone.replace(/\D/g,'')}" target="_blank" rel="noopener" style="color:var(--pink);text-decoration:none;font-weight:800">💬 ${phone}</a>` : '—';

  // Items table
  const itens = (o.items||[]).map(i=>{
    const itemTotal = typeof money==='function' ? money((i.price||0)*i.qty) : '—';
    const sz = i.size ? ` <span style="background:var(--pink-pale);color:var(--pink);padding:1px 8px;border-radius:99px;font-size:11px;font-weight:800">${i.size}</span>` : '';
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);gap:8px;flex-wrap:wrap">
      <span><strong>${i.name||i.id}</strong>${sz} × ${i.qty}</span>
      <strong style="color:var(--ink);white-space:nowrap">${itemTotal}</strong>
    </div>`;
  }).join('');

  function row(icon, label, value, html) {
    if(!value && !html) return '';
    return `<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line)">
      <span style="font-size:16px;flex-shrink:0">${icon}</span>
      <div>
        <div style="font-size:10px;font-weight:900;color:var(--gray);text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">${label}</div>
        <div style="font-size:14px;color:var(--ink);font-weight:600">${html || value}</div>
      </div>
    </div>`;
  }

  var modal = document.getElementById('orderDetailModal');
  if(!modal){
    modal = document.createElement('div');
    modal.id='orderDetailModal';
    modal.style.cssText='position:fixed;inset:0;background:rgba(30,0,26,.55);z-index:800;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)';
    modal.onclick=function(e){if(e.target===modal)modal.style.display='none';};
    document.body.appendChild(modal);
  }
  modal.innerHTML=`<div style="background:#fff;border-radius:24px;max-width:540px;width:100%;max-height:88vh;overflow-y:auto;padding:28px;box-shadow:0 24px 80px rgba(0,0,0,.25)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <strong style="font-size:18px;font-family:var(--font-d)">📋 Detalhes do Pedido</strong>
      <button onclick="document.getElementById('orderDetailModal').style.display='none'" style="border:none;background:var(--pink-pale);color:var(--pink);border-radius:99px;padding:6px 14px;font-weight:900;cursor:pointer">✕</button>
    </div>
    <div style="background:${color}14;border-left:4px solid ${color};border-radius:8px;padding:10px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <span style="font-weight:800;color:${color};font-size:13px">${label}</span>
      <span style="color:var(--gray);font-size:12px">📅 ${date}</span>
    </div>
    <div style="display:grid;gap:0">
      ${row('👤','Cliente', payer.nome||'—')}
      ${row('✉️','E-mail', payer.email||'—')}
      ${row('📱','Telefone', '', waLink)}
      ${addrLines.length ? row('📍','Endereço', '', addrLines.map(function(l){return '<div>'+l+'</div>';}).join('')) : ''}
    </div>
    <div style="margin-top:20px;margin-bottom:8px;font-size:12px;font-weight:900;color:var(--gray);text-transform:uppercase;letter-spacing:1px">🛍️ Itens do Pedido</div>
    ${itens||'<div style="color:var(--gray);font-size:13px;padding:8px 0">—</div>'}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:16px;border-top:2px solid var(--line)">
      <strong style="font-size:14px;color:var(--ink)">Total</strong>
      <strong style="color:var(--pink);font-size:20px;font-family:var(--font-d)">${total}</strong>
    </div>
    ${phone ? '<div style="margin-top:16px"><a href="https://wa.me/55'+phone.replace(/\D/g,'')+'" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25d366;color:#fff;border-radius:99px;padding:12px 20px;font-weight:900;text-decoration:none;font-size:14px">💬 Chamar no WhatsApp</a></div>' : ''}
    ${(status!=='cancelado'&&status!=='estornado') ? '<div style="margin-top:12px"><button onclick="cancelAdminOrder('+idx+')" style="width:100%;border:2px solid #6b7280;background:#fff;color:#6b7280;border-radius:99px;padding:10px 20px;font-family:var(--font-b);font-weight:900;font-size:14px;cursor:pointer;transition:all .2s" onmouseover="this.style.background=\'#6b72801a\'" onmouseout="this.style.background=\'#fff\'">Cancelar pedido</button></div>' : ''}
  </div>`;
  modal.style.display='flex';
}
window.showOrderDetail=showOrderDetail;

async function cancelAdminOrder(idx){
  const o = _adminOrders[idx];
  if(!o) return;
  const nome = o.payer?.nome || o.payer?.email || 'este pedido';
  if(!confirm(`Cancelar o pedido de ${nome}?\n\nO status será marcado como "cancelado" no sistema. O reembolso deve ser feito manualmente pelo painel do Mercado Pago (mercadopago.com.br > Atividades > buscar o pedido).`)) return;
  const modal = document.getElementById('orderDetailModal');
  const btn = modal?.querySelector('button[onclick^="cancelAdminOrder"]');
  if(btn){ btn.textContent='Cancelando...'; btn.disabled=true; }
  try{
    if(window.vixiUpdateOrderStatus){
      await window.vixiUpdateOrderStatus(o.id, 'cancelado');
    }
    _adminOrders[idx].status = 'cancelado';
    document.getElementById('orderDetailModal').style.display='none';
    renderOrdersList();
    if(typeof showToast==='function') showToast('Pedido cancelado.');
  }catch(e){
    if(btn){ btn.textContent='Cancelar pedido'; btn.disabled=false; }
    if(typeof showToast==='function') showToast('Erro ao cancelar pedido.');
    console.error('cancelAdminOrder error', e);
  }
}
window.cancelAdminOrder=cancelAdminOrder;

// ── Badge style picker ──
function setBadgeStyle(style){
  document.body.dataset.badgeStyle = style || '';
  localStorage.setItem('vixiBadgeStyle', style || '');
  if(window.vixiSaveCloud) window.vixiSaveCloud('vixiBadgeStyle', style || '');
  document.querySelectorAll('.badge-preset-btn').forEach(function(btn){
    var on = btn.dataset.style === (style || '');
    btn.style.borderColor = on ? 'var(--pink)' : 'var(--line)';
    btn.style.background  = on ? 'var(--pink-pale)' : '#fff';
  });
  showToast('Estilo de tag atualizado ✅');
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
window.buildContentEditorFields=typeof buildContentEditorFields!=='undefined'?buildContentEditorFields:window.buildContentEditorFields;
window.renderAdminGrid=typeof renderAdminGrid!=='undefined'?renderAdminGrid:window.renderAdminGrid;
window.saveToStorage=typeof saveToStorage!=='undefined'?saveToStorage:window.saveToStorage;
window.openAddModal=typeof openAddModal!=='undefined'?openAddModal:window.openAddModal;
window.openAdmin=typeof openAdmin!=='undefined'?openAdmin:window.openAdmin;
window.confirmDelete=typeof confirmDelete!=='undefined'?confirmDelete:window.confirmDelete;
window.createBackupNow=typeof createBackupNow!=='undefined'?createBackupNow:window.createBackupNow;
window.autoBackup=typeof autoBackup!=='undefined'?autoBackup:window.autoBackup;
window.viewBackups=typeof viewBackups!=='undefined'?viewBackups:window.viewBackups;
window.restoreBackup=typeof restoreBackup!=='undefined'?restoreBackup:window.restoreBackup;
window.deleteBackupItem=typeof deleteBackupItem!=='undefined'?deleteBackupItem:window.deleteBackupItem;
window.liveProducts=liveProducts;
window.startVisualEditor=typeof startVisualEditor!=='undefined'?startVisualEditor:window.startVisualEditor;
window.stopVisualEditor=typeof stopVisualEditor!=='undefined'?stopVisualEditor:window.stopVisualEditor;
window.saveVisualNow=typeof saveVisualNow!=='undefined'?saveVisualNow:window.saveVisualNow;
window.ensureAdminShell=typeof ensureAdminShell!=='undefined'?ensureAdminShell:window.ensureAdminShell;
window.setBadgeStyle=typeof setBadgeStyle!=='undefined'?setBadgeStyle:window.setBadgeStyle;
window.initProductDragDrop=typeof initProductDragDrop!=='undefined'?initProductDragDrop:window.initProductDragDrop;
window.destroyProductDragDrop=typeof destroyProductDragDrop!=='undefined'?destroyProductDragDrop:window.destroyProductDragDrop;
window.loadAdminOrders=typeof loadAdminOrders!=='undefined'?loadAdminOrders:window.loadAdminOrders;
window.renderOrdersList=typeof renderOrdersList!=='undefined'?renderOrdersList:window.renderOrdersList;
window.showOrderDetail=typeof showOrderDetail!=='undefined'?showOrderDetail:window.showOrderDetail;
