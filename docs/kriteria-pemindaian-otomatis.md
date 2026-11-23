# Kriteria pemindaian dan ranking formasi CPNS 2026 (otomatis)

Dokumen ini dibaca oleh sesi pemantau terjadwal. Isinya menggabungkan dua dokumen pemilik repo
(*Riset Strategi Pemilihan Formasi CPNS 2026* dan *Strategi Memilih Formasi CPNS di Pemda*) dengan
semua keputusan yang sudah disepakati di percakapan. Rumus skornya sama dengan yang dipakai aplikasi
(`js/formasi.js`), jadi sesi pemantau cukup mengisi **fakta** formasi; skor dan peringkat dihitung aplikasi.

## 1. Profil pelamar

- Ijazah: **S-1 Ilmu Komunikasi**. Nama prodi pada lampiran formasi harus tercantum persis.
  S-1 Hubungan Masyarakat, Komunikasi Massa, Manajemen Komunikasi, Jurnalistik, dan DKV adalah prodi lain.
- Minat: IT terapan (situs, data, otomasi, produksi digital, vibecoding), **bukan** programmer murni.
- **Tidak nyaman dengan pekerjaan yang banyak bicara.** Jabatan yang tugas intinya bicara di depan orang
  dikeluarkan: Penata Keprotokolan, Fasilitator Pemerintahan, Penggerak Swadaya Masyarakat, Penyuluh Sosial,
  Penata Kelola PPPA, Instruktur, Edukator, penyiar, reporter, pengantar kerja.
- Lokasi: prioritas Kota Tangerang dan Jabodetabek; bersedia nasional bila peluang jauh lebih besar.
- Prioritas: peluang lolos paling besar, bukan instansi populer.
- Data pribadi (nama, IPK, usia, akreditasi) tidak disimpan di repo. Syarat itu ditandai "cek" agar dicek pemilik.

## 2. Gerbang wajib (gugur bila tidak terpenuhi)

1. Formasi berasal dari pengumuman resmi CPNS 2026 (SSCASN atau pengumuman/lampiran resmi instansi).
2. Kualifikasi pendidikan mencantumkan **S-1 ILMU KOMUNIKASI** (atau kesetaraan yang dinyatakan resmi).
3. Tidak mensyaratkan sertifikasi profesi yang tidak dimiliki (mis. STR, sertifikat pendidik).
4. Bukan formasi khusus yang tidak bisa diikuti pemilik (mis. khusus Orang Asli Papua, khusus disabilitas,
   khusus putra/putri daerah tertentu). Formasi cumlaude ditandai "cek akreditasi".

## 3. Urutan prioritas (dokumen Pemda)

- **P1 Jabatan atau unit baru, rekrutmen pertama.** Bukti resmi: instansi yang dibentuk sejak Oktober 2024
  (mis. Kementerian Kebudayaan, Kementerian HAM, Kementerian Ekonomi Kreatif, Kementerian UMKM,
  Kementerian Transmigrasi, Kementerian Haji dan Umrah, Badan Gizi Nasional, kemenko baru), unit baru menurut SOTK,
  atau jabatan yang tidak ada di formasi 2024 instansi itu. Isian `baru`: `resmi` / `indikasi` / `tidak`.
- **P2 Kota Tangerang.** Pemkot Tangerang, serta kantor instansi pusat di Kota Tangerang
  (Pengadilan Negeri dan Pengadilan Agama Tangerang, RS dr. Sitanala, kekarantinaan kesehatan Bandara
  Soekarno-Hatta, Bea Cukai Soekarno-Hatta, KPP di Tangerang, BPS Kota Tangerang, dan lainnya).
  Lalu Jabodetabek lainnya (`jabo: true`).
- **P3 Daerah sepi pesaing.** Pemda atau unit di luar Jawa dengan kuota lebih dari 5 kursi untuk jabatan yang cocok,
  mis. Kota Ambon, Kab. Aceh Tenggara, Kab. Sumbawa Barat, Kab. Lebong, Kab. Lembata, Prov. NTB, Prov. Sumut, Prov. Sultra.
  Papua: 80% formasi untuk Orang Asli Papua, jadi hanya formasi umum yang dihitung.

## 4. Jabatan yang dicari dan kode `jab`

| Kode `jab` | Jabatan | Catatan |
|---|---|---|
| `arsip` | Arsiparis Ahli Pertama | Kerja belakang layar, data dan arsip digital |
| `ptp` | Pengembang Teknologi Pembelajaran Ahli Pertama | Paling dekat dengan minat IT |
| `humas` | Pranata Hubungan Masyarakat Ahli Pertama | Utamakan unit konten digital |
| `perencana` | Perencana Ahli Pertama | Dokumen dan data |
| `analis` | Analis Kebijakan Ahli Pertama | Banyak menulis |
| `siaran` | Pranata Siaran Ahli Pertama | Bagian produksi, bukan penyiar |
| `pemilu` | Penata Kelola Pemilihan Umum Ahli Pertama | |
| *(kosong)* | Jabatan lain yang mencantumkan S-1 Ilmu Komunikasi | Masuk bila tugas intinya tidak lisan |

Jabatan yang **gugur** karena biasanya tidak menerima Ilmu Komunikasi: Pranata Komputer, Penata Kelola Sistem dan TI,
Administrator Database Kependudukan, Statistisi, Pustakawan. Tetap masukkan bila lampiran resmi ternyata mencantumkan
S-1 Ilmu Komunikasi.

### Instansi yang dicek lebih dulu (tambahan 23 Nov 2026)

Kemendikdasmen, Kemenkes (RS dr. Sitanala, KKP Soekarno-Hatta), Mahkamah Agung (PN/PA Tangerang), Kemenkeu (Bea Cukai Soekarno-Hatta),
lalu Kemenag, Kemenhut, Imigrasi dan Pemasyarakatan, Kemendiktisaintek, BSSN. Jabatan tambahan yang dicek bila lampiran mencantumkan
S-1 Ilmu Komunikasi: Pengawas Penyelenggaraan Urusan Pemerintahan Daerah (P2UPD/Inspektorat) dan Pengawas Koperasi.

## 5. Rumus (dihitung otomatis oleh aplikasi)

**Rumus A, dokumen riset (100):** rasio pelamar per kursi 35, jumlah kursi 20, kecocokan tugas 20, lokasi 10,
syarat dan risiko 15. Kategori: 75+ Sangat layak diteliti, 60–74 Layak, di bawah 60 Cadangan, syarat wajib gagal = Gugur.

**Rumus B, matriks Pemda (100):** tiap kriteria 1–5, nilai = jumlah (skor ÷ 5 × bobot): pendidikan 25,
jumlah formasi 20 (lebih dari 5 kursi = 5), jabatan/unit baru 20, persaingan 15, mekanisme seleksi 10 (SKB CAT saja = 5,
tes non-CAT dengan aturan jelas = 3, belum jelas = 1), kesiapan SKB 10.

Bila jumlah pelamar belum tersedia, aplikasi menghitung kedua rumus **tanpa komponen persaingan** lalu menskalakannya ke 100,
dan menandainya "tanpa rasio" (sesuai prinsip dokumen riset: jangan memperkirakan angka pelamar).

Peringkat: urut Rumus B, lalu Rumus A, lalu prioritas P1 > P2 > P3.

## 6. Format data yang diisi sesi pemantau

Di `data/formasi.js`, properti `kandidat2026`:

```js
kandidat2026: {
  tanggal: "24 November 2026",          // tanggal pemindaian
  status: "terbit",                     // "menunggu" | "terbit" | "ditutup"
  catatan: "Ringkasan singkat sumber dan cakupan pemindaian",
  sumber: [{ t: "Pengumuman CPNS Instansi X 2026", u: "https://..." }],
  list: [
    { nama: "Arsiparis Ahli Pertama", instansi: "Kementerian Kebudayaan", lokasi: "Museum X, Jakarta",
      jab: "arsip", kursi: 3, pelamar: null, jabo: true, syarat: "aman", baru: "resmi", mek: "belum",
      prioritas: "P1", pendidikan: "S-1 ILMU KOMUNIKASI, S-1 KEARSIPAN, ...", url: "https://...",
      catatan: "Formasi umum; cek akreditasi minimal B" }
  ]
}
```

- `syarat`: `aman` bila semua syarat umum tampak terpenuhi; `catatan` bila ada hal yang perlu dicek (IPK, akreditasi,
  sertifikat bahasa, wawancara); jangan masukkan formasi yang gugur.
- `pelamar`: angka resmi bila ada (jumlah pelamar atau yang memenuhi syarat per formasi), selain itu `null`.
- `url`: tautan pengumuman atau lampiran resmi yang menjadi bukti S-1 Ilmu Komunikasi diterima.

## 7. Cara memindai (hanya jalur publik)

- Sumber: halaman publik SSCASN (`https://sscasn.bkn.go.id/daftar-formasi/`), pengumuman dan lampiran resmi instansi,
  siaran pers BKN/KemenPANRB, berita sebagai petunjuk.
- Buka halaman seperti pengunjung biasa dengan peramban (Playwright) dengan jeda yang wajar.
  **Jangan** memanggil API SSCASN langsung, memalsukan header, menembus captcha atau pemblokiran,
  masuk dengan akun siapa pun, atau memakai data bocoran. Bila diblokir, hentikan dan laporkan.
- Situs pihak ketiga (mis. jadiasn.id) hanya petunjuk; setiap kandidat harus punya bukti resmi.

## 8. Keluaran

1. Perbarui `kandidat2026` di `data/formasi.js` (maksimal 40 kandidat teratas; boleh lebih sedikit).
2. Tulis `docs/kandidat-formasi-cpns-2026.md` (ringkasan, tabel peringkat dengan kedua skor, sumber),
   lalu buat PDF: `node scripts/dokumen-pdf.cjs docs/kandidat-formasi-cpns-2026.md`.
3. Uji: `node scripts/validate.mjs` dan `node scripts/build.mjs`, lalu buka halaman `#formasi` di Chromium.
4. Commit dan push ke branch `claude/admiring-cerf-9bgc4h` (APK dan PDF terbit otomatis di Releases).
