# Integrasi Apps-R2-Nusantara dengan Website Utama

Dokumen ini menjelaskan bagaimana repo `Apps-R2-Nusantara-` diposisikan sebagai pendamping website utama `R2-Nusantara`.

## Yang sudah diaktifkan

- Deploy otomatis GitHub Pages melalui GitHub Actions.
- Workflow berjalan setiap ada `git push` ke branch `main`.
- Artifact website diambil langsung dari root repository.
- Support `submodules: recursive` sudah disiapkan sehingga jika nanti `Apps-R2-Nusantara-` dijadikan submodule, workflow tidak perlu diubah lagi.

## Cara kerja sekarang

```text
Developer push ke main
        ↓
GitHub Actions berjalan
        ↓
Checkout repository + submodule
        ↓
Upload artifact Pages
        ↓
Deploy otomatis ke GitHub Pages
```

## URL produksi

https://gudangdistributormalang-r2nusantara.github.io/R2-Nusantara/

## Jika ingin Apps-R2-Nusantara menjadi submodule

Jalankan dari komputer lokal:

```bash
git submodule add https://github.com/gudangdistributormalang-r2nusantara/Apps-R2-Nusantara-.git apps

git commit -m "chore: add Apps-R2-Nusantara as submodule"
git push origin main
```

Karena workflow sudah memakai:

```yaml
submodules: recursive
```

maka konten submodule akan otomatis ikut ter-clone saat deploy.

## Pengaturan GitHub Pages

Buka:

**Settings → Pages**

Gunakan:

- **Source:** GitHub Actions

Jangan gunakan lagi **Deploy from a branch** karena sekarang deployment dikendalikan penuh oleh workflow otomatis.
