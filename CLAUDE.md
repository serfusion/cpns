# Catatan untuk Claude: Latihan Soal Pejuang NIP (repo cpns)

Pemilik berbahasa Indonesia. Jawab singkat dan jelas.

## Tempat aplikasi berjalan
- **APK** (GitHub Actions `apk.yml`, rilis `apk-<nomor>`): bawaan memuat **versi online** dari
  `https://superfal-dev.com/tools/pejuang-nip/` (Exclusive di portofolio, kunci sama dengan studio), dan jatuh ke salinan bawaan
  APK bila VPS tidak bisa dihubungi. Pilihan Online/Offline ada di Pengaturan.
- **Web/online**: file hasil build disalin ke repo **serfusion/portofolio** (`projects/portofolio/tools/pejuang-nip/index.html`),
  dijaga Caddy `forward_auth` ke `/cek` panel studio (repo serfusion/Content-Creator-Motion, dict `LUAR["pejuang-nip"]`).
- **Pemindai SSCASN di VPS** (tiap 6 jam): `projects/pejuang-nip/pindai/` di repo portofolio memakai salinan `js/pindai.js`
  (fungsi SCANNER dan `olah`), hasilnya `tools/pejuang-nip/live/pindai.json` yang dibaca aplikasi online. Sesudahnya
  `drive-vps.cjs` mengecek folder Google Drive dokumen formasi dan menulis `live/drive.json` (berkas baru/berubah + petunjuk).
- **Tidak ada lagi pemindai harian di cloud** (dimatikan 28 Nov 2026 atas permintaan pemilik): SSCASN dipindai VPS. Yang tetap
  di cloud hanya jadwal "Cek Google Drive formasi CPNS 2026" untuk membaca teliti dokumen baru.

## Alur setiap ada perubahan
1. Ubah sumber di repo ini, lalu `node scripts/validate.mjs` dan `node scripts/build.mjs` (menghasilkan `dist/latihan-skd.html`).
2. Uji di Chromium (Playwright) ukuran HP 360 px dan komputer, pastikan tanpa galat konsol dan tanpa geser samping.
3. Commit dan push ke cabang kerja (APK dibangun otomatis).
4. Supaya versi online ikut terbarui: salin `dist/latihan-skd.html` ke portofolio
   `projects/portofolio/tools/pejuang-nip/index.html`, `js/pindai.js` ke `projects/pejuang-nip/pindai/pindai.js`, dan
   `scripts/dok2026/drive.json` ke `projects/pejuang-nip/pindai/drive-dibaca.json`,
   commit dan push langsung ke `main` portofolio, lalu tutup jawaban dengan perintah VPS:
   ```bash
   sudo bash ~/portofolio/deploy/superfal/perbarui.sh
   ```

## Data formasi CPNS 2026
- `data/dok2026.js`: formasi dari pengumuman/lampiran resmi, dibuat `scripts/dok2026/buat.py` dari `scripts/dok2026/sumber.json`
  (jangan ubah `data/dok2026.js` langsung). Hitung S-1 Ilmu Komunikasi hanya bila nama prodi tertulis persis "S-1 Ilmu Komunikasi";
  prodi mirip (Komunikasi dan Pengembangan Masyarakat, Ilmu Sosial Politik, D-III) masuk "hampir cocok".
- Dokumen sumbernya ditaruh pemilik di folder Google Drive `14gi0jtT7ihMmOmh5E2OXZVSZRhSEZ_e_` dan terus bertambah. Jadwal
  "Cek Google Drive formasi CPNS 2026" memeriksanya berkala; langkah dan alatnya di `scripts/dok2026/README.md`, berkas yang sudah
  dibaca di `scripts/dok2026/drive.json`. Baca seluruh halaman tiap berkas baru (termasuk lampiran penempatan).
- `data/sscasn2026.js`: hasil pindai SSCASN bawaan. Pindai hanya sebagai pengunjung biasa: jangan memanggil API SSCASN langsung,
  memalsukan header, menembus captcha/pemblokiran, atau login; bila diblokir, hentikan dan laporkan.

## Soal dan tingkat kesulitan
- Prioritas pemilik: TWK dan TKP; TIU tanpa hitungan/angka rumit.
- Soal baru ditulis seperti `data/setara.js` (v: 1): kasus kerja nyata, kelima opsi sama panjang (dicek `validate.mjs`), pengecoh
  masuk akal. Audit: `node scripts/audit-kesulitan.mjs`; hasil dan pembanding resmi BKN di `docs/validasi-tingkat-kesulitan.md`.
- Soal lama (twk.js/tkp.js) punya isyarat panjang opsi (jawaban terbaik sering terpanjang): jangan menulis soal baru dengan pola itu.

## Kunci
- Kunci Exclusive hanya di VPS (`/etc/superfal/kunci`). JANGAN pernah menulis kunci/password di repo, commit, atau pesan.
