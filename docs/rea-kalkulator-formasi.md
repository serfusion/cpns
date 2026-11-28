# Kalkulator formasi: studi REA atas situs pembanding (28 November 2026)

Teknik REA (Reverse Engineer Anything, repo `serfusion/rea`): **Study** sebagai pengunjung, **Build** dengan kode dan data
sendiri, **Check** di Chromium. Situs pembanding: analisacpns.com (dipilih pemilik). Tidak ada kode, data, teks, logo, atau
merek situs itu yang disalin; tidak login dan tidak memanggil API-nya secara langsung.

## Study (yang diamati)

Alat: Playwright (kunjungan biasa, tangkapan layar) dan CLI REA dari repo pemilik:
`rea list-browser-targets`, `rea inspect-web-page` (struktur halaman), `rea capture-browser-scenario` (skenario klik
"Simulasikan"), `rea analyze-web-bundle` (inferensi statis: React + Vite; parameter saringan `education`, `location`, `track`,
`history`, `sort`).

| Fitur di situs pembanding | Pengamatan |
|---|---|
| Katalog formasi 2026 | 24 instansi (penanda "formasi belum keluar"), saringan jurusan pada ijazah, lokasi, jalur (umum, cumlaude, disabilitas, Papua), riwayat 2024, urutan (penghasilan, keketatan SKD 2024, kuota, nama), simpan |
| Arsip 2024 | jumlah formasi, pelamar lolos administrasi, keketatan 1:N, gaji, hasil SKD ("hadir", "batas"), detail SKD |
| Simulasi/rasionalisasi | memakai nilai SKD 2024 atau skor tryout; perlu login, sedang dalam pemeliharaan untuk 2026 (tidak dipelajari lebih jauh) |
| Bandingkan | paling banyak 3 formasi berdampingan |

## Build (yang dibuat di aplikasi ini)

Menu **Kalkulator formasi** (`js/kalkulator.js`):

- Kartu skor TWK/TIU/TKP (atau skor tryout terbaik) dengan cek ambang per subtes.
- Katalog dari data aplikasi sendiri: pengumuman resmi (`data/dok2026.js`) + pindai SSCASN (VPS/perangkat/bawaan) + isian
  sendiri. Saringan kelompok pendidikan, cari, instansi, jalur; urutan peluang, keketatan, kuota, penghasilan, batas SKD, A-Z.
- Per formasi: kuota jalur, pelamar (SSCASN atau perkiraan rasio 2024), keketatan, perkiraan batas lolos SKB, selisih skor,
  perkiraan peringkat, peluang masuk SKB, SKB yang perlu untuk nilai akhir, tahapan seleksi, penghasilan.
- Simpan (bintang), bandingkan sampai 3 formasi, metode hitung terbuka.

Rumusnya sendiri, dari model yang sudah ada di `data/skd2024.js`: batas lolos SKB naik ±93 poin tiap pelamar per kursi naik
10 kali lipat; batas 2026 = batas instansi 2024 + 93 × log10(rasio 2026 ÷ rasio 2024), minimal 311.

## Check

Diuji di Chromium 360/390 px dan 1366 px: tanpa galat konsol, tanpa geser samping; simulasi, simpan, bandingkan, isian
sendiri, dan tanda gagal ambang berjalan.
