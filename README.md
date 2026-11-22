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
- **Hasil + analisis per topik** (TWK per materi, TIU Verbal/Numerik/Figural, TKP per aspek) dan **pembahasan** (disimpan untuk 3 tryout terakhir).
- **Lembar hasil** 1080×1350 dengan stempel LOLOS/BELUM LOLOS, selisih terhadap ambang batas, topik terkuat dan perlu dilatih;
  di APK bisa disimpan ke Galeri atau dibagikan.
- **Latihan per materi** dengan koreksi langsung, **ulangi soal salah**, **riwayat & statistik**, **peta materi**, **strategi formasi**, **audio hafalan**.
- Soal figural, deret angka, dan **jaring-jaring kubus** dibangkitkan otomatis dari aturan, jadi kuncinya pasti benar.
- Ambang batas 65 / 80 / 166 (KepmenPANRB 321/2024) bisa diubah di Pengaturan bila aturan 2026 berbeda.

## Strategi formasi CPNS 2026

Menu **Strategi formasi** memindai formasi untuk lulusan S-1 Ilmu Komunikasi dengan rumus dokumen riset pengguna
(rasio 35, jumlah kursi 20, kecocokan tugas 20, lokasi 10, syarat dan risiko 15): status resmi CPNS 2026, validasi angka dokumen riset,
skor sementara per jabatan, instansi yang dipantau, dan kalkulator skor per formasi. Datanya di `data/formasi.js`.

Bagian **Prioritas Pemda** mengikuti dokumen strategi Pemda pengguna (Prioritas 1 jabatan/unit baru, 2 Kota Tangerang, 3 daerah sepi pesaing),
dan kalkulator juga menghitung matriks Pemda (pendidikan 25, jumlah formasi 20, jabatan/unit baru 20, persaingan 15, mekanisme 10, kesiapan SKB 10).

Dokumen lengkapnya: `docs/pemindaian-formasi-cpns-2026.md` dan `docs/prioritas-formasi-pemda-2026.md`; versi PDF keduanya ikut terlampir di setiap rilis APK.
Membuat ulang PDF: `node scripts/dokumen-pdf.cjs docs/pemindaian-formasi-cpns-2026.md` (butuh pandoc dan Playwright).

## Audio hafalan

Semua soal tulis dibacakan: soal, lalu jawaban benar (TKP: jawaban terbaik dan yang harus dihindari), lalu pembahasan.
Satu MP3 per materi, soal bertanda *Sering keluar* lebih dulu, total sekitar 2,5 jam. Dibuat otomatis oleh GitHub Actions
(`.github/workflows/audio.yml`) setiap bank soal berubah, memakai Piper TTS dengan suara `id_ID-news_tts-medium`.

Unduh di halaman **Releases**, rilis *Audio Hafalan SKD* terbaru: `audio-hafalan-skd.zip` atau per materi.

Membuat sendiri: `node scripts/audio-teks.mjs > naskah.json` lalu `python scripts/audio.py naskah.json model.onnx audio`
(butuh `pip install piper-tts==1.8.0` dan ffmpeg).

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
