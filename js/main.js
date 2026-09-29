/* ============================================================
   2000department — store config, cart logic, theme toggle & shared UI
   Edit CONFIG to change the store name, free shipping threshold
   and the contact shown while there is no payment gateway yet.
   ============================================================ */
const CONFIG = {
  storeName: '2000department',
  freeShippingThreshold: 150,
  currency: '€',
  checkoutContact: 'contact@your-domain.com', // <- replace with your real email/WhatsApp
};

/* ---------- theme (light / dark, persisted per browser) ---------- */
function getStoredTheme(){
  try{ return localStorage.getItem('studio_theme'); }catch(e){ return null; }
}
function effectiveTheme(stored){
  if(stored === 'light' || stored === 'dark') return stored;
  try{
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }catch(e){ return 'light'; }
}
function applyTheme(stored){
  const root = document.documentElement;
  if(stored === 'light' || stored === 'dark'){
    root.setAttribute('data-theme', stored);
  }else{
    root.removeAttribute('data-theme');
  }
  const effective = effectiveTheme(stored);
  document.querySelectorAll('.theme-toggle').forEach(btn=>{
    btn.textContent = effective === 'dark' ? '☀' : '🌙';
    btn.setAttribute('aria-label', effective === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}
function toggleTheme(){
  const next = effectiveTheme(getStoredTheme()) === 'dark' ? 'light' : 'dark';
  try{ localStorage.setItem('studio_theme', next); }catch(e){}
  applyTheme(next);
}

/* ---------- storage helpers (per browser, not shared) ---------- */
function readCart(){
  try{
    return JSON.parse(localStorage.getItem('studio_cart') || '[]');
  }catch(e){ return []; }
}
function writeCart(items){
  try{ localStorage.setItem('studio_cart', JSON.stringify(items)); }catch(e){}
}

function fmtPrice(n){
  if(n == null) return '—';
  return n.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' ' + CONFIG.currency;
}

/* ---------- cart operations ---------- */
function addToCart(product){
  const items = readCart();
  if(items.some(i=>i.id === product.id)){
    showToast('Already in your bag');
    openCart();
    return;
  }
  items.push({id:product.id, title:product.title, brand:product.brand, price:product.price, image:product.image, size:product.size});
  writeCart(items);
  renderCartDrawer();
  showToast('Added to bag');
  openCart();
}
function quickAdd(id){
  const product = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).find(p=>p.id===id);
  if(product) addToCart(product);
}

/* ---------- shared product card markup (home / shop / related) ---------- */
function productCardHTML(p){
  const discount = p.compareAtPrice ? Math.round(100*(1-p.price/p.compareAtPrice)) : 0;
  return `<a class="card" href="product.html?id=${p.id}">
    <div class="thumb">
      <img src="${p.image}" alt="${p.brand} ${p.title}" loading="lazy">
      ${discount>0 ? `<span class="badge">-${discount}%</span>` : ''}
      <button class="quickadd" type="button" aria-label="Quick add to bag" onclick="event.preventDefault();event.stopPropagation();quickAdd(${p.id});">+</button>
    </div>
    <div class="info">
      <span class="brand">${p.brand}</span>
      <span class="title">${p.title}</span>
      <span class="size">Size <b>${p.size}</b></span>
      <span class="price-row">
        <span class="price">${fmtPrice(p.price)}</span>
        ${p.compareAtPrice ? `<span class="price-compare">${fmtPrice(p.compareAtPrice)}</span>` : ''}
      </span>
    </div>
  </a>`;
}
function removeFromCart(id){
  const items = readCart().filter(i=>i.id !== id);
  writeCart(items);
  renderCartDrawer();
}
function cartTotal(){
  return readCart().reduce((s,i)=>s + (i.price||0), 0);
}

/* ---------- toast ---------- */
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- cart drawer render ---------- */
function renderCartDrawer(){
  const items = readCart();
  const countEls = document.querySelectorAll('.cart-count');
  countEls.forEach(el=>{ el.textContent = items.length; el.hidden = items.length === 0; });

  const linesEl = document.getElementById('cartLines');
  const footEl = document.getElementById('cartFoot');
  const shipEl = document.getElementById('shipProgress');
  if(!linesEl) return;

  if(items.length === 0){
    linesEl.innerHTML = '<div class="cart-empty">Your bag is empty.<br>Browse the <a href="shop.html" style="color:var(--ink); text-decoration:underline;">shop</a>.</div>';
    footEl.hidden = true;
  }else{
    linesEl.innerHTML = items.map(i=>`
      <div class="cart-line">
        <img src="${i.image}" alt="${i.title}">
        <div class="ci-info">
          <span class="ci-title">${i.brand} — ${i.title}</span>
          <span class="ci-meta">Size ${i.size} · one of a kind</span>
          <button class="ci-remove" onclick="removeFromCart(${i.id})">Remove</button>
        </div>
        <span class="ci-price">${fmtPrice(i.price)}</span>
      </div>
    `).join('');
    footEl.hidden = false;
    document.getElementById('cartTotal').textContent = fmtPrice(cartTotal());
  }

  const remaining = Math.max(0, CONFIG.freeShippingThreshold - cartTotal());
  const pct = Math.min(100, Math.round((cartTotal()/CONFIG.freeShippingThreshold)*100));
  if(shipEl){
    shipEl.querySelector('.bar div').style.width = pct + '%';
    shipEl.querySelector('.ship-text').innerHTML = remaining > 0
      ? `${fmtPrice(remaining)} away from free shipping`
      : `You've got free shipping ✓`;
  }
}

function openCart(){
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
}
function closeCart(){
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
  document.getElementById('mobileNav')?.classList.remove('open');
}

function openCheckoutModal(){
  if(readCart().length === 0){ showToast('Your bag is empty'); return; }
  document.getElementById('checkoutContactLine').textContent = CONFIG.checkoutContact;
  document.getElementById('checkoutModal').classList.add('open');
}
function closeCheckoutModal(){
  document.getElementById('checkoutModal').classList.remove('open');
}

/* ---------- layout wiring (header/footer/cart shared across pages) ---------- */
function injectChrome(){
  document.querySelectorAll('[data-cart-open]').forEach(el=>el.addEventListener('click', openCart));
  document.querySelectorAll('[data-cart-close]').forEach(el=>el.addEventListener('click', closeCart));
  document.getElementById('overlay')?.addEventListener('click', closeCart);
  document.getElementById('mobileToggle')?.addEventListener('click', ()=>document.getElementById('mobileNav').classList.add('open'));
  document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);
  document.getElementById('checkoutModalClose')?.addEventListener('click', closeCheckoutModal);
  document.getElementById('checkoutModal')?.addEventListener('click', (e)=>{ if(e.target.id==='checkoutModal') closeCheckoutModal(); });

  document.querySelectorAll('.theme-toggle').forEach(btn=>{
    btn.addEventListener('click', toggleTheme);
  });
  applyTheme(getStoredTheme());

  renderCartDrawer();
}

document.addEventListener('DOMContentLoaded', injectChrome);
