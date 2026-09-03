/* ============================================
   R2 NUSANTARA - UTILITIES
   ============================================ */
'use strict';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function getR2Tier(price) {
  if (price <= 76000) return 'hemat';
  if (price >= 90000) return 'premium';
  return 'populer';
}

function getCartQty(id) {
  var i = cart.find(function(x) { return x.id === id; });
  return i ? i.qty : 0;
}

function showToast(m, type) {
  type = type || 'success';
  var c = document.getElementById('toast-container');
  if (!c) return;
  
  var to = document.createElement('div');
  var iconClass = type === 'success' ? 'fa-check-circle text-emerald-400' :
                  type === 'error' ? 'fa-circle-exclamation text-red-400' :
                  'fa-circle-info text-brand-400';
  
  to.className = 'bg-brand-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 transform translate-x-full transition-transform duration-300 border border-white/10';
  to.innerHTML = '<i class="fa-solid ' + iconClass + '"></i><span class="font-bold text-xs">' + m + '</span>';
  
  c.appendChild(to);
  
  setTimeout(function() { to.classList.remove('translate-x-full'); }, 10);
  setTimeout(function() {
    to.classList.add('translate-x-full');
    setTimeout(function() { to.remove(); }, 300);
  }, 2500);
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.formatRupiah = formatRupiah;
window.getR2Tier = getR2Tier;
window.getCartQty = getCartQty;
window.showToast = showToast;
window.escapeHtml = escapeHtml;