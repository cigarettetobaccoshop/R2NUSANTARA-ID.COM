// R2 NUSANTARA — Production Supabase Catalog Bootstrap
// Loads the live catalog first, then starts app.js. No dependency on legacy catalog for production.
(function () {
  'use strict';

  var SUPABASE_URL = 'https://zgsbtexngystdmakqjyi.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_7wqbX7wUVFJZqinPyy8XLQ_SimByBEo';
  var TABLE = 'R2%20NUSANTARA';
  var SELECT = '"Variant SKU","Title","Variant Price","Variant Inventory Qty","Published","Status","Tags","Vendor","Handle","Option1 Value"';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Gagal memuat ' + src)); };
      document.body.appendChild(script);
    });
  }

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function normalize(value) {
    return text(value).toLowerCase();
  }

  function getTagSegment(tags) {
    var match = text(tags).match(/(?:^|,)\s*Segment\s*([A-E])\s*(?:,|$)/i);
    return match ? match[1].toUpperCase() : undefined;
  }

  function classify(rows) {
    return rows
      .filter(function (row) {
        return row.Published === true && normalize(row.Status || 'active') === 'active';
      })
      .map(function (row, index) {
        var sku = text(row['Variant SKU']);
        var tags = text(row.Tags);
        var name = text(row.Title) || text(row['Option1 Value']) || text(row.Handle) || ('Produk ' + (index + 1));
        var isResmi = /^resmi-/i.test(sku) || /(?:^|,)\s*resmi\s*(?:,|$)/i.test(tags);
        var segment = getTagSegment(tags);

        return {
          id: sku || ((isResmi ? 'resmi-' : 'r2-') + (index + 1)),
          name: name,
          price: Number(row['Variant Price']) || 0,
          category: isResmi ? 'resmi' : 'r2',
          segment: segment,
          segmentName: segment ? ({ A: 'Premium', B: 'Reguler', C: 'Mild', D: 'International', E: 'Legacy' }[segment]) : undefined,
          sku: sku,
          inventoryQty: Number(row['Variant Inventory Qty']) || 0,
          vendor: text(row.Vendor),
          tags: tags
        };
      });
  }

  function startApp() {
    return loadScript('app.js');
  }

  function expose(products) {
    window.productsR2 = products.filter(function (p) { return p.category === 'r2'; });
    window.productsResmi = products.filter(function (p) { return p.category === 'resmi'; });
    window.allProducts = products;
    window.R2_CATALOG_SOURCE = 'supabase';
    window.R2_CATALOG_COUNT = products.length;
    window.R2_CATALOG_SYNCED_AT = new Date().toISOString();
    window.dispatchEvent(new CustomEvent('r2:supabase-catalog-ready', {
      detail: {
        total: products.length,
        r2: window.productsR2.length,
        resmi: window.productsResmi.length
      }
    }));
    console.info('[R2] Supabase catalog ready:', products.length, 'products | R2:', window.productsR2.length, '| Resmi:', window.productsResmi.length);
  }

  function showCatalogError(error) {
    window.R2_CATALOG_SOURCE = 'error';
    console.error('[R2] Supabase catalog failed:', error);
    var grid = document.getElementById('productGrid');
    if (grid) {
      grid.innerHTML = '<div class="col-span-full py-16 text-center"><div class="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-4"><i class="fa-solid fa-cloud-exclamation text-xl"></i></div><h3 class="text-lg font-extrabold text-slate-800">Katalog sedang disinkronkan</h3><p class="text-sm text-slate-500 mt-2">Silakan refresh halaman beberapa saat lagi.</p></div>';
    }
  }

  function boot() {
    var endpoint = SUPABASE_URL + '/rest/v1/' + TABLE + '?select=' + encodeURIComponent(SELECT) + '&order=Title.asc&limit=1000';
    fetch(endpoint, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        Accept: 'application/json'
      }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Supabase HTTP ' + response.status);
        return response.json();
      })
      .then(function (rows) {
        var products = classify(Array.isArray(rows) ? rows : []);
        if (!products.length) throw new Error('Supabase mengembalikan 0 produk aktif');
        expose(products);
        return startApp();
      })
      .catch(function (error) {
        showCatalogError(error);
        return startApp();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
