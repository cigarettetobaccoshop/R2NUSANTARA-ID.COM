// ============================================
// app.js — Semua Logika Aplikasi
// R2 NUSANTARA
// ============================================

(function() {
  'use strict';

  // ============================================
  // SMART CONTEXT FOR CHATLING
  // ============================================
  window.R2Context = {
    init: function() {
      this.device = /Mobile|Android|iP(hone|od|ad)/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
      this.language = navigator.language || navigator.userLanguage;
      this.referrer = document.referrer || 'Direct';
      this.isReturning = localStorage.getItem('r2_visited') ? true : false;
      localStorage.setItem('r2_visited', 'true');
    },
    getCartSummary: function() {
      if (!window.__cart) return 'Keranjang Kosong';
      var total = window.__cart.reduce(function(s, i) { return s + i.qty; }, 0);
      return total + ' Slop';
    }
  };
  window.R2Context.init();

  window.chtlConfig = { chatbotId: '4136889914' };

  window.addEventListener('load', function() {
    setTimeout(function() {
      var script = document.createElement('script');
      script.async = true;
      script.dataset.id = '4136889914';
      script.id = 'chtl-script';
      script.type = 'text/javascript';
      script.src = 'https://chatling.ai/js/embed.js';
      document.body.appendChild(script);
    }, 3000);
  });

  // ============================================
  // STATE GLOBAL
  // ============================================
  var productsR2 = window.productsR2 || [];
  var productsResmi = window.productsResmi || [];
  var allProducts = window.allProducts || [];

  var cart = [];
  window.__cart = cart;
  var activeCatalog = 'r2';
  var currentPage = 1;
  var itemsPerPage = 8; // 2 kolom → 8 produk per halaman
  var activeFilter = 'all';
  var activeSort = 'name-asc';
  var searchTerm = '';

  // ============================================
  // UTILITIES
  // ============================================
  function formatRupiah(n) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  }
  function getR2Tier(price) {
    if (price <= 76000) return 'hemat';
    if (price >= 90000) return 'premium';
    return 'populer';
  }
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function showToast(m, type) {
    type = type || 'success';
    var c = document.getElementById('toast-container');
    if (!c) return;
    var to = document.createElement('div');
    var iconClass = type === 'success' ? 'fa-check-circle text-emerald-400' : type === 'error' ? 'fa-circle-exclamation text-red-400' : 'fa-circle-info text-brand-400';
    to.className = 'bg-brand-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 transform translate-x-full transition-transform duration-300 border border-white/10';
    to.innerHTML = '<i class="fa-solid ' + iconClass + '"></i><span class="font-bold text-xs">' + m + '</span>';
    c.appendChild(to);
    setTimeout(function() { to.classList.remove('translate-x-full'); }, 10);
    setTimeout(function() {
      to.classList.add('translate-x-full');
      setTimeout(function() { to.remove(); }, 300);
    }, 2500);
  }

  function getCartQty(id) {
    var item = cart.find(function(x) { return x.id === id; });
    return item ? item.qty : 0;
  }

  // ============================================
  // CATALOG FUNCTIONS
  // ============================================
  window.switchCatalog = function(cat) {
    if (cat !== 'r2' && cat !== 'resmi') return;
    activeCatalog = cat;
    activeFilter = 'all';
    currentPage = 1;
    searchTerm = '';
    var searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.catalog-tab').forEach(function(tab) {
      var isActive = tab.dataset.tab === cat;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    updateCatalogInfoBanner();
    buildFilterChips();
    var indicator = document.getElementById('activeFilterIndicator');
    if (indicator) indicator.classList.add('hidden');
    renderProductDisplay();
  };

  function updateCatalogInfoBanner() {
    var banner = document.getElementById('catalogInfoBanner');
    var icon = document.getElementById('catalogInfoIcon');
    var title = document.getElementById('catalogInfoTitle');
    var desc = document.getElementById('catalogInfoDesc');
    if (!banner) return;
    if (activeCatalog === 'r2') {
      banner.classList.remove('resmi');
      if (icon) icon.className = 'fa-solid fa-fire-flame-curved text-lg';
      if (title) title.textContent = 'Katalog R2 Nusantara';
      if (desc) desc.textContent = '167 merek lokal pilihan dengan harga kompetitif untuk margin maksimal.';
    } else {
      banner.classList.add('resmi');
      if (icon) icon.className = 'fa-solid fa-certificate text-lg';
      if (title) title.textContent = 'Katalog Resmi — Brand Nasional & Internasional';
      if (desc) desc.textContent = '66 merek resmi terbagi dalam 5 segmen. Harga grosir per slop.';
    }
  }

  function buildFilterChips() {
    var container = document.getElementById('filterChipsContainer');
    if (!container) return;
    if (activeCatalog === 'r2') {
      container.innerHTML =
        '<button onclick="applyFilter(\'all\')" id="chip-all" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-brand-900 text-white shadow-md">Semua</button>' +
        '<button onclick="applyFilter(\'hemat\')" id="chip-hemat" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600"><i class="fa-solid fa-piggy-bank text-[10px]"></i> Hemat</button>' +
        '<button onclick="applyFilter(\'populer\')" id="chip-populer" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-600"><i class="fa-solid fa-fire text-[10px]"></i> Populer</button>' +
        '<button onclick="applyFilter(\'premium\')" id="chip-premium" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600"><i class="fa-solid fa-crown text-[10px]"></i> Premium</button>';
    } else {
      container.innerHTML =
        '<button onclick="applyFilter(\'all\')" id="chip-all" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-brand-900 text-white shadow-md">Semua</button>' +
        '<button onclick="applyFilter(\'segA\')" id="chip-segA" class="filter-chip filter-chip-resmi px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:text-amber-700"><i class="fa-solid fa-gem text-[10px]"></i> Segmen A</button>' +
        '<button onclick="applyFilter(\'segB\')" id="chip-segB" class="filter-chip filter-chip-resmi px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-700"><i class="fa-solid fa-star text-[10px]"></i> Segmen B</button>' +
        '<button onclick="applyFilter(\'segC\')" id="chip-segC" class="filter-chip filter-chip-resmi px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700"><i class="fa-solid fa-leaf text-[10px]"></i> Segmen C</button>' +
        '<button onclick="applyFilter(\'segD\')" id="chip-segD" class="filter-chip filter-chip-resmi px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-pink-300 hover:text-pink-700"><i class="fa-solid fa-globe text-[10px]"></i> Segmen D</button>' +
        '<button onclick="applyFilter(\'segE\')" id="chip-segE" class="filter-chip filter-chip-resmi px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700"><i class="fa-solid fa-hand-holding-heart text-[10px]"></i> Segmen E</button>';
    }
  }

  function getProcessedProducts() {
    var source = activeCatalog === 'r2' ? productsR2 : productsResmi;
    var r = source.slice();
    if (searchTerm) r = r.filter(function(p) { return p.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1; });
    if (activeFilter !== 'all') {
      if (activeCatalog === 'r2') {
        r = r.filter(function(p) { return getR2Tier(p.price) === activeFilter; });
      } else {
        var seg = activeFilter.replace('seg', '');
        r = r.filter(function(p) { return p.segment === seg; });
      }
    }
    r.sort(function(a, b) {
      if (activeSort === 'price-asc') return a.price - b.price;
      if (activeSort === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    return r;
  }

  function renderProductDisplay() {
    var processed = getProcessedProducts();
    var totalPages = Math.ceil(processed.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    var pageItems = processed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    var grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var noProduct = document.getElementById('noProductFound');
    if (!pageItems.length) {
      if (noProduct) noProduct.classList.remove('hidden');
      renderPagination(totalPages);
      return;
    }
    if (noProduct) noProduct.classList.add('hidden');

    pageItems.forEach(function(p, idx) {
      var card = document.createElement('div');
      var isResmi = p.category === 'resmi';
      card.className = 'product-card bg-white rounded-2xl p-4 border border-slate-200 card-premium card-glow relative overflow-hidden flex flex-col justify-between group card-enter' + (isResmi ? ' product-card-resmi' : '');
      card.style.animationDelay = (idx * 40) + 'ms';
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      });

      var badge = '';
      if (isResmi) {
        var seg = p.segment;
        var segLabels = { A: 'PREMIUM', B: 'REGULER', C: 'MILD', D: 'INTERNATIONAL', E: 'LEGACY' };
        var segIcons = { A: 'gem', B: 'star', C: 'leaf', D: 'globe', E: 'hand-holding-heart' };
        badge = '<span class="segment-badge segment-' + seg + '"><i class="fa-solid fa-' + segIcons[seg] + '"></i> SEG ' + seg + ' · ' + segLabels[seg] + '</span>';
      } else {
        var tier = getR2Tier(p.price);
        if (tier === 'hemat') badge = '<span class="segment-badge tier-hemat"><i class="fa-solid fa-piggy-bank"></i> HEMAT</span>';
        else if (tier === 'premium') badge = '<span class="segment-badge tier-premium"><i class="fa-solid fa-crown"></i> PREMIUM</span>';
        else badge = '<span class="segment-badge tier-populer"><i class="fa-solid fa-fire"></i> POPULER</span>';
      }

      var qty = getCartQty(p.id);
      var btn = qty > 0
        ? '<div class="flex items-center justify-between border-2 border-brand-500 rounded-lg bg-brand-50 p-0.5 mt-3 stepper-enter"><button onclick="window.__updateQty(\'' + p.id + '\',-1)" class="w-8 h-8 rounded-lg bg-white text-brand-600 font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-transform">-</button><span class="font-bold text-brand-900">' + qty + '</span><button onclick="window.__updateQty(\'' + p.id + '\',1)" class="w-8 h-8 rounded-lg bg-brand-500 text-white font-bold shadow-sm hover:bg-brand-600 active:scale-95 transition-transform">+</button></div>'
        : '<button onclick="window.__addCart(\'' + p.id + '\')" class="w-full mt-3 py-2 bg-slate-100 text-brand-900 font-bold rounded-lg hover:bg-brand-900 hover:text-white transition-colors text-xs flex items-center justify-center gap-1"><i class="fa-solid fa-plus text-[10px]"></i> Tambah</button>';

      var catIndicator = isResmi
        ? '<span class="inline-flex items-center gap-1 text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"><i class="fa-solid fa-certificate text-[7px]"></i> RESMI</span>'
        : '<span class="inline-flex items-center gap-1 text-[8px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200"><i class="fa-solid fa-fire-flame-curved text-[7px]"></i> R2</span>';

      card.innerHTML =
        '<div class="relative z-10">' +
        '<div class="flex justify-between items-start mb-2 gap-2">' + badge +
        '<div class="flex flex-col items-end gap-0.5 shrink-0">' + catIndicator +
        '<span class="text-slate-300 text-[8px] font-mono font-bold">' + p.id.toUpperCase() + '</span></div></div>' +
        '<h3 class="product-name text-sm font-extrabold text-brand-900 leading-tight mb-0.5 group-hover:text-brand-500 transition-colors">' + escapeHtml(p.name) + '</h3>' +
        (isResmi ? '<p class="text-[8px] text-slate-500 font-medium mb-1 italic">' + escapeHtml(p.segmentName) + '</p>' : '') +
        '<p class="product-price text-lg font-black text-brand-900 font-mono tracking-tighter">' + formatRupiah(p.price) + '<span class="text-[8px] text-slate-400 font-sans font-medium ml-0.5">/slop</span></p>' +
        '</div><div class="relative z-10">' + btn + '</div>';

      grid.appendChild(card);
    });

    renderPagination(totalPages);
    updateActiveFilterIndicator();
  }

  function renderPagination(totalPages) {
    var container = document.getElementById('paginationContainer');
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    var html = '';
    for (var i = 1; i <= totalPages; i++) {
      html += '<button onclick="window.__goToPage(' + i + ')" class="w-10 h-10 rounded-xl text-sm font-bold transition-all ' +
        (i === currentPage ? 'bg-brand-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-400') +
        '">' + i + '</button>';
    }
    container.innerHTML = html;
  }

  function updateActiveFilterIndicator() {
    var indicator = document.getElementById('activeFilterIndicator');
    var text = document.getElementById('activeFilterText');
    if (!indicator || !text) return;
    if (activeFilter === 'all') {
      indicator.classList.add('hidden');
      return;
    }
    indicator.classList.remove('hidden');
    var labels = {
      'hemat': 'Hemat (≤ Rp 76.000)',
      'populer': 'Populer (Rp 77.000 - 89.000)',
      'premium': 'Premium (≥ Rp 90.000)',
      'segA': 'Segmen A — Kretek Filter Premium',
      'segB': 'Segmen B — Kretek Filter Reguler',
      'segC': 'Segmen C — Mild/ Rendah Tar',
      'segD': 'Segmen D — SPM Internasional',
      'segE': 'Segmen E — Kretek Tangan/ Legacy'
    };
    text.textContent = 'Filter: ' + (labels[activeFilter] || activeFilter);
  }

  window.applyFilter = function(f) {
    activeFilter = f;
    currentPage = 1;
    document.querySelectorAll('.filter-chip').forEach(function(c) {
      if (c.classList.contains('filter-chip-resmi')) {
        c.classList.remove('filter-chip-resmi', 'segment-active');
        c.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      } else {
        c.classList.remove('bg-brand-900', 'text-white', 'shadow-md');
        c.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      }
    });
    var active = document.getElementById('chip-' + f);
    if (active) {
      if (active.classList.contains('filter-chip-resmi') || f.indexOf('seg') === 0) {
        active.classList.add('segment-active');
        active.classList.remove('bg-white', 'text-slate-600');
      } else {
        active.classList.add('bg-brand-900', 'text-white', 'shadow-md');
        active.classList.remove('bg-white', 'text-slate-600');
      }
    }
    renderProductDisplay();
  };

  window.applySort = function(s) {
    activeSort = s;
    currentPage = 1;
    renderProductDisplay();
  };

  window.__goToPage = function(p) {
    currentPage = p;
    renderProductDisplay();
    document.getElementById('produk').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ============================================
  // CART LOGIC
  // ============================================
  window.__addCart = function(id) {
    var p = allProducts.find(function(x) { return x.id === id; });
    if (!p) return;
    var existing = cart.find(function(x) { return x.id === id; });
    if (existing) existing.qty += 1;
    else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1, category: p.category });
    updateCartUI();
    showToast('Berhasil ditambahkan');
  };

  window.__updateQty = function(id, ch) {
    var item = cart.find(function(x) { return x.id === id; });
    if (item) {
      item.qty += ch;
      if (item.qty < 1) cart = cart.filter(function(x) { return x.id !== id; });
    }
    updateCartUI();
  };

  function updateCartUI() {
    var totalItems = cart.reduce(function(s, i) { return s + i.qty; }, 0);
    var totalPrice = cart.reduce(function(s, i) { return s + (i.price * i.qty); }, 0);

    var badge = document.getElementById('cartBadge');
    if (badge) {
      badge.innerText = totalItems;
      badge.classList.toggle('scale-0', totalItems === 0);
    }

    var bannerQty = document.getElementById('bannerQty');
    var progressFill = document.getElementById('progressFill');
    var bannerTitle = document.getElementById('bannerTitle');
    var bannerSubtitle = document.getElementById('bannerSubtitle');
    var banner = document.getElementById('shippingProgressBanner');
    if (bannerQty) bannerQty.innerText = totalItems;
    if (progressFill) progressFill.style.width = Math.min((totalItems / 20) * 100, 100) + '%';
    if (totalItems >= 20) {
      if (bannerTitle) bannerTitle.innerText = '🎉 Target Tercapai';
      if (bannerSubtitle) bannerSubtitle.innerHTML = 'Anda mendapat <b class="text-emerald-300">GRATIS ONGKIR</b>';
      if (banner) { banner.classList.add('bg-emerald-600'); banner.classList.remove('bg-brand-900'); }
    } else {
      if (bannerTitle) bannerTitle.innerText = 'Target Gratis Ongkir';
      if (bannerSubtitle) bannerSubtitle.innerHTML = 'Pilih <b class="text-emerald-300">' + (20 - totalItems) + ' slop</b> lagi untuk subsidi.';
      if (banner) { banner.classList.remove('bg-emerald-600'); banner.classList.add('bg-brand-900'); }
    }

    var container = document.getElementById('cartItemsContainer');
    var summary = document.getElementById('cartSummary');
    if (!cart.length) {
      if (container) container.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-center opacity-50"><i class="fa-solid fa-cart-shopping text-6xl text-slate-300 mb-4"></i><p class="font-bold text-slate-600">Keranjang Kosong</p></div>';
      if (summary) summary.classList.add('hidden');
    } else {
      if (summary) summary.classList.remove('hidden');
      var totalItemsDisplay = document.getElementById('totalItemsDisplay');
      var totalPriceDisplay = document.getElementById('totalPriceDisplay');
      if (totalItemsDisplay) totalItemsDisplay.innerText = totalItems;
      if (totalPriceDisplay) totalPriceDisplay.innerText = formatRupiah(totalPrice);
      if (container) {
        container.innerHTML = cart.map(function(i) {
          var catBadge = i.category === 'resmi'
            ? '<span class="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"><i class="fa-solid fa-certificate text-[8px]"></i> RESMI</span>'
            : '<span class="inline-flex items-center gap-1 text-[9px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200"><i class="fa-solid fa-fire-flame-curved text-[8px]"></i> R2</span>';
          return '<div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1"><span class="font-bold text-sm text-brand-900 truncate">' + escapeHtml(i.name) + '</span>' + catBadge + '</div><div class="text-brand-500 font-bold font-mono text-sm">' + formatRupiah(i.price) + '</div></div><div class="flex items-center border border-slate-200 rounded-lg h-9 shrink-0"><button onclick="window.__updateQty(\'' + i.id + '\',-1)" class="w-9 h-full font-bold text-slate-500 hover:bg-slate-50 transition-colors">-</button><span class="w-8 text-center text-xs font-bold font-mono">' + i.qty + '</span><button onclick="window.__updateQty(\'' + i.id + '\',1)" class="w-9 h-full font-bold text-brand-500 hover:bg-slate-50 transition-colors">+</button></div></div>';
        }).join('');
      }
    }

    var modalTotal = document.getElementById('modalTotalPrice');
    if (modalTotal) modalTotal.innerText = formatRupiah(totalPrice);
    renderProductDisplay();
  }

  window.toggleCart = function() {
    var overlay = document.getElementById('cartOverlay');
    var sidebar = document.getElementById('cartSidebar');
    if (!overlay || !sidebar) return;
    if (sidebar.classList.contains('translate-x-full')) {
      overlay.classList.remove('hidden');
      setTimeout(function() { overlay.classList.remove('opacity-0'); }, 10);
      sidebar.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
    } else {
      overlay.classList.add('opacity-0');
      sidebar.classList.add('translate-x-full');
      setTimeout(function() { overlay.classList.add('hidden'); }, 300);
      document.body.style.overflow = '';
    }
  };

  // ============================================
  // CHECKOUT MODAL
  // ============================================
  window.openCheckoutModal = function() {
    window.toggleCart();
    setTimeout(function() {
      var overlay = document.getElementById('checkoutModalOverlay');
      var modal = document.getElementById('checkoutModal');
      if (overlay) overlay.classList.add('overlay-enter');
      if (modal) modal.classList.add('modal-enter');
      document.body.style.overflow = 'hidden';
      updateProgressStep(1);
      setTimeout(function() {
        var nameInput = document.getElementById('newCustName');
        if (nameInput) nameInput.focus();
        validateCheckoutForm();
      }, 300);
    }, 300);
  };

  window.closeCheckoutModal = function() {
    var overlay = document.getElementById('checkoutModalOverlay');
    var modal = document.getElementById('checkoutModal');
    if (overlay) overlay.classList.remove('overlay-enter');
    if (modal) modal.classList.remove('modal-enter');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', function(e) {
    var modal = document.getElementById('checkoutModal');
    var reviewModal = document.getElementById('reviewModal');
    if (modal && modal.classList.contains('modal-enter') && e.key === 'Escape') window.closeCheckoutModal();
    if (reviewModal && reviewModal.classList.contains('modal-enter') && e.key === 'Escape') window.closeReviewModal();
  });

  var formInputs = document.querySelectorAll('#checkoutFormFull input, #checkoutFormFull textarea, #checkoutFormFull select');
  formInputs.forEach(function(input, index) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (index < formInputs.length - 1) formInputs[index + 1].focus();
      }
    });
    input.addEventListener('focus', function() {
      var stepGroup = input.closest('[data-step]');
      if (stepGroup) updateProgressStep(parseInt(stepGroup.getAttribute('data-step')));
    });
    input.addEventListener('input', validateCheckoutForm);
    input.addEventListener('change', validateCheckoutForm);
    input.addEventListener('blur', validateCheckoutForm);
  });

  function updateProgressStep(stepNum) {
    var indicators = [document.getElementById('step1Indicator'), document.getElementById('step2Indicator'), document.getElementById('step3Indicator')];
    var line = document.getElementById('stepProgressLine');
    indicators.forEach(function(ind, idx) {
      if (!ind) return;
      var numCircle = ind.querySelector('div');
      var textSpan = ind.querySelector('span');
      numCircle.className = 'w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors duration-300 border-2 border-white ring-2 ring-slate-100 step-indicator' +
        (idx + 1 === stepNum ? ' active shadow-sm' : (idx + 1 < stepNum ? ' completed shadow-sm' : ' bg-slate-100 text-slate-400'));
      textSpan.className = 'text-[9px] font-bold uppercase tracking-widest' +
        (idx + 1 === stepNum ? ' text-brand-900' : (idx + 1 < stepNum ? ' text-emerald-500' : ' text-slate-400'));
    });
    var width = stepNum === 1 ? 0 : stepNum === 2 ? 50 : 100;
    if (line) line.style.width = width + '%';
  }

  var phoneInput = document.getElementById('newCustPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      var v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('62')) v = v.substring(2);
      if (v.startsWith('0')) v = v.substring(1);
      var match = v.match(/(\d{0,3})(\d{0,4})(\d{0,5})/);
      if (match) {
        var formatted = !match[2] ? match[1] : match[1] + ' ' + match[2] + (match[3] ? ' ' + match[3] : '');
        e.target.value = formatted.substring(0, 15);
      } else {
        e.target.value = v;
      }
    });
  }

  function showError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);
    if (field) { field.classList.add('form-field-error'); field.classList.remove('field-valid'); }
    if (error) {
      var span = error.querySelector('span');
      if (span) span.textContent = message;
      error.classList.add('show');
    }
  }

  function clearError(fieldId, errorId) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);
    if (field) { field.classList.remove('form-field-error'); field.classList.add('field-valid'); }
    if (error) error.classList.remove('show');
  }

  function validateCheckoutForm() {
    var isValid = true;
    var name = document.getElementById('newCustName');
    if (name && name.value.trim().length >= 2) {
      clearError('newCustName', 'newErrName');
    } else {
      if (name && name.value.trim().length > 0) showError('newCustName', 'newErrName', 'Minimal 2 karakter');
      isValid = false;
    }
    var phone = document.getElementById('newCustPhone');
    var phoneClean = phone ? phone.value.replace(/\D/g, '') : '';
    if (phoneClean && /^8[1-9]\d{6,11}$/.test(phoneClean)) {
      clearError('newCustPhone', 'newErrPhone');
    } else {
      if (phoneClean) showError('newCustPhone', 'newErrPhone', 'Nomor tidak valid');
      isValid = false;
    }
    var alamat = document.getElementById('newAlamat');
    if (alamat && alamat.value.trim().length >= 20) {
      clearError('newAlamat', 'newErrAlamat');
    } else {
      if (alamat && alamat.value.trim().length > 0) showError('newAlamat', 'newErrAlamat', 'Minimal 20 karakter');
      isValid = false;
    }
    var required = ['newProvinsi', 'newKota', 'newKecamatan', 'newKelurahan', 'newKodePos', 'newEkspedisi', 'newMetode', 'newAdmin'];
    required.forEach(function(id) {
      var el = document.getElementById(id);
      if (!el || !el.value.trim()) isValid = false;
    });
    var btn = document.getElementById('finalCheckoutBtn');
    if (btn) {
      if (isValid) btn.removeAttribute('disabled');
      else btn.setAttribute('disabled', 'true');
    }
    return isValid;
  }

  window.submitOrder = function() {
    if (!validateCheckoutForm()) {
      showToast('Lengkapi formulir dengan benar', 'error');
      return;
    }
    var fName = document.getElementById('newCustName');
    var fPhone = document.getElementById('newCustPhone');
    var fProvinsi = document.getElementById('newProvinsi');
    var fKota = document.getElementById('newKota');
    var fKec = document.getElementById('newKecamatan');
    var fKel = document.getElementById('newKelurahan');
    var fPos = document.getElementById('newKodePos');
    var fAlamat = document.getElementById('newAlamat');
    var fPatokan = document.getElementById('newPatokan');
    var fEkspedisi = document.getElementById('newEkspedisi');
    var fMetode = document.getElementById('newMetode');
    var fAdmin = document.getElementById('newAdmin');

    var btn = document.getElementById('finalCheckoutBtn');
    var btnText = document.getElementById('finalBtnText');
    var btnIcon = document.getElementById('finalBtnIcon');

    btn.classList.add('checkout-btn-loading');
    btnText.textContent = 'Memproses...';
    btnIcon.style.display = 'none';

    setTimeout(function() {
      btn.classList.remove('checkout-btn-loading');
      btn.classList.add('checkout-success');
      btnText.textContent = 'Membuka WhatsApp...';
      btnIcon.className = 'fa-solid fa-check text-lg';
      btnIcon.style.display = '';

      var waNumber = fAdmin.value;
      var total = cart.reduce(function(s, i) { return s + i.qty; }, 0);
      var r2Items = cart.filter(function(i) { return i.category === 'r2'; });
      var resmiItems = cart.filter(function(i) { return i.category === 'resmi'; });

      var fullAddress = fAlamat.value.trim() + ' (Patokan: ' + (fPatokan.value.trim() || '-') + ')\n' +
        'Kel: ' + fKel.value.trim() + ', Kec: ' + fKec.value.trim() + '\n' +
        fKota.value.trim() + ', ' + fProvinsi.value.trim() + ' - ' + fPos.value.trim();

      var msg = '📝 *ORDER R2 NUSANTARA (ENTERPRISE)*\n\n';
      msg += '👤 *Nama:* ' + fName.value.trim() + '\n';
      msg += '📱 *No. HP:* +62 ' + fPhone.value.trim() + '\n';
      msg += '📍 *Alamat Pengiriman:*\n' + fullAddress + '\n\n';
      msg += '🚚 *Ekspedisi:* ' + fEkspedisi.value + '\n';
      msg += '💳 *Pembayaran:* ' + fMetode.value + '\n\n';

      if (r2Items.length > 0) {
        msg += '*🔥 KATALOG R2:*\n';
        r2Items.forEach(function(i) { msg += '• ' + i.name + ' — ' + i.qty + ' slop\n'; });
        msg += '\n';
      }
      if (resmiItems.length > 0) {
        msg += '*🏅 KATALOG RESMI:*\n';
        resmiItems.forEach(function(i) { msg += '• ' + i.name + ' — ' + i.qty + ' slop\n'; });
        msg += '\n';
      }
      msg += '*Total Order:* ' + total + ' Slop\n';
      msg += '*Status Ongkir:* ' + (total >= 20 ? '✅ Gratis Ongkir' : 'Reguler');

      setTimeout(function() {
        window.open('https://wa.me/' + waNumber + '?text=' + encodeURIComponent(msg), '_blank');
        cart = [];
        window.__cart = cart;
        updateCartUI();
        window.closeCheckoutModal();
        document.getElementById('checkoutFormFull').reset();
        btn.classList.remove('checkout-success');
        btnText.textContent = 'Konfirmasi Pesanan';
        btnIcon.className = 'fa-brands fa-whatsapp text-lg';
        validateCheckoutForm();
        showToast('Pesanan berhasil dilanjutkan! 🎉');
      }, 800);
    }, 1500);
  };

  // ============================================
  // TESTIMONIAL SLIDER
  // ============================================
  var slider = document.getElementById('testimonialSlider');
  var prevBtn = document.getElementById('sliderPrevBtn');
  var nextBtn = document.getElementById('sliderNextBtn');
  if (slider && prevBtn && nextBtn) {
    var isDown = false;
    var startX, scrollLeft;
    slider.addEventListener('mousedown', function(e) {
      isDown = true;
      slider.style.scrollSnapType = 'none';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', function() {
      isDown = false;
      slider.style.scrollSnapType = 'x mandatory';
    });
    slider.addEventListener('mouseup', function() {
      isDown = false;
      slider.style.scrollSnapType = 'x mandatory';
    });
    slider.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - slider.offsetLeft;
      var walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    });

    function getScrollAmount() {
      var card = slider.querySelector('.testimonial-card-slide');
      return card ? card.offsetWidth + 24 : 350;
    }

    nextBtn.addEventListener('click', function() {
      slider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });
    prevBtn.addEventListener('click', function() {
      slider.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    var autoSlide = setInterval(function() {
      if (!isDown) {
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        }
      }
    }, 4000);
    slider.addEventListener('mouseenter', function() { clearInterval(autoSlide); });
  }

  // ============================================
  // REVIEW MODAL
  // ============================================
  window.openReviewModal = function() {
    var overlay = document.getElementById('reviewModalOverlay');
    var modal = document.getElementById('reviewModal');
    if (overlay) overlay.classList.add('overlay-enter');
    if (modal) modal.classList.add('modal-enter');
    document.body.style.overflow = 'hidden';
  };

  window.closeReviewModal = function() {
    var overlay = document.getElementById('reviewModalOverlay');
    var modal = document.getElementById('reviewModal');
    if (overlay) overlay.classList.remove('overlay-enter');
    if (modal) modal.classList.remove('modal-enter');
    document.body.style.overflow = '';
    setTimeout(function() {
      document.getElementById('reviewForm').reset();
      window.setRating(5);
    }, 300);
  };

  window.setRating = function(val) {
    document.getElementById('reviewRating').value = val;
    var stars = document.querySelectorAll('#starRatingSelector i');
    stars.forEach(function(s) {
      if (parseInt(s.getAttribute('data-rating')) <= val) {
        s.classList.add('text-amber-400');
        s.classList.remove('text-slate-200');
      } else {
        s.classList.remove('text-amber-400');
        s.classList.add('text-slate-200');
      }
    });
  };

  window.submitReview = function() {
    var btn = document.getElementById('submitReviewBtn');
    var name = document.getElementById('reviewName').value;
    var store = document.getElementById('reviewStore').value;
    var text = document.getElementById('reviewText').value;
    var rating = document.getElementById('reviewRating').value;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
    btn.classList.add('opacity-80', 'pointer-events-none');

    setTimeout(function() {
      var starsHtml = '';
      for (var i = 0; i < 5; i++) {
        starsHtml += i < rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-solid fa-star text-slate-200"></i>';
      }
      var initial = name.charAt(0).toUpperCase();
      var newCard = document.createElement('div');
      newCard.className = 'testimonial-card-slide bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative flex flex-col justify-between';
      newCard.innerHTML =
        '<div><div class="flex items-center gap-4 mb-5"><div class="w-14 h-14 rounded-full avatar-gradient-9 shrink-0"><span class="avatar-initial">' + initial + '</span></div><div><h4 class="font-extrabold text-brand-900 text-base">' + escapeHtml(name) + '</h4><p class="text-xs text-slate-500 font-medium">' + escapeHtml(store) + '</p></div></div><div class="flex gap-0.5 mb-4 text-amber-400 text-sm">' + starsHtml + '</div><p class="text-slate-600 text-sm leading-relaxed">"' + escapeHtml(text) + '"</p></div><div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400"><span><i class="fa-solid fa-calendar-days mr-1"></i> Baru saja</span><span class="text-slate-400 font-bold"><i class="fa-solid fa-clock"></i> Pending Review</span></div>';

      if (slider) {
        slider.insertBefore(newCard, slider.firstChild);
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      }
      showToast('Terima kasih! Ulasan Anda berhasil dikirim.');
      window.closeReviewModal();
      btn.innerHTML = 'Kirim Ulasan';
      btn.classList.remove('opacity-80', 'pointer-events-none');
    }, 1000);
  };

  window.handleNewsletterSubmit = function(form) {
    var input = form.querySelector('input[type="email"]');
    if (input && input.value) {
      showToast('Terima kasih! Anda telah berlangganan newsletter.');
      input.value = '';
    }
  };

  // ============================================
  // INIT
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    var loader = document.getElementById('loader');
    if (loader) {
      if (window.__clearLoader) window.__clearLoader();
      loader.style.opacity = '0';
      setTimeout(function() { loader.style.display = 'none'; }, 700);
    }

    buildFilterChips();
    updateCatalogInfoBanner();
    renderProductDisplay();

    var countR2 = document.getElementById('countR2');
    var countResmi = document.getElementById('countResmi');
    var totalCount = document.getElementById('totalBrandCount');
    if (countR2) countR2.textContent = productsR2.length;
    if (countResmi) countResmi.textContent = productsResmi.length;
    if (totalCount) totalCount.textContent = allProducts.length;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-on-scroll').forEach(function(el) { observer.observe(el); });

    var header = document.getElementById('headerInner');
    var btt = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
      if (header) {
        if (window.scrollY > 50) { header.classList.add('py-2', 'shadow-lg'); header.classList.remove('py-3'); }
        else { header.classList.add('py-3'); header.classList.remove('py-2', 'shadow-lg'); }
      }
      if (btt) {
        if (window.scrollY > 500) btt.classList.add('visible');
        else btt.classList.remove('visible');
      }
    });

    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      var searchTimer;
      searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function() {
          searchTerm = e.target.value;
          currentPage = 1;
          renderProductDisplay();
        }, 200);
      });
    }

    validateCheckoutForm();
  });

})();