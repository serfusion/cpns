# Latihan SKD CPNS

Aplikasi web latihan SKD CPNS (TWK, TIU, TKP) yang meniru alur ujian CAT.

## Menu (5 tab)

Sejak 28 November 2026 menu dibuat datar dan ringkas (permintaan pemilik: teks dan menu terlalu banyak). Tata letaknya meniru
situs pencari formasi dengan teknik REA (dipelajari sebagai pengunjung; kode, teks, warna merek, dan data tetap milik aplikasi ini):
tab di bawah layar HP (di atas pada layar lebar), judul pendek + satu baris angka, label kecil huruf kapital, kartu dengan kotak angka.
Catatan studinya: `docs/rea-tampilan-ringkas.md` (kalkulator formasi: `docs/rea-kalkulator-formasi.md`).

| Tab | Isi |
|---|---|
| **Beranda** | Hasil terakhir (skor, TWK/TIU/TKP terhadap ambang batas), tombol langsung ke paket berikutnya, soal salah, 3 riwayat terakhir. |
| **Tryout** | Pilih versi **Persis CAT** (Paket 1–5, `data/setara*.js`, nilai di akhir) atau **Ringkas** (Paket 1–6, Acak, Setengah). Lalu layar Login Peserta, Konfirmasi Data Peserta, dan ujian seperti CAT BKN. |
| **Latihan** | Subtes, Jenis soal (semua, sangat sering keluar, sering keluar, kisi-kisi 2026, HOTS 2026, acak), Materi (termasuk TIU *tanpa hitungan*), Jumlah. Koreksi langsung + pembahasan. Tombol *Ulangi soal salah* muncul bila ada. |
| **Hafalan** | Kartu kalimat jawaban terbaik (`js/hafalan.js`), versi Ringkas atau Persis CAT, per materi/paket, tandai sudah hafal. Tautan audio MP3 di bawah. |
| **Formasi** | *Cari formasi* (`js/kalkulator.js`): skor SKD Anda, kotak cari, pilihan S-1 Ilmu Komunikasi / Hampir cocok / Semua / Tersimpan, kartu formasi dengan KUOTA, PELUANG masuk SKB, BATAS SKD. *Gaji* (`js/gaji.js`): perkiraan penghasilan per instansi. |

Pengaturan (nama, ambang batas, ulangi soal salah, pindai otomatis di APK) lewat ikon roda gigi. Riwayat lengkap lewat Beranda.
Alamat lama tetap terbuka: `#kalkulator` → Formasi, `#peta` dan `#ulang` → Latihan, `#statistik` → Riwayat.

Halaman yang dilepas: **Peta materi** dan **Strategi formasi** (riset formasi lengkap tetap di `docs/`; `data/formasi.js` disimpan
sebagai arsip, tidak dimuat aplikasi).

Lainnya:
- Layar ujian seperti CAT BKN: informasi ujian, *Simpan dan Lanjutkan*, *Lewatkan soal ini*, kotak nomor merah/hijau, Selesai Ujian
  aktif setelah semua soal dijawab. **Mode belajar** (versi Ringkas) mengoreksi langsung di soal.
- Bank soal: TWK/TKP HOTS 2026, soal sangat sering keluar (`docs/pola-soal-lintas-tahun.md`), soal kisi-kisi 2026, soal acak dari
  tabel fakta (`data/fakta.js`, `js/acak.js`), figural/deret/jaring kubus dibangkitkan otomatis. Validitas soal setara:
  `docs/validasi-tingkat-kesulitan.md`.
- Hasil + per materi, pembahasan (3 tryout terakhir), lembar hasil 1080×1350 (APK: simpan ke Galeri atau bagikan).
- Ambang batas 65 / 80 / 166 (KepmenPANRB 674/2026), bisa diubah di Pengaturan.

## Data formasi

- `data/dok2026.js`: formasi dari pengumuman resmi (dibuat `scripts/dok2026/buat.py`), `data/sscasn2026.js`: hasil pindai SSCASN
  bawaan. Versi online memakai `live/pindai.json` dari VPS (tiap 6 jam). Di APK, tombol *Perbarui dari SSCASN* (atau otomatis paling
  sering tiap 6 jam) membuka halaman resmi SSCASN lewat `ScanActivity`; `SCANNER` di `js/pindai.js` membaca seperti pengunjung biasa.
- Pembanding peluang: `data/skd2024.js` (pendaftar dan nilai SKD/SKB 2024). Gaji: `data/tunjangan.js` (PP 5/2024, Perpres tukin).
- Dokumen riset: `docs/pemindaian-formasi-cpns-2026.md`, `docs/prioritas-formasi-pemda-2026.md`,
  `docs/strategi-formasi-pendidikan-2026.md`, `docs/kandidat-formasi-cpns-2026.md` (PDF ikut rilis APK).
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
