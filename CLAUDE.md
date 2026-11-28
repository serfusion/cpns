# Catatan untuk Claude: Latihan Soal Pejuang NIP (repo cpns)

Pemilik berbahasa Indonesia. Jawab singkat dan jelas.

## Tempat aplikasi berjalan
- **APK** (GitHub Actions `apk.yml`, rilis `apk-<nomor>`): dipakai sendiri oleh pemilik, jadi **selalu memuat salinan bawaan
  APK tanpa kunci** (permintaan pemilik 28 Nov 2026). Kunci Exclusive hanya untuk versi web publik. Soal baru masuk APK lewat
  rilis APK baru (bisa dipasang menimpa, tanpa uninstal).
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

## Tampilan (permintaan pemilik 28 Nov 2026: "terlalu banyak tulisan, menu dari menu")
- Menu tetap 5 tab datar: Beranda, Tryout, Latihan, Hafalan, Formasi (di HP di bawah layar). Jangan menambah laci, menu baru, atau
  deretan tombol lompat. Fitur baru masuk sebagai pilihan di tab yang ada (seg/select), bukan kartu atau halaman baru.
- Teks sesingkat mungkin: judul pendek + satu baris `.meta` (angka tebal). Tanpa paragraf penjelasan; catatan cukup satu baris `.fine`.
- Gaya ikut REA situs pencari formasi sscasn.zainbuilds.app (dipelajari sebagai pengunjung): label `.lbl` kapital kecil, kotak angka
  `.sbox`, kartu putih radius 16, kotak cari `.cari`, pil `.pil`. Merek, warna navy + amber, kode, dan teks tetap milik sendiri.
- Peta materi dan Strategi formasi sudah dilepas (riset di `docs/`, `data/formasi.js` arsip, tidak dimuat).

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
- Dua versi dipertahankan: **Ringkas** (bank lama, soal pendek, untuk menghafal kalimat; tab Hafalan) dan **Persis CAT BKN**
  (`data/setara.js` sampai `data/setara5.js` = Paket 1–5 lewat `pk`, Tryout Setara CAT tanpa koreksi langsung). Soal ringkas
  jangan dihapus; soal persis ditambah bertahap. Paket baru: `data/setaraN.js` dengan `{ v: 1, pk: N }`, TWK 30 (nas 6, int 6,
  bela 6, pilar 7, bind 5) dan TKP 45 (pel 8, jej 7, sos 7, tik 7, pro 8, rad 8), daftarkan di `index.html`, `scripts/validate.mjs`,
  `scripts/audio-teks.mjs`, dan `scripts/audit-kesulitan.mjs`.
- Soal baru ditulis seperti `data/setara.js` (v: 1): kasus kerja nyata, kelima opsi sama panjang (dicek `validate.mjs`), pengecoh
  masuk akal. Audit: `node scripts/audit-kesulitan.mjs`; hasil dan pembanding resmi BKN di `docs/validasi-tingkat-kesulitan.md`.
- Soal lama (twk.js/tkp.js) punya isyarat panjang opsi (jawaban terbaik sering terpanjang): jangan menulis soal baru dengan pola itu.

## Kunci
- Kunci Exclusive hanya di VPS (`/etc/superfal/kunci`). JANGAN pernah menulis kunci/password di repo, commit, atau pesan.
