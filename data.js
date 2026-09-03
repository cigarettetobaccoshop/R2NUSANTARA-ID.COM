/* ============================================
   data.js — DATA KATALOG PRODUK R2 NUSANTARA
============================================ */
'use strict';

// Informasi Perusahaan
window.COMPANY_INFO = {
    name: 'R2 Nusantara - Cigarette Tobacco Shop',
    whatsapp: '6285715905079',
    address: 'WJMC+WG8, Karangduren, Kec. Pakisaji, Kab. Malang, Jawa Timur 65162'
};

// Data Produk R2
window.productsR2 = [
    { id: 'r2-1', name: "Absolute Bold", price: 118000, category: 'R2' },
    { id: 'r2-5', name: "Apache Bold", price: 145000, category: 'R2', badge: 'hot' },
    { id: 'r2-6', name: "Apache Mild", price: 160000, category: 'R2' },
    { id: 'r2-9', name: "Arrow Bold", price: 115000, category: 'R2' },
    { id: 'r2-11', name: "Astro Bold", price: 73000, category: 'R2' }
];

// Data Produk Resmi
window.productsResmi = [
    { id: 'resmi-1', name: "Gudang Garam Surya 12", price: 235000, category: 'Gudang Garam', badge: 'hot' },
    { id: 'resmi-2', name: "Gudang Garam Surya 16", price: 310000, category: 'Gudang Garam', badge: 'vip' },
    { id: 'resmi-3', name: "Gudang Garam International", price: 220000, category: 'Gudang Garam' },
    { id: 'resmi-9', name: "Sampoerna Mild 16", price: 305000, category: 'Sampoerna', badge: 'vip' },
    { id: 'resmi-10', name: "Sampoerna Mild 12", price: 230000, category: 'Sampoerna' },
    { id: 'resmi-23', name: "Djarum Super 16", price: 315000, category: 'Djarum', badge: 'hot' },
    { id: 'resmi-27', name: "LA Lights", price: 285000, category: 'Djarum' },
    { id: 'resmi-55', name: "Class Mild 16", price: 210000, category: 'Lainnya' },
    { id: 'resmi-61', name: "Galan Filter", price: 100000, category: 'Lainnya' },
    { id: 'resmi-67', name: "Wismilak Diplomat", price: 210000, category: 'Wismilak' }
];

// Gabungkan Semua Data (Global Variable agar bisa dibaca app.js)
window.allProducts = [...window.productsR2, ...window.productsResmi];