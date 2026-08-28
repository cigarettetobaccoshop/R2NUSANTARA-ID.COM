(function () {
  'use strict';

  var SUPABASE_URL = 'https://zgsbtexngystdmakqjyi.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_7wqbX7wUVFJZqinPyy8XLQ_SimByBEo';
  var TABLE = 'R2%20NUSANTARA';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function classify(rows) {
    var r2Legacy = {};
    var resmiLegacy = {};
    (window.productsR2 || []).forEach(function (p) { r2Legacy[normalize(p.name)] = p; });
    (window.productsResmi || []).forEach(function (p) { resmiLegacy[normalize(p.name)] = p; });

    return rows.filter(function (row) {
      return row.Published !== false && String(row.Status || 'active').toLowerCase() === 'active';
    }).map(function (row, index) {
      var name = row.Title || row['Option1 Value'] || row.Handle || ('Produk ' + (index + 1));
      var key = normalize(name);
      var legacy = resmiLegacy[key] || r2Legacy[key] || {};
      var isResmi = !!resmiLegacy[key];
      return {
        id: legacy.id || row['Variant SKU'] || ((isResmi ? 'resmi-' : 'r2-') + (index + 1)),
        name: name,
        price: Number(row['Variant Price'] || legacy.price || 0),
        category: isResmi ? 'resmi' : 'r2',
        segment: legacy.segment,
        segmentName: legacy.segmentName,
        sku: row['Variant SKU'] || '',
        inventoryQty: Number(row['Variant Inventory Qty'] || 0),
        vendor: row.Vendor || '',
        tags: row.Tags || ''
      };
    });
  }

  function startApp() {
    return loadScript('app.js');
  }

  loadScript('legacy-data.js')
    .then(function () {
      return fetch(SUPABASE_URL + '/rest/v1/' + TABLE + '?select=*', {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + SUPABASE_KEY
        }
      });
    })
    .then(function (response) {
      if (!response.ok) throw new Error('Supabase HTTP ' + response.status);
      return response.json();
    })
    .then(function (rows) {
      var products = classify(rows);
      window.productsR2 = products.filter(function (p) { return p.category !== 'resmi'; });
      window.productsResmi = products.filter(function (p) { return p.category === 'resmi'; });
      window.allProducts = products;
      window.R2_CATALOG_SOURCE = 'supabase';
      window.R2_CATALOG_SYNCED_AT = new Date().toISOString();
      console.info('[R2] Catalog synchronized from Supabase:', products.length, 'products');
    })
    .catch(function (error) {
      console.error('[R2] Supabase synchronization failed; using legacy catalog.', error);
      window.R2_CATALOG_SOURCE = 'legacy-data.js';
    })
    .then(startApp);
})();
