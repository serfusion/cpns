# TODO — Latihan SKD CPNS

Daftar kerja dan status tiap checkpoint. Setiap butir yang dicentang sudah di-push ke GitHub
(branch `claude/charming-gates-mu7s4i`). Kalau sesi terputus, lanjutkan dari butir pertama yang belum dicentang.

## 1. Aplikasi

- [x] Konfigurasi format ujian + peta materi hasil riset — `js/config.js`
- [x] Gambar figural (SVG) + pembangkit soal figural — `js/figural.js`
- [x] Mesin kuis: acak soal dan opsi, paket latihan/simulasi, penilaian, pembangkit deret angka — `js/engine.js`
- [ ] Penyimpanan progres (per soal, riwayat simulasi, lanjutkan sesi) — `js/storage.js`
- [ ] Tampilan — `index.html`, `css/style.css`, `js/app.js`
  - [ ] Beranda
  - [ ] Latihan per materi dengan koreksi langsung (salah = merah, benar = hijau, pembahasan)
  - [ ] Simulasi CAT 110 soal / 100 menit (nomor soal, sisa waktu, Simpan dan Lanjutkan, Selesai Ujian)
  - [ ] Hasil + ambang batas + pembahasan
  - [ ] Ulangi soal yang salah
  - [ ] Statistik dan riwayat
  - [ ] Peta materi (apa yang paling sering keluar) + sumber riset
  - [ ] Pengaturan (ambang batas bisa diubah kalau aturan 2026 terbit)
- [ ] Uji alur di browser (klik salah → merah, benar → hijau, acak, timer, skor)
- [ ] `scripts/validate.mjs` — cek struktur bank soal dan soal ganda
- [ ] `scripts/build.mjs` — gabung jadi satu file HTML (bisa dibuka offline di HP)
- [ ] README.md

## 2. Bank soal (target ±300 soal tulis tangan + soal figural dan deret yang dibangkitkan otomatis)

TWK — `data/twk.js`
- [ ] Nasionalisme
- [ ] Integritas
- [ ] Bela Negara
- [ ] Pilar Negara
- [ ] Bahasa Indonesia

TIU — `data/tiu.js`
- [ ] Analogi
- [ ] Silogisme
- [ ] Analitis
- [ ] Berhitung
- [ ] Deret Angka (sebagian dibangkitkan otomatis)
- [ ] Perbandingan Kuantitatif
- [ ] Soal Cerita
- [x] Figural: analogi, ketidaksamaan, serial (dibangkitkan otomatis oleh `js/figural.js`)

TKP — `data/tkp.js`
- [ ] Pelayanan Publik
- [ ] Jejaring Kerja
- [ ] Sosial Budaya
- [ ] Teknologi Informasi dan Komunikasi
- [ ] Profesionalisme
- [ ] Anti Radikalisme

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
