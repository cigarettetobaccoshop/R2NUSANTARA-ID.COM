// R2 NUSANTARA — LIVE PRODUCT CATALOG
// Primary source: Supabase Production. Static legacy-data.js is fallback only.
(function () {
  'use strict';

  var SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_mqJp3tqSL1gCjz1xdcgWGQ_mtDFRTmg';
  var VERSION = '20260828-live-catalog-1';
  var SELECT = 'id,name,price,category,segment,segment_name,description,rating,is_active,created_at,updated_at';

  function classify(rows) {
    return (Array.isArray(rows) ? rows : []).filter(function (row) {
      return row && row.is_active !== false;
    }).map(function (row, index) {
      var id = String(row.id == null ? '' : row.id).trim() || ('produk-' + (index + 1));
      var category = String(row.category == null ? '' : row.category).trim().toLowerCase() === 'resmi' ? 'resmi' : 'r2';
      return {
        id: id,
        name: String(row.name == null ? '' : row.name).trim() || ('Produk ' + (index + 1)),
        price: Number(row.price) || 0,
        category: category,
        segment: String(row.segment == null ? '' : row.segment).trim().toUpperCase(),
        segmentName: String(row.segment_name == null ? '' : row.segment_name).trim(),
        description: String(row.description == null ? '' : row.description).trim(),
        rating: Number(row.rating) || 0,
        sku: id,
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
    console.info('[R2] LIVE Supabase catalog:', products.length, 'products | R2:', window.productsR2.length, '| Resmi:', window.productsResmi.length);
  }

  function loadLegacyFallback() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'legacy-data.js?v=' + VERSION, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        (0, eval)(xhr.responseText);
        window.R2_CATALOG_SOURCE = 'legacy-fallback';
        return true;
      }
    } catch (e) {}
    return false;
  }

  function boot() {
    try {
      var xhr = new XMLHttpRequest();
      var endpoint = SUPABASE_URL + '/rest/v1/products?select=' + encodeURIComponent(SELECT) + '&is_active=eq.true&order=name.asc&limit=1000';
      xhr.open('GET', endpoint, false);
      xhr.setRequestHeader('apikey', SUPABASE_KEY);
      xhr.setRequestHeader('Authorization', 'Bearer ' + SUPABASE_KEY);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send(null);

      if (xhr.status >= 200 && xhr.status < 300) {
        var products = classify(JSON.parse(xhr.responseText));
        if (products.length) {
          expose(products);
          return;
        }
      }
    } catch (error) {
      console.error('[R2] Supabase live catalog failed:', error);
    }

    if (!loadLegacyFallback()) {
      window.productsR2 = [];
      window.productsResmi = [];
      window.allProducts = [];
      window.R2_CATALOG_SOURCE = 'error';
      console.error('[R2] Catalog unavailable.');
    }
  }

  boot();
})();
