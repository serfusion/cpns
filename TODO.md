# TODO — Latihan SKD CPNS

Daftar kerja dan status tiap checkpoint. Setiap butir yang dicentang sudah di-push ke GitHub
(branch `claude/charming-gates-mu7s4i`, lalu `claude/admiring-cerf-9bgc4h` untuk menu Formasi). Kalau sesi terputus, lanjutkan dari butir pertama yang belum dicentang.

## 1. Aplikasi

- [x] Konfigurasi format ujian + peta materi hasil riset — `js/config.js`
- [x] Gambar figural (SVG) + pembangkit soal figural — `js/figural.js`
- [x] Mesin kuis: acak soal dan opsi, paket latihan/simulasi, penilaian, pembangkit deret angka — `js/engine.js`
- [x] Penyimpanan progres (per soal, riwayat simulasi, lanjutkan sesi) — `js/storage.js`
- [x] Tampilan — `index.html`, `css/style.css`, `js/app.js`
  - [x] Beranda
  - [x] Latihan per materi dengan koreksi langsung (salah = merah, benar = hijau, pembahasan)
  - [x] Simulasi CAT 110 soal / 100 menit (nomor soal, sisa waktu, Simpan dan Lanjutkan, Selesai Ujian)
  - [x] Hasil + ambang batas + pembahasan
  - [x] Ulangi soal yang salah
  - [x] Statistik dan riwayat
  - [x] Peta materi (apa yang paling sering keluar) + sumber riset
  - [x] Pengaturan (ambang batas bisa diubah kalau aturan 2026 terbit)
- [x] Uji alur di browser (klik salah → merah, benar → hijau, acak, timer, skor)
- [x] `scripts/validate.mjs` — cek struktur bank soal dan soal ganda
- [x] `scripts/build.mjs` — gabung jadi satu file HTML (bisa dibuka offline di HP)
- [x] README.md

## 2. Bank soal (saat ini 230 soal tulis tangan; bisa terus ditambah + soal figural dan deret yang dibangkitkan otomatis)

TWK — `data/twk.js`
- [x] Nasionalisme (20 soal)
- [x] Integritas
- [x] Bela Negara
- [x] Pilar Negara
- [x] Bahasa Indonesia

TIU — `data/tiu.js`
- [x] Analogi
- [x] Silogisme
- [x] Analitis
- [x] Berhitung
- [x] Deret Angka (sebagian dibangkitkan otomatis)
- [x] Perbandingan Kuantitatif
- [x] Soal Cerita
- [x] Figural: analogi, ketidaksamaan, serial (dibangkitkan otomatis oleh `js/figural.js`)

TKP — `data/tkp.js`
- [x] Pelayanan Publik
- [x] Jejaring Kerja
- [x] Sosial Budaya
- [x] Teknologi Informasi dan Komunikasi
- [x] Profesionalisme
- [x] Anti Radikalisme

## 3. Catatan untuk melanjutkan

### Format data soal

```js
// TWK dan TIU: o[0] SELALU jawaban benar. Opsi diacak otomatis saat ditampilkan.
SKD.add("twk", [
  { m: "nas", h: 1, q: "Teks soal ...", o: ["jawaban benar", "pengecoh", "pengecoh", "pengecoh", "pengecoh"], x: "Pembahasan." },
]);

// TKP: o diurutkan dari 5 poin (o[0]) sampai 1 poin (o[4]).
SKD.add("tkp", [
  { m: "pel", q: "Situasi ...", o: ["5 poin", "4 poin", "3 poin", "2 poin", "1 poin"], x: "Pembahasan." },
]);
```

- `m` = kode materi (lihat `js/config.js`): `nas int bela pilar bind` · `ana sil anl hit der pk cer` · `pel jej sos tik pro rad`
- `h: 1` = pola soal yang paling sering dilaporkan keluar (dipakai paket "Soal prioritas")
- `p: "kunci"` = soal memakai bacaan dari `SKD.addPassages({ kunci: "teks bacaan" })`
- `fix: 1, a: 2` = urutan opsi tidak diacak dan jawaban benar ada di indeks `a` (dipakai Perbandingan Kuantitatif)
- `tb: { h: [...], r: [[...]] }` = tabel pada soal

### Riset (16 November 2026)

- CPNS 2026 diumumkan 6 Nov 2026; aturan ambang batas SKD khusus 2026 belum terbit.
- Acuan terakhir: KepmenPANRB 321/2024 — 110 soal, 100 menit, TWK 30 (min 65), TIU 35 (min 80), TKP 45 (min 166).
- Soal CAT BKN rahasia dan diacak per peserta, jadi yang bisa dipetakan adalah materi dan pola soal
  yang paling sering dilaporkan peserta. Rinciannya ada di `js/config.js` (bagian `riset` dan `pola`).
- Soal ditulis orisinal mengikuti kisi-kisi dan gaya soal e-book TWK milik pengguna
  (e-book itu bertanda "tidak untuk dijual ulang", jadi isinya tidak disalin ke repo).

## 4. Strategi formasi (menu Formasi) — 18 November 2026

- [x] Pindai status CPNS 2026 dan formasi CPNS 2024 yang menerima S-1 Ilmu Komunikasi — `data/formasi.js`
- [x] Halaman Formasi: status, cek profil, peringkat target, peta jabatan, aturan memilih, kalkulator peluang, langkah, jalur lain — `js/formasi.js`
- [ ] Begitu SSCASN menampilkan formasi 2026 (diperkirakan 20–23 Nov 2026): perbarui `status`, `jabatan.bukti`, dan `target` di `data/formasi.js` dengan formasi 2026 yang menerima S-1 Ilmu Komunikasi
- [ ] Setelah KepmenPANRB ambang batas SKD 2026 terbit: perbarui ambang batas di `js/config.js`

Catatan data: angka 2024 diambil dari lampiran pengumuman Kemendikbudristek, Kemensetneg/Setkab, Bawaslu, dan rekap hasil akhir BKN untuk Mahkamah Agung
(lihat daftar `sumber` di `data/formasi.js`). Penilaian persaingan adalah analisis, bukan data resmi. Isian pengguna di halaman ini
disimpan di localStorage dengan kunci `skd.formasi.v1` (tidak ikut sinkron).

## 5. Rombak tampilan (teknik REA, clean room) — 20 November 2026

- [x] Study: ukur tampilan acuan sebagai pengunjung (font, warna, jarak); layar ujian dari buku panduan CAT resmi BKN
- [x] Build: `js/app.js` ditulis ulang (beranda, tryout paket, persiapan, ujian CAT, nilai, hasil, pembahasan, lembar), `css/style.css` baru,
      `js/lembar.js` (gambar lembar hasil), font Plus Jakarta Sans lokal (`fonts/`, OFL) disisipkan saat build
- [x] Check: alur penuh diuji di Chromium (paket tetap deterministik, jawaban baru tersimpan setelah Simpan dan Lanjutkan,
      Selesai Ujian aktif setelah semua dijawab, tanpa galat, tanpa gulir samping di 360–1366 px, mode gelap)
- [ ] Uji APK di HP: simpan/bagikan lembar hasil (Android 10 ke atas), tampilan font offline
