# Pull Request: Phase 1 — UI/UX Upgrade (Skeleton)

## Ringkasan
Menambahkan skeleton Phase 1 untuk upgrade UI/UX pada branch `upgrade/ui-ux`.
Fokus: visual upgrade awal, dark mode, quick view, mobile bottom navigation, PWA basics, dan scaffolding untuk fitur berikutnya.

Commit utama: chore(ui): add Phase 1 UI/UX skeleton (dark mode, quick view, mobile nav, PWA)
Commit: https://github.com/gudangdistributormalang-r2nusantara/R2-Nusantara/commit/895f4e60276b1b78adce8be4e147c3443ea579c8

## Perubahan utama
- index.html: hero, sample product card, quick view modal scaffold, bottom mobile nav, manifest & sw registration
- assets/css/main.css, assets/css/components.css: design tokens, dark-mode variables, responsive grid
- assets/js/app.js: dark-mode toggle (localStorage), quick view modal, recently viewed, stock indicator, addToCart placeholder
- assets/js/cart.js: sticky add-to-cart scaffold (mobile)
- manifest.json, sw.js: PWA skeleton
- README.md: ringkasan perubahan + cara test lokal

## Cara test
1. Checkout branch: `git fetch origin && git checkout upgrade/ui-ux`
2. Jalankan server statis: `npx serve .` atau `python3 -m http.server 5000`
3. Buka: http://localhost:5000
4. Cek: dark mode toggle, quick view modal, add-to-cart counter, bottom navigation (mobile), service worker registered

## Checklist Phase 1 (-> to review)
- [x] Add skeleton files (index, CSS, JS)
- [x] Dark mode toggle persisted in localStorage
- [x] Quick view modal scaffold
- [x] Mobile bottom nav + sticky add-to-cart scaffold
- [x] PWA manifest + basic service worker
- [ ] Replace placeholder images with optimized WebP
- [ ] Add wishlist UI & persistence
- [ ] Accessibility review (aria attributes, keyboard navigation)
- [ ] Add unit/e2e tests for new JS behavior (optional)

## Notes for reviewer
- Assets images/icons are placeholders; I'll replace with brand assets if provided.
- This is an initial visual/UX scaffold — many features (autocomplete, compare, real-time counters) are planned for Phase 2.

## Screenshots (placeholders)
- Please attach screenshots here after testing locally. If you want, I can generate screenshots and add them to this PR description.

---

If you want me to merge this PR after review, reply `merge` and I'll proceed (or I can open the PR as draft and request reviewers).