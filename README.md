# Latihan SKD CPNS

Aplikasi web latihan SKD CPNS (TWK, TIU, TKP) yang meniru alur ujian CAT.

## Fitur

- **Koreksi langsung**: begitu memilih jawaban, pilihan salah jadi merah dan jawaban benar jadi hijau, lalu pembahasan muncul.
- **Semua diacak**: urutan soal dan urutan pilihan A–E diacak setiap kali.
- **Ulangi sampai benar**: soal yang salah muncul lagi beberapa nomor kemudian dengan pilihan diacak ulang, dan masuk daftar *Ulangi salah* sampai dijawab benar.
- **Simulasi CAT**: 110 soal (TWK 30, TIU 35, TKP 45), 100 menit, panel nomor soal, *Simpan dan Lanjutkan*, *Lewatkan soal ini*, *Selesai Ujian*. Bisa mode koreksi langsung atau mode ujian asli (koreksi di akhir). Ada paket setengah 55 soal / 50 menit.
- **Nilai & ambang batas**: TWK/TIU benar 5, salah 0; TKP 1–5 poin. Ambang batas 65 / 80 / 166 (KepmenPANRB 321/2024) bisa diubah di Pengaturan bila aturan 2026 berbeda.
- **Soal prioritas**: soal bertanda *Sering keluar* mengikuti pola yang paling banyak dilaporkan peserta SKD 2024.
- **Soal figural dan deret angka tanpa batas**: dibangkitkan otomatis dari aturan, jadi jawabannya pasti benar dan selalu baru.
- Statistik per materi, riwayat simulasi, peta materi + sumber riset, progres tersimpan dan sesi bisa dilanjutkan.
- **Strategi formasi CPNS 2026** (menu *Formasi*): jabatan yang terbukti menerima S-1 Ilmu Komunikasi (dari formasi dan rekap hasil CPNS 2024), peringkat target, aturan memilih formasi, cek profil (IPK, akreditasi saat lulus, usia, filter jabatan yang banyak bicara di depan orang), kalkulator peluang (rasio pelamar per kursi dan posisi yang harus dicapai untuk ikut SKB), daftar langkah, dan jalur non-CPNS. Data ada di `data/formasi.js`.

Bank soal: 277 soal tulis tangan (TWK 128, TIU 88, TKP 61) + soal figural, jaring-jaring kubus, dan deret otomatis. Semua kunci TWK/TIU sudah diperiksa ulang; soal logika baru diuji dengan pencarian menyeluruh.

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

Kode Android ada di folder `android/` (WebView sederhana yang memuat `dist/latihan-skd.html`, bisa dipakai offline).

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
