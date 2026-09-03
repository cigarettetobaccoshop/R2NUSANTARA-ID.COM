/* ============================================
   R2 NUSANTARA - CART LOGIC
   ============================================ */
'use strict';

var cart = [];
window.__cart = cart;

window.__addCart = function(id) {
  var p = allProducts.find(function(x) { return x.id === id; });
  if (!p) return;
  
  var existing = cart.find(function(x) { return x.id === id; });
  if (existing) existing.qty += 1;
  else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1, category: p.category });
  
  updateCartUI();
  showToast("Berhasil ditambahkan");
};

window.__updateQty = function(id, ch) {
  var i = cart.find(function(x) { return x.id === id; });
  if (i) {
    i.qty += ch;
    if (i.qty < 1) cart = cart.filter(function(x) { return x.id !== id; });
  }
  updateCartUI();
};

function updateCartUI() {
  var t = cart.reduce(function(s, i) { return s + i.qty; }, 0);
  var tp = cart.reduce(function(s, i) { return s + (i.price * i.qty); }, 0);
  
  var badge = document.getElementById('cartBadge');
  if (badge) {
    badge.innerText = t;
    badge.classList.toggle('scale-0', t === 0);
  }
  
  var mobileBadge = document.getElementById('mobileCartBadge');
  if (mobileBadge) {
    mobileBadge.innerText = t;
    mobileBadge.classList.toggle('scale-0', t === 0);
  }
  
  var bannerQty = document.getElementById('bannerQty');
  var progressFill = document.getElementById('progressFill');
  var bannerTitle = document.getElementById('bannerTitle');
  var bannerSubtitle = document.getElementById('bannerSubtitle');
  var banner = document.getElementById('shippingProgressBanner');
  
  if (bannerQty) bannerQty.innerText = t;
  if (progressFill) progressFill.style.width = Math.min((t / 20) * 100, 100) + '%';
  
  if (t >= 20) {
    if (bannerTitle) bannerTitle.innerText = '🎉 Target Tercapai';
    if (bannerSubtitle) bannerSubtitle.innerHTML = 'Anda mendapat<b class="text-emerald-300">GRATIS ONGKIR</b>';
    if (banner) {
      banner.classList.add('bg-emerald-600');
      banner.classList.remove('bg-brand-900');
    }
  } else {
    if (bannerTitle) bannerTitle.innerText = 'Target Gratis Ongkir';
    if (bannerSubtitle) bannerSubtitle.innerHTML = 'Pilih<b class="text-emerald-300">' + (20 - t) + ' slop</b> lagi untuk subsidi.';
    if (banner) {
      banner.classList.remove('bg-emerald-600');
      banner.classList.add('bg-brand-900');
    }
  }
  
  var cc = document.getElementById('cartItemsContainer');
  var cs = document.getElementById('cartSummary');
  
  if (!cart.length) {
    if (cc) cc.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-center opacity-50"><i class="fa-solid fa-cart-shopping text-6xl text-slate-300 dark:text-slate-600 mb-4"></i><p class="font-bold text-slate-600 dark:text-slate-400">Keranjang Kosong</p></div>';
    if (cs) cs.classList.add('hidden');
  } else {
    if (cs) cs.classList.remove('hidden');
    
    var totalItemsDisplay = document.getElementById('totalItemsDisplay');
    var totalPriceDisplay = document.getElementById('totalPriceDisplay');
    
    if (totalItemsDisplay) totalItemsDisplay.innerText = t;
    if (totalPriceDisplay) totalPriceDisplay.innerText = formatRupiah(tp);
    
    if (cc) {
      cc.innerHTML = cart.map(function(i) {
        var catBadge = i.category === 'resmi' ?
          '<span class="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-700"><i class="fa-solid fa-certificate text-[8px]"></i> RESMI</span>' :
          '<span class="inline-flex items-center gap-1 text-[9px] font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-700"><i class="fa-solid fa-fire-flame-curved text-[8px]"></i> R2</span>';
        
        return '<div class="bg-white dark:bg-slate-700 p-4 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm flex gap-4"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1"><span class="font-bold text-sm text-brand-900 dark:text-white truncate">' + escapeHtml(i.name) + '</span>' + catBadge + '</div><div class="text-brand-500 font-bold font-mono text-sm">' + formatRupiah(i.price) + '</div></div><div class="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg h-9 shrink-0"><button onclick="window.__updateQty(\'' + i.id + '\',-1)" class="w-9 h-full font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">-</button><span class="w-8 text-center text-xs font-bold font-mono">' + i.qty + '</span><button onclick="window.__updateQty(\'' + i.id + '\',1)" class="w-9 h-full font-bold text-brand-500 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">+</button></div></div>';
      }).join('');
    }
  }
  
  var modalPriceDisplay = document.getElementById('modalTotalPrice');
  if (modalPriceDisplay) modalPriceDisplay.innerText = formatRupiah(tp);
  
  renderProductDisplay();
}

window.toggleCart = function() {
  var o = document.getElementById('cartOverlay');
  var s = document.getElementById('cartSidebar');
  
  if (!o || !s) return;
  
  if (s.classList.contains('translate-x-full')) {
    o.classList.remove('hidden');
    setTimeout(function() { o.classList.remove('opacity-0'); }, 10);
    s.classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden';
  } else {
    o.classList.add('opacity-0');
    s.classList.add('translate-x-full');
    setTimeout(function() { o.classList.add('hidden'); }, 300);
    document.body.style.overflow = '';
  }
};

window.updateCartUI = updateCartUI;