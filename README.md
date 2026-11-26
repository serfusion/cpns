# Latihan SKD CPNS

Aplikasi web latihan SKD CPNS (TWK, TIU, TKP) yang meniru alur ujian CAT.

## Fitur

Tampilan dirombak dengan teknik REA (*Craft Anything*): **Study** (tampilan acuan diukur sebagai pengunjung: font Plus Jakarta Sans,
navy + kuning amber; layar ujian dari buku panduan CAT resmi BKN), **Build** (kode sendiri, tanpa menyalin kode, logo, atau merek acuan),
**Check** (tangkapan layar dibandingkan dengan acuan dan diuji di Chromium), **Ready** (APK).

- **Beranda gaya dasbor**: sapaan dengan nama Anda, jumlah tryout dan skor terbaik, kartu *Hasil terakhir* dengan batang skor per subtes
  dan garis ambang batas, riwayat tryout.
- **Tryout SKD Paket 1–6**: paket tetap (soal, urutan, dan pilihan selalu sama, jadi kemajuan bisa dibandingkan), tryout acak, dan paket setengah.
- **Layar ujian seperti CAT BKN**: halaman informasi peserta sebelum mulai; baris informasi ujian (nomor peserta, nama, batas waktu,
  jumlah soal, soal dijawab, belum dijawab, Selesai Ujian, sisa waktu); submateri di atas *Soal No.*; pilihan bulat A–E; jawaban baru
  tersimpan setelah **Simpan dan Lanjutkan**; **Lewatkan soal ini**; kotak nomor merah/hijau berisi huruf jawaban, berhalaman 40 nomor
  dengan tombol On/Off; Selesai Ujian aktif setelah semua soal dijawab; dialog konfirmasi dan halaman nilai bergaya CAT.
- **Mode belajar** (aktif bawaan, bisa dimatikan di layar ujian): setelah Simpan dan Lanjutkan, jawaban yang salah langsung dibenarkan di soal itu
  (opsi benar hijau, pilihan salah merah) dan pembahasan muncul di bawahnya, tanpa jendela pop-up.
- **TWK HOTS 2026**: 31 soal kasus panjang dengan pilihan mirip dan konteks terkini (KUHP baru, putusan MK 2025, keamanan siber, deepfake,
  gratifikasi, pelindungan data pribadi, EYD Edisi V); bisa dilatih terpisah lewat centang "TWK HOTS 2026 saja" di menu Latihan.
- **TKP HOTS 2026**: 42 soal kasus panjang untuk keenam aspek TKP; centang "TKP HOTS 2026 saja" di menu Latihan.
- **Fokus TWK + TKP**: kartu strategi skor (ambang batas dan target per subtes) dengan latihan TWK + TKP HOTS,
  TWK + TKP campuran, dan TIU tanpa hitungan berat (analogi, silogisme, analitis, deret, figural).
- **Sangat sering keluar**: 216 soal bertanda khusus (TWK 92, TIU 63, TKP 61) (pola yang dilaporkan di 3 laporan peserta SKD 2024 atau lebih) dengan
  tombol latihan ulang: campuran tanpa hitungan, TWK, TKP, TIU tanpa hitungan. Metode dan tabel frekuensinya di
  `docs/pola-soal-lintas-tahun.md`.
- **Soal acak (selalu berbeda)**: TWK dibangkitkan dari tabel fakta `data/fakta.js` (45 butir Pancasila, 33 wewenang lembaga negara,
  45 pasal UUD, sejarah BPUPKI/PPKI dan pergerakan, hari nasional, kata baku) dan silogisme yang kesimpulannya dibuktikan otomatis
  (`js/acak.js`), serta TIU tanpa hitungan: analogi kata (9 jenis hubungan) dan susunan duduk/antrean yang jawabannya diperiksa
  ke semua susunan yang mungkin. Sebagian soal tryout dan latihan juga diambil dari sini.
- **Kandidat formasi 2026**: diisi pemantau terjadwal begitu formasi resmi terbit (aturan di `docs/kriteria-pemindaian-otomatis.md`),
  lalu diurutkan aplikasi dengan matriks Pemda dan rumus dokumen riset.
- **Hasil + analisis per topik** (TWK per materi, TIU Verbal/Numerik/Figural, TKP per aspek) dan **pembahasan** (disimpan untuk 3 tryout terakhir).
- **Lembar hasil** 1080×1350 dengan stempel LOLOS/BELUM LOLOS, selisih terhadap ambang batas, topik terkuat dan perlu dilatih;
  di APK bisa disimpan ke Galeri atau dibagikan.
- **Latihan per materi** dengan koreksi langsung, **ulangi soal salah**, **riwayat & statistik**, **peta materi**, **strategi formasi**, **audio hafalan**.
- Soal figural, deret angka, dan **jaring-jaring kubus** dibangkitkan otomatis dari aturan, jadi kuncinya pasti benar.
- Ambang batas 65 / 80 / 166 mengikuti KepmenPANRB 674/2026 (kebutuhan umum) dan bisa diubah di Pengaturan.
- Kartu **Soal baru kisi-kisi 2026** di menu Latihan: 120 soal yang disusun dari rumusan resmi 2026 (TWK, TKP, dan TIU logika).
- Materi mengikuti kisi-kisi SKD 2026 (KepmenPANRB 674/2026): TIU verbal silogisme, **penalaran induktif**, analitis; figural serial,
  analogi, **penalaran matriks**; perbandingan kuantitatif dua atau tiga data; TWK empat konsensus kebangsaan dan bahasa Indonesia
  untuk mengevaluasi informasi; TKP adaptasi TIK. Analogi kata dan ketidaksamaan gambar (kisi-kisi 2024) tetap ada untuk latihan,
  tetapi tidak masuk tryout.

## Strategi formasi CPNS 2026

Menu **Strategi formasi** memindai formasi untuk lulusan S-1 Ilmu Komunikasi dengan rumus dokumen riset pengguna
(rasio 35, jumlah kursi 20, kecocokan tugas 20, lokasi 10, syarat dan risiko 15): status resmi CPNS 2026, validasi angka dokumen riset,
skor sementara per jabatan, instansi yang dipantau, dan kalkulator skor per formasi. Datanya di `data/formasi.js`.

Bagian **Prioritas Pemda** mengikuti dokumen strategi Pemda pengguna (Prioritas 1 jabatan/unit baru, 2 Kota Tangerang, 3 daerah sepi pesaing),
dan kalkulator juga menghitung matriks Pemda (pendidikan 25, jumlah formasi 20, jabatan/unit baru 20, persaingan 15, mekanisme 10, kesiapan SKB 10).

Sejak 23 November 2026 MenPANRB memastikan formasi CPNS 2026–2027 hanya dari instansi pusat (pemda tidak membuka). Bagian
**Fokus pendidikan 2026** di menu Formasi mengurutkan sasaran sesuai pengalaman data akademik/PDDikti: tenaga kependidikan
Sekolah Nasional Terintegrasi (Kemendikdasmen), LLDIKTI/PTN/SMA Unggul Garuda (Kemendiktisaintek), pendidikan Kemenag, lalu
jabatan pelatihan di instansi pusat. Formasi bidang pendidikan mendapat nilai tugas dan kesiapan SKB tertinggi di kedua rumus.

Dokumen lengkapnya: `docs/pemindaian-formasi-cpns-2026.md`, `docs/prioritas-formasi-pemda-2026.md`, dan
`docs/strategi-formasi-pendidikan-2026.md`; versi PDF-nya ikut terlampir di setiap rilis APK.
Membuat ulang PDF: `node scripts/dokumen-pdf.cjs docs/pemindaian-formasi-cpns-2026.md` (butuh pandoc dan Playwright).

## Audio hafalan

Audio dipecah per bagian: setiap MP3 paling banyak 10 soal (sekitar 7 menit), jadi bila berhenti di tengah cukup lanjut dari
bagian berikutnya. Hanya materi tanpa hitungan (TWK, TIU analogi dan silogisme, TKP). Setiap soal dibacakan, ada jeda untuk
menjawab dalam hati, lalu jawaban benar (TKP: jawaban terbaik dan yang harus dihindari) dan pembahasan.

Tiga album di setiap rilis *Audio Hafalan SKD*:

- `audio-1-sangat-sering.zip`: soal sangat sering keluar, untuk diulang-ulang.
- `audio-2-per-materi.zip`: semua soal per materi, dimulai dari yang paling sering keluar.
- `audio-3-fakta-twk.zip`: pasal UUD, wewenang lembaga negara, 45 butir Pancasila, sejarah, hari nasional.

Dibuat otomatis oleh GitHub Actions (`.github/workflows/audio.yml`) setiap bank soal berubah, memakai Piper TTS dengan suara
`id_ID-news_tts-medium`. Membuat sendiri: `node scripts/audio-teks.mjs > naskah.json` lalu
`python scripts/audio.py naskah.json model.onnx audio` (butuh `pip install piper-tts==1.8.0` dan ffmpeg).

## Unduh APK (Android)

APK dibangun otomatis oleh GitHub Actions setiap ada push (`.github/workflows/apk.yml`).

1. Buka halaman **Releases** repo ini: https://github.com/serfusion/cpns/releases
2. Pilih rilis terbaru *Latihan SKD APK*, unduh `latihan-skd.apk`.
3. Di HP Android, buka file itu dan izinkan *Instal dari sumber tidak dikenal* bila diminta.

Alternatif: tab **Actions** → *Build APK* → run terbaru → bagian *Artifacts* → `latihan-skd-apk`.

Kode Android ada di folder `android/` (WebView yang memuat `dist/latihan-skd.html`, bisa dipakai offline, plus jembatan kecil untuk menyimpan lembar hasil ke Galeri).

## Menjalankan

Buka `index.html` di browser, atau jalankan server lokal:

```bash
python3 -m http.server 8000
```

Versi satu file (bisa dikirim ke HP dan dibuka offline):

```bash
node scripts/build.mjs
```

Validasi bank soal setelah menambah soal:

```bash
node scripts/validate.mjs
```

## Menambah soal

Lihat format di `TODO.md`. Soal TWK/TIU: `o[0]` selalu jawaban benar. Soal TKP: `o` urut dari 5 poin ke 1 poin.

Catatan: soal disusun orisinal mengikuti kisi-kisi SKD, bukan soal resmi BKN. Kunci TKP disusun dari definisi aspek TKP dan nilai dasar ASN BerAKHLAK.
