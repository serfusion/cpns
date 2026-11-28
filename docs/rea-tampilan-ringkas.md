# Tampilan ringkas: studi REA atas situs pencari formasi (28 November 2026)

Permintaan pemilik: "terlalu banyak tulisan, pusing lihat menu dari menu", dengan contoh sscasn.zainbuilds.app ("enak, simple,
mudah dibaca"). Teknik REA: **Study** sebagai pengunjung (Playwright, kunjungan biasa), **Build** dengan kode, teks, dan merek
sendiri, **Check** di Chromium. Tidak ada kode, teks, logo, nama, atau data situs itu yang disalin.

## Study (yang diamati, HP 390 px dan komputer 1280 px)

| Bagian | Pengamatan |
|---|---|
| Huruf | Plus Jakarta Sans (sama dengan aplikasi ini), isi 14 px tinggi baris 1,6; judul halaman 21 px tebal 800; subjudul 15 px |
| Navigasi | 4 tab saja. HP: bilah bawah tetap 59 px, ikon di atas label 11 px, tab aktif berlatar biru muda radius 10. Komputer: tab yang sama di kanan bilah atas |
| Kepala halaman | judul pendek + satu baris angka ("15.414 kebutuhan · 1.714 formasi · 10 instansi · data per ..."), angka tebal |
| Kartu | putih, radius 16, padding 16; nama jabatan tebal, instansi pudar, lokasi dengan ikon pin; kotak angka abu muda berisi label kapital kecil (KEBUTUHAN, PENGHASILAN, KELAS) dan angka besar; pil kecil di bawah; tombol simpan (ikon) di kanan atas |
| Kontrol | satu kotak cari besar dengan ikon, pilihan berbentuk pil, saringan dan urutan sebagai select |
| Teks | hampir tanpa paragraf; keterangan satu baris |

## Build (yang dibuat di aplikasi ini)

- Laci 12 menu diganti 5 tab datar: Beranda, Tryout, Latihan, Hafalan, Formasi (HP: bilah bawah; ≥820 px: di bilah atas).
  Pengaturan lewat ikon roda gigi.
- Pola tampilan: `.meta` (satu baris, angka tebal), `.lbl` (label kapital kecil), `.sbox` (kotak angka 3 kolom), `.cari`, `.pil`,
  kartu putih radius 16. Merek tetap Pejuang NIP dengan warna navy + amber.
- Beranda: hasil terakhir dengan kotak TWK/TIU/TKP terhadap ambang, satu tombol ke paket berikutnya, soal salah, 3 riwayat.
- Tryout: pilihan versi Persis CAT / Ringkas, lalu daftar paket satu baris per paket.
- Latihan: lima kartu (fokus, kisi-kisi 2026, sangat sering keluar, soal acak, formulir) jadi satu formulir: subtes, jenis soal,
  materi, jumlah.
- Formasi: Kalkulator formasi + Strategi formasi + Gaji & tunjangan jadi satu tab (Cari formasi | Gaji). Kartu formasi
  memakai kotak KUOTA / PELUANG / BATAS SKD, tombol ☆ simpan, detail dibuka bila perlu. Bandingkan 3 formasi, saringan
  instansi/jalur, dan metode hitung panjang dilepas.
- Peta materi dan Strategi formasi dilepas dari aplikasi (riset tetap di `docs/`).

## Check

Chromium 360/390/820/1280 px, terang dan gelap: tanpa galat konsol, tanpa geser samping. Alur penuh diuji otomatis: Beranda →
Mulai Paket 1 → Login → Konfirmasi → 110 soal → Selesai Ujian → Nilai → Hasil → Beranda (Lanjut Paket 2); latihan TIU sangat
sering keluar tanpa hitungan; hafalan versi persis; formasi simpan, detail, cari; gaji; alamat lama (`#kalkulator`, `#peta`,
`#ulang`, `#statistik`) tetap terbuka.

Jumlah kata di layar HP sebelum → sesudah: Beranda 141 → 23, Tryout 356 → 44, Latihan 666 → 48, Hafalan 145 → 103,
Formasi 15.958 → 755 (tinggi halaman 91.769 px → 7.218 px), Gaji 1.730 → 486, Peta materi 2.311 → dilepas.
