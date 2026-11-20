/* Strategi pemilihan formasi CPNS 2026 untuk lulusan S-1 Ilmu Komunikasi.
   Pemindaian 20 November 2026: status resmi, validasi dokumen riset pengguna, data formasi 2024,
   dan skor sementara dengan rumus dokumen riset (rasio 35, kursi 20, tugas 20, lokasi 10, syarat 15).
   Rincian formasi 2026 belum terbit; perbarui file ini begitu SSCASN menampilkan formasi. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});

  SKD.formasi = {
    tanggal: "20 November 2026",
    jurusan: "S-1 Ilmu Komunikasi",
    dokumen: "https://github.com/serfusion/cpns/releases?q=APK",

    status: [
      "Rincian formasi CPNS 2026 belum terbit. Sampai Jumat 20 November siang, BKN belum mengumumkannya di situs maupun media sosial resminya. Kepala BKN kini menargetkan pekan keempat November (23–29 November) karena masih menunggu penetapan formasi dari KemenPANRB.",
      "Rekrutmen diumumkan 6 November 2026 (Siaran Pers KemenPANRB No. 378/HUMAS-MENPANRB/2026). Akun SSCASN dibuka sejak 14 November; membuat akun belum berarti mendaftar formasi.",
      "Jumlah: sekitar 150 ribu menurut MenPANRB (masih dihitung ulang) dan 158 ribu menurut Dirjen Anggaran Kemenkeu (APBN KiTa, 13 November), terutama untuk mengganti PNS pensiun. Seleksi bisa berlanjut sampai semester I 2027.",
      "Formasi prioritas: Polisi Hutan, Manggala Agni, Guru Sekolah Terintegrasi, dan Guru Sekolah Unggul Garuda. Keempatnya bukan untuk S-1 Ilmu Komunikasi.",
      "Sudah menyebut angka: Mahkamah Agung 2.830 CPNS + 1.600 calon hakim (salah satu dari 14 K/L prioritas Presiden untuk tambahan pegawai, pengumuman akhir November) dan Kemenkeu 1.915 formasi umum untuk SMA/SMK, D-III, dan S-1. Kemenkes menyatakan segera membuka, belum dengan angka.",
      "Formasi pemerintah daerah belum diputuskan resmi. Klaim \"pemda tidak membuka CPNS 2026\" hanya beredar di situs tidak resmi; BKD DKI masih menunggu juklak dan juknis pusat.",
      "Seperti 2024, satu pelamar diperkirakan hanya boleh memilih satu formasi, dan seluruh tahapan gratis."
    ],

    angka: [
      { v: "≈16", l: "pelamar per kursi, nasional 2024", d: "3.963.832 pelamar untuk 250.407 formasi" },
      { v: "158 rb", l: "perkiraan formasi CPNS 2026", d: "Kemenkeu, 13 Nov; MenPANRB ±150 ribu (belum final)" },
      { v: "895", l: "formasi Pranata Humas 2024 yang mencantumkan S-1 Ilmu Komunikasi", d: "terbanyak; olahan data BKN 2024" },
      { v: "12%", l: "peserta SKD Kemenag 2024 yang lolos ke SKB", d: "37.849 dari 313.078 peserta" }
    ],

    // Jabatan yang terbukti menerima S-1 Ilmu Komunikasi pada CPNS 2024.
    // saing: indikasi persaingan 2024. cocok: kecocokan dengan minat IT/digital.
    // lisan: seberapa banyak tugas inti menuntut bicara di depan orang ("tinggi" disembunyikan bila filter aktif).
    // n: data nasional 2024 (olahan MisiPNS atas data BKN): ilkom = formasi yang mencantumkan S-1 Ilmu Komunikasi.
    // skor: skor sementara rumus dokumen riset tanpa komponen rasio (jumlah /20, tugas /20, lokasi /10, syarat /15).
    jabatan: [
      {
        id: "humas", nama: "Pranata Hubungan Masyarakat Ahli Pertama", saing: "tinggi", cocok: "tinggi", lisan: "sedang",
        n: { ilkom: 895, formasi: 1442, kursi: 2514 }, skor: { jumlah: 20, tugas: 15, lokasi: 10, syarat: 12 }, kat: "layak",
        tugas: "Produksi konten (desain, video, situs web, media sosial), tetapi juga liputan, wawancara, dan hubungan dengan media.",
        bukti: [
          "Nasional 2024: 2.514 kursi dalam 1.442 formasi di 235 instansi. S-1 Ilmu Komunikasi tercantum di 895 formasi, terbanyak dari semua jurusan (disusul Hubungan Masyarakat 779, DKV 622, Jurnalistik 548)",
          "Kementerian PU 2024: 496 kursi di 340 formasi, kebanyakan di balai daerah (bendungan, sungai, jalan nasional)",
          "Kemenag 410 kursi, Komdigi 94, Kemenkes 89, Kementan 72, BPS 48, KLH 48, Pemprov DKI 32 (2024)",
          "Kemensetneg dan Setkab 2024: Pranata Humas justru TIDAK menerima S-1 Ilmu Komunikasi (hanya Humas, DKV, Manajemen Komunikasi, Desain Grafis)"
        ],
        catatan: "Kesempatan terbanyak dan paling dekat dengan ijazah, tetapi paling ramai karena semua jurusan komunikasi ikut. Pilih unit yang jelas mengurus konten digital (desain, video, situs) dan cek nama prodi persis."
      },
      {
        id: "arsip", nama: "Arsiparis Ahli Pertama", saing: "rendah", cocok: "tinggi", lisan: "rendah",
        n: { ilkom: 318, formasi: 3007, kursi: 5559 }, skor: { jumlah: 16, tugas: 20, lokasi: 10, syarat: 8 }, kat: "layak",
        tugas: "Mengelola arsip dinamis dan statis, termasuk alih media dan arsip digital. Kerja di balik meja.",
        bukti: [
          "Nasional 2024: 5.559 kursi dalam 3.007 formasi. S-1 Ilmu Komunikasi hanya tercantum di 318 formasi (sekitar 1 dari 10)",
          "Kemendikbudristek 2024: 9 kursi menerima S-1 Ilmu Komunikasi, antara lain Universitas Sultan Ageng Tirtayasa (Serang) 2 kursi dan Universitas Jambi 1 kursi",
          "Kejaksaan 2024: 569 kursi Arsiparis Ahli Pertama, tetapi daftar jurusannya memuat S-1 Hubungan Masyarakat, bukan S-1 Ilmu Komunikasi",
          "Mahkamah Agung 2024: 20 kursi Arsiparis (khusus jurusan kearsipan) hanya diikuti 14 peserta SKB, jadi 6 kursi kosong"
        ],
        catatan: "Paling cocok dengan pengalaman data dan arsip akademik serta kerja tanpa banyak bicara. Risikonya di syarat: hanya sebagian kecil formasi mencantumkan Ilmu Komunikasi, jadi saring nama prodi satu per satu."
      },
      {
        id: "ptp", nama: "Pengembang Teknologi Pembelajaran Ahli Pertama", saing: "sedang", cocok: "tinggi", lisan: "rendah",
        n: { ilkom: 59, formasi: 225, kursi: 397 }, skor: { jumlah: 8, tugas: 20, lokasi: 8, syarat: 10 }, kat: "layak",
        tugas: "Membuat media dan kelas daring: video pembelajaran, e-learning, LMS. Hasil kerjanya produk, bukan presentasi.",
        bukti: [
          "Nasional 2024: 397 kursi dalam 225 formasi. S-1 Ilmu Komunikasi tercantum di 59 formasi (sekitar 1 dari 4)",
          "Mahkamah Agung 2024: 6 kursi, menerima Ilmu Komunikasi, informatika, dan jurusan pendidikan; 18 peserta SKB, terisi penuh",
          "Kemensetneg 2024: 2 kursi di Pusat Pengembangan Kompetensi ASN (D-IV Produksi Media, S-1 Teknologi Pendidikan, S-1 DKV, S-1 Ilmu Komunikasi)",
          "Instansi terbanyak 2024: Kemenag 72 kursi, Kemendikbudristek 25, Kementan 18, Pemprov DKI 17, LAN 12"
        ],
        catatan: "Paling dekat dengan minat IT tanpa ijazah informatika: produksi video, web, dan alat bantu AI dipakai sehari-hari. Kursinya sedikit, jadi jangan jadikan satu-satunya pilihan."
      },
      {
        id: "perencana", nama: "Perencana Ahli Pertama (bila menerima Ilmu Komunikasi)", saing: "sedang", cocok: "sedang", lisan: "rendah",
        n: { ilkom: 286, formasi: 4285, kursi: 7615 }, skor: { jumlah: 16, tugas: 15, lokasi: 10, syarat: 5 }, kat: "layak",
        tugas: "Menyusun rencana program, anggaran, dan laporan kinerja berbasis data.",
        bukti: [
          "Nasional 2024: 7.615 kursi dalam 4.285 formasi. S-1 Ilmu Komunikasi hanya di 286 formasi (kurang dari 1 dari 10)",
          "Kemendikbudristek 2024: 2 kursi di Universitas Mulawarman mencantumkan S-1 Ilmu Komunikasi",
          "Kejaksaan 2024: 574 kursi Perencana tanpa Ilmu Komunikasi (jurusan ekonomi, akuntansi, administrasi)"
        ],
        catatan: "Kerjanya dokumen dan data, tetapi jarang membuka Ilmu Komunikasi dan materi SKB-nya condong ke ekonomi dan perencanaan."
      },
      {
        id: "analis", nama: "Analis Kebijakan Ahli Pertama", saing: "tinggi", cocok: "sedang", lisan: "sedang",
        n: { ilkom: 298, formasi: 2734, kursi: 4847 }, skor: { jumlah: 16, tugas: 10, lokasi: 10, syarat: 8 }, kat: "layak",
        tugas: "Menyusun kajian dan rekomendasi kebijakan; banyak menulis, sesekali memaparkan.",
        bukti: [
          "Nasional 2024: 4.847 kursi dalam 2.734 formasi. S-1 Ilmu Komunikasi di 298 formasi, bersaing dengan Hukum, Manajemen, Administrasi Publik, dan Ekonomi",
          "Kemendikbudristek 2024: 3 kursi di Sekretariat Jenderal (10 jurusan diterima)",
          "Kominfo 2024: Sekretariat Dewan Pers 1, Ditjen IKP 1 (menurut media)"
        ],
        catatan: "Banyak jurusan ikut bersaing, jadi bukan pilihan utama."
      },
      {
        id: "siaran", nama: "Pranata Siaran Ahli Pertama (LPP RRI dan TVRI)", saing: "sedang", cocok: "sedang", lisan: "sedang",
        n: { ilkom: 112, formasi: 190, kursi: 840 }, skor: { jumlah: 12, tugas: 10, lokasi: 7, syarat: 8 }, kat: "cadangan",
        tugas: "Merencanakan, memproduksi, dan menyajikan siaran. Ada bagian produksi di belakang layar, tetapi tugas penyiar juga termasuk jabatan ini.",
        bukti: [
          "2024 (lewat Kominfo): 840 kursi dalam 190 formasi di stasiun RRI dan TVRI; S-1 Ilmu Komunikasi tercantum di 112 formasi",
          "Kominfo, RRI, dan TVRI membuka 4.215 formasi CPNS 2024"
        ],
        catatan: "Bila dibuka lagi, pilih formasi produksi di stasiun daerah dan baca uraian tugasnya. Belum ada kabar RRI dan TVRI di CPNS 2026."
      },
      {
        id: "pemilu", nama: "Penata Kelola Pemilihan Umum Ahli Pertama (KPU)", saing: "sedang", cocok: "sedang", lisan: "sedang",
        n: { ilkom: 39, formasi: 39, kursi: 499 }, skor: { jumlah: 4, tugas: 10, lokasi: 4, syarat: 10 }, kat: "cadangan",
        tugas: "Administrasi teknis pemilu di sekretariat KPU: data pemilih, tahapan, logistik, dan laporan.",
        bukti: ["KPU 2024: 499 kursi di 39 lokasi; S-1 Ilmu Komunikasi termasuk 18 jurusan yang diterima di semua formasinya"],
        catatan: "Banyak jurusan ikut bersaing, penempatan di daerah, dan belum ada sinyal KPU membuka formasi 2026."
      },
      {
        id: "fasilitator", nama: "Fasilitator Pemerintahan", saing: "tinggi", cocok: "sedang", lisan: "tinggi",
        n: { ilkom: 782, formasi: 3121, kursi: 4863 }, skor: { jumlah: 20, tugas: 5, lokasi: 7, syarat: 10 }, kat: "keluar",
        tugas: "Memfasilitasi rapat, kerja sama, dan layanan pemerintahan.",
        bukti: [
          "Nasional 2024: 4.863 kursi dalam 3.121 formasi, terbanyak di Pemkab Jayawijaya, Pemkab Manggarai, KemenP2MI, dan Pemprov Jatim; S-1 Ilmu Komunikasi tercantum di 782 formasi",
          "Kemensetneg 2024: 4 kursi umum + 1 disabilitas di Biro Kerja Sama Teknik Luar Negeri (D-IV Layanan Publik, S-1 Ilmu Komunikasi, S-1 Hubungan Masyarakat)"
        ],
        catatan: "Kursinya banyak, tetapi tugas intinya koordinasi lisan."
      },
      {
        id: "protokol", nama: "Penata Keprotokolan", saing: "sedang", cocok: "sedang", lisan: "tinggi",
        n: { ilkom: 266, formasi: 430, kursi: 1161 }, skor: { jumlah: 16, tugas: 0, lokasi: 10, syarat: 8 }, kat: "keluar",
        tugas: "Mengatur acara resmi, tata upacara, dan kunjungan pimpinan.",
        bukti: [
          "Nasional 2024: 1.161 kursi; S-1 Ilmu Komunikasi jurusan teratas (266 formasi). Terbanyak di DPD, DPR, dan Mahkamah Agung",
          "Mahkamah Agung 2024: 46 kursi umum (+5 cumlaude, +1 Papua) hanya untuk S-1 Hubungan Masyarakat, Ilmu Komunikasi, dan Manajemen Komunikasi; 138 peserta SKB"
        ],
        catatan: "Kuota besar, tetapi tugas intinya koordinasi dan berbicara dengan banyak orang."
      },
      {
        id: "pppa", nama: "Penata Kelola Pemberdayaan Perempuan dan Perlindungan Anak", saing: "sedang", cocok: "sedang", lisan: "tinggi",
        n: { ilkom: 223, formasi: 337, kursi: 577 }, skor: { jumlah: 12, tugas: 5, lokasi: 4, syarat: 10 }, kat: "keluar",
        tugas: "Menjalankan program perlindungan perempuan dan anak, termasuk pendampingan dan sosialisasi.",
        bukti: ["Nasional 2024: 577 kursi dalam 337 formasi, hampir semua di pemerintah daerah; S-1 Ilmu Komunikasi di 223 formasi"],
        catatan: "Banyak pendampingan dan sosialisasi tatap muka."
      },
      {
        id: "psm", nama: "Penggerak Swadaya Masyarakat Ahli Pertama", saing: "sedang", cocok: "tinggi", lisan: "tinggi",
        n: { ilkom: 203, formasi: 725, kursi: 1322 }, skor: { jumlah: 12, tugas: 5, lokasi: 4, syarat: 10 }, kat: "keluar",
        tugas: "Menjalankan program pemberdayaan dan literasi digital langsung di masyarakat.",
        bukti: [
          "Nasional 2024: 1.322 kursi dalam 725 formasi, terbanyak di daerah timur; S-1 Ilmu Komunikasi di 203 formasi",
          "Kominfo 2024: 11 kursi di Direktorat Pemberdayaan Informatika dan 2 kursi di Direktorat Ekonomi Digital (menurut media)"
        ],
        catatan: "Banyak sosialisasi dan pendampingan tatap muka."
      },
      {
        id: "penyuluh", nama: "Penyuluh Sosial Ahli Pertama", saing: "sedang", cocok: "sedang", lisan: "tinggi",
        n: { ilkom: 124, formasi: 465, kursi: 894 }, skor: { jumlah: 12, tugas: 0, lokasi: 4, syarat: 8 }, kat: "keluar",
        tugas: "Menyuluh dan mengedukasi masyarakat tentang program sosial.",
        bukti: ["Nasional 2024: 894 kursi dalam 465 formasi; S-1 Ilmu Komunikasi di 124 formasi"],
        catatan: "Tugas intinya berbicara di depan kelompok masyarakat."
      },
      {
        id: "instruktur", nama: "Instruktur Ahli Pertama (Komdigi)", saing: "rendah", cocok: "tinggi", lisan: "tinggi", kat: "keluar",
        tugas: "Melatih talenta dan literasi digital di depan kelas.",
        bukti: ["Kominfo 2024: 3 kursi di BPSDMP Banjarmasin dan 3 kursi di BPSDMP Yogyakarta (menurut media)"],
        catatan: "Sepi pelamar, tetapi pekerjaannya mengajar."
      },
      {
        id: "edukator", nama: "Edukator (museum dan cagar budaya)", saing: "sedang", cocok: "sedang", lisan: "tinggi", kat: "keluar",
        tugas: "Memandu dan mengedukasi pengunjung museum.",
        bukti: ["Kemendikbudristek 2024: 2 kursi di unit museum dan cagar budaya"],
        catatan: "Tugas intinya menjelaskan kepada pengunjung."
      }
    ],

    gugur: "Gugur karena S-1 Ilmu Komunikasi tidak tercantum di data 2024: Pranata Komputer, Penata Kelola Sistem dan Teknologi Informasi, Administrator Database Kependudukan, Statistisi, dan Pustakawan (semuanya meminta jurusan komputer, statistik, atau perpustakaan). Analis SDM Aparatur dan Pengelola Pengadaan juga tidak memuat Ilmu Komunikasi di 20 jurusan teratasnya.",
    tidakBisa: "Jabatan TI murni (Pranata Komputer, Penata Kelola Sistem dan Teknologi Informasi, Administrator Database Kependudukan) mensyaratkan ijazah komputer. Pada 2024 ada 15.192 kursi Penata Kelola Sistem dan TI dan 11.428 kursi Pranata Komputer, tetapi S-1 Ilmu Komunikasi tidak masuk 20 jurusan teratas keduanya. Salurkan minat IT lewat Pengembang Teknologi Pembelajaran, arsip digital, dan produksi media.",

    // Validasi angka di bagian 5 dokumen riset pengguna.
    validasi: {
      jabatan: [
        { nama: "Pranata Humas Ahli Pertama", md: 826, ilkom: 895 },
        { nama: "Fasilitator Pemerintahan", md: 706, ilkom: 782 },
        { nama: "Arsiparis Ahli Pertama", md: 284, ilkom: 318 },
        { nama: "Analis Kebijakan Ahli Pertama", md: 261, ilkom: 298 },
        { nama: "Penata Keprotokolan", md: 251, ilkom: 266 },
        { nama: "Perencana Ahli Pertama", md: 249, ilkom: 286 },
        { nama: "Penata Kelola PPPA", md: 208, ilkom: 223 },
        { nama: "Penggerak Swadaya Masyarakat", md: 195, ilkom: 203 },
        { nama: "Penyuluh Sosial Ahli Pertama", md: 114, ilkom: 124 },
        { nama: "Pengembang Teknologi Pembelajaran", md: 53, ilkom: 59 }
      ],
      jabatanHasil: "Urutan kesepuluh jabatan sama persis dan angkanya hanya selisih 4–15%, jadi angka Anda kemungkinan berasal dari olahan data BKN 2024 yang sama dengan cara hitung sedikit berbeda. Artinya angka itu jumlah formasi 2024 yang mencantumkan S-1 Ilmu Komunikasi, bukan jumlah kursi dan bukan lowongan 2026.",
      instansi: [
        { nama: "Pemkot Gorontalo", md: "5 formasi · 13 pelamar", isi: "5 formasi, semuanya dokter umum dan spesialis", hasil: "Gugur" },
        { nama: "Pemkab Bangli", md: "9 · 19", isi: "9 formasi dokter spesialis/subspesialis dan tenaga sanitasi", hasil: "Gugur" },
        { nama: "Pemkab Purworejo", md: "17 · 39", isi: "18 kursi dokter, dokter spesialis, dan entomolog kesehatan", hasil: "Gugur" },
        { nama: "Pemkab Bondowoso", md: "27 · 58", isi: "27 kursi dokter dan dokter gigi", hasil: "Gugur" },
        { nama: "Pemkot Tidore Kepulauan", md: "51 · 62", isi: "53 kursi dokter, dokter gigi, apoteker, pranata laboratorium, radiografer", hasil: "Gugur" },
        { nama: "BRIN", md: "500 · 460", isi: "263 kursi Peneliti Ahli Muda, khusus S-3", hasil: "Gugur" },
        { nama: "Kemenko PMK", md: "65 · 345", isi: "Terutama Fasilitator Pemerintahan; S-1 Ilmu Komunikasi hanya terlihat di Penata Keprotokolan (3 kursi)", hasil: "Tidak cocok (lisan)" },
        { nama: "KemenPANRB", md: "61 · 374", isi: "Analis Kebijakan, Pranata Komputer, Analis SDM, Perencana; S-1 Ilmu Komunikasi tidak terlihat di contoh jurusannya", hasil: "Belum jelas" }
      ],
      instansiHasil: "Rasionya rendah karena syaratnya sempit (dokter, S-3), bukan karena sepi. Angka pelamarnya juga potret saat pendaftaran 2024 masih berjalan dan berbeda antarmedia. Jangan memilih instansi dari statistik pelamar sebelum melihat jabatan dan jurusannya."
    },

    // Instansi yang dipantau untuk 2026: sinyal 2026 x jejak formasi Ilmu Komunikasi 2024.
    pantau: [
      { nama: "Mahkamah Agung", kelas: "ok", sinyal: "2.830 CPNS + 1.600 calon hakim, pengumuman akhir November; termasuk 14 K/L prioritas tambahan pegawai.",
        jejak: "2024: Pengembang Teknologi Pembelajaran 6 kursi dan Penata Keprotokolan 46 kursi menerima S-1 Ilmu Komunikasi; Arsiparis khusus kearsipan.",
        saran: "Prioritas pantau. Cek Pengembang Teknologi Pembelajaran dan Pranata Humas; penempatan pengadilan di seluruh Indonesia. SKB 2024 memakai 3 metode, jadi cek apakah ada wawancara." },
      { nama: "Kementerian Kesehatan", kelas: "accent", sinyal: "Menyatakan segera membuka (casn.kemkes.go.id); jumlah belum diumumkan.",
        jejak: "2024: Pranata Humas 89 kursi di 57 formasi, banyak di UPT daerah (balai kekarantinaan, rumah sakit vertikal).",
        saran: "Pantau Pranata Humas di UPT daerah." },
      { nama: "Kementerian Keuangan", kelas: "warn", sinyal: "1.915 formasi umum (SMA/SMK, D-III, S-1) di semua unit eselon I.",
        jejak: "2024: 1.066 kursi, terbanyak penyusun materi hukum, Fasilitator Pemerintahan, Pengelola Keprotokolan (D-III), dan TI; S-1 Ilmu Komunikasi tidak tampak di 10 jurusan teratasnya.",
        saran: "Tetap cek, tetapi peluang untuk Ilmu Komunikasi kecil dan instansinya sangat ramai." },
      { nama: "Instansi dengan jejak Ilmu Komunikasi terbesar 2024 (belum ada kabar 2026)", kelas: "accent", sinyal: "Belum menyebut formasi 2026.",
        jejak: "Komdigi (Pranata Humas, Arsiparis 81 formasi, Pranata Siaran RRI/TVRI), Kementerian PU (Pranata Humas 340 formasi di balai daerah, Arsiparis 240), Kemenag (Pranata Humas 90 formasi, Pengembang Teknologi Pembelajaran 19), PTN (Pranata Humas, Arsiparis), Bawaslu (Pranata Humas 19 kursi di Sekretariat Jenderal), BPS (Pranata Humas 26 formasi).",
        saran: "Begitu SSCASN terbit, cek instansi ini lebih dulu." },
      { nama: "Pemerintah daerah Jabodetabek dan Banten", kelas: "warn", sinyal: "Belum ada keputusan resmi formasi daerah; BKD DKI menunggu juklak dan juknis.",
        jejak: "Pemprov DKI 2024: Pranata Humas 28 formasi dan Pengembang Teknologi Pembelajaran 17 formasi.",
        saran: "Jalur Jabodetabek bila dibuka, dengan rasio yang biasanya tinggi." },
      { nama: "Kemenhut dan Kemendikdasmen", kelas: "", sinyal: "Formasi prioritas: Polisi Hutan, Manggala Agni, guru Sekolah Terintegrasi dan Sekolah Unggul Garuda.",
        jejak: "Formasi prioritas itu butuh ijazah kehutanan, SMA, atau kependidikan.",
        saran: "Tidak cocok, kecuali ternyata membuka Pranata Humas atau tenaga kependidikan nonguru." }
    ],

    // Peringkat target untuk profil: S-1 Ilmu Komunikasi, minat IT, tidak nyaman dengan pekerjaan lisan,
    // Jabodetabek tetapi siap nasional.
    target: [
      {
        tier: "1", judul: "Paling cocok, kerja belakang layar (siap di luar Jabodetabek)", kelas: "ok",
        isi: [
          "Arsiparis Ahli Pertama yang mencantumkan S-1 Ilmu Komunikasi: PTN, Komdigi, Kementerian PU, dan instansi vertikal di daerah",
          "Pengembang Teknologi Pembelajaran (produksi video dan e-learning): Mahkamah Agung, Kemenag, PTN, Kemensetneg",
          "Perencana atau Analis Kebijakan yang mencantumkan Ilmu Komunikasi: jarang, tetapi kerjanya dokumen dan data"
        ]
      },
      {
        tier: "2", judul: "Kesempatan terbanyak, penempatan nasional", kelas: "accent",
        isi: [
          "Pranata Humas di unit konten digital: balai Kementerian PU di daerah (340 formasi pada 2024), Kemenag, UPT Kemenkes, Kementan, BPS",
          "Mahkamah Agung (2.830 CPNS 2026): cek Pengembang Teknologi Pembelajaran dan Pranata Humas, dan apakah SKB-nya memakai wawancara",
          "LPP RRI dan TVRI bila dibuka lagi: Pranata Siaran bagian produksi di stasiun daerah, bukan penyiar atau reporter"
        ]
      },
      {
        tier: "3", judul: "Jabodetabek dan Banten (persaingan tinggi)", kelas: "warn",
        isi: [
          "PTN dekat Tangerang bila membuka formasi untuk Ilmu Komunikasi: Untirta (Serang), UNJ, UPN Veteran Jakarta, Politeknik Negeri Jakarta, Politeknik Negeri Media Kreatif. Pilih Arsiparis atau Pengembang Teknologi Pembelajaran",
          "Kantor pusat: Kemensetneg (Pengembang Teknologi Pembelajaran di Pusbangkom ASN), Kemendiktisaintek dan Kementerian Kebudayaan (Arsiparis), Komdigi (Pranata Humas bagian konten digital)",
          "Pemprov DKI bila formasi daerah dibuka (2024: Pranata Humas 28 formasi, Pengembang Teknologi Pembelajaran 17): rasio biasanya paling tinggi, jadikan pilihan terakhir"
        ]
      }
    ],
    hindari: [
      "Jabatan yang tugas intinya berbicara di depan orang: Penata Keprotokolan, Fasilitator Pemerintahan, Penggerak Swadaya Masyarakat, Penyuluh Sosial, Instruktur, Edukator, penyiar, dan reporter",
      "Instansi yang terlihat sepi di statistik pelamar sebelum melihat jabatannya: pada 2024 Pemkot Gorontalo, Pemkab Bangli, Purworejo, Bondowoso, dan Tidore hanya membuka formasi dokter, BRIN hanya S-3",
      "Formasi \"S-1 semua jurusan\" di Jakarta: pesaingnya dari semua jurusan",
      "Pranata Humas di instansi favorit (mis. Kemenkeu, Kemenlu): paling ramai dan banyak tugas lisan",
      "Formasi cumlaude atau yang mensyaratkan akreditasi lebih tinggi dari akreditasi prodi Anda pada tahun lulus"
    ],

    aturan: [
      { t: "Saring syarat wajib", d: "S-1 ILMU KOMUNIKASI tertulis persis di kualifikasi pendidikan (S-1 Hubungan Masyarakat atau Komunikasi Massa adalah prodi lain); IPK, akreditasi pada tahun kelulusan, usia (umumnya 18–35 tahun saat melamar), dan syarat tambahan seperti sertifikat bahasa Inggris terpenuhi." },
      { t: "Kerja belakang layar", d: "Utamakan jabatan yang hasil kerjanya arsip, data, dokumen, atau media (Arsiparis, Pengembang Teknologi Pembelajaran, Perencana). Lewati jabatan yang tugas intinya bicara di depan orang." },
      { t: "Cek metode SKB", d: "SKB berbasis CAT tidak menuntut bicara. Wawancara menambah komponen lisan, jadi baca metode SKB di pengumuman instansi sebelum memilih. Bawaslu 2024 memakai SKB CAT saja; Mahkamah Agung 2024 memakai 3 metode." },
      { t: "Lokasi yang sepi", d: "Kantor pusat dan kota besar paling ramai. Unit di daerah, balai, dan PTN luar Jawa biasanya jauh lebih sepi." },
      { t: "Daftar jurusan yang sempit", d: "Makin sedikit jurusan yang diterima, makin sedikit pesaing. Hindari formasi semua jurusan." },
      { t: "Jabatan sama di banyak lokasi", d: "Pada CPNS 2024, kursi kosong bisa diisi peserta yang lulus ambang batas dengan nilai tertinggi dari jabatan, kualifikasi pendidikan, dan jenis formasi yang sama dalam satu instansi (optimalisasi). Aturan 2026 menunggu keputusan MenPANRB." },
      { t: "Kunci pilihan sebelum mengakhiri pendaftaran", d: "Satu pelamar satu formasi dan pilihan tidak bisa diganti setelah pendaftaran diakhiri. Pilih formasi dengan beberapa kursi bila bisa, dan jangan menunggu hari terakhir." }
    ],

    langkah: [
      { id: "akun", t: "Buat akun SSCASN (sudah dibuka sejak 14 November)." },
      { id: "dok", t: "Siapkan pindaian ijazah dan transkrip asli, KTP, pas foto, dan swafoto sesuai ketentuan." },
      { id: "akr", t: "Unduh bukti akreditasi prodi dan perguruan tinggi yang berlaku pada tanggal kelulusan di ijazah (BAN-PT atau kampus)." },
      { id: "toefl", t: "Siapkan sertifikat bahasa Inggris. Kominfo 2024 mewajibkan sertifikat yang berlaku paling lama 2 tahun." },
      { id: "pindai", t: "Saat formasi terbit: di SSCASN pilih jenjang S-1 dan program studi Ilmu Komunikasi, catat semua formasi yang muncul, lalu cek instansi pantau lebih dulu." },
      { id: "kalk", t: "Masukkan 5–10 kandidat ke kalkulator: skornya memakai rumus dokumen riset Anda (rasio 35, kursi 20, tugas 20, lokasi 10, syarat 15)." },
      { id: "daftar", t: "Pilih satu formasi, unggah dokumen, dan akhiri pendaftaran beberapa hari sebelum penutupan." },
      { id: "ms", t: "Setelah hasil seleksi administrasi: cek jumlah pesaing yang memenuhi syarat di formasi Anda dan perbarui kalkulator." },
      { id: "skd", t: "Latih SKD sampai simulasi penuh konsisten di atas ambang batas tiap subtes, dengan target total 400 atau lebih." }
    ],

    jalurLain: [
      { t: "PPPK 2026", s: "Tidak ada seleksi umum", d: "Fokus pemerintah: PPPK paruh waktu menjadi penuh waktu bertahap mulai 2027. PPPK Sekolah Rakyat (Kemensos) Juni–Juli 2026 terbuka untuk umum dan sudah ditutup; pantau gelombang berikutnya." },
      { t: "Honorer / non-ASN di instansi", s: "Ditutup", d: "UU 20/2023 melarang instansi pemerintah mengangkat pegawai non-ASN untuk mengisi jabatan ASN. Waspadai tawaran \"honorer\" berbayar." },
      { t: "Guru CPNS/PPPK", s: "Tidak cocok", d: "Butuh kualifikasi guru dan sertifikat pendidik (PPG). Formasi prioritas 2026 (Sekolah Terintegrasi, Sekolah Unggul Garuda) untuk pendidik; formasi tenaga kependidikannya layak dicek." },
      { t: "Pegawai PTN Badan Hukum", s: "Layak dipantau", d: "PTN-BH seperti UI dan IPB merekrut tenaga kependidikan non-PNS dengan seleksi sendiri. Dekat Jabodetabek dan cocok dengan pengalaman data akademik." },
      { t: "BUMN, BI, OJK, LPS", s: "Cek usia", d: "Bukan ASN. Seleksi sendiri, batas usia sering lebih rendah dari 35 tahun." },
      { t: "TNI/Polri jalur sarjana", s: "Cek usia", d: "Perwira jalur sarjana punya batas usia dan syarat fisik ketat." },
      { t: "Pendamping program pemerintah", s: "Kontrak", d: "Misalnya pendamping desa atau PKH: berbasis kontrak, bukan ASN." }
    ],

    sumber: [
      { t: "BKN targetkan pengumuman 23–29 November, 158 ribu formasi (Radar Kudus, 17 Nov 2026)", u: "https://radarkudus.jawapos.com/nasional/2611170062/kapan-pendaftaran-cpns-2026-dimulai-bkn-targetkan-pengumuman-23-29-november" },
      { t: "Kemenkeu, Kemenkes, dan MA umumkan CPNS 2026 (detikJabar, 18 Nov 2026)", u: "https://www.detik.com/jabar/berita/d-8758794/3-instansi-umumkan-buka-lowongan-di-cpns-2026-simak-kuota-dan-cara-daftarnya" },
      { t: "MA akan rekrut 4 ribuan CPNS dan calon hakim (MARINews)", u: "https://marinews.mahkamahagung.go.id/berita/ma-akan-rekrut-4-ribuan-cpns-dan-cakim-bersiaplah-0b4h" },
      { t: "Benarkah CPNS 2026 hanya formasi pusat? (detikJateng)", u: "https://www.detik.com/jateng/bisnis/d-8747719/benarkah-cpns-2026-hanya-buka-formasi-di-pusat-cek-faktanya" },
      { t: "BKD DKI menunggu juklak dan juknis (TribunJakarta)", u: "https://jakarta.tribunnews.com/jakarta/446374/cpns-dki-jakarta-2026-ini-bocoran-formasi-yang-jadi-prioritas-ada-polisi-hutan-hingga-guru-garuda" },
      { t: "Formasi prioritas CPNS 2026 (CNBC Indonesia, 9 Nov 2026)", u: "https://www.cnbcindonesia.com/news/20261109063714-4-783348/rekrutmen-cpns-dibuka-november-2026-ini-formasi-prioritasnya" },
      { t: "Akun SSCASN dibuka (detikEdu, 14 Nov 2026)", u: "https://www.detik.com/edu/detikpedia/d-8752780/update-terbaru-seleksi-cpns-2026-pendaftaran-akun-sscasn-sudah-dibuka" },
      { t: "Kemenkeu 1.915 formasi (Kontan)", u: "https://nasional.kontan.co.id/news/bersiap-kemenkeu-buka-1915-formasi-cpns-di-november-2026" },
      { t: "Data formasi 2024 per jabatan dan instansi, olahan MisiPNS atas data BKN (pihak ketiga)", u: "https://www.misipns.com/cpns/jabatan/pranata-hubungan-masyarakat-ahli-pertama" },
      { t: "Pengumuman CPNS Kejaksaan 2024 (salinan UGM)", u: "https://deb.sv.ugm.ac.id/wp-content/uploads/sites/98/2024/08/CPNS-KEJAKSAAN-2024.pdf" },
      { t: "Rekap hasil akhir CPNS 2024 Mahkamah Agung (BKN)", u: "https://www.mahkamahagung.go.id/media/13404" },
      { t: "Formasi CPNS 2024 Kemendikbudristek (salinan UGM)", u: "https://chemistry.ugm.ac.id/wp-content/uploads/sites/1671/2024/09/Seleksi-Penerimaan-CPNS-Kemdikbudristek-TA-2024.pdf" },
      { t: "Formasi CPNS 2024 Kemensetneg", u: "https://setkab.go.id/wp-content/uploads/2024/08/1031Pengumuman_CPNS_2024.pdf" },
      { t: "Formasi CPNS 2024 Bawaslu", u: "https://bawaslu.go.id/sites/default/files/pengumuman/0819%20-%20964%20-%20PENGUMUMAN%20CPNS%20TA%202024.pdf" },
      { t: "Formasi Kominfo 2024 untuk lulusan komunikasi (Kontan)", u: "https://momsmoney.kontan.co.id/news/ini-daftar-formasi-dan-rentang-gaji-cpns-kominfo-2024-untuk-lulusan-komunikasi" },
      { t: "Kominfo, RRI, TVRI 4.215 formasi 2024 (Antara)", u: "https://babel.antaranews.com/berita/427647/kemenkominfo-buka-4215-formasi-untuk-cpns-2024" },
      { t: "Instansi \"sepi peminat\" CPNS 2024, potret saat pendaftaran (Tirto)", u: "https://tirto.id/statistik-pelamar-cpns-2024-terbaru-kapan-penutupannya-g3r3" },
      { t: "Hasil akhir pelamar CPNS 2024 per instansi (GoodStats)", u: "https://goodstats.id/article/telah-ditutup-cek-hasil-final-instansi-cpns-2024-terketat-FIS6U" },
      { t: "Kemenag: 37.849 lulus SKD 2024 (Bisnis)", u: "https://kabar24.bisnis.com/read/20241124/15/1818592/37849-peserta-lulus-skd-calon-pns-kemenag-2024-cek-link-jadwal-skb-di-sini" },
      { t: "Cara cek jumlah pesaing per formasi (CNN Indonesia)", u: "https://www.cnnindonesia.com/edukasi/20241004165434-561-1151655/cara-cek-jumlah-pesaing-cpns-2024-sesuai-jabatan-yang-dilamar" },
      { t: "Formasi pemda belum pasti (topik.id)", u: "https://www.topik.id/benarkah-cpns-2026-hanya-buka-formasi-pusat-ini-penjelasan-bkn-dan-kemenpanrb" },
      { t: "PPPK Sekolah Rakyat 2026 (Kompas TV)", u: "https://www.kompas.tv/ekonomi/673121/link-jadwal-dan-cara-daftar-pppk-tendik-sekolah-rakyat-2026-ada-5-127-formasi-maksimal-45-tahun" },
      { t: "Portal resmi SSCASN", u: "https://sscasn.bkn.go.id/" }
    ]
  };
})();
