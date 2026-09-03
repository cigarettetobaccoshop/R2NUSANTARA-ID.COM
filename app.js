/* ============================================
   app.js — LOGIKA SISTEM R2 NUSANTARA
============================================ */
'use strict';

// 1. STATE MANAGEMENT
let cart = []; // Array untuk menyimpan isi keranjang

// Format Rupiah Helper
const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(angka);
};

// 2. INISIALISASI HALAMAN
document.addEventListener('DOMContentLoaded', () => {
    // Render produk saat pertama kali dibuka
    renderProducts(window.allProducts);
    
    // Normal Loader Removal (Hilang dengan mulus jika semua sukses dimuat)
    setTimeout(() => {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                document.body.classList.remove('overflow-hidden');
            }, 500);
        }
    }, 800); // 0.8 detik delay animasi
});


// 3. RENDER PRODUK KE HALAMAN
function renderProducts(dataToRender) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    
    if (dataToRender.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center py-16 text-gray-400">
                <i class="fas fa-box-open text-6xl mb-4 text-gray-300"></i>
                <h4 class="text-lg font-bold text-gray-600">Produk Tidak Ditemukan</h4>
            </div>`;
        return;
    }

    dataToRender.forEach(p => {
        // Render Badge (Hot / VIP)
        let badgeHtml = '';
        if (p.badge === 'hot') {
            badgeHtml = `<span class="absolute top-3 left-3 bg-red-600 text-white text-[0.65rem] font-black px-2 py-1 rounded shadow-md z-10"><i class="fas fa-fire mr-1"></i> HOT ITEM</span>`;
        } else if (p.badge === 'vip') {
            badgeHtml = `<span class="absolute top-3 left-3 bg-gold text-white text-[0.65rem] font-black px-2 py-1 rounded shadow-md z-10"><i class="fas fa-crown mr-1"></i> BEST SELLER</span>`;
        }

        // Hitung harga eceran (Coret) - Logika dari data asli Anda
        const retailPrice = p.price * 1.10;

        const card = document.createElement('div');
        card.className = "product-card bg-white rounded-xl border border-gray-100 overflow-hidden relative flex flex-col cursor-pointer shadow-sm";
        card.innerHTML = `
            ${badgeHtml}
            <div class="w-full aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 p-4">
                <i class="fas fa-box text-6xl text-gray-300 product-img"></i>
            </div>
            
            <div class="p-4 flex flex-col flex-1">
                <span class="text-[0.6rem] font-bold text-gold uppercase tracking-wider mb-1">${p.category}</span>
                <h3 class="text-sm font-bold text-gray-800 leading-snug mb-3 flex-1">${p.name}</h3>
                
                <div class="mt-auto">
                    <p class="text-[0.65rem] text-gray-400 line-through mb-0.5">${formatRp(retailPrice)}</p>
                    <p class="text-primary font-black text-lg leading-none mb-3">
                        ${formatRp(p.price)}
                    </p>
                </div>
                
                <button onclick="addToCart('${p.id}', this)" class="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 hover:border-primary text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center">
                    <i class="fas fa-cart-plus mr-2"></i> Tambah
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}


// 4. LOGIKA PENCARIAN & FILTER
function filterData(category) {
    // Ubah style tombol aktif
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.innerText.includes(category) || (category === 'Semua' && btn.innerText === 'Semua Produk')) {
            btn.className = "filter-btn px-6 py-2 bg-primary text-white rounded-full text-sm font-bold active-filter shadow-md";
        } else {
            btn.className = "filter-btn px-6 py-2 bg-white text-gray-600 border border-gray-200 rounded-full text-sm font-semibold hover:border-gold shadow-sm";
        }
    });

    // Render ulang data sesuai filter
    if (category === 'Semua') {
        renderProducts(window.allProducts);
    } else {
        const filtered = window.allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// Fitur Kolom Pencarian
const executeSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = window.allProducts.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        p.category.toLowerCase().includes(keyword)
    );
    renderProducts(filtered);
};
document.getElementById('searchInput')?.addEventListener('input', executeSearch);
document.getElementById('searchInputMobile')?.addEventListener('input', executeSearch);


// 5. SISTEM KERANJANG BELANJA (CART)
function addToCart(productId, btnElement) {
    const product = window.allProducts.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    updateCartUI();

    // Visual Feedback (Ubah tombol sesaat)
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '<i class="fas fa-check"></i> Sukses';
    btnElement.classList.replace('bg-primary/10', 'bg-green-500');
    btnElement.classList.replace('text-primary', 'text-white');
    
    setTimeout(() => {
        btnElement.innerHTML = originalText;
        btnElement.classList.replace('bg-green-500', 'bg-primary/10');
        btnElement.classList.replace('text-white', 'text-primary');
    }, 1000);
}

function updateCartUI() {
    const container = document.getElementById('cartItems');
    const badge = document.getElementById('cartCount');
    const totalEl = document.getElementById('cartTotal');
    
    container.innerHTML = '';
    let totalPrice = 0;
    let totalQty = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 text-gray-400">
                <i class="fas fa-shopping-basket text-4xl mb-3 text-gray-300"></i>
                <p class="text-sm">Keranjang belanja kosong</p>
            </div>`;
    }

    cart.forEach((item, index) => {
        totalPrice += item.price * item.qty;
        totalQty += item.qty;
        
        container.innerHTML += `
            <div class="flex bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div class="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center mr-3 border border-gray-100">
                    <i class="fas fa-box text-gray-300 text-xl"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-bold text-gray-800 line-clamp-1">${item.name}</h4>
                    <p class="text-primary text-xs font-bold mt-1">${formatRp(item.price)}</p>
                    <div class="flex items-center mt-2 space-x-3 bg-gray-50 w-fit rounded-lg px-2 py-1 border border-gray-100">
                        <button onclick="changeQty(${index}, -1)" class="w-6 h-6 text-gray-600 hover:text-red-500 font-bold">-</button>
                        <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
                        <button onclick="changeQty(${index}, 1)" class="w-6 h-6 text-gray-600 hover:text-green-500 font-bold">+</button>
                    </div>
                </div>
            </div>
        `;
    });

    badge.innerText = totalQty;
    totalEl.innerText = formatRp(totalPrice);
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    // Jika qty 0, hapus dari keranjang
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('cart-open');
    if (sidebar.classList.contains('cart-open')) {
        overlay.classList.remove('hidden');
        // Sedikit delay untuk efek fade
        setTimeout(() => overlay.classList.add('opacity-100'), 10); 
    } else {
        overlay.classList.remove('opacity-100');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

// 6. CHECKOUT KE WHATSAPP
function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert('Keranjang Anda masih kosong. Silakan pilih produk terlebih dahulu.');
        return;
    }
    
    let textMessage = `Halo Admin *${window.COMPANY_INFO.name}*, saya ingin melakukan pemesanan (Grosir):\n\n`;
    let grandTotal = 0;
    
    cart.forEach((item, i) => {
        const subtotal = item.price * item.qty;
        grandTotal += subtotal;
        textMessage += `${i+1}. ${item.name}\n   └ ${item.qty} Bal x ${formatRp(item.price)} = ${formatRp(subtotal)}\n`;
    });
    
    textMessage += `\n*TOTAL PESANAN: ${formatRp(grandTotal)}*\n\n`;
    textMessage += `Mohon konfirmasi rincian ongkos kirim dan ketersediaan stoknya. Terima kasih.`;
    
    const waUrl = `https://wa.me/${window.COMPANY_INFO.whatsapp}?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, '_blank');
}