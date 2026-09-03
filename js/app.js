/* ============================================
   R2 NUSANTARA - MAIN APPLICATION
   ============================================ */
'use strict';

// 1. DARK MODE TOGGLE
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('r2_dark_mode', isDark);
}

if (localStorage.getItem('r2_dark_mode') === 'true' || (!('r2_dark_mode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

// 2. LIVE VISITOR COUNTER
function initVisitorCounter() {
  const el = document.getElementById('visitorCount');
  if (!el) return;
  let count = Math.floor(Math.random() * (45 - 18 + 1)) + 18;
  el.textContent = count;
  
  setInterval(() => {
    const change = Math.floor(Math.random() * 5) - 2;
    count = Math.max(15, Math.min(60, count + change));
    el.textContent = count;
  }, 4000);
}

// 3. WISHLIST SYSTEM
let wishlist = JSON.parse(localStorage.getItem('r2_wishlist')) || [];

function toggleWishlistItem(id, event) {
  if(event) event.stopPropagation();
  const index = wishlist.indexOf(id);
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast('Dihapus dari Wishlist', 'info');
  } else {
    wishlist.push(id);
    showToast('Ditambahkan ke Wishlist', 'success');
  }
  localStorage.setItem('r2_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
  renderProductDisplay();
}

function updateWishlistUI() {
  const badge = document.getElementById('wishlistBadge');
  if (badge) {
    badge.innerText = wishlist.length;
    badge.classList.toggle('scale-0', wishlist.length === 0);
  }
  
  const container = document.getElementById('wishlistItemsContainer');
  if (!container) return;
  
  if (wishlist.length === 0) {
    container.innerHTML = '<div class="text-center py-10 text-slate-400"><i class="fa-regular fa-heart text-4xl mb-3"></i><p class="text-sm font-bold">Wishlist kosong</p></div>';
    return;
  }
  
  container.innerHTML = wishlist.map(id => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return '';
    return `
    <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600">
      <div class="flex-1 min-w-0">
        <div class="font-bold text-sm text-brand-900 dark:text-white truncate">${escapeHtml(p.name)}</div>
        <div class="text-brand-500 font-mono text-xs font-bold">${formatRupiah(p.price)}</div>
      </div>
      <button onclick="window.__addCart('${p.id}'); toggleWishlistItem('${p.id}');" class="w-8 h-8 rounded-lg bg-brand-900 dark:bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 dark:hover:bg-brand-500 transition-colors" title="Pindah ke Keranjang">
        <i class="fa-solid fa-cart-plus text-xs"></i>
      </button>
      <button onclick="toggleWishlistItem('${p.id}')" class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
        <i class="fa-solid fa-trash text-xs"></i>
      </button>
    </div>`;
  }).join('');
}

function toggleWishlistSidebar() {
  const overlay = document.getElementById('wishlistOverlay');
  const sidebar = document.getElementById('wishlistSidebar');
  if (sidebar.classList.contains('translate-x-full')) {
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('overlay-enter'), 10);
    sidebar.classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden';
  } else {
    overlay.classList.remove('overlay-enter');
    sidebar.classList.add('translate-x-full');
    setTimeout(() => overlay.classList.add('hidden'), 300);
    document.body.style.overflow = '';
  }
}

// 4. QUICK VIEW MODAL
function openQuickView(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('qvTitle').textContent = p.name;
  document.getElementById('qvPrice').textContent = formatRupiah(p.price);
  
  const badge = document.getElementById('qvBadge');
  if (p.category === 'resmi') {
    badge.className = 'inline-block px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400';
    badge.innerHTML = '<i class="fa-solid fa-certificate mr-1"></i> RESMI';
  } else {
    const tier = getR2Tier(p.price);
    badge.className = `inline-block px-3 py-1 rounded-lg text-xs font-bold tier-${tier}`;
    badge.innerHTML = `<i class="fa-solid fa-fire mr-1"></i> ${tier.toUpperCase()}`;
  }
  
  document.getElementById('qvAddToCartBtn').onclick = function() {
    window.__addCart(p.id);
    closeQuickView();
  };
  
  const overlay = document.getElementById('quickViewOverlay');
  const modal = document.getElementById('quickViewModal');
  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.add('overlay-enter');
    modal.classList.add('modal-enter');
  }, 10);
}

function closeQuickView() {
  const overlay = document.getElementById('quickViewOverlay');
  const modal = document.getElementById('quickViewModal');
  overlay.classList.remove('overlay-enter');
  modal.classList.remove('modal-enter');
  setTimeout(() => overlay.classList.add('hidden'), 300);
}

// 5. ADVANCED SEARCH AUTOCOMPLETE
let searchTimeout;
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('searchSuggestions');

if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
      suggestionsBox.classList.add('hidden');
      searchTerm = '';
      currentPage = 1;
      renderProductDisplay();
      return;
    }
    
    searchTimeout = setTimeout(() => {
      searchTerm = query;
      currentPage = 1;
      renderProductDisplay();
      
      const matches = allProducts.filter(p => p.name.toLowerCase().includes(query)).slice(0, 5);
      if (matches.length > 0) {
        suggestionsBox.innerHTML = matches.map(p => `
          <div onclick="document.getElementById('searchInput').value='${p.name}'; searchTerm='${p.name.toLowerCase()}'; renderProductDisplay(); document.getElementById('searchSuggestions').classList.add('hidden');" 
               class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 flex items-center gap-3 transition-colors">
            <i class="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
            <div>
              <div class="text-sm font-bold text-brand-900 dark:text-white">${p.name.replace(new RegExp(query, 'gi'), match => `<span class="text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/50 px-0.5 rounded">${match}</span>`)}</div>
              <div class="text-xs text-slate-500 font-mono">${formatRupiah(p.price)}</div>
            </div>
          </div>
        `).join('');
        suggestionsBox.classList.remove('hidden');
      } else {
        suggestionsBox.classList.add('hidden');
      }
    }, 300);
  });
  
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.classList.add('hidden');
    }
  });
}

// 6. CHECKOUT MODAL
window.openCheckoutModal = function() {
  toggleCart();
  setTimeout(function() {
    var o = document.getElementById('checkoutModalOverlay');
    var m = document.getElementById('checkoutModal');
    if (o) o.classList.add('overlay-enter');
    if (m) m.classList.add('modal-enter');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      var n = document.getElementById('newCustName');
      if (n) n.focus();
      validateCheckoutForm();
    }, 300);
  }, 300);
};

window.closeCheckoutModal = function() {
  var o = document.getElementById('checkoutModalOverlay');
  var m = document.getElementById('checkoutModal');
  if (o) o.classList.remove('overlay-enter');
  if (m) m.classList.remove('modal-enter');
  document.body.style.overflow = '';
};

document.addEventListener('keydown', function(e) {
  var m = document.getElementById('checkoutModal');
  var r = document.getElementById('reviewModal');
  if (m && m.classList.contains('modal-enter') && e.key === 'Escape') closeCheckoutModal();
  if (r && r.classList.contains('modal-enter') && e.key === 'Escape') closeReviewModal();
});

const formInputs = document.querySelectorAll('#checkoutFormFull input, #checkoutFormFull textarea, #checkoutFormFull select');
formInputs.forEach((input, index) => {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (index < formInputs.length - 1) formInputs[index + 1].focus();
    }
  });
  input.addEventListener('input', validateCheckoutForm);
  input.addEventListener('change', validateCheckoutForm);
  input.addEventListener('blur', validateCheckoutForm);
});

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
  var f = document.getElementById(fieldId);
  var e = document.getElementById(errorId);
  if (f) { f.classList.add('form-field-error'); f.classList.remove('field-valid'); }
  if (e) {
    if (message) { var s = e.querySelector('span'); if (s) s.textContent = message; }
    e.classList.add('show');
  }
}

function clearError(fieldId, errorId) {
  var f = document.getElementById(fieldId);
  var e = document.getElementById(errorId);
  if (f) { f.classList.remove('form-field-error'); f.classList.add('field-valid'); }
  if (e) e.classList.remove('show');
}

function validateCheckoutForm() {
  var isValid = true;
  
  var name = document.getElementById('newCustName');
  if (name && name.value.trim().length >= 2) { clearError('newCustName', 'newErrName'); }
  else { if (name && name.value.trim().length > 0) showError('newCustName', 'newErrName', 'Minimal 2 karakter'); isValid = false; }
  
  var phone = document.getElementById('newCustPhone');
  var phoneClean = phone ? phone.value.replace(/\D/g, '') : '';
  if (phoneClean && /^8[1-9]\d{6,11}$/.test(phoneClean)) { clearError('newCustPhone', 'newErrPhone'); }
  else { if (phoneClean) showError('newCustPhone', 'newErrPhone', 'Nomor tidak valid'); isValid = false; }
  
  var alamat = document.getElementById('newAlamat');
  if (alamat && alamat.value.trim().length >= 20) { clearError('newAlamat', 'newErrAlamat'); }
  else { if (alamat && alamat.value.trim().length > 0) showError('newAlamat', 'newErrAlamat', 'Minimal 20 karakter'); isValid = false; }
  
  var reqFields = ['newProvinsi', 'newKota', 'newKecamatan', 'newKelurahan', 'newKodePos', 'newEkspedisi', 'newMetode', 'newAdmin'];
  reqFields.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el || !el.value.trim()) isValid = false;
  });
  
  var btn = document.getElementById('finalCheckoutBtn');
  if (btn) {
    if (isValid) { btn.removeAttribute('disabled'); }
    else { btn.setAttribute('disabled', 'true'); }
  }
  
  return isValid;
}

window.submitOrder = function() {
  if (!validateCheckoutForm()) { showToast('Lengkapi formulir dengan benar', 'error'); return; }
  
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
    
    var phoneClean = fPhone.value.replace(/\D/g, '');
    var waNumber = fAdmin.value;
    var total = cart.reduce(function(s, i) { return s + i.qty; }, 0);
    var r2Items = cart.filter(function(i) { return i.category === 'r2'; });
    var resmiItems = cart.filter(function(i) { return i.category === 'resmi'; });
    
    var fullAddress = fAlamat.value.trim() + ' (Patokan: ' + (fPatokan.value.trim() || '-') + ')\n' +
      'Kel: ' + fKel.value.trim() + ', Kec: ' + fKec.value.trim() + '\n' +
      fKota.value.trim() + ', ' + fProvinsi.value.trim() + ' - ' + fPos.value.trim();
    
    var m = '📝*ORDER R2 NUSANTARA(ENTERPRISE)*\n\n';
    m += '*Nama:* ' + fName.value.trim() + '\n';
    m += '*No. HP:* +62 ' + fPhone.value.trim() + '\n';
    m += '*Alamat Pengiriman:*\n' + fullAddress + '\n\n';
    m += '🚚*Ekspedisi:* ' + fEkspedisi.value + '\n';
    m += '💳*Pembayaran:* ' + fMetode.value + '\n\n';
    
    if (r2Items.length > 0) {
      m += '*🔥 KATALOG R2:*\n';
      r2Items.forEach(function(i) { m += '• ' + i.name + ' — ' + i.qty + ' slop\n'; });
      m += '\n';
    }
    
    if (resmiItems.length > 0) {
      m += '*🏅 KATALOG RESMI:*\n';
      resmiItems.forEach(function(i) { m += '• ' + i.name + ' — ' + i.qty + ' slop\n'; });
      m += '\n';
    }
    
    m += '*Total Order:* ' + total + ' Slop\n';
    m += '*Status Ongkir:* ' + (total >= 20 ? '✅ Gratis Ongkir' : 'Reguler');
    
    setTimeout(function() {
      window.open('https://wa.me/' + waNumber + '?text=' + encodeURIComponent(m), '_blank');
      cart = [];
      window.__cart = cart;
      updateCartUI();
      closeCheckoutModal();
      document.getElementById('checkoutFormFull').reset();
      btn.classList.remove('checkout-success');
      btnText.textContent = 'Konfirmasi Pesanan';
      btnIcon.className = 'fa-brands fa-whatsapp text-lg';
      validateCheckoutForm();
      showToast('Pesanan berhasil dilanjutkan! 🎉');
    }, 800);
  }, 1500);
};

// 7. TESTIMONIAL SLIDER
var slider = document.getElementById('testimonialSlider');
var prevBtn = document.getElementById('sliderPrevBtn');
var nextBtn = document.getElementById('sliderNextBtn');

if (slider && prevBtn && nextBtn) {
  var isDown = false;
  var startX;
  var scrollLeft;
  
  slider.addEventListener('mousedown', function(e) {
    isDown = true;
    slider.style.scrollSnapType = 'none';
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  
  slider.addEventListener('mouseleave', function() { isDown = false; slider.style.scrollSnapType = 'x mandatory'; });
  slider.addEventListener('mouseup', function() { isDown = false; slider.style.scrollSnapType = 'x mandatory'; });
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
  
  nextBtn.addEventListener('click', function() { slider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' }); });
  prevBtn.addEventListener('click', function() { slider.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' }); });
  
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

// 8. REVIEW MODAL
window.openReviewModal = function() {
  var o = document.getElementById('reviewModalOverlay');
  var m = document.getElementById('reviewModal');
  if (o) o.classList.add('overlay-enter');
  if (m) m.classList.add('modal-enter');
  document.body.style.overflow = 'hidden';
};

window.closeReviewModal = function() {
  var o = document.getElementById('reviewModalOverlay');
  var m = document.getElementById('reviewModal');
  if (o) o.classList.remove('overlay-enter');
  if (m) m.classList.remove('modal-enter');
  document.body.style.overflow = '';
  setTimeout(function() {
    document.getElementById('reviewForm').reset();
    setRating(5);
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
    newCard.className = 'testimonial-card-slide bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative flex flex-col justify-between';
    newCard.innerHTML = '<div><div class="flex items-center gap-4 mb-5"><div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shrink-0 flex items-center justify-center text-white font-bold text-xl">' + initial + '</div><div><h4 class="font-extrabold text-brand-900 dark:text-white text-base">' + escapeHtml(name) + '</h4><p class="text-xs text-slate-500 dark:text-slate-400 font-medium">' + escapeHtml(store) + '</p></div></div><div class="flex gap-0.5 mb-4 text-amber-400 text-sm">' + starsHtml + '</div><p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">"' + escapeHtml(text) + '"</p></div><div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400"><span><i class="fa-solid fa-calendar-days mr-1"></i> Baru saja</span><span class="text-slate-400 font-bold"><i class="fa-solid fa-clock"></i> Pending Review</span></div>';
    
    if (slider) {
      slider.insertBefore(newCard, slider.firstChild);
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    }
    
    showToast('Terima kasih! Ulasan Anda berhasil dikirim.');
    closeReviewModal();
    btn.innerHTML = 'Kirim Ulasan';
    btn.classList.remove('opacity-80', 'pointer-events-none');
  }, 1000);
};

// 9. INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
  var loader = document.getElementById('loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(function() { loader.style.display = 'none'; }, 700);
  }
  
  initVisitorCounter();
  updateWishlistUI();
  buildFilterChips();
  renderProductDisplay();
  
  var countR2 = document.getElementById('countR2');
  var countResmi = document.getElementById('countResmi');
  var totalCount = document.getElementById('totalBrandCount');
  
  if (countR2) countR2.textContent = productsR2.length;
  if (countResmi) countResmi.textContent = productsResmi.length;
  if (totalCount) totalCount.textContent = allProducts.length;
  
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (en.isIntersecting) en.target.classList.add('is-visible');
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.fade-in-up').forEach(function(el) { obs.observe(el); });
  
  window.addEventListener('scroll', function() {
    var btt = document.getElementById('backToTop');
    if (btt) {
      if (window.scrollY > 500) btt.classList.add('visible');
      else btt.classList.remove('visible');
    }
  });
  
  validateCheckoutForm();
});