# Validasi tingkat kesulitan soal terhadap SKD asli

Disusun 28 November 2026 untuk menjawab pertanyaan pemilik: *apakah soal di aplikasi akan keluar di CAT, terlalu mudah, atau
memang sekelas itu?* Ulangi pengukurannya kapan saja dengan `node scripts/audit-kesulitan.mjs`.

## 1. Yang tidak bisa dijamin

Soal CAT BKN rahasia, disusun BKN dari bank soal yang diuji coba, dan diacak per peserta. Tidak ada cara sah untuk mengetahui
soal yang akan keluar. Soal di aplikasi ini disusun sendiri mengikuti **kisi-kisi resmi 2026** (KepmenPANRB 674/2026) dan
**pola dari laporan peserta SKD 2024** (`docs/pola-soal-lintas-tahun.md`). Kesesuaian *materi dan pola* sudah diperiksa;
yang diperiksa di dokumen ini adalah *tingkat kesulitan*.

## 2. Pembanding resmi dari BKN

Laporan Kinerja Pusat Pengembangan Sistem Seleksi BKN 2024 (LKj PPSS 2024, bkn.go.id):

| Data | Angka |
|---|---|
| Uji butir soal TKD 2024 (858 soal, 386 peserta uji) | mudah 335 (39%), sedang 300 (35%), sulit 223 (26%); hanya 389 soal (45%) dinyatakan layak; nilai tertinggi peserta uji 417, terendah 189 |
| Pemutakhiran soal TKD 2024 | TWK: 355 soal awal, 109 valid, 135 dihapus; TIU: 249 awal, 120 valid, 115 dihapus; TKP: 252 awal, 162 valid |
| SKD sekolah kedinasan 2024 (104.626 peserta hadir) | tidak lulus ambang 49,7%; TWK ≥ 65 hanya 65,9%; TIU ≥ 80 66,3%; TKP ≥ 156 94,2%. Pada 2024 peserta paling banyak gugur di TWK (2023: di TIU) |
| SKD CPNS 2024 | nilai tertinggi 509 (Kementerian Agama), lalu 504, 501, 499 |

Surat Edaran Kepala BKN 8/2023 mendefinisikan *tingkat kesulitan* sebagai kompleksitas kognitif (mudah, sedang, sulit) dan
*skema soal* sebagai jumlah soal per submateri menurut tingkat kesulitan. Proporsi skema soal SKD tidak dipublikasikan.

Laporan peserta 2024 (Antara Aceh, 30 Oktober 2024): TWK "sangat sulit dan penuh penalaran", "opsi pilihan jawaban dibuat
hampir mirip, sekilas benar semua", dan banyak peserta mendapat nilai rendah di TWK.

## 3. Hasil audit bank soal aplikasi (28 November 2026)

**Isyarat panjang opsi** (seberapa sering jawaban terbaik adalah opsi terpanjang; tanpa isyarat = 20%):

| Kelompok soal | Jawaban terbaik = opsi terpanjang | Panjang jawaban terbaik dibanding rata-rata opsi lain |
|---|---|---|
| TKP lama (169 soal) | 97–100% | 2,2–2,5 kali |
| TWK lama (241 soal) | 58–76% | 1,4–1,8 kali |
| TKP setara CAT, paket 1–5 (225 soal) | 0,4% | 0,99 kali |
| TWK setara CAT, paket 1–5 (150 soal) | 1,3% | 0,99 kali |

**Skor peserta yang asal memilih opsi terpanjang tanpa membaca soal** (acak murni ≈ TWK 30, TIU 35, TKP 135):

| Paket | TWK | TIU | TKP |
|---|---|---|---|
| Paket latihan 1–6 | 70–95 (ambang 65) | 35–50 | 204–213 (ambang 166) |
| Tryout Setara CAT paket 1–5 | 0–15 | 40–65 | 121–150 |

Kesimpulan: **soal lama lebih mudah daripada CAT asli**. Di paket lama, orang yang hanya menebak opsi terpanjang bisa lolos
ambang TWK dan TKP; di CAT asli hal itu tidak terjadi (opsi hampir sama panjang dan "sekilas benar semua"). Selain itu sekitar 30% soal
TWK lama (sekitar sepertiga) berupa hafalan singkat, rata-rata hanya 22–30 kata, sedangkan laporan peserta 2024 menggambarkan TWK berbasis kasus.

## 4. Yang diubah

- `data/setara.js` (paket 1) sampai `data/setara5.js` (paket 5, `pk: 5`): 383 soal setara (TWK 150, TKP 225, TIU tanpa
  hitungan 8) berupa kasus kerja ASN dengan kelima opsi sama panjang. Tiap paket berisi TWK 30 (nas 6, int 6, bela 6, pilar 7,
  bind 5) dan TKP 45 (pel 8, jej 7, sos 7, tik 7, pro 8, rad 8) yang tidak berulang di paket lain. Rata-rata 25–34 kata per soal
  (paket 1: 34, paket 2: 30, paket 3–5: 25–26); opsi pengecoh dibuat masuk akal (sebagian benar, berlebihan, salah kutip pasal,
  atau sikap yang terdengar baik tetapi kurang tepat).
- **Tryout Setara CAT** (menu Tryout, Paket 1–5): TWK 30 dan TKP 45 dari soal paket itu, TIU 35 tanpa hitungan berat
  (silogisme, penalaran induktif, analitis, deret, figural) sesuai permintaan pemilik. Skor terbaik dicatat per paket.
- `scripts/validate.mjs` menolak soal setara yang opsi terbaiknya lebih dari 5% lebih panjang dari opsi lain, dan memeriksa bahwa
  opsi terbaik paling panjang di paling banyak 30% soal setara.
- Halaman Tryout menampilkan penjelasan validitas dengan angka yang dihitung langsung dari bank soal.

## 5. Yang belum

- Lima paket setara. Bila semuanya sudah hafal, tambah paket berikutnya di `data/setara6.js` (`pk: 6`) dengan aturan yang sama,
  lalu daftarkan di `index.html` dan skrip validasi/audit. Kasus paket 3–5 sedikit lebih pendek (25–26 kata) dari paket 1.
- 410 soal TWK/TKP lama masih punya isyarat panjang. Tulis ulang opsi pengecohnya bertahap, mulai dari yang bertanda sangat
  sering keluar.
- Belum ada data jawaban banyak peserta untuk menghitung tingkat kesukaran per butir seperti uji butir BKN. Pembanding terbaik
  untuk pemilik: bandingkan skor Tryout Setara CAT dengan nilai SKD asli (bila pernah ikut SKD).
