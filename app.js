/* ============================================
app.js — Main Application Logic
R2 Nusantara v6.0 - Production Ready
Dengan Thumbnail Generator sesuai referensi
============================================ */
'use strict';

// ===== GLOBAL STATE =====
var cart = [];
var wishlist = [];
var recentlyViewed = [];
var currentPage = 1;
var itemsPerPage = 12;
var currentFilter = { category: '', search: '', sort: 'name' };
var testimonialState = { currentIndex: 0, autoPlayInterval: null };

// ===== COMPANY INFO & PRODUCTS =====
var COMPANY = window.COMPANY_INFO || {
    name: 'R2 Nusantara - Cigarette Tobacco Shop',
    contact: { whatsapp: '085715905079', whatsappLink: 'https://wa.me/6285715905079' },
    location: { address: 'WJMC+WG8, Karangduren, Kec. Pakisaji, Kabupaten Malang, Jawa Timur 65162' }
};
var PRODUCTS = window.PRODUCTS || [];

// ===== TESTIMONIALS =====
var defaultTestimonials = [
    { name: 'Budi Santoso', location: 'Surabaya, Jawa Timur', rating: 5, text: 'Pelayanan sangat profesional. Barang original semua, packing rapi. Pengiriman cepat hanya 2 hari. Recommended!' },
    { name: 'Ahmad Fauzi', location: 'Malang, Jawa Timur', rating: 5, text: 'Sudah langganan 2 tahun lebih. Harga grosir terbaik di Malang, stok lengkap, selalu original. Terima kasih!' },
    { name: 'Dedi Kurniawan', location: 'Jakarta Pusat', rating: 5, text: 'Stok sangat lengkap, lebih dari 200 merek. Admin ramah. Sistem bayar setelah resi keluar bikin tenang.' },
    { name: 'Rudi Setiawan', location: 'Bandung, Jawa Barat', rating: 5, text: 'Website user friendly, mudah cari produk. Fitur wishlist dan cart sangat membantu. Checkout via WA cepat.' },
    { name: 'Wawan Hermawan', location: 'Semarang, Jawa Tengah', rating: 5, text: 'Gratis ongkir untuk minimal 1 bal sangat membantu. Packaging aman, harga kompetitif. Pasti order lagi!' },
    { name: 'Eko Prasetyo', location: 'Yogyakarta', rating: 5, text: 'Sebagai reseller, saya sangat puas. Konsisten, reliable, harga kompetitif. Partner bisnis yang tepat!' }
];

function loadTestimonials() {
    var saved = localStorage.getItem('userReviews');
    var userReviews = saved ? JSON.parse(saved) : [];
    return defaultTestimonials.concat(userReviews);
}

// ==========================================
// 🎯 THUMBNAIL GENERATOR - CIGARETTE PACK DESIGN
// Sesuai referensi gambar: kemasan putih, R2 besar,
// NUSANTARA, health warning, nama produk di bawah
// ==========================================
function generateProductThumbnail(product) {
    var brandName = product.name.toUpperCase();
    var category = product.category || 'R2';
    var sideText = category === 'Resmi' ? 'RESMI FILTER' : 'KRETEK FILTER';
    
    // Warna aksen berdasarkan badge
    var accentColor = '#1a1a1a';
    if (product.badge === 'hot') accentColor = '#DC2626';
    else if (product.badge === 'vip') accentColor = '#7C3AED';
    else if (product.badge === 'new') accentColor = '#059669';
    
    // Generate background packs grid
    var bgPacks = '';
    for (var i = 0; i < 30; i++) {
        var x = (i % 6) * 100 + 10;
        var y = Math.floor(i / 6) * 100 + 10;
        var opacity = 0.08 + (Math.random() * 0.1);
        bgPacks += '<rect x="' + x + '" y="' + y + '" width="70" height="90" fill="#ffffff" opacity="' + opacity.toFixed(2) + '" rx="2"/>';
        bgPacks += '<text x="' + (x + 35) + '" y="' + (y + 55) + '" font-family="Georgia, serif" font-size="22" fill="#ffffff" opacity="' + (opacity + 0.05).toFixed(2) + '" text-anchor="middle" font-weight="bold">R2</text>';
    }
    
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">' +
        '<defs>' +
            '<linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
                '<stop offset="0%" style="stop-color:#2a2a2a"/>' +
                '<stop offset="50%" style="stop-color:#1a1a1a"/>' +
                '<stop offset="100%" style="stop-color:#0d0d0d"/>' +
            '</linearGradient>' +
            '<linearGradient id="packGrad" x1="0%" y1="0%" x2="0%" y2="100%">' +
                '<stop offset="0%" style="stop-color:#ffffff"/>' +
                '<stop offset="100%" style="stop-color:#f0f0f0"/>' +
            '</linearGradient>' +
            '<linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
                '<stop offset="0%" style="stop-color:#888888"/>' +
                '<stop offset="30%" style="stop-color:#e0e0e0"/>' +
                '<stop offset="50%" style="stop-color:#ffffff"/>' +
                '<stop offset="70%" style="stop-color:#c0c0c0"/>' +
                '<stop offset="100%" style="stop-color:#666666"/>' +
            '</linearGradient>' +
            '<filter id="packShadow" x="-50%" y="-50%" width="200%" height="200%">' +
                '<feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="#000" flood-opacity="0.6"/>' +
            '</filter>' +
            '<filter id="textShadow">' +
                '<feDropShadow dx="1" dy="2" stdDeviation="1" flood-color="#000" flood-opacity="0.3"/>' +
            '</filter>' +
        '</defs>' +
        
        // Background
        '<rect width="600" height="600" fill="url(#bgGrad)"/>' +
        bgPacks +
        
        // Marble floor reflection
        '<rect x="0" y="520" width="600" height="80" fill="#1a1a1a" opacity="0.5"/>' +
        
        // Main Pack with 3D effect
        '<g filter="url(#packShadow)" transform="translate(150, 80)">' +
            // Pack side (left)
            '<rect x="0" y="30" width="50" height="400" fill="#d4d4d4" rx="2"/>' +
            '<text x="25" y="230" font-family="Arial" font-size="11" fill="#666" text-anchor="middle" transform="rotate(-90, 25, 230)" letter-spacing="3">' + sideText + '</text>' +
            
            // Pack front
            '<rect x="50" y="0" width="300" height="440" fill="url(#packGrad)" rx="3" stroke="#000" stroke-width="1.5"/>' +
            
            // Pack top
            '<path d="M 50,20 L 75,0 L 350,0 L 350,20 Z" fill="#e8e8e8" stroke="#000" stroke-width="1"/>' +
            
            // Health Warning Top Section
            '<rect x="60" y="10" width="280" height="110" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
            '<rect x="60" y="10" width="280" height="28" fill="#000000"/>' +
            '<text x="200" y="30" font-family="Arial" font-size="15" fill="#ffffff" text-anchor="middle" font-weight="bold" letter-spacing="1">HEALTH WARNINGS</text>' +
            
            // Warning graphic area
            '<rect x="65" y="42" width="140" height="73" fill="#f5f5f5" stroke="#000" stroke-width="0.5"/>' +
            '<circle cx="135" cy="78" r="25" fill="#d0d0d0" opacity="0.6"/>' +
            '<text x="135" y="85" font-family="Arial" font-size="30" fill="#999" text-anchor="middle">⚠</text>' +
            
            // QR Code placeholder
            '<rect x="215" y="42" width="65" height="65" fill="#fff" stroke="#000" stroke-width="0.5"/>' +
            '<rect x="220" y="47" width="15" height="15" fill="#000"/>' +
            '<rect x="260" y="47" width="15" height="15" fill="#000"/>' +
            '<rect x="220" y="87" width="15" height="15" fill="#000"/>' +
            '<rect x="240" y="67" width="15" height="15" fill="#000"/>' +
            '<rect x="260" y="87" width="15" height="15" fill="#000"/>' +
            
            // Warning Text Bar
            '<rect x="60" y="120" width="280" height="45" fill="#000000"/>' +
            '<text x="200" y="138" font-family="Arial" font-size="11" fill="#ffffff" text-anchor="middle" font-weight="bold">PERINGATAN: MEROKOK MEMBUNUHMU</text>' +
            '<text x="200" y="155" font-family="Arial" font-size="10" fill="#ffffff" text-anchor="middle">WARNING: SMOKING KILLS</text>' +
            
            // Main Brand Area
            '<rect x="60" y="175" width="280" height="220" fill="#ffffff" stroke="#000" stroke-width="1"/>' +
            
            // R2 Logo (Large, Metallic 3D effect)
            '<text x="200" y="320" font-family="Georgia, serif" font-size="140" fill="url(#metalGrad)" text-anchor="middle" font-weight="bold" filter="url(#textShadow)" letter-spacing="-2">R2</text>' +
            
            // NUSANTARA Text
            '<text x="200" y="360" font-family="Georgia, serif" font-size="22" fill="#000000" text-anchor="middle" letter-spacing="10" font-weight="600">NUSANTARA</text>' +
            
            // Decorative line
            '<line x1="120" y1="375" x2="280" y2="375" stroke="#000" stroke-width="1"/>' +
            
            // Product Name (di bawah NUSANTARA - sesuai permintaan)
            '<text x="200" y="395" font-family="Arial" font-size="14" fill="' + accentColor + '" text-anchor="middle" font-weight="bold" letter-spacing="1">' + brandName.substring(0, 22) + '</text>' +
            
            // Category Badge Bar
            '<rect x="60" y="405" width="280" height="25" fill="#000000"/>' +
            '<text x="200" y="422" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle" font-weight="bold" letter-spacing="3">' + sideText + '</text>' +
            
            // Barcode
            '<rect x="65" y="438" width="110" height="38" fill="#fff" stroke="#000" stroke-width="0.5"/>' +
            '<rect x="70" y="441" width="2" height="32" fill="#000"/>' +
            '<rect x="74" y="441" width="1" height="32" fill="#000"/>' +
            '<rect x="77" y="441" width="3" height="32" fill="#000"/>' +
            '<rect x="82" y="441" width="1" height="32" fill="#000"/>' +
            '<rect x="85" y="441" width="2" height="32" fill="#000"/>' +
            '<rect x="89" y="441" width="1" height="32" fill="#000"/>' +
            '<rect x="92" y="441" width="3" height="32" fill="#000"/>' +
            '<rect x="97" y="441" width="2" height="32" fill="#000"/>' +
            '<rect x="101" y="441" width="1" height="32" fill="#000"/>' +
            '<rect x="104" y="441" width="2" height="32" fill="#000"/>' +
            '<rect x="108" y="441" width="3" height="32" fill="#000"/>' +
            '<rect x="113" y="441" width="1" height="32" fill="#000"/>' +
            '<rect x="116" y="441" width="2" height="32" fill="#000"/>' +
            '<rect x="120" y="441" width="1" height="32" fill="#000"/>' +
            '<rect x="123" y="441" width="3" height="32" fill="#000"/>' +
            '<rect x="128" y="441" width="2" height="32" fill="#000"/>' +
            '<rect x="132" y="441" width="1" height="32" fill="#000"/>' +
            '<rect x="135" y="441" width="2" height="32" fill="#000"/>' +
            '<rect x="139" y="441" width="3" height="32" fill="#000"/>' +
            '<rect x="144" y="441" width="1" height="32" fill="#000"/>' +
            '<rect x="147" y="441" width="2" height="32" fill="#000"/>' +
            '<rect x="151" y="441" width="1" height="32" fill="#000"/>' +
            '<rect x="154" y="441" width="3" height="32" fill="#000"/>' +
            '<rect x="159" y="441" width="2" height="32" fill="#000"/>' +
            '<rect x="163" y="441" width="1" height="32" fill="#000"/>' +
            '<text x="120" y="472" font-family="monospace" font-size="7" fill="#000" text-anchor="middle">8991234567890</text>' +
        '</g>' +
        
        // Reflection on marble floor
        '<g transform="translate(150, 530) scale(1, -0.25)" opacity="0.15">' +
            '<rect x="50" y="0" width="300" height="440" fill="#ffffff" rx="3"/>' +
            '<text x="200" y="320" font-family="Georgia, serif" font-size="140" fill="#000" text-anchor="middle" font-weight="bold">R2</text>' +
        '</g>' +
        
        // Watermark 233 VARIAN
        '<text x="570" y="580" font-family="Arial" font-size="13" font-style="italic" font-weight="600" fill="rgba(200, 150, 46, 0.4)" text-anchor="end" letter-spacing="2">233 VARIAN</text>' +
    '</svg>';
    
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function getProductImage(product) {
    if (product.image && typeof product.image === 'string' && product.image.startsWith('http')) {
        return product.image;
    }
    return generateProductThumbnail(product);
}

function preloadThumbnails() {
    PRODUCTS.slice(0, 12).forEach(function(product) {
        var img = new Image();
        img.src = getProductImage(product);
    });
}

// ===== PRICE & FORMAT HELPERS =====
function getWholesalePrice(product) {
    if (!product.price) return 0;
    if (typeof product.price === 'object') return product.price.wholesale || 0;
    return product.price;
}

function getRetailPrice(product) {
    if (!product.price) return 0;
    if (typeof product.price === 'object') return product.price.retail || Math.round(getWholesalePrice(product) * 1.15);
    return Math.round(product.price * 1.15);
}

function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

function getProductRating(product) {
    return product.rating || (product.badge === 'vip' ? 4.8 : (product.badge === 'hot' ? 4.7 : 4.5));
}

function getProductBadge(product) {
    if (product.badge === 'hot') return '<span class="mp-card-badge hot"><i class="fas fa-fire"></i> Terlaris</span>';
    if (product.badge === 'vip') return '<span class="mp-card-badge vip"><i class="fas fa-crown"></i> VIP</span>';
    if (product.badge === 'new') return '<span class="mp-card-badge new"><i class="fas fa-bolt"></i> Baru</span>';
    return '';
}

function buildStarRating(rating) {
    var fullStars = Math.floor(rating);
    var hasHalfStar = rating % 1 >= 0.5;
    var html = '';
    for (var i = 0; i < fullStars; i++) html += '<i class="fas fa-star"></i>';
    if (hasHalfStar) html += '<i class="fas fa-star-half-alt"></i>';
    var emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (var i = 0; i < emptyStars; i++) html += '<i class="far fa-star"></i>';
    return html;
}

// ===== BUILD PRODUCT CARD =====
function buildProductCardHTML(product) {
    var wholesalePrice = getWholesalePrice(product);
    var retailPrice = getRetailPrice(product);
    var discount = retailPrice > 0 ? Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100) : 0;
    var badge = getProductBadge(product);
    var rating = getProductRating(product);
    var inWishlist = wishlist.indexOf(product.id) > -1;
    var productImage = getProductImage(product);
    
    return '<div class="mp-card" data-product-id="' + product.id + '">' +
        '<div class="mp-card-image">' +
            badge +
            '<button class="mp-card-wishlist ' + (inWishlist ? 'active' : '') + '" onclick="toggleWishlist(\'' + product.id + '\', event)" title="Wishlist">' +
                '<i class="' + (inWishlist ? 'fas' : 'far') + ' fa-heart"></i>' +
            '</button>' +
            '<img src="' + productImage + '" alt="' + product.name + '" loading="lazy" class="mp-card-img">' +
        '</div>' +
        '<div class="mp-card-content">' +
            '<div class="mp-card-category">' + (product.category || 'R2') + '</div>' +
            '<h3 class="mp-card-title">' + product.name + '</h3>' +
            '<div class="mp-card-rating">' + buildStarRating(rating) + '<span>(' + rating + ')</span></div>' +
            '<div class="mp-card-price">' +
                '<div class="mp-card-price-retail">Rp ' + formatPrice(retailPrice) + '</div>' +
                '<div class="mp-card-price-wholesale">Rp ' + formatPrice(wholesalePrice) + (discount > 0 ? '<span class="mp-card-price-badge">-' + discount + '%</span>' : '') + '</div>' +
            '</div>' +
            '<div class="mp-card-actions">' +
                '<button class="mp-card-add-to-cart" onclick="addToCart(\'' + product.id + '\')"><i class="fas fa-plus"></i> Keranjang</button>' +
                '<button class="mp-card-quick-view" onclick="openQuickView(\'' + product.id + '\')" title="Quick View"><i class="fas fa-eye"></i></button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

// ===== RENDER PRODUCT GRID =====
function renderProductGrid() {
    var grid = document.getElementById('productGrid');
    var noResults = document.getElementById('noResults');
    var pagination = document.getElementById('pagination');
    if (!grid) return;
    
    var filtered = PRODUCTS.slice();
    if (currentFilter.category) filtered = filtered.filter(function(p) { return p.category === currentFilter.category; });
    if (currentFilter.search) {
        var search = currentFilter.search.toLowerCase();
        filtered = filtered.filter(function(p) { return p.name.toLowerCase().indexOf(search) > -1 || (p.category && p.category.toLowerCase().indexOf(search) > -1); });
    }
    
    if (currentFilter.sort === 'price-asc') filtered.sort(function(a, b) { return getWholesalePrice(a) - getWholesalePrice(b); });
    else if (currentFilter.sort === 'price-desc') filtered.sort(function(a, b) { return getWholesalePrice(b) - getWholesalePrice(a); });
    else if (currentFilter.sort === 'rating') filtered.sort(function(a, b) { return getProductRating(b) - getProductRating(a); });
    else filtered.sort(function(a, b) { return a.name.localeCompare(b.name); });
    
    var totalPages = Math.ceil(filtered.length / itemsPerPage);
    var start = (currentPage - 1) * itemsPerPage;
    var paginated = filtered.slice(start, start + itemsPerPage);
    
    if (paginated.length === 0) {
        grid.innerHTML = '';
        grid.classList.add('hidden');
        if (noResults) noResults.classList.remove('hidden');
        if (pagination) pagination.innerHTML = '';
        return;
    }
    
    if (noResults) noResults.classList.add('hidden');
    grid.classList.remove('hidden');
    grid.innerHTML = paginated.map(buildProductCardHTML).join('');
    
    if (pagination && totalPages > 1) {
        var paginationHTML = '';
        if (currentPage > 1) paginationHTML += '<button class="pagination-btn" onclick="changePage(' + (currentPage - 1) + ')"><i class="fas fa-chevron-left"></i></button>';
        for (var i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationHTML += '<button class="pagination-btn ' + (i === currentPage ? 'active' : '') + '" onclick="changePage(' + i + ')">' + i + '</button>';
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationHTML += '<span class="px-2 text-secondary text-xs">...</span>';
            }
        }
        if (currentPage < totalPages) paginationHTML += '<button class="pagination-btn" onclick="changePage(' + (currentPage + 1) + ')"><i class="fas fa-chevron-right"></i></button>';
        pagination.innerHTML = paginationHTML;
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

function changePage(page) {
    currentPage = page;
    renderProductGrid();
    var katalog = document.getElementById('katalog');
    if (katalog) katalog.scrollIntoView({ behavior: 'smooth' });
}

// ===== EDITOR'S PICK =====
function renderEditorsPick() {
    var container = document.getElementById('editorsPick');
    if (!container) return;
    var featured = PRODUCTS.filter(function(p) { return p.isFeatured || p.badge === 'hot' || p.badge === 'vip'; }).slice(0, 3);
    if (featured.length === 0) {
        container.innerHTML = '<p class="text-secondary text-sm">Belum ada produk unggulan.</p>';
        return;
    }
    container.innerHTML = featured.map(function(product) {
        return '<div class="mp-card cursor-pointer" onclick="openQuickView(\'' + product.id + '\')">' +
            '<div class="mp-card-image"><img src="' + getProductImage(product) + '" alt="' + product.name + '" loading="lazy" class="mp-card-img"></div>' +
            '<div class="mp-card-content">' +
                '<h3 class="font-semibold text-primary mb-1 text-sm">' + product.name + '</h3>' +
                '<p class="text-gold font-bold font-mono text-sm">Rp ' + formatPrice(getWholesalePrice(product)) + '</p>' +
            '</div>' +
        '</div>';
    }).join('');
}

// ===== SEARCH =====
function initSearch() {
    var searchInput = document.getElementById('searchInput');
    var searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;
    
    searchInput.addEventListener('input', function(e) {
        var query = e.target.value.trim().toLowerCase();
        if (query.length < 2) { searchResults.classList.add('hidden'); return; }
        
        var filtered = PRODUCTS.filter(function(p) {
            return p.name.toLowerCase().indexOf(query) > -1 || (p.category && p.category.toLowerCase().indexOf(query) > -1);
        }).slice(0, 5);
        
        if (filtered.length > 0) {
            searchResults.innerHTML = filtered.map(function(product) {
                return '<div class="search-result-item" onclick="selectSearchResult(\'' + product.id + '\')">' +
                    '<div class="flex items-center gap-3">' +
                        '<img src="' + getProductImage(product) + '" alt="' + product.name + '" class="w-10 h-10 object-cover rounded-lg">' +
                        '<div class="flex-1 min-w-0">' +
                            '<p class="font-semibold text-primary text-xs truncate">' + product.name + '</p>' +
                            '<p class="text-[10px] text-secondary">' + (product.category || 'R2') + '</p>' +
                        '</div>' +
                        '<span class="text-gold font-bold text-xs font-mono">Rp ' + formatPrice(getWholesalePrice(product)) + '</span>' +
                    '</div>' +
                '</div>';
            }).join('');
            searchResults.classList.remove('hidden');
        } else {
            searchResults.classList.add('hidden');
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
            searchResults.classList.add('hidden');
        }
    });
}

function selectSearchResult(productId) {
    openQuickView(productId);
    var searchResults = document.getElementById('searchResults');
    if (searchResults) searchResults.classList.add('hidden');
    var searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
}

// ===== FILTERS =====
function initFilters() {
    var categoryFilter = document.getElementById('categoryFilter');
    var sortFilter = document.getElementById('sortFilter');
    if (categoryFilter) categoryFilter.addEventListener('change', function(e) { currentFilter.category = e.target.value; currentPage = 1; renderProductGrid(); });
    if (sortFilter) sortFilter.addEventListener('change', function(e) { currentFilter.sort = e.target.value; renderProductGrid(); });
}

function filterByCategory(category) {
    var categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = category;
    currentFilter.category = category;
    currentPage = 1;
    renderProductGrid();
    var katalog = document.getElementById('katalog');
    if (katalog) katalog.scrollIntoView({ behavior: 'smooth' });
}

function resetFilters() {
    currentFilter = { category: '', search: '', sort: 'name' };
    currentPage = 1;
    var categoryFilter = document.getElementById('categoryFilter');
    var sortFilter = document.getElementById('sortFilter');
    var searchInput = document.getElementById('searchInput');
    if (categoryFilter) categoryFilter.value = '';
    if (sortFilter) sortFilter.value = 'name';
    if (searchInput) searchInput.value = '';
    renderProductGrid();
}

// ===== QUICK VIEW =====
function openQuickView(productId) {
    var product = PRODUCTS.find(function(p) { return p.id === productId; });
    if (!product) return;
    
    trackRecentlyViewed(productId);
    var modal = document.getElementById('quickViewModal');
    var content = document.getElementById('quickViewContent');
    if (!modal || !content) return;
    
    var wholesalePrice = getWholesalePrice(product);
    var retailPrice = getRetailPrice(product);
    var discount = retailPrice > 0 ? Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100) : 0;
    var inWishlist = wishlist.indexOf(product.id) > -1;
    
    content.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">' +
        '<div class="aspect-square rounded-xl overflow-hidden bg-surface relative group">' +
            '<img src="' + getProductImage(product) + '" alt="' + product.name + '" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy">' +
        '</div>' +
        '<div>' +
            '<div class="flex items-start justify-between mb-3">' +
                '<div><span class="text-xs text-secondary uppercase font-semibold">' + (product.category || 'R2') + '</span><h2 class="text-xl font-display text-primary mt-0.5">' + product.name + '</h2></div>' +
                '<button class="w-9 h-9 rounded-lg ' + (inWishlist ? 'bg-gold text-white' : 'bg-surface text-primary') + ' hover:scale-110 transition-transform" onclick="toggleWishlist(\'' + product.id + '\')"><i class="' + (inWishlist ? 'fas' : 'far') + ' fa-heart"></i></button>' +
            '</div>' +
            '<div class="flex items-center gap-2 mb-3">' + buildStarRating(getProductRating(product)) + '<span class="text-secondary text-xs">(' + getProductRating(product) + ')</span></div>' +
            '<div class="mb-4">' +
                '<p class="text-secondary line-through text-xs mb-1 font-mono">Rp ' + formatPrice(retailPrice) + '</p>' +
                '<div class="flex items-center gap-2"><span class="text-2xl font-bold text-primary font-mono">Rp ' + formatPrice(wholesalePrice) + '</span>' + (discount > 0 ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">-' + discount + '%</span>' : '') + '</div>' +
            '</div>' +
            '<p class="text-secondary text-xs mb-4 leading-relaxed">' + (product.description || 'Produk original dari distributor resmi.') + '</p>' +
            '<div class="flex gap-2">' +
                '<button onclick="addToCart(\'' + product.id + '\'); closeQuickView();" class="flex-1 py-2.5 bg-gradient-to-r from-gold to-gold-light text-white font-semibold rounded-lg transition-all shadow-md text-sm"><i class="fas fa-shopping-cart mr-1"></i>Tambah</button>' +
                '<button onclick="shareProduct(\'' + product.id + '\')" class="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"><i class="fab fa-whatsapp"></i></button>' +
            '</div>' +
        '</div>' +
    '</div>';
    
    modal.classList.remove('hidden');
    setTimeout(function() {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    var url = new URL(window.location);
    url.searchParams.set('p', productId);
    window.history.pushState({}, '', url);
}

function closeQuickView() {
    var modal = document.getElementById('quickViewModal');
    var content = document.getElementById('quickViewContent');
    if (!modal || !content) return;
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(function() { modal.classList.add('hidden'); }, 300);
    var url = new URL(window.location);
    url.searchParams.delete('p');
    window.history.pushState({}, '', url);
}

function shareProduct(productId) {
    var product = PRODUCTS.find(function(p) { return p.id === productId; });
    if (!product) return;
    var url = window.location.origin + window.location.pathname + '?p=' + productId;
    var message = 'Check out ' + product.name + ' - Rp ' + formatPrice(getWholesalePrice(product)) + ' di R2 Nusantara! ' + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank');
}

function checkDeepLink() {
    var urlParams = new URLSearchParams(window.location.search);
    var productId = urlParams.get('p');
    if (productId) setTimeout(function() { openQuickView(productId); }, 900);
}

// ===== CART =====
function addToCart(productId, quantity) {
    quantity = quantity || 1;
    var product = PRODUCTS.find(function(p) { return p.id === productId; });
    if (!product) return;
    var existingItem = cart.find(function(item) { return item.id === productId; });
    if (existingItem) existingItem.quantity += quantity;
    else cart.push({ id: productId, name: product.name, price: getWholesalePrice(product), image: getProductImage(product), quantity: quantity });
    saveToStorage();
    updateCartUI();
    showToast(product.name + ' ditambahkan ke keranjang', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(function(item) { return item.id !== productId; });
    saveToStorage();
    updateCartUI();
}

function updateCartQuantity(productId, quantity) {
    var item = cart.find(function(item) { return item.id === productId; });
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveToStorage();
        updateCartUI();
    }
}

function updateCartUI() {
    var totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    ['cartBadge', 'mobileCartBadge', 'mobileBottomCartBadge'].forEach(function(id) {
        var badge = document.getElementById(id);
        if (badge) {
            if (totalItems > 0) { badge.classList.remove('hidden'); badge.textContent = totalItems; }
            else badge.classList.add('hidden');
        }
    });
}

function openCart() {
    var sidebar = document.getElementById('cartSidebar');
    var content = document.getElementById('cartContent');
    var itemsContainer = document.getElementById('cartItems');
    var totalElement = document.getElementById('cartTotal');
    if (!sidebar || !content || !itemsContainer) return;
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<div class="text-center py-10"><i class="fas fa-shopping-cart text-5xl text-muted/30 mb-3"></i><p class="text-secondary text-sm">Keranjang Anda kosong</p><button onclick="closeCart(); document.getElementById(\'katalog\').scrollIntoView({behavior: \'smooth\'})" class="mt-3 px-5 py-2 bg-gradient-to-r from-gold to-gold-light text-white font-semibold rounded-lg text-sm">Belanja Sekarang</button></div>';
    } else {
        itemsContainer.innerHTML = cart.map(function(item) {
            return '<div class="flex gap-3 mb-3 p-3 bg-surface rounded-lg">' +
                '<img src="' + item.image + '" alt="' + item.name + '" class="w-16 h-16 object-cover rounded-lg">' +
                '<div class="flex-1">' +
                    '<h4 class="font-semibold text-primary text-sm mb-1">' + item.name + '</h4>' +
                    '<p class="text-gold font-bold font-mono text-sm mb-2">Rp ' + formatPrice(item.price) + '</p>' +
                    '<div class="flex items-center gap-2">' +
                        '<button onclick="updateCartQuantity(\'' + item.id + '\', ' + (item.quantity - 1) + ')" class="w-7 h-7 rounded-md bg-white border border-border hover:bg-gray-100 flex items-center justify-center"><i class="fas fa-minus text-[10px]"></i></button>' +
                        '<span class="font-semibold text-primary text-sm w-6 text-center">' + item.quantity + '</span>' +
                        '<button onclick="updateCartQuantity(\'' + item.id + '\', ' + (item.quantity + 1) + ')" class="w-7 h-7 rounded-md bg-white border border-border hover:bg-gray-100 flex items-center justify-center"><i class="fas fa-plus text-[10px]"></i></button>' +
                        '<button onclick="removeFromCart(\'' + item.id + '\')" class="ml-auto text-red-500 hover:text-red-600"><i class="fas fa-trash text-xs"></i></button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }
    
    var total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
    if (totalElement) totalElement.textContent = 'Rp ' + formatPrice(total);
    sidebar.classList.remove('hidden');
    setTimeout(function() { content.classList.remove('translate-x-full'); }, 10);
}

function closeCart() {
    var sidebar = document.getElementById('cartSidebar');
    var content = document.getElementById('cartContent');
    if (!sidebar || !content) return;
    content.classList.add('translate-x-full');
    setTimeout(function() { sidebar.classList.add('hidden'); }, 300);
}

// ===== WISHLIST =====
function toggleWishlist(productId, event) {
    if (event) event.stopPropagation();
    var product = PRODUCTS.find(function(p) { return p.id === productId; });
    if (!product) return;
    var index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast(product.name + ' dihapus dari wishlist', 'success');
    } else {
        wishlist.push(productId);
        showToast(product.name + ' ditambahkan ke wishlist', 'success');
    }
    saveToStorage();
    updateWishlistUI();
    renderProductGrid();
}

function updateWishlistUI() {
    ['wishlistBadge', 'mobileWishlistBadge', 'mobileBottomWishlistBadge'].forEach(function(id) {
        var badge = document.getElementById(id);
        if (badge) {
            if (wishlist.length > 0) { badge.classList.remove('hidden'); badge.textContent = wishlist.length; }
            else badge.classList.add('hidden');
        }
    });
}

function openWishlist() {
    var sidebar = document.getElementById('wishlistSidebar');
    var content = document.getElementById('wishlistContent');
    var itemsContainer = document.getElementById('wishlistItems');
    if (!sidebar || !content || !itemsContainer) return;
    
    if (wishlist.length === 0) {
        itemsContainer.innerHTML = '<div class="text-center py-10"><i class="far fa-heart text-5xl text-muted/30 mb-3"></i><p class="text-secondary text-sm">Wishlist Anda kosong</p><button onclick="closeWishlist(); document.getElementById(\'katalog\').scrollIntoView({behavior: \'smooth\'})" class="mt-3 px-5 py-2 bg-gradient-to-r from-gold to-gold-light text-white font-semibold rounded-lg text-sm">Jelajahi Produk</button></div>';
    } else {
        itemsContainer.innerHTML = wishlist.map(function(id) {
            var product = PRODUCTS.find(function(p) { return p.id === id; });
            if (!product) return '';
            return '<div class="flex gap-3 mb-3 p-3 bg-surface rounded-lg">' +
                '<img src="' + getProductImage(product) + '" alt="' + product.name + '" class="w-16 h-16 object-cover rounded-lg">' +
                '<div class="flex-1">' +
                    '<h4 class="font-semibold text-primary text-sm mb-1">' + product.name + '</h4>' +
                    '<p class="text-gold font-bold font-mono text-sm mb-2">Rp ' + formatPrice(getWholesalePrice(product)) + '</p>' +
                    '<div class="flex gap-2">' +
                        '<button onclick="addToCart(\'' + product.id + '\'); closeWishlist();" class="flex-1 py-1.5 bg-gradient-to-r from-gold to-gold-light text-white text-xs font-semibold rounded-md"><i class="fas fa-shopping-cart mr-1"></i>Tambah</button>' +
                        '<button onclick="toggleWishlist(\'' + product.id + '\')" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-md"><i class="fas fa-trash text-xs"></i></button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).filter(Boolean).join('');
    }
    sidebar.classList.remove('hidden');
    setTimeout(function() { content.classList.remove('translate-x-full'); }, 10);
}

function closeWishlist() {
    var sidebar = document.getElementById('wishlistSidebar');
    var content = document.getElementById('wishlistContent');
    if (!sidebar || !content) return;
    content.classList.add('translate-x-full');
    setTimeout(function() { sidebar.classList.add('hidden'); }, 300);
}

// ===== CHECKOUT =====
function openCheckout() {
    closeCart();
    var modal = document.getElementById('checkoutModal');
    var content = modal ? modal.querySelector('div[class*="transform"]') : null;
    var itemsContainer = document.getElementById('checkoutItems');
    var totalElement = document.getElementById('checkoutTotal');
    if (!modal || !itemsContainer) return;
    if (cart.length === 0) { showToast('Keranjang kosong!', 'warning'); return; }
    
    itemsContainer.innerHTML = cart.map(function(item) {
        return '<div class="flex justify-between items-center py-2 border-b border-border"><div><p class="font-semibold text-primary text-sm">' + item.name + '</p><p class="text-xs text-secondary">Qty: ' + item.quantity + '</p></div><span class="text-gold font-bold font-mono text-sm">Rp ' + formatPrice(item.price * item.quantity) + '</span></div>';
    }).join('');
    
    var total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
    if (totalElement) totalElement.textContent = 'Rp ' + formatPrice(total);
    modal.classList.remove('hidden');
    setTimeout(function() { if (content) { content.classList.remove('scale-95', 'opacity-0'); content.classList.add('scale-100', 'opacity-100'); } }, 10);
}

function closeCheckout() {
    var modal = document.getElementById('checkoutModal');
    var content = modal ? modal.querySelector('div[class*="transform"]') : null;
    if (!modal) return;
    if (content) { content.classList.remove('scale-100', 'opacity-100'); content.classList.add('scale-95', 'opacity-0'); }
    setTimeout(function() { modal.classList.add('hidden'); }, 300);
}

document.addEventListener('DOMContentLoaded', function() {
    var checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('checkoutName').value;
            var phone = document.getElementById('checkoutPhone').value;
            var address = document.getElementById('checkoutAddress').value;
            var notes = document.getElementById('checkoutNotes').value;
            var total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
            
            var message = '*PESANAN BARU - R2 NUSANTARA*\n\n*Data Pembeli:*\nNama: ' + name + '\nWhatsApp: ' + phone + '\nAlamat: ' + address + '\n\n*Detail Pesanan:*\n';
            cart.forEach(function(item) { message += '- ' + item.name + '\n  Qty: ' + item.quantity + ' x Rp ' + formatPrice(item.price) + '\n  Subtotal: Rp ' + formatPrice(item.price * item.quantity) + '\n\n'; });
            message += '*Total: Rp ' + formatPrice(total) + '*\n\n';
            if (notes) message += 'Catatan: ' + notes + '\n\n';
            message += 'Terima kasih!';
            
            var waNumber = COMPANY.contact.whatsapp.replace(/\D/g, '');
            window.open('https://wa.me/62' + waNumber + '?text=' + encodeURIComponent(message), '_blank');
            
            closeCheckout();
            cart = [];
            saveToStorage();
            updateCartUI();
            showToast('Pesanan berhasil dikirim!', 'success');
        });
    }
});

// ===== FAQ =====
function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function(item) {
        var question = item.querySelector('.faq-question');
        var answer = item.querySelector('.faq-answer');
        if (!question || !answer) return;
        question.addEventListener('click', function() {
            var isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(function(i) {
                i.classList.remove('active');
                var ans = i.querySelector('.faq-answer');
                if (ans) ans.style.maxHeight = '0';
            });
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

// ===== BACK TO TOP =====
function initBackToTop() {
    var button = document.getElementById('backToTop');
    if (!button) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) button.classList.add('visible');
        else button.classList.remove('visible');
    });
    button.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

// ===== NEWSLETTER =====
function initNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('Terima kasih telah berlangganan!', 'success');
        form.reset();
    });
}

// ===== COOKIE BANNER =====
function initCookieBanner() {
    setTimeout(function() {
        if (!localStorage.getItem('cookiesAccepted')) {
            var banner = document.getElementById('cookieBanner');
            if (banner) banner.classList.remove('hidden');
        }
    }, 1200);
}
function acceptCookies() { localStorage.setItem('cookiesAccepted', 'true'); var banner = document.getElementById('cookieBanner'); if (banner) banner.classList.add('hidden'); }
function rejectCookies() { localStorage.setItem('cookiesAccepted', 'false'); var banner = document.getElementById('cookieBanner'); if (banner) banner.classList.add('hidden'); }

// ===== LEGAL MODAL =====
function openLegalModal(type) {
    var modal = document.getElementById('legalModal');
    var content = document.getElementById('legalContent');
    if (!modal || !content) return;
    var contentMap = {
        terms: { title: 'Syarat & Ketentuan', content: '<p class="text-sm text-secondary leading-relaxed">Selamat datang di R2 Nusantara. Dengan menggunakan website ini, Anda setuju untuk terikat dengan syarat dan ketentuan yang berlaku.</p>' },
        privacy: { title: 'Kebijakan Privasi', content: '<p class="text-sm text-secondary leading-relaxed">Kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi yang Anda berikan.</p>' },
        cookie: { title: 'Kebijakan Cookie', content: '<p class="text-sm text-secondary leading-relaxed">Website ini menggunakan cookie untuk meningkatkan pengalaman browsing Anda.</p>' }
    };
    var data = contentMap[type];
    if (!data) return;
    content.innerHTML = '<div class="flex items-center justify-between mb-4"><h2 class="text-xl font-display text-primary">' + data.title + '</h2><button onclick="closeLegalModal()" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><i class="fas fa-times text-primary text-sm"></i></button></div>' + data.content;
    modal.classList.remove('hidden');
    setTimeout(function() { content.classList.remove('scale-95', 'opacity-0'); content.classList.add('scale-100', 'opacity-100'); }, 10);
}
function closeLegalModal() {
    var modal = document.getElementById('legalModal');
    var content = document.getElementById('legalContent');
    if (!modal || !content) return;
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(function() { modal.classList.add('hidden'); }, 300);
}

// ===== TOAST =====
function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var icons = { success: 'fa-check', error: 'fa-times', warning: 'fa-exclamation' };
    var titles = { success: 'Berhasil', error: 'Error', warning: 'Peringatan' };
    toast.innerHTML = '<div class="toast-icon"><i class="fas ' + (icons[type] || 'fa-check') + '"></i></div><div class="toast-content"><div class="toast-title">' + (titles[type] || 'Berhasil') + '</div><div class="toast-message">' + message + '</div></div>';
    container.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
}

// ===== MOBILE NAV =====
function initMobileNav() {
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
            item.classList.add('active');
        });
    });
    var mobileBottomCart = document.getElementById('mobileBottomCart');
    var mobileBottomWishlist = document.getElementById('mobileBottomWishlist');
    if (mobileBottomCart) mobileBottomCart.addEventListener('click', function(e) { e.preventDefault(); openCart(); });
    if (mobileBottomWishlist) mobileBottomWishlist.addEventListener('click', function(e) { e.preventDefault(); openWishlist(); });
}

// ===== STORAGE =====
function saveToStorage() {
    try {
        localStorage.setItem('r2_cart', JSON.stringify(cart));
        localStorage.setItem('r2_wishlist', JSON.stringify(wishlist));
        localStorage.setItem('r2_recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (e) { console.error('Error saving to storage:', e); }
}
function loadFromStorage() {
    try {
        var savedCart = localStorage.getItem('r2_cart');
        var savedWishlist = localStorage.getItem('r2_wishlist');
        var savedRecentlyViewed = localStorage.getItem('r2_recentlyViewed');
        if (savedCart) cart = JSON.parse(savedCart);
        if (savedWishlist) wishlist = JSON.parse(savedWishlist);
        if (savedRecentlyViewed) recentlyViewed = JSON.parse(savedRecentlyViewed);
    } catch (e) { console.error('Error loading from storage:', e); }
}
function trackRecentlyViewed(productId) {
    recentlyViewed = recentlyViewed.filter(function(id) { return id !== productId; });
    recentlyViewed.unshift(productId);
    recentlyViewed = recentlyViewed.slice(0, 10);
    saveToStorage();
}

// ===== TESTIMONIAL SLIDER =====
function initTestimonialSlider() {
    var track = document.getElementById('testimonialTrack');
    var dotsContainer = document.getElementById('testimonialDots');
    var prevBtn = document.getElementById('testimonialPrev');
    var nextBtn = document.getElementById('testimonialNext');
    var reviewCountEl = document.getElementById('reviewCount');
    if (!track) return;
    
    var testimonials = loadTestimonials();
    if (reviewCountEl) reviewCountEl.textContent = testimonials.length;
    
    track.innerHTML = testimonials.map(function(t) {
        var initials = t.name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var stars = Array(5).fill(0).map(function(_, i) { return '<i class="' + (i < t.rating ? 'fas' : 'far') + ' fa-star"></i>'; }).join('');
        return '<div class="testimonial-slide"><div class="testimonial-card"><div class="testimonial-stars">' + stars + '</div><p class="testimonial-text">"' + t.text + '"</p><div class="testimonial-author"><div class="testimonial-avatar">' + initials + '</div><div class="testimonial-author-info"><h4>' + t.name + '</h4><p>' + t.location + '</p></div></div></div></div>';
    }).join('');
    
    var slides = track.querySelectorAll('.testimonial-slide');
    if (slides.length === 0) return;
    if (dotsContainer) dotsContainer.innerHTML = Array.from(slides).map(function(_, i) { return '<div class="testimonial-dot ' + (i === 0 ? 'active' : '') + '" data-index="' + i + '"></div>'; }).join('');
    
    function getVisibleSlides() { return window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 768 ? 2 : 1); }
    function updateSlider() {
        var slideWidth = slides[0] ? slides[0].offsetWidth : 0;
        track.style.transform = 'translateX(-' + (testimonialState.currentIndex * slideWidth) + 'px)';
        document.querySelectorAll('.testimonial-dot').forEach(function(dot, index) { dot.classList.toggle('active', index === testimonialState.currentIndex); });
    }
    function nextSlide() {
        var maxIndex = Math.max(0, slides.length - getVisibleSlides());
        testimonialState.currentIndex = testimonialState.currentIndex >= maxIndex ? 0 : testimonialState.currentIndex + 1;
        updateSlider();
    }
    function prevSlide() {
        var maxIndex = Math.max(0, slides.length - getVisibleSlides());
        testimonialState.currentIndex = testimonialState.currentIndex <= 0 ? maxIndex : testimonialState.currentIndex - 1;
        updateSlider();
    }
    function startAutoPlay() { testimonialState.autoPlayInterval = setInterval(nextSlide, 4000); }
    function stopAutoPlay() { clearInterval(testimonialState.autoPlayInterval); }
    
    if (nextBtn) nextBtn.addEventListener('click', function() { stopAutoPlay(); nextSlide(); startAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', function() { stopAutoPlay(); prevSlide(); startAutoPlay(); });
    document.querySelectorAll('.testimonial-dot').forEach(function(dot, index) {
        dot.addEventListener('click', function() { stopAutoPlay(); testimonialState.currentIndex = index; updateSlider(); startAutoPlay(); });
    });
    
    var touchStartX = 0;
    track.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; stopAutoPlay(); }, { passive: true });
    track.addEventListener('touchend', function(e) {
        var touchEndX = e.changedTouches[0].clientX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) { if (diff > 0) nextSlide(); else prevSlide(); }
        startAutoPlay();
    });
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);
    window.addEventListener('resize', function() { testimonialState.currentIndex = 0; updateSlider(); });
    updateSlider();
    startAutoPlay();
}

// ===== ADD REVIEW =====
function openReviewModal() {
    var modal = document.getElementById('reviewModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(function() {
        var content = modal.querySelector('div[class*="transform"]');
        if (content) { content.classList.remove('scale-95', 'opacity-0'); content.classList.add('scale-100', 'opacity-100'); }
    }, 10);
}
function closeReviewModal() {
    var modal = document.getElementById('reviewModal');
    var content = modal ? modal.querySelector('div[class*="transform"]') : null;
    if (!modal) return;
    if (content) { content.classList.remove('scale-100', 'opacity-100'); content.classList.add('scale-95', 'opacity-0'); }
    setTimeout(function() { modal.classList.add('hidden'); }, 300);
}
function initReviewForm() {
    var form = document.getElementById('reviewForm');
    var starBtns = document.querySelectorAll('.star-btn');
    var ratingInput = document.getElementById('reviewRating');
    if (!form) return;
    
    starBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var rating = parseInt(btn.dataset.rating);
            if (ratingInput) ratingInput.value = rating;
            starBtns.forEach(function(b, i) {
                var icon = b.querySelector('i');
                if (i < rating) { icon.className = 'fas fa-star'; b.classList.add('text-gold'); b.classList.remove('text-gray-300'); }
                else { icon.className = 'far fa-star'; b.classList.remove('text-gold'); b.classList.add('text-gray-300'); }
            });
        });
    });
    starBtns.forEach(function(b) { var icon = b.querySelector('i'); icon.className = 'fas fa-star'; b.classList.add('text-gold'); b.classList.remove('text-gray-300'); });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = document.getElementById('reviewName').value.trim();
        var location = document.getElementById('reviewLocation').value.trim();
        var rating = parseInt(document.getElementById('reviewRating').value);
        var text = document.getElementById('reviewText').value.trim();
        if (!name || !location || !text) { showToast('Mohon lengkapi semua field', 'warning'); return; }
        
        var newReview = { name: name, location: location, rating: rating, text: text, date: new Date().toISOString() };
        var saved = localStorage.getItem('userReviews');
        var userReviews = saved ? JSON.parse(saved) : [];
        userReviews.push(newReview);
        localStorage.setItem('userReviews', JSON.stringify(userReviews));
        
        form.reset();
        if (ratingInput) ratingInput.value = 5;
        starBtns.forEach(function(b) { var icon = b.querySelector('i'); icon.className = 'fas fa-star'; b.classList.add('text-gold'); });
        closeReviewModal();
        showToast('Ulasan Anda berhasil ditambahkan! Terima kasih.', 'success');
        setTimeout(function() { initTestimonialSlider(); }, 500);
    });
}

// ===== HEADER SCROLL =====
function initHeader() {
    var header = document.getElementById('mainHeader');
    if (!header) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 80) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });
    var cartBtn = document.getElementById('cartBtn');
    var wishlistBtn = document.getElementById('wishlistBtn');
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (wishlistBtn) wishlistBtn.addEventListener('click', openWishlist);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        var loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.classList.add('hidden');
    }, 1200);
    
    loadFromStorage();
    initHeader();
    initSearch();
    initFilters();
    renderProductGrid();
    renderEditorsPick();
    updateCartUI();
    updateWishlistUI();
    initFAQ();
    initBackToTop();
    initNewsletter();
    initCookieBanner();
    initMobileNav();
    initTestimonialSlider();
    initReviewForm();
    checkDeepLink();
    preloadThumbnails();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(console.error);
    }
    console.log('✅ R2 Nusantara App initialized! Total products: ' + PRODUCTS.length);
});

// ===== ESC KEY HANDLER =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeQuickView(); closeCart(); closeWishlist(); closeCheckout(); closeLegalModal(); closeReviewModal();
    }
});