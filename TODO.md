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

## 2. Bank soal (saat ini 545 soal tulis tangan + soal figural, deret, TWK, dan silogisme yang dibangkitkan otomatis)

TWK — `data/twk.js`
- [x] Nasionalisme (20 soal)
- [x] Integritas
- [x] Bela Negara
- [x] Pilar Negara
- [x] Bahasa Indonesia

TIU — `data/tiu.js`
- [x] Analogi (kisi-kisi 2024; tidak masuk tryout 2026)
- [x] Silogisme
- [x] Penalaran Induktif (baru 2026, 16 soal)
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
- [x] Pemindaian 20 Nov 2026 dengan rumus dokumen riset pengguna: validasi tabel 5.1/5.2, skor sementara per jabatan (tanpa rasio),
      instansi yang dipantau, kalkulator skor 100 poin; dokumen `docs/pemindaian-formasi-cpns-2026.md` + PDF (dilampirkan ke rilis APK)
- [x] Prioritas Pemda 22 Nov 2026 (dokumen strategi Pemda pengguna): status pemda, Kota Tangerang, daerah sepi, matriks Pemda di kalkulator;
      dokumen `docs/prioritas-formasi-pemda-2026.md` + PDF
- [ ] Begitu SSCASN menampilkan formasi 2026 (kini ditargetkan 23–29 Nov 2026): perbarui `status`, `jabatan`, `pantau`, dan `target` di
      `data/formasi.js` serta dokumen di `docs/`, lalu buat ulang PDF dengan `node scripts/dokumen-pdf.cjs`
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

## 6. Mode belajar dan TWK HOTS — 22 November 2026

- [x] Mode belajar di ujian CAT: koreksi langsung di bawah soal (tanpa pop-up), jawaban terkunci setelah dikoreksi, bisa dimatikan
- [x] Cek sumber data situs formasi pihak ketiga (jadiasn.id memakai server sendiri, disalin dari SSCASN) dan daftar formasi resmi SSCASN
- [x] 31 soal TWK HOTS 2026 (`b: 1` di `data/twk.js`) + saringan "TWK HOTS 2026 saja" di menu Latihan
- [x] 42 soal TKP HOTS 2026 dan 14 soal TWK HOTS tambahan (fakta pilar, sejarah, EYD)
- [x] Kartu Fokus TWK + TKP di menu Latihan; TIU tanpa hitungan berat
- [x] Bagian Kandidat formasi 2026 + `docs/kriteria-pemindaian-otomatis.md`; pemantau terjadwal tiga kali sehari
- [ ] Pemantau terjadwal: isi `kandidat2026` begitu formasi terbit, lalu matikan jadwal setelah pendaftaran ditutup

## 7. Sangat sering keluar, soal acak, audio per bagian — 23 November 2026

- [x] Riset lintas tahun: kisi-kisi 2021/2023/2024/kedinasan 2026 sama; laporan peserta yang bisa diperiksa hanya SKD 2024
  (AyoJakarta 3 rangkuman, ASN Institute, Analitica) dan kedinasan 2026. Tabel frekuensi di `docs/pola-soal-lintas-tahun.md` (+ PDF).
- [x] `h: 2` = sangat sering keluar (3+ laporan), `h: 1` = sering keluar. 118 soal bertanda `h: 2`; 16 soal baru (8 TKP, 4 TWK, 4 inti kalimat).
- [x] `data/fakta.js` + `js/acak.js`: pembangkit TWK (kasus sila, butir Pancasila, wewenang lembaga, pasal UUD, sejarah, hari nasional,
  kata baku) dan silogisme (kategoris dan jika-maka) yang dibuktikan dengan memeriksa semua model. `gen` di `js/config.js`:
  nas 0.3, pilar 0.35, bind 0.2, sil 0.35. Filter mesin: `sangat`, `acak`.
- [x] Menu Latihan: kartu "Sangat sering keluar" dan "Soal acak", centang "Sangat sering keluar saja"; label "Sangat sering keluar" dan "Soal acak" di soal.
- [x] Audio: maksimal 10 soal per berkas, hanya materi tanpa hitungan, tiga album (sangat sering, per materi, fakta TWK).
- [ ] Bila kisi-kisi CPNS 2026 terbit: cocokkan materi, perbarui `config.riset` dan tabel frekuensi bila ada laporan peserta baru.
- [x] TKP diperbarui: 8 sumber FR asli SKD 2024 (S1–S6 via romisaputra, ASN Institute, Analitica). 28 soal TKP baru (24 sangat sering,
  4 sering) dan 21 soal lama dinaikkan; TKP sangat sering keluar sekarang 61. Laporan TKP 2023/kedinasan 2025/2026 tidak ditemukan.
- [x] TWK dan TIU dihitung ulang dari 7 sumber asli. TWK: 17 soal baru (penerapan pasal, inti kalimat, kata bercetak miring dengan
  penanda `_kata_`, Hatta di BPUPKI, rapat Ikada, bacaan) dan soal lama naik tingkat. TIU: pembangkit analogi (`fakta.analogi`) dan
  analitis (baris, antrean, meja bundar; diperiksa ke semua permutasi); analogi, deret, dan perbandingan naik tingkat.
- [x] 24 Nov 2026: pemda tidak membuka formasi 2026–2027 (MenPANRB). Fokus pendidikan: `pendidikan` di `data/formasi.js`, bagian
  "Fokus pendidikan 2026" di menu Formasi, kolom `bidang` di kalkulator dan kandidat (tugas 20, SKB 5), urutan E1–E3 di kriteria pemindaian.
- [x] Sesuaikan dengan KepmenPANRB 674/2026 (kisi-kisi dan ambang batas 2026) dan pengumuman formasi 25 November 2026
- [x] 26 Nov 2026: 96 soal tambahan kisi-kisi 2026 (TWK 39, TKP 30, TIU logika 27), pembangkit analitis kombinasi, bentuk silogisme diperluas, kartu "Soal baru kisi-kisi 2026"
- [x] 27 Nov 2026: menu Formasi, bagian "Data CPNS 2024 dan tahun sebelumnya": riwayat resmi lintas tahun (MA 2021/2023, Kemensetneg 2019,
  Kemenko PMK 2019, PPATK 2023), riwayat nasional sejak 2000-an, dan 56 kementerian/lembaga (resmi + perkiraan berentang; cara hitung
  di `model`, `data/skd2024.js`). Laporan yang menolak akses (BPS, Kemenag, Komdigi, BKN, Bappenas, dll.) tetap belum termasuk.
- [x] 27 Nov 2026: menu Gaji & tunjangan (REA dari situs pembanding, angka dari dokumen resmi): kalkulator CPNS/PNS, peringkat instansi,
  tabel tukin per kelas (pola A–D, 53 instansi), tabel gaji pokok PP 5/2024. Belum terbaca: Kemenkes, Kemenkeu (peringkat 1–27), Kemlu,
  Kementan, Kemenhub, Kemenperin, Kemendag, BSSN, Kejaksaan, MA, BPKP, KemenPANRB, Bappenas, Kemensos, BPOM, BMKG, BRIN, BKN, BPK.
- [ ] Bila PP gaji baru atau Perpres tukin baru terbit: perbarui `data/tunjangan.js` (generator di luar repo, angka dibaca dari salinan resmi).
- [x] 28 Nov 2026: Pindai SSCASN di APK (`ScanActivity` + `js/pindai.js`), hasil bawaan `data/sscasn2026.js`, `kandidat2026` terisi
  (BPK: Pranata Humas Ahli Pertama 13 + 5 kursi, Analis Kerja Sama Ahli Pertama 5 kursi), `docs/kandidat-formasi-cpns-2026.md` (+ PDF).
- [x] 28 Nov 2026 (koreksi): formasi dibaca teliti dari pengumuman/lampiran resmi 8 instansi -> `data/dok2026.js` (generator
  `tools/gen_dok2026.py` di luar repo). S-1 Ilmu Komunikasi 489 kursi: Kemenkum 217, BPKP 172, Kemenkeu 67, BPK 23, Kemenkop 10.
  Versi sebelumnya hanya menghitung yang tampil di SSCASN (BPK 23). Bagian Formasi kini memakai data pengumuman + SSCASN.
- [ ] Saat 16 instansi lain (daftar di `SKD.dok2026.belum`) menerbitkan rincian formasi: baca pengumuman/lampirannya dengan teliti,
  tambahkan ke `scripts/dok2026/sumber.json`, lalu `python3 scripts/dok2026/buat.py`. Jadwal "Cek Google Drive formasi CPNS 2026"
  memeriksa folder Drive pemilik berkala (lihat `scripts/dok2026/README.md`).
- [x] 28 Nov 2026: pemindai harian di cloud dimatikan; SSCASN dipindai VPS tiap 6 jam, folder Drive dicek VPS (`live/drive.json`)
  dan dibaca teliti oleh jadwal "Cek Google Drive formasi CPNS 2026".
- [x] 28 Nov 2026: Kalkulator formasi (REA), login CAT + konfirmasi data peserta, layar ujian HP (lembar daftar soal, tombol
  menempel di bawah), footer "by Superfaldev", validasi tingkat kesulitan + 83 soal setara CAT + Tryout Setara CAT.
- [x] 28 Nov 2026: Paket setara CAT 2–5 (`data/setara2.js`–`setara5.js`, `pk`), daftar Paket 1–5 di menu Tryout dengan skor
  terbaik per paket, pilihan paket di Hafalan versi persis.
- [ ] Paket setara 6 dan seterusnya bila paket 1–5 sudah hafal (aturan sama, `pk: 6`).
- [ ] Tulis ulang opsi pengecoh soal TKP/TWK lama yang jawaban terbaiknya jauh lebih panjang (mulai dari `h: 2`).
- [ ] Saat instansi lain menampilkan formasi: perbarui `data/sscasn2026.js` (jalankan SCANNER sebagai pengunjung, lalu
  `tools/gen_sscasn2026.cjs` di luar repo) dan tahapan seleksinya dari pengumuman resmi; uji APK di HP (layar pindai).
- [x] 28 Nov 2026: tampilan diringkas (permintaan pemilik: teks dan menu terlalu banyak). Laci 12 menu diganti 5 tab datar
  (Beranda, Tryout, Latihan, Hafalan, Formasi; di HP tab di bawah). REA dari situs pencari formasi (pengunjung): judul pendek +
  satu baris angka, label kecil kapital, kartu dengan kotak angka, kotak cari dan pil. Latihan jadi satu formulir (subtes, jenis,
  materi, jumlah); Kalkulator + Strategi formasi + Gaji jadi tab Formasi; Peta materi dan Strategi formasi dilepas; jumlah kata
  di HP: Beranda 141 -> 23, Tryout 356 -> 44, Latihan 666 -> 48, Formasi 15.958 -> 755, Gaji 1.730 -> 486.
- [x] 28 Nov 2026: tiga versi (permintaan pemilik): 1 Persis CAT BKN, 2 Ringkas tryout, 3 Hafalan cepat (`data/cepat.js`: 229 baris
  dari catatan notepad pemilik yang dirapikan/dikoreksi + tabel `data/fakta.js`, ditambah 80 kata baku). Beranda menampilkan
  ketiganya; kartu soal Hafalan kalimat dilepas. Teks Tryout/Formasi/Gaji dipangkas lagi (tanpa "Belum dikerjakan", tanpa
  kotak pengumuman, pil formasi hanya keketatan + gaji, peringkat gaji cukup singkatan instansi).
- [ ] Tambah baris Hafalan cepat bila pemilik mengirim catatan baru (gaya `kunci = jawaban`, cek fakta dulu).
