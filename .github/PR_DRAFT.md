# Draft Pull Request — Phase 1 UI/UX Upgrade

This draft PR will aggregate Phase 1 changes for the UI/UX upgrade: visual tokens, dark mode, quick view, wishlist, client-side search, PWA basics, and scaffolding for performance/image optimization.

What I added so far (branch: upgrade/ui-ux)
- index.html, assets/css/, assets/js/ (dark mode, quick view, wishlist, search)
- manifest.json, sw.js (PWA skeleton)
- products.json (sample data)
- scripts/convert_images.sh (helper to convert images into WebP variants)
- assets/images/README.md (instructions to add provided image assets)

Notes about images
- You uploaded 4 images via chat. I have not been able to attach the binary files directly into the repository via the automation due to platform restrictions for binary uploads from chat attachments. Please upload the 4 images to the following paths (or run the conversion script after uploading originals):
  - assets/logo/icon-192.png
  - assets/logo/icon-512.png
  - assets/images/brand/hero.webp
  - assets/images/products/sample-400.webp
  - assets/images/products/sample-800.webp
  - assets/images/products/sample-1200.webp

Next steps I will take after images are in the repo (I can do these if you prefer and grant binary upload permission):
- Commit optimized WebP variants and update srcset in product cards
- Generate responsive screenshots (desktop/tablet/mobile) and attach to PR
- Run basic accessibility checks and fix any contrast/focus issues
- Mark PR as Ready for review when Phase 1 QC is passed

Labels: enhancement, ui, pwa
Assignees: (none)
Reviewers: (none)

If you want me to continue and I should attempt to add binary images directly from the chat attachments, reply with `allow-binary-upload` and I will try to commit them. Otherwise, please upload the images to the paths above or let me know and I will provide a link to download the images and add them.
