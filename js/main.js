(function() {
    'use strict';

    // --- State Global ---
    var cart = []; window.__cart = cart;
    var activeCatalog = 'r2'; var currentPage = 1; var itemsPerPage = 12;
    var activeFilter = 'all'; var activeSort = 'name-asc'; var searchTerm = '';

    // --- Helper Functions ---
    function formatRupiah(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n); }
    function escapeHtml(str) { var div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
    function getR2Tier(price) { if (price <= 76000) return 'hemat'; if (price >= 90000) return 'premium'; return 'populer'; }

    // --- Number Counter Animation for "500+" ---
    function animateCounter(elementId, target, duration = 2000) {
        let start = 0;
        const element = document.getElementById(elementId);
        if(!element) return;
        const increment = target / (duration / 16);
        const updateCounter = () => {
            start += increment;
            if (start >= target) { element.innerText = target; return; }
            element.innerText = Math.floor(start);
            requestAnimationFrame(updateCounter);
        };
        updateCounter();
    }

    // --- 3D Card Tilt Effect ---
    function enable3DTilt() {
        document.querySelectorAll('.card-3d').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }

    // --- Catalog & Filter Logic (Disamakan dengan data.js) ---
    window.switchCatalog = function(cat) {
        activeCatalog = cat; activeFilter = 'all'; currentPage = 1; searchTerm = '';
        document.querySelectorAll('.catalog-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === cat));
        buildFilterChips(); renderProductDisplay();
    };

    function buildFilterChips() {
        var container = document.getElementById('filterChipsContainer');
        if (!container) return;
        if (activeCatalog === 'r2') {
            container.innerHTML = `
                <button onclick="applyFilter('all')" id="chip-all" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-brand-900 text-white shadow-md">Semua</button>
                <button onclick="applyFilter('hemat')" id="chip-hemat" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-emerald-300">Hemat</button>
                <button onclick="applyFilter('populer')" id="chip-populer" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-brand-300">Populer</button>
                <button onclick="applyFilter('premium')" id="chip-premium" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:border-blue-300">Premium</button>`;
        } else {
            container.innerHTML = `
                <button onclick="applyFilter('all')" id="chip-all" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-brand-900 text-white shadow-md">Semua</button>
                <button onclick="applyFilter('segA')" id="chip-segA" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200">Segmen A</button>
                <button onclick="applyFilter('segB')" id="chip-segB" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200">Segmen B</button>
                <button onclick="applyFilter('segC')" id="chip-segC" class="filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200">Segmen C</button>`;
        }
    }

    window.applyFilter = function(f) {
        activeFilter = f; currentPage = 1;
        document.querySelectorAll('.filter-chip').forEach(c => {
            c.classList.remove('bg-brand-900', 'text-white', 'shadow-md');
            c.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
        });
        var active = document.getElementById('chip-' + f);
        if (active) active.classList.add('bg-brand-900', 'text-white', 'shadow-md');
        renderProductDisplay();
    };

    // --- Core Render (Produk dengan class card-3d) ---
    function renderProductDisplay() {
        var source = activeCatalog === 'r2' ? productsR2 : productsResmi;
        var r = source.slice();
        if (searchTerm) r = r.filter(p => p.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
        if (activeFilter !== 'all') {
            if (activeCatalog === 'r2') r = r.filter(p => getR2Tier(p.price) === activeFilter);
            else r = r.filter(p => p.segment === activeFilter.replace('seg', ''));
        }
        r.sort((a,b) => { if(activeSort==='price-asc') return a.price-b.price; if(activeSort==='price-desc') return b.price-a.price; return a.name.localeCompare(b.name); });

        var g = document.getElementById('productGrid'); g.innerHTML = '';
        var pp = r.slice(0, itemsPerPage);

        pp.forEach((p, idx) => {
            var c = document.createElement('div');
            c.className = 'card-3d bg-white rounded-3xl p-6 border border-slate-200 relative overflow-hidden flex flex-col justify-between group card-enter';
            c.style.animationDelay = (idx * 30) + 'ms';
            
            var badge = activeCatalog === 'resmi' ? `<span class="segment-badge bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold">${p.segmentName}</span>` : '';
            var btn = `<button onclick="window.__addCart('${p.id}')" class="w-full mt-4 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center justify-center gap-2"><i class="fa-solid fa-plus text-xs"></i> Tambah</button>`;

            c.innerHTML = `
                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-4"><div class="flex flex-col gap-1"><span class="text-[10px] text-slate-400 font-mono font-bold">${p.id.toUpperCase()}</span>${badge}</div></div>
                    <h3 class="text-lg font-extrabold text-brand-900 leading-tight mb-2">${escapeHtml(p.name)}</h3>
                    <p class="text-2xl font-black text-brand-900 font-mono tracking-tighter">${formatRupiah(p.price)}<span class="text-[10px] text-slate-400 font-sans font-medium ml-1">/slop</span></p>
                </div>
                <div class="relative z-10">${btn}</div>
            `;
            g.appendChild(c);
        });
        enable3DTilt(); // Re-apply 3D effect on new cards
    }

    // --- Cart Logic ---
    window.__addCart = function(id) {
        var p = allProducts.find(x => x.id === id); if(!p) return;
        var existing = cart.find(x => x.id === id);
        if(existing) existing.qty += 1; else cart.push({id: p.id, name: p.name, price: p.price, qty: 1});
        updateCartUI(); showToast("Ditambahkan ke keranjang");
    };

    function updateCartUI() {
        var t = cart.reduce((s,i) => s + i.qty, 0);
        var badge = document.getElementById('cartBadge');
        if(badge) { badge.innerText = t; badge.classList.toggle('scale-0', t===0); }
    }

    function showToast(m) {
        var c = document.getElementById('toast-container');
        if(!c) return;
        var to = document.createElement('div');
        to.className = 'fixed bottom-4 right-4 bg-brand-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 transform translate-x-full transition-transform duration-300 z-50';
        to.innerHTML = '<i class="fa-solid fa-check-circle text-brand-400"></i> <span class="font-bold text-xs">'+m+'</span>';
        document.body.appendChild(to);
        setTimeout(() => to.classList.remove('translate-x-full'), 10);
        setTimeout(() => { to.classList.add('translate-x-full'); setTimeout(() => to.remove(), 300); }, 2500);
    }
    window.showToast = showToast;
    window.toggleCart = function() {
        var s = document.getElementById('cartSidebar');
        s.classList.toggle('translate-x-full');
        document.body.style.overflow = s.classList.contains('translate-x-full') ? '' : 'hidden';
    };
    window.openCheckoutModal = function() {
        toggleCart();
        setTimeout(() => {
            document.getElementById('checkoutModalOverlay').classList.add('overlay-enter');
            document.getElementById('checkoutModal').classList.add('modal-enter');
        }, 300);
    };
    window.closeCheckoutModal = function() {
        document.getElementById('checkoutModalOverlay').classList.remove('overlay-enter');
        document.getElementById('checkoutModal').classList.remove('modal-enter');
    };
    window.submitOrder = function() {
        var btn = document.getElementById('finalCheckoutBtn');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
        setTimeout(() => {
            window.open('https://wa.me/6285715905079?text=Halo%20Admin%2C%20saya%20ingin%20order%20barang.', '_blank');
            btn.innerHTML = '<span>Konfirmasi</span><i class="fa-brands fa-whatsapp"></i>';
            closeCheckoutModal();
        }, 1000);
    };

    // --- Search Logic ---
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        clearTimeout(window.searchTimer);
        window.searchTimer = setTimeout(() => { searchTerm = e.target.value; renderProductDisplay(); }, 300);
    });

    // --- DOM Ready ---
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('loader').style.display = 'none';
        buildFilterChips(); renderProductDisplay(); animateCounter('trustCounter', 500, 2500);
    });
})();