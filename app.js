/* ============================================
 app.js — R2 NUSANTARA MAIN APPLICATION
 (UPGRADE: sinkronisasi assets lokal + semua fitur dipertahankan)
============================================ */
(function () {
'use strict';

/* ============ 1B. SUPABASE CLIENT ============
 Publishable key (anon) — aman dipakai di sisi client, akses dibatasi Row Level Security:
 - products: publik cuma boleh SELECT
 - orders & newsletter_subscribers: publik cuma boleh INSERT (tidak bisa baca punya orang lain) */
var SUPA_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co';
var SUPA_KEY = 'sb_publishable_mqJp3tqSL1gCjz1xdcgWGQ_mtDFRTmg';
var supa = null;
try {
 if (window.supabase && window.supabase.createClient) supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
} catch (e) { supa = null; }

/* ============ 2. SMART CONTEXT + CHATBOT ============ */
window.R2Context = {
 init: function () {
 this.device = /Mobile|Android|iP(hone|od|ad)/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
 this.language = navigator.language || 'id-ID';
 this.isReturning = !!localStorage.getItem('r2_visited');
 localStorage.setItem('r2_visited', 'true');
 },
 getCartSummary: function () {
 if (!window.__cart) return 'Keranjang Kosong';
 return window.__cart.reduce(function (s, i) { return s + i.qty; }, 0) + ' Slop';
 }
};
window.R2Context.init();
window.chtlConfig = { chatbotId: "4136889914" };
window.__chatlingLoaded = false;
window.loadChatWidget = function (btn) {
 if (window.__chatlingLoaded) return;
 window.__chatlingLoaded = true;
 if (btn) { btn.classList.add('chat-trigger-loading'); btn.querySelector('i').className = 'fa-solid fa-spinner fa-spin'; }
 var s = document.createElement('script');
 s.async = true; s.dataset.id = "4136889914"; s.id = "chtl-script";
 s.type = "text/javascript"; s.src = "https://chatling.ai/js/embed.js";
 s.onload = function () { if (btn) btn.style.display = 'none'; };
 document.body.appendChild(s);
};

/* ============ 3. STATE GLOBAL ============ */
var cart = [], wishlist = [];
try { cart = JSON.parse(localStorage.getItem('r2_cart')) || []; } catch (e) { cart = []; }
try { wishlist = JSON.parse(localStorage.getItem('r2_wishlist')) || []; } catch (e) { wishlist = []; }
window.__cart = cart;
var activeCatalog = 'r2', currentPage = 1, itemsPerPage = 12;
var activeFilter = 'all', activeSort = 'name-asc', searchTerm = '', viewMode = 'grid';

/* ============ 4. UTILITIES ============ */
function formatRupiah(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n); }
function getR2Tier(p) { if (p <= 76000) return 'hemat'; if (p >= 90000) return 'premium'; return 'populer'; }
function getCartQty(id) { var i = cart.find(function (x) { return x.id === id; }); return i ? i.qty : 0; }
function isWishlisted(id) { return wishlist.indexOf(id) > -1; }
function escapeHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function saveCart() { try { localStorage.setItem('r2_cart', JSON.stringify(cart)); } catch (e) {} }
function saveWishlist() { try { localStorage.setItem('r2_wishlist', JSON.stringify(wishlist)); } catch (e) {} }
function showToast(m, type) {
 type = type || 'success';
 var c = document.getElementById('toast-container'); if (!c) return;
 var to = document.createElement('div');
 var ic = type === 'success' ? 'fa-check-circle text-gold' : type === 'error' ? 'fa-circle-exclamation text-red-400' : 'fa-circle-info text-brand-400';
 to.className = 'bg-deep text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 translate-x-full transition-transform duration-300 border border-white/10';
 to.innerHTML = '<i class="fa-solid ' + ic + '"></i><span class="font-bold text-xs">' + m + '</span>';
 c.appendChild(to);
 setTimeout(function () { to.classList.remove('translate-x-full'); }, 10);
 setTimeout(function () { to.classList.add('translate-x-full'); setTimeout(function () { to.remove(); }, 300); }, 2500);
}

/* ============ 5. ANIMASI TEKS ============ */
var SCRAMBLE_CHARS = '█▓▒░<>/#01RXZK*+';
function scrambleIn(el) {
 var original = el.getAttribute('data-scramble-text') || el.textContent;
 var iterations = 0, frame = 0;
 var iv = setInterval(function () {
 el.textContent = original.split('').map(function (ch, idx) {
 if (ch === ' ') return ' ';
 if (idx < iterations) return ch;
 return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
 }).join('');
 frame++; if (frame % 2 === 0) iterations++;
 if (iterations > original.length) { clearInterval(iv); el.textContent = original; }
 }, 28);
}
function startTypewriter(el, text) {
 var i = 0;
 function tick() {
 if (i <= text.length) { el.textContent = text.slice(0, i); i++; setTimeout(tick, 22); }
 else el.classList.add('tw-done');
 }
 setTimeout(tick, 600);
}
function startWordRotator(el, words) {
 var idx = 0;
 setInterval(function () {
 el.classList.add('rotator-out');
 setTimeout(function () {
 idx = (idx + 1) % words.length;
 el.textContent = words[idx];
 el.classList.remove('rotator-out');
 el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
 }, 300);
 }, 2600);
}
function initTextAnimations() {
 document.querySelectorAll('[data-word-reveal]').forEach(function (el) {
 var words = el.textContent.trim().split(/\s+/);
 el.innerHTML = words.map(function (w, i) { return '<span class="wr-word" style="transition-delay:' + (i * 70) + 'ms">' + w + '</span>'; }).join(' ');
 });
 var wrObs = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('wr-visible'); wrObs.unobserve(en.target); } }); }, { threshold: 0.25 });
 document.querySelectorAll('[data-word-reveal]').forEach(function (el) { wrObs.observe(el); });
 document.querySelectorAll('[data-scramble]').forEach(function (el) { el.setAttribute('data-scramble-text', el.textContent.trim()); });
 var scObs = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { scrambleIn(en.target); scObs.unobserve(en.target); } }); }, { threshold: 0.5 });
 document.querySelectorAll('[data-scramble]').forEach(function (el) { scObs.observe(el); });
 var tw = document.getElementById('typewriterText');
 if (tw) startTypewriter(tw, tw.getAttribute('data-typewriter') || '');
 var rot = document.getElementById('heroRotator');
 if (rot) startWordRotator(rot, (rot.getAttribute('data-words') || 'Penuhi').split('|'));
}
function animateCounter(el) {
 var target = parseInt(el.getAttribute('data-count-to'), 10); if (isNaN(target)) return;
 var suffix = el.getAttribute('data-count-suffix') || '', duration = 1400, start = null;
 function step(ts) {
 if (!start) start = ts;
 var p = Math.min((ts - start) / duration, 1), eased = 1 - Math.pow(1 - p, 3);
 el.textContent = Math.floor(eased * target) + suffix;
 if (p < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
 }
 requestAnimationFrame(step);
}

/* ============ 6. MOBILE MENU ============ */
window.toggleMobileMenu = function () {
 var m = document.getElementById('mobileMenu'), ic = document.getElementById('mobileMenuIcon');
 if (!m) return;
 m.classList.toggle('hidden');
 if (ic) ic.className = m.classList.contains('hidden') ? 'fa-solid fa-bars text-sm' : 'fa-solid fa-xmark text-sm';
};
function closeMobileMenu() {
 var m = document.getElementById('mobileMenu'), ic = document.getElementById('mobileMenuIcon');
 if (m) m.classList.add('hidden');
 if (ic) ic.className = 'fa-solid fa-bars text-sm';
}

/* ============ 7. KATALOG ============ */
function pseudoRating(id) {
 var h = 0;
 for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
 return Math.round((4.3 + (h % 8) / 10) * 10) / 10;
}
function retailPrice(price) { return Math.ceil((price / 0.87) / 1000) * 1000; }
function renderStars(rating) {
 var full = Math.floor(rating), half = (rating - full) >= 0.5, html = '';
 for (var i = 0; i < 5; i++) {
 if (i < full) html += '<i class="fa-solid fa-star"></i>';
 else if (i === full && half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
 else html += '<i class="fa-regular fa-star"></i>';
 }
 return html;
}
function isNewProduct(id) { var n = parseInt(id.replace(/\D/g, ''), 10); return n % 11 === 0; }
function getRibbonBadge(p) {
 if (isNewProduct(p.id)) return { cls: 'new', label: '<i class="fa-solid fa-bolt"></i> BARU' };
 if (p.category === 'resmi') {
 if (p.segment === 'A' || p.segment === 'D') return { cls: 'vip', label: '<i class="fa-solid fa-crown"></i> VIP' };
 if (p.segment === 'B') return { cls: 'hit', label: '<i class="fa-solid fa-fire"></i> TERLARIS' };
 return null;
 }
 var tier = getR2Tier(p.price);
 if (tier === 'premium') return { cls: 'vip', label: '<i class="fa-solid fa-crown"></i> VIP' };
 if (tier === 'populer') return { cls: 'hit', label: '<i class="fa-solid fa-fire"></i> TERLARIS' };
 return null;
}
window.switchCatalog = function (cat) {
 if (cat !== 'r2' && cat !== 'resmi') return;
 activeCatalog = cat; activeFilter = 'all'; currentPage = 1; searchTerm = '';
 var si = document.getElementById('searchInput'); if (si) si.value = '';
 document.querySelectorAll('.catalog-tab').forEach(function (t) {
 var a = t.dataset.tab === cat; t.classList.toggle('active', a); t.setAttribute('aria-selected', a ? 'true' : 'false');
 });
 updateCatalogInfoBanner(); buildFilterChips();
 var ind = document.getElementById('activeFilterIndicator'); if (ind) ind.classList.add('hidden');
 renderProductDisplay();
};
function updateCatalogInfoBanner() {
 var b = document.getElementById('catalogInfoBanner'), i = document.getElementById('catalogInfoIcon'), t = document.getElementById('catalogInfoTitle'), d = document.getElementById('catalogInfoDesc');
 if (!b) return;
 if (activeCatalog === 'r2') {
 b.classList.remove('resmi');
 if (i) i.className = 'fa-solid fa-fire-flame-curved text-lg';
 if (t) t.textContent = 'Katalog R2 Nusantara';
 if (d) d.textContent = '167 merek lokal pilihan dengan harga kompetitif untuk margin maksimal.';
 } else {
 b.classList.add('resmi');
 if (i) i.className = 'fa-solid fa-certificate text-lg';
 if (t) t.textContent = 'Katalog Resmi — Brand Nasional & Internasional';
 if (d) d.textContent = '66 merek resmi terbagi dalam 5 segmen. Harga grosir per slop.';
 }
}
function buildFilterChips() {
 var c = document.getElementById('filterChipsContainer'); if (!c) return;
 var base = 'filter-chip px-5 py-2.5 rounded-xl text-xs font-bold transition-all';
 var on = 'bg-deep text-white shadow-md', off = 'bg-white text-slate-600 border border-slate-200 hover:border-gold hover:text-gold';
 if (activeCatalog === 'r2') {
 c.innerHTML =
 '<button onclick="applyFilter(\'all\')" id="chip-all" class="' + base + ' ' + on + '">Semua</button>' +
 '<button onclick="applyFilter(\'hemat\')" id="chip-hemat" class="' + base + ' ' + off + '"><i class="fa-solid fa-piggy-bank text-[10px]"></i> Hemat</button>' +
 '<button onclick="applyFilter(\'populer\')" id="chip-populer" class="' + base + ' ' + off + '"><i class="fa-solid fa-fire text-[10px]"></i> Populer</button>' +
 '<button onclick="applyFilter(\'premium\')" id="chip-premium" class="' + base + ' ' + off + '"><i class="fa-solid fa-crown text-[10px]"></i> Premium</button>';
 } else {
 c.innerHTML =
 '<button onclick="applyFilter(\'all\')" id="chip-all" class="' + base + ' ' + on + '">Semua</button>' +
 '<button onclick="applyFilter(\'segA\')" id="chip-segA" class="filter-chip-resmi ' + base + ' ' + off + '"><i class="fa-solid fa-gem text-[10px]"></i> Segmen A</button>' +
 '<button onclick="applyFilter(\'segB\')" id="chip-segB" class="filter-chip-resmi ' + base + ' ' + off + '"><i class="fa-solid fa-star text-[10px]"></i> Segmen B</button>' +
 '<button onclick="applyFilter(\'segC\')" id="chip-segC" class="filter-chip-resmi ' + base + ' ' + off + '"><i class="fa-solid fa-leaf text-[10px]"></i> Segmen C</button>' +
 '<button onclick="applyFilter(\'segD\')" id="chip-segD" class="filter-chip-resmi ' + base + ' ' + off + '"><i class="fa-solid fa-globe text-[10px]"></i> Segmen D</button>' +
 '<button onclick="applyFilter(\'segE\')" id="chip-segE" class="filter-chip-resmi ' + base + ' ' + off + '"><i class="fa-solid fa-hand-holding-heart text-[10px]"></i> Segmen E</button>';
 }
}
function getProcessedProducts() {
 var src = activeCatalog === 'r2' ? productsR2 : productsResmi, r = src.slice();
 if (searchTerm) r = r.filter(function (p) { return p.name.toLowerCase().indexOf(searchTerm) !== -1; });
 if (activeCatalog === 'r2') { if (activeFilter !== 'all') r = r.filter(function (p) { return getR2Tier(p.price) === activeFilter; }); }
 else if (activeFilter !== 'all') { var seg = activeFilter.replace('seg', ''); r = r.filter(function (p) { return p.segment === seg; }); }
 r.sort(function (a, b) {
 if (activeSort === 'price-asc') return a.price - b.price;
 if (activeSort === 'price-desc') return b.price - a.price;
 if (activeSort === 'name-desc') return b.name.localeCompare(a.name);
 return a.name.localeCompare(b.name);
 });
 return r;
}
var __placeholderCache = {};
function generateProductPlaceholder(name, size, uid, category) {
 var cacheKey = uid + '|' + size + '|' + category;
 if (__placeholderCache[cacheKey]) return __placeholderCache[cacheKey];
 var gid = 'grad' + uid + size;
 var isResmi = category === 'resmi';
 var brandWord = isResmi ? 'RESMI' : 'R2';

 /* Versi kecil (thumbnail tabel/recently-viewed): cukup dark badge + wordmark, detail penuh tak muat */
 if (size === 'small') {
 var w = 40, h = 40;
 var svgSmall = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">' +
 '<defs><linearGradient id="' + gid + '" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#26282b"/><stop offset="100%" stop-color="#0c0d0e"/></linearGradient></defs>' +
 '<rect width="' + w + '" height="' + h + '" fill="url(#' + gid + ')" rx="7"/>' +
 '<rect x="6" y="6" width="' + (w - 12) + '" height="' + (h - 12) + '" rx="3" fill="none" stroke="#8A96A8" stroke-width="1" opacity="0.35"/>' +
 '<text x="' + (w / 2) + '" y="' + (h / 2 - 1) + '" font-family="Inter,sans-serif" font-size="11" font-weight="800" fill="#e8ebef" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.5">' + brandWord + '</text>' +
 '<text x="' + (w / 2) + '" y="' + (h / 2 + 10) + '" font-family="Inter,sans-serif" font-size="4" font-weight="700" fill="#8A96A8" text-anchor="middle" letter-spacing="1">NUSANTARA</text></svg>';
 __placeholderCache[cacheKey] = svgSmall;
 return svgSmall;
 }

 /* Versi medium (kartu katalog): mockup kemasan lengkap */
 var w = 240, h = 240;
 var safeName = escapeHtml(name.length > 20 ? name.slice(0, 20) + '…' : name).toUpperCase();
 var filterLabel = isResmi ? 'RESMI FILTER' : 'R2 FILTER';

 /* Pola watermark berulang di background (grid teks miring, opacity rendah) — dihemat jadi 8 elemen, tampilan tetap sama karena opacity sangat tipis */
 var tiles = '';
 for (var row = 0; row < 4; row++) {
 for (var col = 0; col < 2; col++) {
 var tx = col * 140 + (row % 2 === 0 ? 0 : 60);
 var ty = row * 62 + 30;
 tiles += '<text x="' + tx + '" y="' + ty + '" font-family="Inter,sans-serif" font-size="14" font-weight="800" fill="#ffffff" opacity="0.04" transform="rotate(-18 ' + tx + ' ' + ty + ')">' + brandWord + '</text>';
 }
 }

 /* Barcode mockup: batang vertikal lebar acak tapi konsisten (berbasis uid) */
 var seed = 0;
 for (var c = 0; c < uid.length; c++) seed = (seed * 31 + uid.charCodeAt(c)) >>> 0;
 var bars = '', bx = 74;
 for (var bi = 0; bi < 16; bi++) {
 var bw = 1 + ((seed >> (bi % 24)) & 1) + (((seed >> (bi % 16)) & 1) ? 1 : 0);
 if ((seed >> (bi % 8)) & 1) bars += '<rect x="' + bx + '" y="0" width="' + bw + '" height="14" fill="#c8cdd4"/>';
 bx += bw + 2.4;
 }

 /* Pola sisi kiri-kanan R2 kecil vertikal via loop (6 titik, dari sebelumnya 10 baris manual) */
 var sidePattern = '';
 [30, 198].forEach(function (sx) {
 [30, 110, 190].forEach(function (sy) {
 sidePattern += '<text x="' + sx + '" y="' + sy + '" font-family="Inter,sans-serif" font-size="9" font-weight="800" fill="#8A96A8" opacity="0.3">' + brandWord + '</text>';
 });
 });

 var result = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">' +
 '<defs>' +
 '<linearGradient id="' + gid + '" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#28292c"/><stop offset="55%" stop-color="#17181a"/><stop offset="100%" stop-color="#0a0a0b"/></linearGradient>' +
 '<linearGradient id="pack' + gid + '" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#f4f5f6"/><stop offset="100%" stop-color="#d7dade"/></linearGradient>' +
 '</defs>' +
 '<rect width="' + w + '" height="' + h + '" fill="url(#' + gid + ')"/>' +
 '<g>' + tiles + '</g>' +
 /* Silhouette kemasan */
 '<rect x="76" y="14" width="88" height="212" rx="6" fill="url(#pack' + gid + ')" stroke="#9aa0a8" stroke-width="0.75"/>' +
 /* Kotak health warning */
 '<rect x="86" y="24" width="68" height="30" rx="2" fill="#ffffff" stroke="#1a1a1a" stroke-width="0.6"/>' +
 '<text x="120" y="32" font-family="Inter,sans-serif" font-size="4.2" font-weight="800" fill="#111" text-anchor="middle" letter-spacing="0.4">HEALTH WARNINGS</text>' +
 '<path d="M92 46 l3.2 -5.6 l3.2 5.6 z" fill="none" stroke="#111" stroke-width="0.8"/><text x="95.2" y="45.3" font-family="Inter,sans-serif" font-size="4.5" fill="#111" text-anchor="middle" font-weight="800">!</text>' +
 '<rect x="103" y="40" width="9" height="9" fill="#111"/><rect x="105" y="42" width="2" height="2" fill="#fff"/><rect x="108.5" y="42" width="1.5" height="1.5" fill="#fff"/><rect x="105" y="45.5" width="1.5" height="1.5" fill="#fff"/>' +
 /* Teks peringatan */
 '<text x="120" y="65" font-family="Inter,sans-serif" font-size="5.4" font-weight="800" fill="#1a1a1a" text-anchor="middle">PERINGATAN:</text>' +
 '<text x="120" y="72" font-family="Inter,sans-serif" font-size="5.4" font-weight="800" fill="#1a1a1a" text-anchor="middle">MEROKOK MEMBUNUHMU</text>' +
 '<text x="120" y="79" font-family="Inter,sans-serif" font-size="4" font-weight="500" fill="#555" text-anchor="middle" letter-spacing="0.3">WARNING: SMOKING KILLS</text>' +
 /* Logo besar R2 NUSANTARA */
 '<text x="120" y="132" font-family="Georgia, serif" font-size="30" font-weight="800" fill="#1a2530" text-anchor="middle" letter-spacing="1">R2</text>' +
 '<text x="120" y="145" font-family="Inter,sans-serif" font-size="9" font-weight="700" fill="#3a4a5c" text-anchor="middle" letter-spacing="3">NUSANTARA</text>' +
 '<rect x="98" y="150" width="44" height="1" fill="#8A96A8"/>' +
 /* Label filter dinamis R2/RESMI + nama produk */
 '<rect x="79" y="158" width="82" height="15" fill="' + (isResmi ? '#7a1f1f' : '#1a2530') + '"/>' +
 '<text x="120" y="168" font-family="Inter,sans-serif" font-size="6.5" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="1">' + filterLabel + '</text>' +
 '<text x="120" y="185" font-family="Inter,sans-serif" font-size="6" font-weight="700" fill="#2a2a2a" text-anchor="middle">' + safeName + '</text>' +
 /* Barcode */
 '<g transform="translate(0,208)">' + bars + '</g>' +
 '<text x="120" y="232" font-family="Inter,sans-serif" font-size="3.4" font-weight="600" fill="#7a828c" text-anchor="middle" letter-spacing="0.5">233 VARIAN</text>' +
 /* Pola sisi kiri-kanan R2 kecil vertikal (dihemat jadi loop 6 titik dari sebelumnya 10 baris manual) */
 sidePattern +
 '</svg>';
 __placeholderCache[cacheKey] = result;
 return result;
}
function buildCardActions(p) {
 var q = getCartQty(p.id);
 var main = q > 0
 ? '<div class="mp-stepper stepper-enter"><button onclick="window.__updateQty(\'' + p.id + '\',-1)" class="mp-step-btn">-</button><span class="mp-step-val">' + q + '</span><button onclick="window.__updateQty(\'' + p.id + '\',1)" class="mp-step-btn mp-step-btn-gold">+</button></div>'
 : '<button onclick="window.__addCart(\'' + p.id + '\')" class="mp-add-btn"><i class="fa-solid fa-cart-plus"></i> Keranjang</button>';
 return '<div class="mp-actions">' + main + '<button onclick="openQuickView(\'' + p.id + '\')" class="mp-quick-btn" aria-label="Lihat Cepat"><i class="fa-solid fa-eye"></i></button></div>';
}
function buildRowActions(p) {
 var q = getCartQty(p.id);
 var main = q > 0
 ? '<div class="mp-stepper sm stepper-enter"><button onclick="window.__updateQty(\'' + p.id + '\',-1)" class="mp-step-btn">-</button><span class="mp-step-val">' + q + '</span><button onclick="window.__updateQty(\'' + p.id + '\',1)" class="mp-step-btn mp-step-btn-gold">+</button></div>'
 : '<button onclick="window.__addCart(\'' + p.id + '\')" class="mp-add-btn sm" aria-label="Tambah ke Keranjang"><i class="fa-solid fa-cart-plus"></i></button>';
 return main + '<button onclick="openQuickView(\'' + p.id + '\')" class="mp-quick-btn sm" aria-label="Lihat Cepat"><i class="fa-solid fa-eye"></i></button>';
}
function buildProductCardHTML(p, idx) {
 var isResmi = p.category === 'resmi';
 var tag = isResmi
 ? '<span class="mp-tag mp-tag-resmi"><i class="fa-solid fa-certificate"></i> RESMI</span>'
 : '<span class="mp-tag mp-tag-r2"><i class="fa-solid fa-fire-flame-curved"></i> R2</span>';
 var catLabel = isResmi ? (p.segmentName || 'Katalog Resmi') : 'Katalog R2 Nusantara';
 var rating = pseudoRating(p.id);
 var ribbon = getRibbonBadge(p);
 var ribbonHTML = ribbon ? '<div class="mp-ribbon mp-ribbon-' + ribbon.cls + '">' + ribbon.label + '</div>' : '';
 var wl = isWishlisted(p.id);
 var wishBtn = '<button onclick="toggleWishlistItem(\'' + p.id + '\', event)" data-wish-heart="' + p.id + '" class="mp-wish-btn' + (wl ? ' is-active' : '') + '" aria-label="Wishlist"><i class="fa-' + (wl ? 'solid' : 'regular') + ' fa-heart"></i></button>';
 var retail = retailPrice(p.price);
 var savingsPct = Math.max(1, Math.round((1 - p.price / retail) * 100));
 var ph = generateProductPlaceholder(p.name, 'medium', p.id, p.category);
 return '<div class="mp-card card-glow card-enter' + (isResmi ? ' mp-card-resmi' : '') + '" style="animation-delay:' + (idx * 40) + 'ms" data-pid="' + p.id + '">' +
 '<div class="mp-card-media">' + ribbonHTML + wishBtn + '<div class="mp-card-img">' + ph + '</div></div>' +
 '<div class="mp-card-body">' +
 '<div class="mp-card-toprow">' + tag + '<span class="mp-id">' + p.id.toUpperCase() + '</span></div>' +
 '<p class="mp-cat">' + escapeHtml(catLabel) + '</p>' +
 '<h3 class="mp-name">' + escapeHtml(p.name) + '</h3>' +
 '<div class="mp-rating"><span class="mp-stars">' + renderStars(rating) + '</span><span class="mp-rating-num">' + rating.toFixed(1) + '</span></div>' +
 '<div class="mp-price-row"><span class="mp-price-old">' + formatRupiah(retail) + '</span><span class="mp-save-badge">Hemat ' + savingsPct + '%</span></div>' +
 '<div class="mp-price-now">' + formatRupiah(p.price) + '<span class="mp-price-unit">/slop grosir</span></div>' +
 buildCardActions(p) +
 '</div></div>';
}
function buildProductRowHTML(p, idx) {
 var isResmi = p.category === 'resmi', wl = isWishlisted(p.id);
 var rating = pseudoRating(p.id), ribbon = getRibbonBadge(p), retail = retailPrice(p.price);
 var catBadge = isResmi
 ? '<span class="mp-row-tag mp-tag-resmi"><i class="fa-solid fa-certificate"></i> RESMI · SEG ' + p.segment + '</span>'
 : '<span class="mp-row-tag mp-tag-r2"><i class="fa-solid fa-fire-flame-curved"></i> R2 · ' + getR2Tier(p.price).toUpperCase() + '</span>';
 var thumb = '<div class="mp-row-thumb">' + generateProductPlaceholder(p.name, 'small', p.id, p.category) + '</div>';
 return '<div class="mp-row' + (isResmi ? ' is-resmi' : '') + '" style="animation-delay:' + (idx * 25) + 'ms" data-pid="' + p.id + '">' +
 '<div class="mp-row-main">' + thumb + '<div class="min-w-0">' +
 (ribbon ? '<span class="mp-row-ribbon mp-ribbon-' + ribbon.cls + '">' + ribbon.label + '</span>' : '') +
 '<div class="mp-row-name truncate">' + escapeHtml(p.name) + '</div>' +
 '<div class="mp-row-rating"><span class="mp-stars sm">' + renderStars(rating) + '</span><span class="mp-rating-num">' + rating.toFixed(1) + '</span><span class="mt-1">' + catBadge + '</span></div>' +
 '</div></div>' +
 '<div class="mp-row-price"><span class="mp-price-old sm">' + formatRupiah(retail) + '</span><span class="mp-price-now sm">' + formatRupiah(p.price) + '</span></div>' +
 '<div class="text-[11px] font-bold text-slate-500 hidden md:block">' + p.id.toUpperCase() + '</div>' +
 '<div class="mp-row-actions">' +
 '<button onclick="toggleWishlistItem(\'' + p.id + '\', event)" data-wish-heart="' + p.id + '" class="mp-wish-btn sm' + (wl ? ' is-active' : '') + '" aria-label="Wishlist"><i class="fa-' + (wl ? 'solid' : 'regular') + ' fa-heart"></i></button>' +
 buildRowActions(p) + '</div></div>';
}
function renderProductDisplay() {
 var processed = getProcessedProducts();
 var tp = Math.ceil(processed.length / itemsPerPage) || 1;
 if (currentPage > tp) currentPage = tp;
 var pp = processed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 var grid = document.getElementById('productGrid'), wrap = document.getElementById('productTableWrap'), body = document.getElementById('productTableBody'), none = document.getElementById('noProductFound');
 if (!pp.length) {
 if (grid) grid.innerHTML = ''; if (body) body.innerHTML = '';
 if (none) none.classList.remove('hidden');
 renderPagination(tp); return;
 }
 if (none) none.classList.add('hidden');
 if (viewMode === 'table') {
 if (grid) grid.classList.add('hidden');
 if (wrap) wrap.classList.remove('hidden');
 if (body) body.innerHTML = pp.map(buildProductRowHTML).join('');
 } else {
 if (wrap) wrap.classList.add('hidden');
 if (grid) { grid.classList.remove('hidden'); grid.innerHTML = pp.map(buildProductCardHTML).join(''); }
 if (grid) grid.querySelectorAll('.card-glow').forEach(function (c) {
 c.addEventListener('mousemove', function (e) {
 var r = c.getBoundingClientRect();
 c.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
 c.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
 });
 });
 }
 renderPagination(tp); updateActiveFilterIndicator();
}
function updateActiveFilterIndicator() {
 var ind = document.getElementById('activeFilterIndicator'), txt = document.getElementById('activeFilterText');
 if (!ind || !txt) return;
 if (activeFilter === 'all') { ind.classList.add('hidden'); return; }
 ind.classList.remove('hidden'); ind.classList.add('flex');
 var L = { hemat: 'Hemat (≤ Rp 76.000)', populer: 'Populer (Rp 77.000–89.000)', premium: 'Premium (≥ Rp 90.000)', segA: 'Segmen A — Kretek Filter Premium', segB: 'Segmen B — Kretek Filter Reguler', segC: 'Segmen C — Mild / Rendah Tar', segD: 'Segmen D — SPM Internasional', segE: 'Segmen E — Kretek Tangan / Legacy' };
 txt.textContent = 'Filter: ' + (L[activeFilter] || activeFilter);
}
function renderPagination(tp) {
 var c = document.getElementById('paginationContainer'); if (!c) return;
 if (tp <= 1) { c.innerHTML = ''; return; }
 var h = '';
 for (var i = 1; i <= tp; i++) h += '<button onclick="window.__goToPage(' + i + ')" class="w-10 h-10 rounded-xl text-sm font-bold transition-all ' + (i === currentPage ? 'bg-deep text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-gold') + '">' + i + '</button>';
 c.innerHTML = h;
}
window.__goToPage = function (p) { currentPage = p; renderProductDisplay(); var t = document.getElementById('produk'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
window.applyFilter = function (f) {
 activeFilter = f; currentPage = 1;
 document.querySelectorAll('.filter-chip').forEach(function (c) {
 if (c.classList.contains('filter-chip-resmi')) { c.classList.remove('filter-chip-resmi', 'segment-active'); c.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200'); }
 else { c.classList.remove('bg-deep', 'text-white', 'shadow-md'); c.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200'); }
 });
 var a = document.getElementById('chip-' + f);
 if (a) {
 if (a.classList.contains('filter-chip-resmi') || f.indexOf('seg') === 0) { a.classList.add('segment-active'); a.classList.remove('bg-white', 'text-slate-600'); }
 else { a.classList.add('bg-deep', 'text-white', 'shadow-md'); a.classList.remove('bg-white', 'text-slate-600'); }
 }
 renderProductDisplay();
};
window.applySort = function (s) { activeSort = s; currentPage = 1; renderProductDisplay(); };
window.setViewMode = function (m) {
 if (m !== 'grid' && m !== 'table') return;
 viewMode = m;
 var g = document.getElementById('viewGridBtn'), t = document.getElementById('viewTableBtn');
 if (g) g.classList.toggle('active', m === 'grid');
 if (t) t.classList.toggle('active', m === 'table');
 renderProductDisplay();
};

/* ============ 8. WISHLIST ============ */
window.toggleWishlistItem = function (id, event) {
 if (event) event.stopPropagation();
 var i = wishlist.indexOf(id);
 if (i > -1) { wishlist.splice(i, 1); showToast('Dihapus dari Wishlist', 'info'); }
 else { wishlist.push(id); showToast('Ditambahkan ke Wishlist', 'success'); }
 saveWishlist(); updateWishlistUI(); renderProductDisplay();
};
function updateWishlistUI() {
 var badge = document.getElementById('wishlistBadge');
 if (badge) { badge.innerText = wishlist.length; badge.classList.toggle('scale-0', wishlist.length === 0); }
 var mbBadge = document.getElementById('mbWishBadge');
 if (mbBadge) { mbBadge.textContent = wishlist.length; mbBadge.classList.toggle('hidden', wishlist.length === 0); }
 document.querySelectorAll('[data-wish-heart]').forEach(function (btn) {
 var id = btn.getAttribute('data-wish-heart'), on = isWishlisted(id);
 btn.classList.toggle('is-active', on);
 var ic = btn.querySelector('i'); if (ic) ic.className = 'fa-' + (on ? 'solid' : 'regular') + ' fa-heart text-xs';
 });
 var c = document.getElementById('wishlistItemsContainer'); if (!c) return;
 if (!wishlist.length) {
 c.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-center opacity-50"><i class="fa-regular fa-heart text-6xl text-slate-300 mb-4"></i><p class="font-bold text-slate-600">Wishlist Kosong</p></div>';
 return;
 }
 c.innerHTML = wishlist.map(function (id) {
 var p = allProducts.find(function (x) { return x.id === id; }); if (!p) return '';
 return '<div class="flex items-center gap-3 bg-ivory p-3 rounded-xl border border-slate-100">' +
 '<div class="flex-1 min-w-0"><div class="font-bold text-sm text-deep truncate">' + escapeHtml(p.name) + '</div><div class="text-gold font-mono text-xs font-bold">' + formatRupiah(p.price) + '</div></div>' +
 '<button onclick="window.__addCart(\'' + p.id + '\'); toggleWishlistItem(\'' + p.id + '\');" class="w-8 h-8 rounded-lg bg-deep text-white flex items-center justify-center hover:bg-gold transition-colors" title="Pindah ke Keranjang"><i class="fa-solid fa-cart-plus text-xs"></i></button>' +
 '<button onclick="toggleWishlistItem(\'' + p.id + '\')" class="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><i class="fa-solid fa-trash text-xs"></i></button></div>';
 }).join('');
}
window.toggleWishlistSidebar = function () {
 var o = document.getElementById('wishlistOverlay'), s = document.getElementById('wishlistSidebar');
 if (!o || !s) return;
 if (s.classList.contains('translate-x-full')) { o.classList.remove('hidden'); setTimeout(function () { o.classList.remove('opacity-0'); }, 10); s.classList.remove('translate-x-full'); document.body.style.overflow = 'hidden'; }
 else { o.classList.add('opacity-0'); s.classList.add('translate-x-full'); setTimeout(function () { o.classList.add('hidden'); }, 300); document.body.style.overflow = ''; }
};

/* ============ 8B. RECENTLY VIEWED ============ */
function getRecentlyViewed() {
 try { return JSON.parse(localStorage.getItem('r2_recently_viewed') || '[]'); } catch (e) { return []; }
}
function trackRecentlyViewed(id) {
 var list = getRecentlyViewed().filter(function (x) { return x !== id; });
 list.unshift(id);
 list = list.slice(0, 10);
 try { localStorage.setItem('r2_recently_viewed', JSON.stringify(list)); } catch (e) {}
 renderRecentlyViewed();
}
function renderRecentlyViewed() {
 var wrap = document.getElementById('recentlyViewedWrap'), row = document.getElementById('recentlyViewedRow');
 if (!wrap || !row) return;
 var ids = getRecentlyViewed();
 var items = ids.map(function (id) { return allProducts.find(function (p) { return p.id === id; }); }).filter(Boolean).slice(0, 8);
 if (!items.length) { wrap.classList.add('hidden'); return; }
 wrap.classList.remove('hidden');
 row.innerHTML = items.map(function (p) {
 return '<button onclick="openQuickView(\'' + p.id + '\')" class="recent-chip" aria-label="Lihat ' + escapeHtml(p.name) + '"><span class="recent-chip-thumb">' + generateProductPlaceholder(p.name, 'small', p.id, p.category) + '</span><span class="recent-chip-name">' + escapeHtml(p.name) + '</span><span class="recent-chip-price">' + formatRupiah(p.price) + '</span></button>';
 }).join('');
}

/* ============ 9. QUICK VIEW ============ */
window.openQuickView = function (id) {
 var p = allProducts.find(function (x) { return x.id === id; }); if (!p) return;
 trackRecentlyViewed(p.id);
 try { history.replaceState(null, '', location.pathname + '?p=' + encodeURIComponent(p.id)); } catch (e) {}
 var imgWrap = document.getElementById('qvImageWrap');
 if (imgWrap) imgWrap.innerHTML = generateProductPlaceholder(p.name, 'medium', p.id, p.category);
 var t = document.getElementById('qvTitle'), pr = document.getElementById('qvPrice'), b = document.getElementById('qvBadge'), i = document.getElementById('qvId'), d = document.getElementById('qvDesc');
 if (t) t.textContent = p.name;
 if (pr) pr.innerHTML = formatRupiah(p.price) + '<span class="text-xs text-slate-400 font-sans font-medium">/slop</span>';
 if (i) i.textContent = p.id.toUpperCase();
 if (d) d.textContent = p.category === 'resmi' ? (p.segmentName || '') : 'Katalog R2 Nusantara — harga kompetitif untuk margin maksimal.';
 if (b) {
 if (p.category === 'resmi') { b.className = 'segment-badge segment-' + p.segment; b.innerHTML = '<i class="fa-solid fa-certificate"></i> RESMI · SEG ' + p.segment; }
 else { var tier = getR2Tier(p.price); b.className = 'segment-badge tier-' + tier; b.innerHTML = '<i class="fa-solid fa-fire"></i> ' + tier.toUpperCase(); }
 }
 var ab = document.getElementById('qvAddToCartBtn'); if (ab) ab.onclick = function () { window.__addCart(p.id); closeQuickView(); };
 var wb = document.getElementById('qvWishlistBtn');
 if (wb) {
 var wl = isWishlisted(p.id);
 wb.classList.toggle('is-active', wl);
 wb.innerHTML = '<i class="fa-' + (wl ? 'solid' : 'regular') + ' fa-heart"></i>';
 wb.onclick = function () { toggleWishlistItem(p.id); var now = isWishlisted(p.id); wb.classList.toggle('is-active', now); wb.innerHTML = '<i class="fa-' + (now ? 'solid' : 'regular') + ' fa-heart"></i>'; };
 }
 var sb = document.getElementById('qvShareBtn');
 if (sb) sb.onclick = function () { copyToClipboard(location.href, 'Link produk'); };
 var o = document.getElementById('quickViewOverlay'), m = document.getElementById('quickViewModal');
 if (o) { o.classList.remove('hidden'); setTimeout(function () { o.classList.add('overlay-enter'); }, 10); }
 if (m) setTimeout(function () { m.classList.add('modal-enter'); }, 10);
 document.body.style.overflow = 'hidden';
};
window.closeQuickView = function () {
 var o = document.getElementById('quickViewOverlay'), m = document.getElementById('quickViewModal');
 if (o) o.classList.remove('overlay-enter');
 if (m) m.classList.remove('modal-enter');
 setTimeout(function () { if (o) o.classList.add('hidden'); }, 300);
 document.body.style.overflow = '';
 try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
};

/* ============ 9B. LEGAL MODAL ============ */
var LEGAL_CONTENT = {
 tos: { title: 'Syarat & Ketentuan', body: '<p><strong>1. Umum.</strong> Dengan mengakses dan berbelanja di R2 Nusantara, Anda dianggap menyetujui syarat &amp; ketentuan berikut.</p><p><strong>2. Produk.</strong> Seluruh produk yang dijual ditujukan untuk konsumen dewasa (18 tahun ke atas) dan dijual dalam skema grosir/partai kepada mitra toko.</p><p><strong>3. Pemesanan.</strong> Pesanan dikonfirmasi melalui admin sebelum diproses. Harga dapat berubah sewaktu-waktu mengikuti kondisi pasar.</p><p><strong>4. Pembayaran &amp; Pengiriman.</strong> Metode pembayaran dan opsi ekspedisi mengikuti pilihan yang tersedia pada form checkout.</p><p><strong>5. Perselisihan.</strong> Segala keluhan dapat disampaikan langsung ke tim Admin melalui WhatsApp yang tertera di situs.</p>' },
 privacy: { title: 'Kebijakan Privasi', body: '<p>Kami menghargai privasi Anda. Data yang dikumpulkan (nama, nomor HP, alamat) hanya digunakan untuk keperluan proses pemesanan dan pengiriman, dan tidak dibagikan ke pihak ketiga di luar kebutuhan ekspedisi.</p><p>Data disimpan secara lokal di perangkat Anda (keranjang, wishlist) dan pada sistem internal kami untuk keperluan transaksi. Anda dapat menghubungi Admin kapan saja untuk permintaan penghapusan data.</p>' },
 cookie: { title: 'Kebijakan Cookie', body: '<p>Situs ini menggunakan penyimpanan lokal browser (localStorage) — bukan cookie pelacak pihak ketiga — untuk menyimpan preferensi ringan seperti isi keranjang belanja, wishlist, dan status persetujuan ini sendiri.</p><p>Data tersebut tersimpan hanya di perangkat Anda dan tidak dikirim ke server pihak ketiga untuk keperluan iklan.</p>' }
};
window.openLegalModal = function (type) {
 var c = LEGAL_CONTENT[type]; if (!c) return;
 var t = document.getElementById('legalTitle'), b = document.getElementById('legalBody');
 if (t) t.textContent = c.title;
 if (b) b.innerHTML = c.body;
 var o = document.getElementById('legalOverlay'), m = document.getElementById('legalModal');
 if (o) { o.classList.remove('hidden'); setTimeout(function () { o.classList.add('overlay-enter'); }, 10); }
 if (m) setTimeout(function () { m.classList.add('modal-enter'); }, 10);
 document.body.style.overflow = 'hidden';
};
window.closeLegalModal = function () {
 var o = document.getElementById('legalOverlay'), m = document.getElementById('legalModal');
 if (o) o.classList.remove('overlay-enter');
 if (m) m.classList.remove('modal-enter');
 setTimeout(function () { if (o) o.classList.add('hidden'); }, 300);
 document.body.style.overflow = '';
};

/* ============ 9C. COOKIE CONSENT ============ */
function initCookieConsent() {
 var el = document.getElementById('cookieConsent'); if (!el) return;
 var consented = false;
 try { consented = localStorage.getItem('r2_cookie_consent') !== null; } catch (e) {}
 if (consented) return;
 setTimeout(function () {
 el.classList.remove('hidden');
 setTimeout(function () { el.classList.add('is-visible'); }, 20);
 }, 1400);
}
window.acceptCookies = function () {
 try { localStorage.setItem('r2_cookie_consent', 'accepted'); } catch (e) {}
 window.closeCookieBanner();
};
window.closeCookieBanner = function () {
 try { if (localStorage.getItem('r2_cookie_consent') === null) localStorage.setItem('r2_cookie_consent', 'dismissed'); } catch (e) {}
 var el = document.getElementById('cookieConsent'); if (!el) return;
 el.classList.remove('is-visible');
 setTimeout(function () { el.classList.add('hidden'); }, 400);
};

/* ============ 10. VISITOR COUNTER ============ */
/* ============ 11. KERANJANG ============ */
window.__addCart = function (id) {
 var p = allProducts.find(function (x) { return x.id === id; }); if (!p) return;
 var ex = cart.find(function (x) { return x.id === id; });
 if (ex) ex.qty += 1; else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1, category: p.category });
 saveCart(); window.__cart = cart; updateCartUI(); showToast('Berhasil ditambahkan');
};
window.__updateQty = function (id, ch) {
 var i = cart.find(function (x) { return x.id === id; });
 if (i) { i.qty += ch; if (i.qty < 1) cart = cart.filter(function (x) { return x.id !== id; }); }
 window.__cart = cart; saveCart(); updateCartUI();
};
function updateCartUI() {
 var t = cart.reduce(function (s, i) { return s + i.qty; }, 0);
 var tp = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
 var badge = document.getElementById('cartBadge');
 if (badge) { badge.innerText = t; badge.classList.toggle('scale-0', t === 0); }
 var mbBadge = document.getElementById('mbCartBadge');
 if (mbBadge) { mbBadge.textContent = t; mbBadge.classList.toggle('hidden', t === 0); }
 var bq = document.getElementById('bannerQty'), pf = document.getElementById('progressFill'), bt = document.getElementById('bannerTitle'), bs = document.getElementById('bannerSubtitle'), bn = document.getElementById('shippingProgressBanner');
 if (bq) bq.innerText = t;
 if (pf) pf.style.width = Math.min((t / 20) * 100, 100) + '%';
 if (t >= 20) {
 if (bt) bt.innerText = '🎉 Target Tercapai';
 if (bs) bs.innerHTML = 'Anda mendapat <b class="text-gold">GRATIS ONGKIR</b>';
 if (bn) { bn.classList.add('bg-emerald-600'); bn.classList.remove('bg-deep'); }
 } else {
 if (bt) bt.innerText = 'Target Gratis Ongkir';
 if (bs) bs.innerHTML = 'Pilih <b class="text-gold">' + (20 - t) + ' slop</b> lagi untuk subsidi.';
 if (bn) { bn.classList.remove('bg-emerald-600'); bn.classList.add('bg-deep'); }
 }
 var cc = document.getElementById('cartItemsContainer'), cs = document.getElementById('cartSummary');
 if (!cart.length) {
 if (cc) cc.innerHTML = '<div class="h-full flex flex-col items-center justify-center text-center opacity-50"><i class="fa-solid fa-cart-shopping text-6xl text-slate-300 mb-4"></i><p class="font-bold text-slate-600">Keranjang Kosong</p></div>';
 if (cs) cs.classList.add('hidden');
 } else {
 if (cs) cs.classList.remove('hidden');
 var ti = document.getElementById('totalItemsDisplay'), tpd = document.getElementById('totalPriceDisplay');
 if (ti) ti.innerText = t; if (tpd) tpd.innerText = formatRupiah(tp);
 if (cc) cc.innerHTML = cart.map(function (i) {
 var cb = i.category === 'resmi'
 ? '<span class="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"><i class="fa-solid fa-certificate text-[8px]"></i> RESMI</span>'
 : '<span class="inline-flex items-center gap-1 text-[9px] font-bold text-deep bg-deep/5 px-1.5 py-0.5 rounded border border-deep/10"><i class="fa-solid fa-fire-flame-curved text-[8px]"></i> R2</span>';
 return '<div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1"><span class="font-bold text-sm text-deep truncate">' + escapeHtml(i.name) + '</span>' + cb + '</div><div class="text-gold font-bold font-mono text-sm">' + formatRupiah(i.price) + '</div></div><div class="flex items-center border border-slate-200 rounded-lg h-9 shrink-0"><button onclick="window.__updateQty(\'' + i.id + '\',-1)" class="w-9 h-full font-bold text-slate-500 hover:bg-slate-50 transition-colors">-</button><span class="w-8 text-center text-xs font-bold font-mono">' + i.qty + '</span><button onclick="window.__updateQty(\'' + i.id + '\',1)" class="w-9 h-full font-bold text-gold hover:bg-slate-50 transition-colors">+</button></div></div>';
 }).join('');
 }
 var mp = document.getElementById('modalTotalPrice'); if (mp) mp.innerText = formatRupiah(tp);
 var cic = document.getElementById('checkoutItemCount'), csl = document.getElementById('checkoutSummaryList'), csub = document.getElementById('checkoutSubtotal'), ofb = document.querySelector('.ongkir-free-badge');
 if (cic) cic.textContent = t + ' item';
 if (csub) csub.textContent = formatRupiah(tp);
 if (csl) csl.innerHTML = cart.length ? cart.map(function (i) {
 return '<div class="checkout-summary-item"><span class="checkout-summary-item-name">' + escapeHtml(i.name) + ' <b class="text-slate-400 font-normal">×' + i.qty + '</b></span><span class="checkout-summary-item-price">' + formatRupiah(i.price * i.qty) + '</span></div>';
 }).join('') : '<p class="text-xs text-slate-400 text-center py-3">Keranjang kosong</p>';
 if (ofb) {
 if (t >= 20) { ofb.innerHTML = '<i class="fa-solid fa-circle-check"></i> GRATIS (syarat terpenuhi)'; ofb.classList.add('is-qualified'); }
 else { ofb.innerHTML = '<i class="fa-solid fa-circle-info"></i> Gratis jika ≥ 1 Bal (' + (20 - t) + ' slop lagi)'; ofb.classList.remove('is-qualified'); }
 }
 renderProductDisplay();
}
window.toggleCart = function () {
 var o = document.getElementById('cartOverlay'), s = document.getElementById('cartSidebar');
 if (!o || !s) return;
 if (s.classList.contains('translate-x-full')) { o.classList.remove('hidden'); setTimeout(function () { o.classList.remove('opacity-0'); }, 10); s.classList.remove('translate-x-full'); document.body.style.overflow = 'hidden'; }
 else { o.classList.add('opacity-0'); s.classList.add('translate-x-full'); setTimeout(function () { o.classList.add('hidden'); }, 300); document.body.style.overflow = ''; }
};

/* ============ 12. CHECKOUT ============ */
window.openCheckoutModal = function () {
 if (!cart.length) { showToast('Keranjang masih kosong', 'error'); return; }
 toggleCart();
 setTimeout(function () {
 var o = document.getElementById('checkoutModalOverlay'), m = document.getElementById('checkoutModal');
 if (o) o.classList.add('overlay-enter');
 if (m) m.classList.add('modal-enter');
 document.body.style.overflow = 'hidden';
 updateProgressStep(1);
 setTimeout(function () { var n = document.getElementById('newCustName'); if (n) n.focus(); validateCheckoutForm(); }, 300);
 }, 300);
};
window.closeCheckoutModal = function () {
 var o = document.getElementById('checkoutModalOverlay'), m = document.getElementById('checkoutModal');
 if (o) o.classList.remove('overlay-enter');
 if (m) m.classList.remove('modal-enter');
 document.body.style.overflow = '';
};
function updateProgressStep(n) {
 var inds = [document.getElementById('step1Indicator'), document.getElementById('step2Indicator'), document.getElementById('step3Indicator'), document.getElementById('step4Indicator')];
 var line = document.getElementById('stepProgressLine');
 inds.forEach(function (ind, idx) {
 if (!ind) return;
 var num = ind.querySelector('div'), txt = ind.querySelector('span');
 num.className = 'w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors duration-300 border-2 border-white ring-2 ring-slate-100 step-indicator ' + (idx + 1 === n ? 'active shadow-sm' : (idx + 1 < n ? 'completed shadow-sm' : 'bg-slate-100 text-slate-400'));
 txt.className = 'text-[9px] font-bold uppercase tracking-widest ' + (idx + 1 === n ? 'text-deep' : (idx + 1 < n ? 'text-gold' : 'text-slate-400'));
 });
 if (line) line.style.width = (n === 1 ? 0 : n === 2 ? 33 : n === 3 ? 66 : 100) + '%';
}
function showError(f, e, msg) {
 var F = document.getElementById(f), E = document.getElementById(e);
 if (F) { F.classList.add('form-field-error'); F.classList.remove('field-valid'); }
 if (E) { if (msg) { var s = E.querySelector('span'); if (s) s.textContent = msg; } E.classList.add('show'); }
}
function clearError(f, e) {
 var F = document.getElementById(f), E = document.getElementById(e);
 if (F) { F.classList.remove('form-field-error'); F.classList.add('field-valid'); }
 if (E) E.classList.remove('show');
}
function validateCheckoutForm() {
 var ok = true;
 var n = document.getElementById('newCustName');
 if (n && n.value.trim().length >= 2) clearError('newCustName', 'newErrName');
 else { if (n && n.value.trim().length > 0) { showError('newCustName', 'newErrName', 'Minimal 2 karakter'); } ok = false; }
 var ph = document.getElementById('newCustPhone'), pc = ph ? ph.value.replace(/\D/g, '') : '';
 if (pc && /^8[1-9]\d{6,11}$/.test(pc)) clearError('newCustPhone', 'newErrPhone');
 else { if (pc) showError('newCustPhone', 'newErrPhone', 'Nomor tidak valid'); ok = false; }
 var al = document.getElementById('newAlamat');
 if (al && al.value.trim().length >= 20) clearError('newAlamat', 'newErrAlamat');
 else { if (al && al.value.trim().length > 0) showError('newAlamat', 'newErrAlamat', 'Minimal 20 karakter'); ok = false; }
 ['newProvinsi', 'newKota', 'newKodePos', 'newEkspedisi', 'newMetode', 'newAdmin'].forEach(function (id) {
 var el = document.getElementById(id); if (!el || !el.value.trim()) ok = false;
 });
 var btn = document.getElementById('finalCheckoutBtn');
 if (btn) { if (ok) btn.removeAttribute('disabled'); else btn.setAttribute('disabled', 'true'); }
 return ok;
}
window.submitOrder = function () {
 if (!validateCheckoutForm()) { showToast('Lengkapi formulir dengan benar', 'error'); return; }
 var g = function (id) { return document.getElementById(id); };
 var btn = g('finalCheckoutBtn'), btnText = g('finalBtnText'), btnIcon = g('finalBtnIcon');
 btn.classList.add('checkout-btn-loading'); btnText.textContent = 'Memproses...'; btnIcon.style.display = 'none';
 setTimeout(function () {
 btn.classList.remove('checkout-btn-loading'); btn.classList.add('checkout-success');
 btnText.textContent = 'Membuka WhatsApp...'; btnIcon.className = 'fa-solid fa-check text-lg'; btnIcon.style.display = '';
 var total = cart.reduce(function (s, i) { return s + i.qty; }, 0);
 var r2 = cart.filter(function (i) { return i.category === 'r2'; });
 var resmi = cart.filter(function (i) { return i.category === 'resmi'; });
 var addr = g('newAlamat').value.trim() + '\n' + g('newKota').value.trim() + ', ' + g('newProvinsi').value.trim() + ' - ' + g('newKodePos').value.trim();
 var m = '📝 *ORDER R2 NUSANTARA (ENTERPRISE)*\n\n👤 *Nama:* ' + g('newCustName').value.trim() + '\n📱 *No. HP:* +62 ' + g('newCustPhone').value.trim() + '\n📍 *Alamat Pengiriman:*\n' + addr + '\n\n🚚 *Ekspedisi:* ' + g('newEkspedisi').value + '\n💳 *Pembayaran:* ' + g('newMetode').value + '\n\n';
 if (r2.length) { m += '*🔥 KATALOG R2:*\n'; r2.forEach(function (i) { m += '• ' + i.name + ' — ' + i.qty + ' slop\n'; }); m += '\n'; }
 if (resmi.length) { m += '*🏅 KATALOG RESMI:*\n'; resmi.forEach(function (i) { m += '• ' + i.name + ' — ' + i.qty + ' slop\n'; }); m += '\n'; }
 m += '*Total Order:* ' + total + ' Slop\n*Status Ongkir:* ' + (total >= 20 ? '✅ Gratis Ongkir' : 'Reguler');
 var subtotal = cart.reduce(function (s, i) { return s + (i.price * i.qty); }, 0);
 if (supa) {
 supa.from('orders').insert({
 customer_name: g('newCustName').value.trim(),
 customer_phone: g('newCustPhone').value.trim(),
 address: g('newAlamat').value.trim(),
 city: g('newKota').value.trim(),
 province: g('newProvinsi').value.trim(),
 postal_code: g('newKodePos').value.trim(),
 ekspedisi: g('newEkspedisi').value,
 payment_method: g('newMetode').value,
 admin_number: g('newAdmin').value,
 items: cart.map(function (i) { return { id: i.id, name: i.name, price: i.price, qty: i.qty, category: i.category }; }),
 subtotal: subtotal
 }).then(function () {}).catch(function () { /* diam-diam gagal, alur WhatsApp tetap lanjut normal */ });
 }
 setTimeout(function () {
 window.open('https://wa.me/' + g('newAdmin').value + '?text=' + encodeURIComponent(m), '_blank');
 cart = []; window.__cart = cart; saveCart(); updateCartUI(); closeCheckoutModal();
 var f = document.getElementById('checkoutFormFull'); if (f) f.reset();
 btn.classList.remove('checkout-success'); btnText.textContent = 'Konfirmasi Pesanan'; btnIcon.className = 'fa-brands fa-whatsapp text-lg';
 validateCheckoutForm();
 updateProgressStep(4);
 setTimeout(openSuccessPopup, 400);
 }, 800);
 }, 1500);
};
window.openSuccessPopup = function () {
 var o = document.getElementById('successOverlay'), m = document.getElementById('successPopup');
 if (o) { o.classList.remove('hidden'); setTimeout(function () { o.classList.add('overlay-enter'); }, 10); }
 if (m) setTimeout(function () { m.classList.add('modal-enter'); }, 10);
 document.body.style.overflow = 'hidden';
};
window.closeSuccessPopup = function () {
 var o = document.getElementById('successOverlay'), m = document.getElementById('successPopup');
 if (o) o.classList.remove('overlay-enter');
 if (m) m.classList.remove('modal-enter');
 setTimeout(function () { if (o) o.classList.add('hidden'); }, 300);
 document.body.style.overflow = '';
};
/* Salin nomor WhatsApp ke clipboard */
window.copyToClipboard = function (text, label) {
 var done = function () { showToast((label ? label + ' — ' : '') + 'Nomor disalin!'); };
 if (navigator.clipboard && navigator.clipboard.writeText) {
 navigator.clipboard.writeText(text).then(done).catch(function () { showToast('Gagal menyalin', 'error'); });
 } else {
 var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
 document.body.appendChild(ta); ta.select();
 try { document.execCommand('copy'); done(); } catch (e) { showToast('Gagal menyalin', 'error'); }
 document.body.removeChild(ta);
 }
};

/* ============ 13. REVIEW ============ */
window.openReviewModal = function () {
 var o = document.getElementById('reviewModalOverlay'), m = document.getElementById('reviewModal');
 if (o) o.classList.add('overlay-enter');
 if (m) m.classList.add('modal-enter');
 document.body.style.overflow = 'hidden';
};
window.closeReviewModal = function () {
 var o = document.getElementById('reviewModalOverlay'), m = document.getElementById('reviewModal');
 if (o) o.classList.remove('overlay-enter');
 if (m) m.classList.remove('modal-enter');
 document.body.style.overflow = '';
 setTimeout(function () { var f = document.getElementById('reviewForm'); if (f) f.reset(); setRating(5); }, 300);
};
window.setRating = function (v) {
 var r = document.getElementById('reviewRating'); if (r) r.value = v;
 document.querySelectorAll('#starRatingSelector i').forEach(function (s) {
 if (parseInt(s.getAttribute('data-rating'), 10) <= v) { s.classList.add('text-gold'); s.classList.remove('text-slate-200'); }
 else { s.classList.remove('text-gold'); s.classList.add('text-slate-200'); }
 });
};
window.submitReview = function () {
 var btn = document.getElementById('submitReviewBtn');
 var name = document.getElementById('reviewName').value, store = document.getElementById('reviewStore').value, text = document.getElementById('reviewText').value, rating = document.getElementById('reviewRating').value;
 btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...'; btn.classList.add('opacity-80', 'pointer-events-none');
 setTimeout(function () {
 var stars = ''; for (var i = 0; i < 5; i++) stars += i < rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-solid fa-star text-slate-200"></i>';
 var card = document.createElement('div');
 card.className = 'testimonial-card-slide relative flex flex-col justify-between';
 card.innerHTML = '<div><div class="flex items-center gap-4 mb-5"><div class="w-14 h-14 rounded-full avatar-gradient-9 shrink-0"><span class="avatar-initial">' + escapeHtml(name.charAt(0).toUpperCase()) + '</span></div><div><h4 class="font-serif font-bold text-deep text-base">' + escapeHtml(name) + '</h4><p class="text-xs text-slate-500">' + escapeHtml(store || 'Mitra R2 Nusantara') + '</p></div></div><div class="flex gap-0.5 mb-4 text-gold text-sm">' + stars + '</div><p class="text-slate-600 text-sm leading-relaxed">"' + escapeHtml(text) + '"</p></div><div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400"><span><i class="fa-solid fa-calendar-days mr-1"></i> Baru saja</span><span class="font-bold"><i class="fa-solid fa-clock"></i> Pending Review</span></div>';
 var slider = document.getElementById('testimonialSlider');
 if (slider) { slider.insertBefore(card, slider.firstChild); slider.scrollTo({ left: 0, behavior: 'smooth' }); }
 showToast('Terima kasih! Ulasan Anda berhasil dikirim.');
 closeReviewModal();
 btn.innerHTML = 'Kirim Ulasan'; btn.classList.remove('opacity-80', 'pointer-events-none');
 }, 1000);
};

/* ============ 14. NEWSLETTER ============ */
window.handleNewsletterSubmit = function (form) {
 var input = form.querySelector('input[type="email"]');
 if (!input || !input.value) return;
 try {
 var list = JSON.parse(localStorage.getItem('r2_newsletter_emails') || '[]');
 if (list.indexOf(input.value) === -1) list.push(input.value);
 localStorage.setItem('r2_newsletter_emails', JSON.stringify(list));
 } catch (e) {}
 if (supa) supa.from('newsletter_subscribers').insert({ email: input.value }).then(function () {}).catch(function () {});
 showToast('Terima kasih! Email kamu sudah kami catat.');
 input.value = '';
};

/* Grid logo ekspedisi <-> <select id="newEkspedisi"> (select tetap jadi satu-satunya sumber data,
 supaya validateCheckoutForm() & submitOrder() tidak perlu diubah sama sekali). */
/* Deteksi kota & provinsi otomatis via GPS browser (opt-in, user klik tombolnya sendiri) */
window.detectLocation = function () {
 var btn = document.getElementById('detectLocationBtn');
 if (!navigator.geolocation) { showToast('Perangkat tidak mendukung deteksi lokasi', 'error'); return; }
 var orig = btn.innerHTML;
 btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendeteksi…';
 navigator.geolocation.getCurrentPosition(function (pos) {
 var lat = pos.coords.latitude, lon = pos.coords.longitude;
 fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon + '&zoom=12&addressdetails=1')
 .then(function (r) { return r.json(); })
 .then(function (data) {
 var a = data && data.address ? data.address : {};
 var kota = a.city || a.town || a.municipality || a.county || '';
 var provinsi = a.state || '';
 var kodepos = a.postcode || '';
 if (kota) document.getElementById('newKota').value = kota;
 if (provinsi) document.getElementById('newProvinsi').value = provinsi;
 if (kodepos) document.getElementById('newKodePos').value = kodepos;
 if (kota || provinsi) { showToast('Lokasi terdeteksi: ' + (kota || '-') + ', ' + (provinsi || '-')); validateCheckoutForm(); }
 else showToast('Kota tidak terdeteksi, isi manual ya', 'error');
 })
 .catch(function () { showToast('Gagal mendeteksi lokasi, isi manual ya', 'error'); })
 .finally(function () { btn.disabled = false; btn.innerHTML = orig; });
 }, function () {
 showToast('Izin lokasi ditolak, isi manual ya', 'error');
 btn.disabled = false; btn.innerHTML = orig;
 }, { timeout: 10000 });
};

/* Search bar besar di header (mobile/tablet) — proxy murni ke #searchInput katalog yang sudah ada,
 supaya tidak ada duplikasi logic dan katalog tidak perlu diubah sama sekali. */
window.runHeaderSearch = function () {
 var hi = document.getElementById('headerSearchInput'), si = document.getElementById('searchInput');
 if (!hi || !si || !hi.value.trim()) return;
 si.value = hi.value.trim();
 document.getElementById('produk').scrollIntoView({ behavior: 'smooth', block: 'start' });
 si.dispatchEvent(new Event('input', { bubbles: true }));
 setTimeout(function () { si.focus(); }, 500);
};
/* Glass Capsule Dock — indicator bergeser magnetis ke item yang di-tap */
/* Value Proposition Slider — auto-play, pause on hover, dot nav */
/* Info Card 2x2 -> jadi slider khusus mobile (<768px). Desktop/tablet tetap grid, tidak disentuh. */
/* Sinkronisasi produk dari Supabase — data statis (data.js) tetap jadi fallback instan
 kalau Supabase lambat/offline, situs tetap 100% jalan tanpa gangguan. */
function syncProductsFromSupabase() {
 if (!supa) return;
 supa.from('products').select('id,name,price,category,segment,segment_name').eq('is_active', true)
 .then(function (res) {
 if (res.error || !res.data || !res.data.length) return;
 var mapped = res.data.map(function (r) {
 return { id: r.id, name: r.name, price: r.price, category: r.category, segment: r.segment, segmentName: r.segment_name };
 });
 allProducts.length = 0;
 Array.prototype.push.apply(allProducts, mapped);
 productsR2 = allProducts.filter(function (p) { return p.category === 'r2'; });
 productsResmi = allProducts.filter(function (p) { return p.category === 'resmi'; });
 renderProductDisplay();
 buildFilterChips();
 })
 .catch(function () { /* diam-diam gagal, tetap pakai data statis yang sudah tampil */ });
}

function initInfoCardSlider() {
 var card = document.getElementById('infoCard2x2'), dotsWrap = document.querySelector('.info-slider-dots');
 if (!card || !dotsWrap) return;
 var quads = card.querySelectorAll('.info-quad'), dots = dotsWrap.querySelectorAll('.info-dot');
 var idx = 0, timer = null;
 function isMobile() { return window.innerWidth < 768; }
 function render() {
 quads.forEach(function (q, i) { q.classList.toggle('is-active-slide', isMobile() ? i === idx : true); });
 dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); d.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
 }
 function goTo(n) { idx = (n + quads.length) % quads.length; render(); }
 function start() { stop(); if (!isMobile()) return; timer = setInterval(function () { goTo(idx + 1); }, 6000); }
 function stop() { if (timer) clearInterval(timer); }
 dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); start(); }); });
 card.addEventListener('mouseenter', stop);
 card.addEventListener('mouseleave', start);
 window.addEventListener('resize', function () { render(); start(); });

 /* Swipe gesture (mobile) */
 var touchStartX = 0, touchStartY = 0, touchMoved = false;
 card.addEventListener('touchstart', function (e) {
 if (!isMobile()) return;
 touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; touchMoved = false;
 stop();
 }, { passive: true });
 card.addEventListener('touchmove', function () { touchMoved = true; }, { passive: true });
 card.addEventListener('touchend', function (e) {
 if (!isMobile() || !touchMoved) { start(); return; }
 var dx = e.changedTouches[0].clientX - touchStartX, dy = e.changedTouches[0].clientY - touchStartY;
 if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
 if (dx < 0) goTo(idx + 1); else goTo(idx - 1);
 }
 start();
 });

 render();
 start();
}

function initValuePropSlider() {
 var wrap = document.getElementById('valuePropSlider');
 if (!wrap) return;
 var slides = wrap.querySelectorAll('.vp-slide'), dots = wrap.querySelectorAll('.vp-dot');
 var idx = 0, timer = null;
 function goTo(n) {
 idx = (n + slides.length) % slides.length;
 slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
 dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); d.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
 }
 function start() { stop(); timer = setInterval(function () { goTo(idx + 1); }, 4500); }
 function stop() { if (timer) clearInterval(timer); }
 dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); start(); }); });
 wrap.addEventListener('mouseenter', stop);
 wrap.addEventListener('mouseleave', start);
 start();
}

function initDockNav() {
 var dock = document.querySelector('.mb-dock'), indicator = document.getElementById('mbDockIndicator');
 if (!dock || !indicator) return;
 var items = Array.prototype.slice.call(dock.querySelectorAll('.mb-nav-item'));
 function setActive(idx) {
 items.forEach(function (el, i) { el.classList.toggle('is-active', i === idx); });
 indicator.style.transform = 'translateX(' + (idx * 100) + '%)';
 }
 items.forEach(function (el, idx) {
 el.addEventListener('click', function () { setActive(idx); });
 });
 setActive(0);
}

function initHeaderSearch() {
 var hi = document.getElementById('headerSearchInput');
 if (!hi) return;
 hi.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); runHeaderSearch(); } });
}

function initEkspedisiPicker() {
 var sel = document.getElementById('newEkspedisi'), picker = document.getElementById('ekspedisiPicker');
 if (!sel || !picker) return;
 picker.addEventListener('click', function (e) {
 var btn = e.target.closest('.eksp-card'); if (!btn) return;
 sel.value = btn.getAttribute('data-eksp');
 sel.dispatchEvent(new Event('change', { bubbles: true }));
 picker.querySelectorAll('.eksp-card').forEach(function (c) { c.classList.toggle('is-selected', c === btn); });
 });
 sel.addEventListener('change', function () {
 picker.querySelectorAll('.eksp-card').forEach(function (c) {
 c.classList.toggle('is-selected', c.getAttribute('data-eksp') === sel.value);
 });
 });
}

/* ============ 15. INISIALISASI ============ */
document.addEventListener('DOMContentLoaded', function () {
 var loader = document.getElementById('loader');
 if (loader) { loader.style.opacity = '0'; setTimeout(function () { loader.style.display = 'none'; }, 700); }
 initTextAnimations();
 initCookieConsent();
 initEkspedisiPicker();
 initHeaderSearch();
 initDockNav();
 initValuePropSlider();
 initInfoCardSlider();
 syncProductsFromSupabase();
 updateWishlistUI();
 renderRecentlyViewed();
 buildFilterChips();
 updateCatalogInfoBanner();
 renderProductDisplay();
 updateCartUI();
 var cr = document.getElementById('countR2'), cre = document.getElementById('countResmi'), tc = document.getElementById('totalBrandCount');
 if (cr) cr.textContent = productsR2.length;
 if (cre) cre.textContent = productsResmi.length;
 if (tc) tc.textContent = allProducts.length;
 var obs = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('is-visible'); }); }, { threshold: 0.1 });
 document.querySelectorAll('.fade-on-scroll').forEach(function (el) { obs.observe(el); });
 var cObs = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { animateCounter(en.target); cObs.unobserve(en.target); } }); }, { threshold: 0.5 });
 document.querySelectorAll('.stat-counter').forEach(function (el) { cObs.observe(el); });
 var cy = document.getElementById('copyrightYear'); if (cy) cy.textContent = new Date().getFullYear();

 var deepLinkId = new URLSearchParams(location.search).get('p');
 if (deepLinkId && allProducts.some(function (x) { return x.id === deepLinkId; })) {
 setTimeout(function () { openQuickView(deepLinkId); }, 900);
 }

 var CIRC = 113.1;
 window.addEventListener('scroll', function () {
 var h = document.getElementById('headerInner'), btt = document.getElementById('backToTop');
 if (h) { if (window.scrollY > 50) { h.classList.add('py-2', 'shadow-lg'); h.classList.remove('py-3'); } else { h.classList.add('py-3'); h.classList.remove('py-2', 'shadow-lg'); } }
 if (btt) { if (window.scrollY > 500) btt.classList.add('visible'); else btt.classList.remove('visible'); }
 var w = document.getElementById('scrollProgress'), c = document.getElementById('scrollCircle'), l = document.getElementById('scrollPercent');
 if (w && c && l) {
 var dh = document.documentElement.scrollHeight - window.innerHeight;
 var pct = dh > 0 ? Math.min(Math.max(window.scrollY / dh, 0), 1) : 0;
 c.style.strokeDashoffset = CIRC * (1 - pct);
 l.textContent = Math.round(pct * 100) + '%';
 w.style.opacity = window.scrollY > 400 ? '1' : '0';
 }
 if (window.scrollY < window.innerHeight * 1.2) {
 var b1 = document.querySelector('.blob-1'), b2 = document.querySelector('.blob-2');
 if (b1) b1.style.transform = 'translateY(' + (window.scrollY * 0.18) + 'px)';
 if (b2) b2.style.transform = 'translateY(' + (window.scrollY * -0.12) + 'px)';
 }
 });

 var si = document.getElementById('searchInput'), sb = document.getElementById('searchSuggestions');
 if (si && sb && window.MutationObserver) {
 new MutationObserver(function () { si.setAttribute('aria-expanded', sb.classList.contains('hidden') ? 'false' : 'true'); }).observe(sb, { attributes: true, attributeFilter: ['class'] });
 }
 if (si) {
 var cb = document.getElementById('clearSearchBtn');
 window.clearSearch = function () {
 si.value = ''; searchTerm = ''; currentPage = 1;
 if (cb) cb.classList.add('hidden');
 if (sb) sb.classList.add('hidden');
 renderProductDisplay(); si.focus();
 };
 var timer;
 si.addEventListener('input', function (e) {
 if (cb) cb.classList.toggle('hidden', e.target.value.length === 0);
 clearTimeout(timer);
 var q = e.target.value.toLowerCase().trim();
 timer = setTimeout(function () {
 searchTerm = q; currentPage = 1; renderProductDisplay();
 if (!sb) return;
 if (q.length < 2) { sb.classList.add('hidden'); return; }
 var matches = allProducts.filter(function (p) { return p.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 6);
 if (matches.length) {
 sb.innerHTML = matches.map(function (p) {
 var sq = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 var hl = p.name.replace(new RegExp(sq, 'gi'), function (m) { return '<span class="text-gold bg-gold/10 px-0.5 rounded">' + m + '</span>'; });
 return '<div class="px-4 py-3 hover:bg-ivory cursor-pointer border-b border-slate-100 last:border-0 flex items-center gap-3 transition-colors" role="option" data-suggest-id="' + p.id + '"><i class="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i><div><div class="text-sm font-bold text-deep">' + hl + '</div><div class="text-xs text-slate-500 font-mono">' + formatRupiah(p.price) + '</div></div></div>';
 }).join('');
 sb.classList.remove('hidden');
 } else sb.classList.add('hidden');
 }, 220);
 });
 if (sb) {
 sb.addEventListener('click', function (e) {
 var row = e.target.closest('[data-suggest-id]'); if (!row) return;
 var p = allProducts.find(function (x) { return x.id === row.getAttribute('data-suggest-id'); });
 if (p) { si.value = p.name; searchTerm = p.name.toLowerCase(); if (p.category !== activeCatalog) window.switchCatalog(p.category); currentPage = 1; renderProductDisplay(); }
 sb.classList.add('hidden');
 });
 document.addEventListener('click', function (e) { if (!si.contains(e.target) && !sb.contains(e.target)) sb.classList.add('hidden'); });
 }
 }

 var inputs = document.querySelectorAll('#checkoutFormFull input, #checkoutFormFull textarea, #checkoutFormFull select');
 inputs.forEach(function (input, index) {
 input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') { e.preventDefault(); if (index < inputs.length - 1) inputs[index + 1].focus(); } });
 input.addEventListener('focus', function () { var sg = input.closest('[data-step]'); if (sg) updateProgressStep(parseInt(sg.getAttribute('data-step'), 10)); });
 input.addEventListener('input', validateCheckoutForm);
 input.addEventListener('change', validateCheckoutForm);
 input.addEventListener('blur', validateCheckoutForm);
 });
 var phone = document.getElementById('newCustPhone');
 if (phone) phone.addEventListener('input', function (e) {
 var v = e.target.value.replace(/\D/g, '');
 if (v.startsWith('62')) v = v.substring(2);
 if (v.startsWith('0')) v = v.substring(1);
 var m = v.match(/(\d{0,3})(\d{0,4})(\d{0,5})/);
 if (m) e.target.value = (!m[2] ? m[1] : m[1] + ' ' + m[2] + (m[3] ? ' ' + m[3] : '')).substring(0, 15);
 else e.target.value = v;
 });
 document.addEventListener('keydown', function (e) {
 if (e.key !== 'Escape') return;
 var m = document.getElementById('checkoutModal'), r = document.getElementById('reviewModal'), q = document.getElementById('quickViewModal');
 var lg = document.getElementById('legalModal'), cs = document.getElementById('cartSidebar'), ws = document.getElementById('wishlistSidebar'), mm = document.getElementById('mobileMenu');
 var sp = document.getElementById('successPopup');
 if (sp && sp.classList.contains('modal-enter')) closeSuccessPopup();
 if (m && m.classList.contains('modal-enter')) closeCheckoutModal();
 if (r && r.classList.contains('modal-enter')) closeReviewModal();
 if (q && q.classList.contains('modal-enter')) closeQuickView();
 if (lg && lg.classList.contains('modal-enter')) closeLegalModal();
 if (cs && !cs.classList.contains('translate-x-full')) toggleCart();
 if (ws && !ws.classList.contains('translate-x-full')) toggleWishlistSidebar();
 if (mm && !mm.classList.contains('hidden')) closeMobileMenu();
 });

 var mm = document.getElementById('mobileMenu');
 if (mm) mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMobileMenu); });

 var slider = document.getElementById('testimonialSlider'), prev = document.getElementById('sliderPrevBtn'), next = document.getElementById('sliderNextBtn');
 if (slider && prev && next) {
 var isDown = false, startX, scrollLeft;
 slider.addEventListener('mousedown', function (e) { isDown = true; slider.style.scrollSnapType = 'none'; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
 slider.addEventListener('mouseleave', function () { isDown = false; slider.style.scrollSnapType = 'x mandatory'; });
 slider.addEventListener('mouseup', function () { isDown = false; slider.style.scrollSnapType = 'x mandatory'; });
 slider.addEventListener('mousemove', function (e) { if (!isDown) return; e.preventDefault(); var x = e.pageX - slider.offsetLeft; slider.scrollLeft = scrollLeft - (x - startX) * 2; });
 function amt() { var c = slider.querySelector('.testimonial-card-slide'); return c ? c.offsetWidth + 24 : 350; }
 next.addEventListener('click', function () { slider.scrollBy({ left: amt(), behavior: 'smooth' }); });
 prev.addEventListener('click', function () { slider.scrollBy({ left: -amt(), behavior: 'smooth' }); });
 var auto = setInterval(function () {
 if (!isDown) {
 if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) slider.scrollTo({ left: 0, behavior: 'smooth' });
 else slider.scrollBy({ left: amt(), behavior: 'smooth' });
 }
 }, 4000);
 slider.addEventListener('mouseenter', function () { clearInterval(auto); });
 }
 validateCheckoutForm();
});
})();
