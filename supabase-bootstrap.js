// R2 NUSANTARA — Production Supabase Catalog Bootstrap
// Single source of truth: Supabase project nwrqdcrknipnfvhogjyg.
(function () {
  'use strict';

  var SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_mqJp3tqSL1gCjz1xdcgWGQ_mtDFRTmg';
  var TABLE = 'products';
  var SELECT = 'id,name,price,category,segment,segment_name,description,rating,is_active,created_at,updated_at';
  var VERSION = '20260828-supabase-prod-3';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src + '?v=' + VERSION;
      script.async = false;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Gagal memuat ' + src)); };
      document.body.appendChild(script);
    });
  }

  function text(value) { return String(value == null ? '' : value).trim(); }

  function classify(rows) {
    return rows.filter(function (row) {
      return row && row.is_active !== false;
    }).map(function (row, index) {
      var sku = text(row.id) || ('produk-' + (index + 1));
      var category = text(row.category).toLowerCase() === 'resmi' ? 'resmi' : 'r2';
      var segment = text(row.segment).toUpperCase() || undefined;
      return {
        id: sku,
        name: text(row.name) || ('Produk ' + (index + 1)),
        price: Number(row.price) || 0,
        category: category,
        segment: segment,
        segmentName: text(row.segment_name) || undefined,
        description: text(row.description),
        rating: Number(row.rating) || 0,
        sku: sku,
        inventoryQty: 0,
        tags: '',
        vendor: 'R2 NUSANTARA'
      };
    });
  }

  function expose(products) {
    window.productsR2 = products.filter(function (p) { return p.category === 'r2'; });
    window.productsResmi = products.filter(function (p) { return p.category === 'resmi'; });
    window.allProducts = products;
    window.R2_CATALOG_SOURCE = 'supabase:nwrqdcrknipnfvhogjyg';
    window.R2_CATALOG_COUNT = products.length;
    window.R2_CATALOG_SYNCED_AT = new Date().toISOString();
    document.documentElement.dataset.catalogReady = 'true';
    window.dispatchEvent(new CustomEvent('r2:supabase-catalog-ready', {
      detail: { total: products.length, r2: window.productsR2.length, resmi: window.productsResmi.length }
    }));
    console.info('[R2] Supabase production catalog ready:', products.length, 'products | R2:', window.productsR2.length, '| Resmi:', window.productsResmi.length);
  }

  function renderAfterAppLoaded() {
    var attempts = 0;
    function render() {
      attempts++;
      if (typeof window.switchCatalog === 'function') {
        window.switchCatalog('r2');
        if (typeof window.renderProductDisplay === 'function') window.renderProductDisplay();
        return;
      }
      if (attempts < 100) window.setTimeout(render, 50);
      else console.error('[R2] app.js loaded but switchCatalog() was not found.');
    }
    render();
  }

  function startApp() {
    return loadScript('app.js').then(renderAfterAppLoaded);
  }

  function showCatalogError(error) {
    window.R2_CATALOG_SOURCE = 'error';
    console.error('[R2] Supabase catalog failed:', error);
    var grid = document.getElementById('productGrid');
    if (grid) {
      grid.innerHTML = '<div class="col-span-full py-16 text-center"><div class="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-4"><i class="fa-solid fa-cloud-exclamation text-xl"></i></div><h3 class="text-lg font-extrabold text-slate-800">Katalog belum dapat dimuat</h3><p class="text-sm text-slate-500 mt-2">Koneksi database gagal. Silakan refresh halaman.</p><button onclick="location.reload()" class="mt-5 px-5 py-2.5 bg-brand-900 text-white rounded-xl text-sm font-bold">Refresh Katalog</button></div>';
    }
  }

  function requestCatalog() {
    var endpoint = SUPABASE_URL + '/rest/v1/' + TABLE + '?select=' + encodeURIComponent(SELECT) + '&is_active=eq.true&order=name.asc&limit=1000';
    return fetch(endpoint, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        Accept: 'application/json'
      }
    }).then(function (response) {
      if (!response.ok) throw new Error('Supabase HTTP ' + response.status);
      return response.json();
    });
  }

  function boot() {
    requestCatalog().then(function (rows) {
      var products = classify(Array.isArray(rows) ? rows : []);
      if (!products.length) throw new Error('Tabel products tidak memiliki produk aktif');
      expose(products);
      return startApp();
    }).catch(showCatalogError);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
