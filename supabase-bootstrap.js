(function () {
  'use strict';
  var URL = 'https://zgsbtexngystdmakqjyi.supabase.co/rest/v1/R2%20NUSANTARA?select=*';
  var KEY = 'sb_publishable_7wqbX7wUVFJZqinPyy8XLQ_SimByBEo';
  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function boot() {
    return load('data.js').then(function () {
      return fetch(URL, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } });
    }).then(function (r) {
      if (!r.ok) throw new Error('Supabase HTTP ' + r.status);
      return r.json();
    }).then(function (rows) {
      var r2 = {}, resmi = {};
      (window.productsR2 || []).forEach(function (p) { r2[String(p.name).trim().toLowerCase()] = p; });
      (window.productsResmi || []).forEach(function (p) { resmi[String(p.name).trim().toLowerCase()] = p; });
      var all = rows.filter(function (x) { return x.Published !== false && String(x.Status || 'active').toLowerCase() === 'active'; }).map(function (x, i) {
        var name = x.Title || x['Option1 Value'] || x.Handle || ('Produk ' + (i + 1));
        var key = String(name).trim().toLowerCase();
        var legacy = resmi[key] || r2[key] || {};
        var isResmi = !!resmi[key];
        return {
          id: legacy.id || x['Variant SKU'] || ((isResmi ? 'resmi-' : 'r2-') + (i + 1)),
          name: name,
          price: Number(x['Variant Price'] || legacy.price || 0),
          category: isResmi ? 'resmi' : 'r2',
          segment: legacy.segment,
          segmentName: legacy.segmentName,
          sku: x['Variant SKU'] || '',
          inventoryQty: Number(x['Variant Inventory Qty'] || 0)
        };
      });
      window.productsR2 = all.filter(function (p) { return p.category !== 'resmi'; });
      window.productsResmi = all.filter(function (p) { return p.category === 'resmi'; });
      window.allProducts = all;
      window.R2_CATALOG_SOURCE = 'supabase';
    }).catch(function (e) {
      console.error('[R2] Supabase sync failed; using data.js fallback.', e);
      window.R2_CATALOG_SOURCE = 'fallback-data.js';
    }).then(function () { return load('app.js'); });
  }
  boot();
})();
