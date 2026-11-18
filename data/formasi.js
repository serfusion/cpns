/* Strategi pemilihan formasi CPNS 2026 untuk lulusan S-1 Ilmu Komunikasi.
   Hasil pemindaian 18 November 2026: status resmi + data formasi dan hasil seleksi CPNS 2024.
   Rincian formasi 2026 belum terbit; perbarui file ini begitu SSCASN menampilkan formasi. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});

  SKD.formasi = {
    tanggal: "18 November 2026",
    jurusan: "S-1 Ilmu Komunikasi",

    status: [
      "Rekrutmen CPNS 2026 diumumkan 6 November 2026 (siaran pers KemenPANRB No. 378/HUMAS-MENPANRB/2026). Pembuatan akun SSCASN dibuka sejak 14 November 2026.",
      "Rincian formasi belum terbit. Kepala BKN menargetkan pengumuman sekitar 20–23 November dan pendaftaran pada pekan keempat November. Jadwal SKD belum diumumkan.",
      "Total sekitar 150 ribu formasi (perkiraan MenPANRB, belum final), jauh di bawah 250.407 formasi CPNS 2024.",
      "Prioritas pemerintah: Polisi Hutan, Manggala Agni, guru sekolah terintegrasi, pendidik dan tenaga kependidikan Sekolah Unggul Garuda, serta program prioritas nasional lain.",
      "Instansi yang sudah menyebut angka: Mahkamah Agung 2.830 CPNS (ditambah 1.600 calon hakim) dan Kementerian Keuangan 1.915 CPNS. Rincian jabatannya belum diumumkan.",
      "Formasi pemerintah daerah belum pasti: Pemprov DKI masih menunggu juknis pusat, Pemprov Bali mengusulkan 611 formasi ASN, sebagian BKPSDM menyebut belum ada formasi daerah.",
      "Tidak ada seleksi PPPK untuk pelamar umum yang diumumkan. PPPK paruh waktu diangkat menjadi penuh waktu bertahap mulai 1 Januari 2027.",
      "Seperti 2024, satu pelamar diperkirakan hanya boleh memilih satu formasi. KemenPANRB menegaskan seluruh tahapan gratis."
    ],

    // Angka persaingan acuan (CPNS 2024) dan perkiraan 2026.
    angka: [
      { v: "≈16", l: "pelamar per kursi, nasional 2024", d: "3.963.832 pelamar untuk 250.407 formasi" },
      { v: "≈62", l: "pelamar per kursi di Kemenkumham 2024", d: "567,5 ribu pelamar, 9.070 formasi" },
      { v: "12%", l: "peserta SKD Kemenag 2024 yang lolos ke SKB", d: "37.849 dari 313.078 peserta" },
      { v: "≥20", l: "perkiraan rata-rata 2026", d: "kursi turun ±40% dan 2025 tanpa CPNS umum (perkiraan, bukan data resmi)" }
    ],

    // Jabatan yang terbukti menerima S-1 Ilmu Komunikasi pada CPNS 2024.
    // saing: "rendah" | "sedang" | "tinggi" (penilaian dari pola 2024). cocok: kecocokan dengan minat IT/digital.
    // lisan: seberapa banyak tugas inti menuntut bicara di depan orang. Jabatan "tinggi" disembunyikan bila filter aktif.
    jabatan: [
      {
        id: "arsip", nama: "Arsiparis Ahli Pertama", saing: "rendah", cocok: "tinggi", lisan: "rendah",
        tugas: "Mengelola arsip dinamis dan statis, termasuk alih media dan arsip digital. Kerja di balik meja.",
        bukti: [
          "Kemendikbudristek 2024: 9 kursi menerima S-1 Ilmu Komunikasi, antara lain Universitas Sultan Ageng Tirtayasa (Serang) 2 kursi dan Universitas Jambi 1 kursi",
          "BNN 2024: 1 kursi di Biro Umum (bersama 14 jurusan lain)",
          "Mahkamah Agung 2024: 20 kursi Arsiparis (khusus jurusan kearsipan) hanya diikuti 14 peserta SKB, jadi 6 kursi kosong"
        ],
        catatan: "Jarang dilirik lulusan Ilmu Komunikasi dan cocok dengan pengalaman mengelola data serta arsip akademik. Tidak semua instansi menerima Ilmu Komunikasi, jadi cek daftar jurusannya."
      },
      {
        id: "ptp", nama: "Pengembang Teknologi Pembelajaran Ahli Pertama", saing: "sedang", cocok: "tinggi", lisan: "rendah",
        tugas: "Membuat media dan kelas daring: video pembelajaran, e-learning, LMS. Hasil kerjanya produk, bukan presentasi.",
        bukti: [
          "Mahkamah Agung 2024: 6 kursi, menerima Ilmu Komunikasi, informatika, dan jurusan pendidikan; 18 peserta SKB, terisi penuh",
          "Kemensetneg 2024: 2 kursi di Pusat Pengembangan Kompetensi ASN (D-IV Produksi Media, S-1 Teknologi Pendidikan, S-1 DKV, S-1 Ilmu Komunikasi)",
          "Kominfo 2024: 1 kursi di Puslitbang SDPPI (menurut daftar media untuk lulusan komunikasi)"
        ],
        catatan: "Paling dekat dengan minat IT tanpa ijazah informatika: produksi video, web, dan alat bantu AI dipakai sehari-hari."
      },
      {
        id: "perencana", nama: "Perencana Ahli Pertama (bila menerima Ilmu Komunikasi)", saing: "sedang", cocok: "sedang", lisan: "rendah",
        tugas: "Menyusun rencana program, anggaran, dan laporan kinerja berbasis data.",
        bukti: ["Kemendikbudristek 2024: 2 kursi di Universitas Mulawarman mencantumkan S-1 Ilmu Komunikasi"],
        catatan: "Jarang membuka Ilmu Komunikasi, tetapi kerjanya dokumen dan data. Masukkan ke daftar pantau saat memindai SSCASN."
      },
      {
        id: "siaran", nama: "Jabatan produksi di LPP RRI dan TVRI", saing: "sedang", cocok: "tinggi", lisan: "rendah",
        tugas: "Penyuntingan video dan audio, grafis, dan produksi konten di stasiun pusat dan daerah.",
        bukti: ["CPNS 2024: LPP RRI 1.093 formasi dan LPP TVRI 2.453 formasi di seluruh Indonesia (rincian jurusan per jabatan belum terverifikasi)"],
        catatan: "Bila dibuka lagi, pilih jabatan produksi atau teknis di stasiun daerah. Hindari penyiar dan reporter. Pastikan Ilmu Komunikasi tercantum."
      },
      {
        id: "analis", nama: "Analis Kebijakan Ahli Pertama", saing: "tinggi", cocok: "sedang", lisan: "sedang",
        tugas: "Menyusun kajian dan rekomendasi kebijakan; banyak menulis, sesekali memaparkan.",
        bukti: ["Kemendikbudristek 2024: 3 kursi di Sekretariat Jenderal (10 jurusan diterima)", "Kominfo 2024: Sekretariat Dewan Pers 1, Ditjen IKP 1 (menurut media)"],
        catatan: "Banyak jurusan ikut bersaing, jadi bukan pilihan utama."
      },
      {
        id: "humas", nama: "Pranata Hubungan Masyarakat Ahli Pertama", saing: "tinggi", cocok: "tinggi", lisan: "sedang",
        tugas: "Produksi konten (desain, video, situs web, media sosial), tetapi juga liputan, wawancara, dan hubungan dengan media.",
        bukti: [
          "Kemendikbudristek 2024: 30 kursi di 22 unit, sebagian besar PTN (mis. UNJ 1, Untirta 2, Unsri 3, Unja 2, Undiksha 2)",
          "Bawaslu 2024: 19 kursi di Sekretariat Jenderal (Jakarta)",
          "Kominfo 2024: Biro Humas 3, Komisi Informasi Pusat 2, Direktorat IKP PMK 4 (menurut media); Kemensos 7 (+5 IKN)",
          "Kemensetneg dan Setkab 2024: Pranata Humas justru TIDAK menerima S-1 Ilmu Komunikasi (hanya Humas, DKV, Manajemen Komunikasi, Desain Grafis)"
        ],
        catatan: "Paling ramai pelamar dan sebagian tugasnya lisan. Ambil hanya bila unitnya jelas mengurus konten digital (desain, video, situs), dan selalu cek nama program studi persis."
      },
      {
        id: "protokol", nama: "Penata Keprotokolan", saing: "sedang", cocok: "sedang", lisan: "tinggi",
        tugas: "Mengatur acara resmi, tata upacara, dan kunjungan pimpinan.",
        bukti: [
          "Mahkamah Agung 2024: 46 kursi umum (+5 cumlaude, +1 Papua) hanya untuk S-1 Hubungan Masyarakat, Ilmu Komunikasi, dan Manajemen Komunikasi; 138 peserta SKB, terisi penuh",
          "Sekretariat Kabinet 2024: 3 kursi (S-1 Ilmu Komunikasi, S-1 Sastra Inggris); Kantor Staf Presiden 2024: 1 kursi"
        ],
        catatan: "Kuota besar, tetapi tugas intinya koordinasi dan berbicara dengan banyak orang."
      },
      {
        id: "instruktur", nama: "Instruktur Ahli Pertama (Komdigi)", saing: "rendah", cocok: "tinggi", lisan: "tinggi",
        tugas: "Melatih talenta dan literasi digital di depan kelas.",
        bukti: ["Kominfo 2024: 3 kursi di BPSDMP Banjarmasin dan 3 kursi di BPSDMP Yogyakarta (menurut daftar media untuk lulusan komunikasi)"],
        catatan: "Sepi pelamar, tetapi pekerjaannya mengajar."
      },
      {
        id: "psm", nama: "Penggerak Swadaya Masyarakat Ahli Pertama (Komdigi)", saing: "sedang", cocok: "tinggi", lisan: "tinggi",
        tugas: "Menjalankan program pemberdayaan dan literasi digital langsung di masyarakat.",
        bukti: ["Kominfo 2024: 11 kursi di Direktorat Pemberdayaan Informatika dan 2 kursi di Direktorat Ekonomi Digital (menurut daftar media untuk lulusan komunikasi)"],
        catatan: "Banyak sosialisasi dan pendampingan tatap muka."
      },
      {
        id: "fasilitator", nama: "Fasilitator Pemerintahan (Kemensetneg, Setkab)", saing: "tinggi", cocok: "sedang", lisan: "tinggi",
        tugas: "Memfasilitasi rapat, kerja sama, dan layanan pemerintahan.",
        bukti: [
          "Kemensetneg 2024: 4 kursi umum + 1 disabilitas di Biro Kerja Sama Teknik Luar Negeri (D-IV Layanan Publik, S-1 Ilmu Komunikasi, S-1 Hubungan Masyarakat)",
          "Sekretariat Kabinet 2024: 4 kursi umum (+2 cumlaude, +1 Putra/Putri Kalimantan) bersama jurusan hukum, pemerintahan, dan ekonomi"
        ],
        catatan: "Jabodetabek, tetapi instansi favorit dan tugasnya banyak koordinasi lisan."
      },
      {
        id: "edukator", nama: "Edukator (museum dan cagar budaya)", saing: "sedang", cocok: "sedang", lisan: "tinggi",
        tugas: "Memandu dan mengedukasi pengunjung museum.",
        bukti: ["Kemendikbudristek 2024: 2 kursi di unit museum dan cagar budaya"],
        catatan: "Tugas intinya menjelaskan kepada pengunjung."
      }
    ],

    tidakBisa: "Jabatan TI murni (Pranata Komputer, Penata Kelola Sistem dan Teknologi Informasi, Manggala Informatika) dan Statistisi mensyaratkan ijazah informatika atau statistik. Di Mahkamah Agung 2024, Penata Kelola Sistem dan TI hanya menerima jurusan komputer dan TI. Salurkan minat IT lewat Pengembang Teknologi Pembelajaran, arsip digital, dan produksi media.",

    // Peringkat target untuk profil: S-1 Ilmu Komunikasi, minat IT, tidak nyaman dengan pekerjaan lisan,
    // Jabodetabek tetapi siap nasional.
    target: [
      {
        tier: "1", judul: "Peluang tertinggi, kerja belakang layar (siap di luar Jabodetabek)", kelas: "ok",
        isi: [
          "Arsiparis Ahli Pertama yang menerima S-1 Ilmu Komunikasi di PTN, balai, atau instansi vertikal di luar kota besar",
          "Pengembang Teknologi Pembelajaran (produksi video dan e-learning) di balai atau PTN daerah",
          "Perencana atau jabatan dokumen lain yang mencantumkan Ilmu Komunikasi: jarang, tetapi sepi"
        ]
      },
      {
        tier: "2", judul: "Kuota besar, penempatan nasional", kelas: "accent",
        isi: [
          "Mahkamah Agung (2.830 CPNS): Pengembang Teknologi Pembelajaran bila dibuka lagi. SKB-nya pada 2024 memakai 3 metode, jadi cek apakah ada wawancara",
          "LPP RRI dan TVRI bila dibuka lagi: jabatan produksi atau teknis di stasiun daerah, bukan penyiar atau reporter"
        ]
      },
      {
        tier: "3", judul: "Jabodetabek dan Banten (persaingan tinggi)", kelas: "warn",
        isi: [
          "PTN dekat Tangerang bila membuka formasi untuk Ilmu Komunikasi: Untirta (Serang), UNJ, UPN Veteran Jakarta, Politeknik Negeri Jakarta, Politeknik Negeri Media Kreatif. Pilih Arsiparis atau Pengembang Teknologi Pembelajaran",
          "Kantor pusat: Kemensetneg (Pengembang Teknologi Pembelajaran di Pusbangkom ASN), Kemendiktisaintek dan Kementerian Kebudayaan (Arsiparis), Komdigi (Pranata Humas bagian konten digital)",
          "Pemerintah daerah Jabodetabek bila dibuka: rasio biasanya paling tinggi, jadikan pilihan terakhir"
        ]
      }
    ],
    hindari: [
      "Jabatan yang tugas intinya berbicara di depan orang: Penata Keprotokolan, Instruktur, Penggerak Swadaya Masyarakat, Fasilitator Pemerintahan, Edukator, penyiar, dan reporter",
      "Formasi \"S-1 semua jurusan\" di Jakarta: pesaingnya dari semua jurusan",
      "Pranata Humas di instansi favorit (mis. Kemenkeu, Kemenlu): paling ramai dan banyak tugas lisan",
      "Formasi cumlaude bila akreditasi prodi atau kampus pada tahun lulus bukan A/Unggul",
      "Formasi yang mensyaratkan akreditasi lebih tinggi dari akreditasi prodi Anda pada tahun lulus"
    ],

    aturan: [
      { t: "Saring syarat wajib", d: "S-1 ILMU KOMUNIKASI tertulis di kualifikasi pendidikan; IPK, akreditasi pada tahun kelulusan, usia (umumnya 18–35 tahun saat melamar), dan syarat tambahan seperti sertifikat bahasa Inggris terpenuhi." },
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
      { id: "pindai", t: "Saat formasi terbit: di SSCASN pilih jenjang S-1 dan program studi Ilmu Komunikasi, lalu catat semua formasi yang muncul." },
      { id: "kalk", t: "Masukkan 5–10 kandidat ke kalkulator di bawah, lalu baca pengumuman resmi tiap instansi (syarat khusus, lokasi, metode SKB)." },
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
      { t: "Formasi prioritas CPNS 2026 (CNBC Indonesia, 9 Nov 2026)", u: "https://www.cnbcindonesia.com/news/20261109063714-4-783348/rekrutmen-cpns-dibuka-november-2026-ini-formasi-prioritasnya" },
      { t: "Status CPNS 2026 (Drillo, diperbarui 18 Nov 2026)", u: "https://www.drillo.id/blog/cpns-2026-dibuka-november" },
      { t: "Akun SSCASN dibuka (detikEdu, 14 Nov 2026)", u: "https://www.detik.com/edu/detikpedia/d-8752780/update-terbaru-seleksi-cpns-2026-pendaftaran-akun-sscasn-sudah-dibuka" },
      { t: "Kemenkeu 1.915 formasi (Kontan)", u: "https://nasional.kontan.co.id/news/bersiap-kemenkeu-buka-1915-formasi-cpns-di-november-2026" },
      { t: "Mahkamah Agung 4.430 formasi (detikFinance)", u: "https://finance.detik.com/cpns/d-8741261/ma-buka-4-430-lowongan-cpns-dan-calon-hakim" },
      { t: "Formasi pemda belum pasti (topik.id)", u: "https://www.topik.id/benarkah-cpns-2026-hanya-buka-formasi-pusat-ini-penjelasan-bkn-dan-kemenpanrb" },
      { t: "Rekap hasil akhir CPNS 2024 Mahkamah Agung (BKN)", u: "https://www.mahkamahagung.go.id/media/13404" },
      { t: "Formasi CPNS 2024 Kemendikbudristek (salinan UGM)", u: "https://chemistry.ugm.ac.id/wp-content/uploads/sites/1671/2024/09/Seleksi-Penerimaan-CPNS-Kemdikbudristek-TA-2024.pdf" },
      { t: "Formasi CPNS 2024 Kemensetneg", u: "https://setkab.go.id/wp-content/uploads/2024/08/1031Pengumuman_CPNS_2024.pdf" },
      { t: "Formasi CPNS 2024 Bawaslu", u: "https://bawaslu.go.id/sites/default/files/pengumuman/0819%20-%20964%20-%20PENGUMUMAN%20CPNS%20TA%202024.pdf" },
      { t: "Formasi Kominfo 2024 untuk lulusan komunikasi (Kontan)", u: "https://momsmoney.kontan.co.id/news/ini-daftar-formasi-dan-rentang-gaji-cpns-kominfo-2024-untuk-lulusan-komunikasi" },
      { t: "Kominfo, RRI, TVRI 4.215 formasi 2024 (Antara)", u: "https://babel.antaranews.com/berita/427647/kemenkominfo-buka-4215-formasi-untuk-cpns-2024" },
      { t: "Hasil akhir pelamar CPNS 2024 per instansi (GoodStats)", u: "https://goodstats.id/article/telah-ditutup-cek-hasil-final-instansi-cpns-2024-terketat-FIS6U" },
      { t: "Kemenag: 37.849 lulus SKD 2024 (Bisnis)", u: "https://kabar24.bisnis.com/read/20241124/15/1818592/37849-peserta-lulus-skd-calon-pns-kemenag-2024-cek-link-jadwal-skb-di-sini" },
      { t: "Cara cek jumlah pesaing per formasi (CNN Indonesia)", u: "https://www.cnnindonesia.com/edukasi/20241004165434-561-1151655/cara-cek-jumlah-pesaing-cpns-2024-sesuai-jabatan-yang-dilamar" },
      { t: "Daftar 1.000 formasi tersepi CPNS 2024 (warganet, belum diverifikasi)", u: "https://x.com/vindikasi/status/2065541711682785430" },
      { t: "PPPK Sekolah Rakyat 2026 (Kompas TV)", u: "https://www.kompas.tv/ekonomi/673121/link-jadwal-dan-cara-daftar-pppk-tendik-sekolah-rakyat-2026-ada-5-127-formasi-maksimal-45-tahun" },
      { t: "Portal resmi SSCASN", u: "https://sscasn.bkn.go.id/" }
    ]
  };
})();
