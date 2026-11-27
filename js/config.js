/* Konfigurasi format SKD + peta materi hasil riset.
   Semua angka format ujian ada di sini supaya mudah diubah kalau aturan 2026 terbit. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});

  SKD.config = {
    appName: "Latihan SKD CPNS",
    // Acuan: KepmenPANRB 674/2026 (ditetapkan 20 November 2026) tentang mekanisme seleksi PNS dan nilai ambang batas SKD
    // tahun anggaran 2026. Sebelumnya KepmenPANRB 321/2024. Aturan khusus CPNS 2026
    // belum terbit saat aplikasi ini dibuat (16 Nov 2026) — ubah di menu Pengaturan bila berbeda.
    exam: { minutes: 100 },
    sections: [
      { id: "twk", short: "TWK", name: "Tes Wawasan Kebangsaan", count: 30, pass: 65, max: 150 },
      { id: "tiu", short: "TIU", name: "Tes Intelegensia Umum", count: 35, pass: 80, max: 175 },
      { id: "tkp", short: "TKP", name: "Tes Karakteristik Pribadi", count: 45, pass: 166, max: 225 }
    ],
    /* quota = perkiraan jumlah soal per materi dalam satu paket 110 soal.
       Rincian per materi tidak dipublikasikan resmi; angka ini disusun dari laporan peserta. */
    materi: [
      {
        id: "nas", sec: "twk", name: "Nasionalisme", quota: 6, gen: 0.3,
        def: "Memahami, menghayati, dan mengaktualisasikan nilai nasionalisme melalui sikap cinta tanah air, kesadaran berbangsa dan bernegara, penghargaan terhadap keberagaman, serta komitmen menjaga persatuan dan kesatuan bangsa dengan tetap mempertahankan identitas nasional.",
        pola: [
          "Studi kasus penerapan nasionalisme sehari-hari: produk lokal, media sosial dan konten kreator, suporter, globalisasi budaya",
          "Nasionalisme sempit dan luas; chauvinisme, primordialisme, etnosentrisme, separatisme",
          "Sejarah pergerakan: Budi Utomo, Sumpah Pemuda, organisasi pergerakan, peristiwa sekitar proklamasi",
          "Identitas nasional dan integrasi nasional (faktor pendorong dan penghambat)",
          "Netralitas ASN dan peran ASN sebagai perekat bangsa"
        , "Organisasi pergerakan (Sarekat Dagang Islam, Taman Siswa, Kongres Perempuan) dan relevansinya kini"]
      },
      {
        id: "int", sec: "twk", name: "Integritas", quota: 6,
        def: "Memahami dan menerapkan nilai integritas, yaitu keselarasan pikiran, perkataan, sikap, dan tindakan berdasarkan kejujuran, tanggung jawab, konsistensi, keteguhan moral, serta komitmen terhadap kepentingan bangsa dan negara.",
        pola: [
          "Sembilan nilai antikorupsi (jujur, disiplin, tanggung jawab, adil, berani, peduli, kerja keras, sederhana, mandiri) pada kasus dan kisah tokoh",
          "Gratifikasi, suap, konflik kepentingan, LHKPN",
          "Kode etik dan disiplin ASN, netralitas dalam pemilu",
          "Trisula pemberantasan korupsi: penindakan, pencegahan, pendidikan"
        , "Nilai integritas pada tokoh dan peristiwa sejarah (Hoegeng, Hatta, Palagan Ambarawa)"]
      },
      {
        id: "bela", sec: "twk", name: "Bela Negara", quota: 6,
        def: "Memahami dan mengaktualisasikan nilai dasar bela negara: cinta tanah air, sadar berbangsa dan bernegara, setia kepada Pancasila, rela berkorban, serta kemampuan awal bela negara sesuai peran dan tanggung jawab, untuk menjaga kedaulatan, keutuhan wilayah, dan keselamatan bangsa.",
        pola: [
          "Pasal 27 ayat (3) dan Pasal 30 UUD 1945, UU 3/2002, UU 23/2019",
          "Nilai dasar bela negara dan contoh perilakunya",
          "Bentuk keikutsertaan warga negara, termasuk pengabdian sesuai profesi",
          "Ancaman militer, nonmiliter, dan hibrida; kewaspadaan dan ketahanan nasional",
          "Sistem pertahanan semesta: kerakyatan, kesemestaan, kewilayahan"
        ]
      },
      {
        id: "pilar", sec: "twk", name: "Empat Konsensus Kebangsaan", quota: 7, gen: 0.35,
        def: "Memahami, menganalisis, dan menerapkan nilai empat konsensus kebangsaan: Pancasila sebagai dasar dan ideologi negara, UUD 1945 sebagai hukum dasar tertulis, NKRI sebagai bentuk negara, dan Bhinneka Tunggal Ika sebagai semboyan negara.",
        pola: [
          "Kasus penerapan sila Pancasila (sila ke berapa) dan butir pengamalannya",
          "Sejarah perumusan Pancasila: BPUPKI, Panitia Sembilan, Piagam Jakarta, PPKI",
          "Pasal UUD 1945 dan maknanya; Pembukaan (alinea dan pokok pikiran); amandemen",
          "Lembaga negara dan wewenangnya (MPR, DPR, DPD, Presiden, MA, MK, KY, BPK), pemilu, HAM",
          "NKRI, otonomi daerah, wawasan nusantara, Bhinneka Tunggal Ika"
        , "BPUPKI (ketua, sidang I dan II), Panitia Sembilan, hasil sidang PPKI 18 Agustus 1945", "Wewenang MPR, BPK, DPD, KY; pemberhentian Presiden (Pasal 7B)"]
      },
      {
        id: "bind", sec: "twk", name: "Bahasa Indonesia", quota: 5, gen: 0.2,
        def: "Pengetahuan kebahasaan dan kemampuan berbahasa Indonesia dengan baik dan/atau benar untuk memahami, menggunakan, mengevaluasi, dan merefleksi informasi dalam kehidupan bermasyarakat, berbangsa, dan bernegara.",
        pola: [
          "Ide pokok, simpulan, dan judul bacaan",
          "Makna kata atau istilah dalam konteks",
          "Kalimat efektif, kata baku, ejaan (huruf kapital, kata depan, tanda baca)",
          "Majas, jenis paragraf, fakta dan opini",
          "Kedudukan dan fungsi bahasa Indonesia"
        , "Huruf miring dan tanda koma", "Inti kalimat (subjek, predikat, objek)", "Mengevaluasi informasi: fakta atau opini, sumber yang dapat dipercaya, tujuan penulis (kisi-kisi 2026)", "Merefleksi informasi: menerapkan isi aturan atau bacaan pada situasi nyata (kisi-kisi 2026)"]
      },

      {
        id: "ana", sec: "tiu", name: "Analogi Kata (kisi-kisi 2024)", group: "Verbal", quota: 0, gen: 0.35, lama: true,
        def: "Bernalar melalui perbandingan dua konsep kata yang memiliki hubungan tertentu, lalu memakai hubungan itu pada situasi lain.",
        pola: ["Analogi dua kata dan tiga kata", "Hubungan fungsi, sebab-akibat, bagian-keseluruhan, alat-profesi, tingkatan, tempat"]
      },
      {
        id: "sil", sec: "tiu", name: "Silogisme", group: "Verbal", quota: 4, gen: 0.35,
        def: "Bernalar deduktif dengan menghubungkan premis-premis untuk menarik satu kesimpulan logis yang pasti benar, tanpa menambahkan asumsi di luar informasi yang diberikan.",
        pola: ["Silogisme dua premis: semua, sebagian, tidak ada", "Modus ponens dan modus tollens (jika-maka)", "Memilih kesimpulan yang pasti benar, bukan yang mungkin benar", "Silogisme tiga premis: rantai semua–semua–sebagian dan rantai jika–maka", "Bentuk diperluas 2026: hanya jika, dilema, disjungtif bertingkat, ingkaran dan kesetaraan, pernyataan yang pasti salah"]
      },
      {
        id: "ind", sec: "tiu", name: "Penalaran Induktif", group: "Verbal", quota: 3, baru2026: true,
        def: "Mengidentifikasi pola hubungan, tren, atau prinsip umum dari serangkaian informasi yang terpisah untuk merumuskan generalisasi, penjelasan, atau perkiraan yang paling berpeluang benar (materi baru 2026).",
        pola: ["Generalisasi dari beberapa pengamatan, termasuk pengecualian", "Penjelasan yang paling mungkin untuk sebuah perubahan", "Perkiraan dari tren atau pola berulang", "Hubungan belum tentu sebab-akibat; sampel yang tidak mewakili; generalisasi tergesa-gesa", "Informasi yang memperkuat atau memperlemah simpulan"]
      },
      {
        id: "anl", sec: "tiu", name: "Analitis", group: "Verbal", quota: 4, gen: 0.3,
        def: "Mengurai informasi yang kompleks, memetakan hubungan antarvariabel, serta menyusun atau mengevaluasi kombinasi keputusan yang valid berdasarkan seperangkat syarat dan batasan.",
        pola: ["Urutan dan posisi duduk", "Penjadwalan dan pengelompokan bersyarat", "Menarik kesimpulan dari tabel", "Susunan duduk melingkar dan antrean", "Analisis tabel: rasio, persentase kenaikan, pecahan", "Memilih anggota tim, jadwal, atau penempatan dari syarat dan batasan (rumusan 2026)"]
      },
      {
        id: "hit", sec: "tiu", name: "Berhitung", group: "Numerik", quota: 3,
        def: "Kemampuan hitung sederhana.",
        pola: ["Pecahan, desimal, dan persen", "Akar dan pangkat sederhana", "Operasi campuran dan aljabar satu variabel"]
      },
      {
        id: "der", sec: "tiu", name: "Deret Angka", group: "Numerik", quota: 4, gen: 0.4,
        def: "Melihat pola hubungan angka.",
        pola: ["Deret bertingkat", "Dua pola berselang", "Deret geometri, Fibonacci, dan pola kali-tambah"]
      },
      {
        id: "pk", sec: "tiu", name: "Perbandingan Kuantitatif", group: "Numerik", quota: 4,
        def: "Menarik kesimpulan berdasarkan dua atau tiga data kuantitatif.",
        pola: ["Membandingkan x dan y dari pecahan, persen, akar, dan pangkat", "Membandingkan tiga data x, y, dan z (kisi-kisi 2026)", "Kasus yang hubungannya tidak dapat ditentukan"]
      },
      {
        id: "cer", sec: "tiu", name: "Soal Cerita", group: "Numerik", quota: 7,
        def: "Melakukan analisis kuantitatif dari informasi yang diberikan.",
        pola: [
          "Perbandingan senilai (bensin dan jarak) dan berbalik nilai (tambahan pekerja)",
          "Persentase untung, rugi, dan diskon",
          "Kecepatan, jarak, waktu; rata-rata; usia",
          "Himpunan, peluang, pekerjaan bersama"
        ]
      },
      {
        id: "fig-ana", sec: "tiu", name: "Analogi Gambar", group: "Figural", quota: 2, gen: 1,
        def: "Bernalar melalui perbandingan dua gambar yang memiliki hubungan tertentu, lalu memakai konsep hubungan itu pada situasi lain.",
        pola: ["Rotasi dan pencerminan", "Perubahan arsiran", "Pertukaran bentuk luar dan dalam"]
      },
      {
        id: "fig-beda", sec: "tiu", name: "Ketidaksamaan Gambar (kisi-kisi 2024)", group: "Figural", quota: 0, gen: 1, lama: true,
        def: "Melihat perbedaan beberapa gambar.",
        pola: ["Satu gambar hasil cermin di antara gambar hasil putaran", "Aturan jumlah elemen yang dilanggar satu gambar"]
      },
      {
        id: "fig-seri", sec: "tiu", name: "Serial Gambar", group: "Figural", quota: 1, gen: 1,
        def: "Melihat pola hubungan dalam bentuk gambar.",
        pola: ["Rotasi bertahap", "Pergeseran posisi", "Penambahan elemen"]
      },
      {
        id: "fig-mat", sec: "tiu", name: "Penalaran Matriks", group: "Figural", quota: 2, gen: 1, baru2026: true,
        def: "Memahami pola melalui berbagai perspektif dan menentukan perspektif yang menyelesaikan permasalahan (materi baru 2026). Di aplikasi berupa matriks 3×3, dikenal peserta sebagai pola 9 kotak, yang dibaca per baris, kolom, putaran, dan jumlah.",
        pola: ["Pola 9 kotak (3×3): setiap baris dan kolom memuat semua bentuk dan jumlah", "Jumlah bertambah ke kanan dan ke bawah", "Putaran berbeda arah baris dan kolom"]
      },
      {
        id: "fig-kubus", sec: "tiu", name: "Jaring-jaring Kubus", group: "Figural", quota: 1, gen: 1,
        def: "Membayangkan jaring-jaring yang dirakit menjadi kubus: sisi mana yang berhadapan dan mana yang bersebelahan. Tidak disebut tersendiri di kisi-kisi; dilaporkan peserta 2024 muncul di bagian figural.",
        pola: ["Sisi yang berhadapan dengan sisi tertentu", "Sisi yang menjadi tutup bila sisi tertentu menjadi alas", "Pasangan sisi yang saling berhadapan"]
      },

      {
        id: "pel", sec: "tkp", name: "Pelayanan Publik", quota: 8,
        def: "Memberikan pelayanan terbaik kepada publik sesuai tugas melalui sikap ramah, respons yang cekatan, pelayanan tanpa pamrih, dan upaya memperbaiki kualitas layanan secara berkesinambungan.",
        pola: ["Menangani keluhan dan antrean", "Melayani tuntas di luar kebiasaan tanpa melanggar aturan", "Menolak imbalan", "Layanan bagi lansia dan penyandang disabilitas"]
      },
      {
        id: "jej", sec: "tkp", name: "Jejaring Kerja", quota: 7,
        def: "Membangun dan memelihara kolaborasi internal dan eksternal yang mendorong peran aktif berbagai pihak untuk mencapai tujuan organisasi.",
        pola: ["Kerja sama lintas unit dan instansi", "Berbagi informasi dan pengetahuan", "Konflik dalam tim", "Membangun relasi baru"]
      },
      {
        id: "sos", sec: "tkp", name: "Sosial Budaya", quota: 7,
        def: "Membangun hubungan sosial yang positif dengan menghargai keragaman latar belakang sosial budaya untuk mewujudkan komunitas yang harmonis dan terintegrasi.",
        pola: ["Keberagaman suku dan agama di kantor", "Adaptasi di tempat tugas baru", "Empati dan menghargai adat setempat"]
      },
      {
        id: "tik", sec: "tkp", name: "Adaptasi Teknologi Informasi dan Komunikasi", quota: 7,
        def: "Menyesuaikan diri terhadap perkembangan dan perubahan teknologi informasi dan komunikasi: menerima dan memanfaatkan TIK secara bijak untuk mempermudah tugas, dengan tetap mematuhi prinsip etis.",
        pola: ["Aplikasi dan sistem baru di kantor", "Keamanan data dan kerahasiaan", "Hoaks dan media sosial", "Inovasi digital", "Kecerdasan artifisial generatif dan pelindungan data pribadi", "Rekan gagap teknologi, gangguan sistem, dan serangan siber"]
      },
      {
        id: "pro", sec: "tkp", name: "Profesionalisme", quota: 8,
        def: "Menampilkan keahlian di bidangnya, mengedepankan akuntabilitas dan integritas, serta menunjukkan komitmen dalam bekerja dan berkontribusi pada organisasi.",
        pola: ["Prioritas dan tenggat", "Tanggung jawab atas kesalahan", "Menempatkan diri di antara tugas kantor dan urusan lain (kuliah, keluarga, organisasi, usaha sampingan)", "Belajar dan berinovasi", "Kerahasiaan dan spionase, judi daring, perubahan penugasan mendadak", "Penerapan nilai BerAKHLAK dan netralitas ASN saat pilkada"]
      },
      {
        id: "rad", sec: "tkp", name: "Anti Radikalisme", quota: 8,
        def: "Berpikir dan bertindak bijak, menolak kekerasan dan pemaksaan kehendak atas keyakinan pribadi (agama, politik, aliran), serta menerima perbedaan ideologi yang tidak bertentangan dengan ideologi bangsa.",
        pola: ["Ajakan kelompok intoleran", "Konten radikal dan isu SARA di media sosial", "Netralitas dan persatuan", "Melapor lewat jalur resmi"]
      }
    ],
    riset: {
      tanggal: "23 November 2026",
      status: [
        "Formasi CPNS 2026 belum terbit per 23 November 2026. Rencana pemerintah: pendaftaran mulai 27 November 2026, SKD dan SKB Januari–Maret 2027 (belum resmi).",
        "SKD sekolah kedinasan 2026 sudah berlangsung 22 September–7 Oktober 2026 dengan CAT BKN: 110 soal, 100 menit, ambang batas TWK 65, TIU 80, TKP 156 (KepmenPANRB 406/2026).",
        "Ambang batas SKD CPNS 2026 sudah ditetapkan dalam KepmenPANRB 674/2026 (20 November 2026): kebutuhan umum TWK 65, TIU 80, TKP 166 (sama dengan 2024). Cumlaude dan diaspora: kumulatif minimal 311 dengan TIU minimal 85; penyandang disabilitas dan putra/putri Papua: kumulatif minimal 286 dengan TIU minimal 60.",
        "Kisi-kisi SKD 2026 (KepmenPANRB 674/2026): TIU verbal kini silogisme, penalaran induktif, dan analitis (analogi kata tidak lagi tercantum); TIU figural kini serial, analogi gambar, dan penalaran matriks (ketidaksamaan tidak lagi tercantum); perbandingan kuantitatif bisa memakai dua atau tiga data. SKB memakai CAT BKN: 90 menit, 100 soal untuk jabatan yang materinya tidak dominan hitungan. Nilai SKD 2024 boleh dipakai bila memenuhi syarat.",
        "Soal CAT BKN rahasia dan diacak per peserta. Tidak ada cara sah mendapatkan soal yang akan keluar; tawaran \"bocoran\" adalah penipuan dan dapat menggugurkan peserta. Semua soal di aplikasi ini disusun sendiri mengikuti kisi-kisi dan pola laporan peserta."
      ],
      rumus: "Tingkat pola. Sangat sering keluar: tercantum di kisi-kisi resmi dan dilaporkan di 3 laporan peserta atau lebih. Sering keluar: 1–2 laporan. Laporan dihitung per rangkuman hari ujian dan per sumber, karena soal CAT diacak per peserta: pola yang muncul di banyak hari dan banyak peserta berarti sering keluar.",
      temuan: [
        "Kisi-kisi resmi SKD 2021, 2023, 2024, dan kedinasan 2026 isinya sama: TWK (nasionalisme, integritas, bela negara, pilar negara, bahasa Indonesia), TIU (verbal, numerik, figural), TKP (enam aspek). Semua materi tetap keluar; yang berubah adalah bentuk soalnya.",
        "Laporan peserta yang bisa diperiksa hanya ada untuk SKD CPNS 2024 (AyoJakarta 3 rangkuman, ASN Institute, Analitica) dan kedinasan 2026. Untuk 2021 dan 2023 yang beredar hanya kumpulan latihan, bukan laporan peserta, jadi tidak dihitung.",
        "Sangat sering keluar, TWK (7 sumber peserta berbeda, SKD 2024): penerapan nilai Pancasila (7), penerapan isi pasal UUD (5), BPUPKI/PPKI dan sikap tokohnya (5), simpulan dan gagasan utama bacaan (5), lembaga negara MA, MK, KY, MPR (4), organisasi pergerakan (4), inti kalimat (4), kata bercetak miring (4), netralitas ASN (3), nasionalisme konten kreator (3), peristiwa sekitar dan sesudah kemerdekaan (3).",
        "Sangat sering keluar, TIU tanpa hitungan: silogisme dua dan tiga premis (5), pola 9 kotak atau penalaran matriks (5), susunan duduk dan antrean (4); analogi kata (4) dilaporkan 2024 tetapi tidak lagi tercantum di kisi-kisi 2026. Dengan hitungan: analisis tabel (5), pecahan dan hitung cepat (5), perbandingan senilai dan berbalik nilai (4), hubungan x dan y (4), deret angka (4).",
        "Sangat sering keluar, TKP (8 sumber peserta berbeda, SKD 2024): menempatkan diri antara kesibukan pribadi atau masyarakat dan pekerjaan (4), spionase dan kebocoran rahasia (4), inovasi dan masalah TIK termasuk rekan gagap teknologi (4), penerapan BerAKHLAK (3), netralitas dan isu SARA saat pilkada (3). Peserta melaporkan nilai 4 dan 5 paling sulit dibedakan.",
        "TKP 2023, kedinasan 2025, dan kedinasan 2026: tidak ditemukan laporan yang bisa diperiksa. Materi bimbel 2025–2026 mengulang tema TKP 2024, jadi tema itu masih dianggap paling mungkin keluar, tetapi tidak dihitung sebagai bukti baru.",
        "Analitica (FR 2024): semua soal TWK bersifat penalaran, tidak ada hafalan murni; soalnya tidak sepanjang tryout pada umumnya, tetapi pilihan jawabannya mirip-mirip. Karena itu soal acak TWK di aplikasi ini kebanyakan berbentuk kasus (sila, lembaga negara, pasal).",
        "TWK HOTS: set \"HOTS 2026\" menambahkan kasus dengan konteks terkini: KUHP baru (berlaku 2 Januari 2026), putusan MK 2 Januari 2025, keamanan siber, deepfake, gratifikasi, pelindungan data pribadi, dan EYD Edisi V.",
        "SKD kedinasan 2026: peserta melaporkan TIU sebagai bagian paling menantang; belum ada rincian soal yang dapat diverifikasi."
      ],
      sumber: [
        { t: "Rangkuman FR SKD CPNS 2024, 16–25 Okt (AyoJakarta)", u: "https://www.ayojakarta.com/news/7613818100/terbaru-dan-lengkap-rangkuman-fr-skd-cpns-2024-sejak-hari-pertama-hingga-kemarin-twk-tiu-tkp-pasti-keluar" },
        { t: "Rangkuman FR SKD CPNS 2024, 28 Okt (AyoJakarta)", u: "https://www.ayojakarta.com/news/7613828932/lengkap-ini-rangkuman-fr-skd-cpns-2024-untuk-materi-twk-tiu-tkp-yang-dipastikan-keluar-saat-tes" },
        { t: "Rekap FR SKD CPNS 2024, 24 Okt (AyoJakarta)", u: "https://www.ayojakarta.com/news/0315783/catat-rekap-fr-skd-cpns-2024-lengkap-untuk-soal-tiu-twk-dan-tkp" },
        { t: "Laporan peserta SKD 2024 (ASN Institute)", u: "https://www.asninstitute.id/field-report-cpns-2024/" },
        { t: "FR SKD CPNS 2024 (Analitica)", u: "https://blog.analitica.id/fr-skd-cpns-terbaru/" },
        { t: "FR SKD CPNS 2024 dari @ujiancpns.id (romisaputra)", u: "https://www.romisaputra.com/2024/10/rekap-fr-skd-cpns-2024-lengkap-untuk.html" },
        { t: "FR SKD CPNS 2024 dari @idcpns (romisaputra)", u: "https://www.romisaputra.com/2024/10/catat-rangkuman-fr-skd-cpns-2024-cek.html" },
        { t: "FR SKD CPNS 2024 dari @widiadiantari (romisaputra)", u: "https://www.romisaputra.com/2024/10/rangkuman-fr-skd-cpns-2024-sesuai.html" },
        { t: "FR SKD CPNS 2024 hari ketujuh dari @imalagus (romisaputra)", u: "https://www.romisaputra.com/2024/10/rangkuman-fr-skd-cpns-2024-hari-ketujuh.html" },
        { t: "FR SKD CPNS 2024 TKP dari @studicpns.id (romisaputra)", u: "https://www.romisaputra.com/2024/10/catat-rangkuman-fr-skd-cpns-2024-soal.html" },
        { t: "Kisi-kisi SKD CPNS 2021 dari BKN (detikFinance)", u: "https://finance.detik.com/cpns/d-5667396/ssst-ini-kisi-kisi-lengkap-skd-cpns-2021-dari-bkn" },
        { t: "Isi soal TWK, TIU, dan TKP CPNS 2023 (detikFinance)", u: "https://finance.detik.com/cpns/d-6930994/ini-isi-soal-twk-tiu-dan-tkp-untuk-cpns-2023" },
        { t: "FR SKD Sekolah Kedinasan 2026: TIU jadi tantangan", u: "https://www.bimbelptk.com/blog/fr-skd-sekolah-kedinasan-2026--tiu-jadi-tantangan--cek-persiapan-sebelum-ujian" },
        { t: "Materi SKD Sekolah Kedinasan 2026 dan KepmenPANRB 406/2026", u: "https://www.bimbelptk.com/blog/resmi--bkn-ungkap-materi-skd-sekolah-kedinasan-2026--ini-rincian-twk--tiu--dan-tkp" },
        { t: "Passing grade SKD Sekolah Kedinasan 2026 (Kompas)", u: "https://money.kompas.com/read/2026/09/24/095752726/passing-grade-skd-sekolah-kedinasan-2026-cek-nilai-minimal-twk-tiu-dan-tkp" },
        { t: "Status CPNS 2026 (Drillo)", u: "https://www.drillo.id/blog/cpns-2026-dibuka-november" },
        { t: "Kisi-kisi SKD CPNS 2024 dari KemenPANRB (Kompas TV)", u: "https://www.kompas.tv/ekonomi/537047/kisi-kisi-soal-twk-tiu-tkp-materi-skd-cpns-2024-resmi-dari-kemenpanrb-ini-link-pdf-nya" },
        { t: "Siaran pers BKN: 110 soal dalam 100 menit", u: "https://www.bkn.go.id/storage/2021/08/SIARAN-PERS-Peserta-Calon-PNS-2021-akan-Berkompetisi-dalam-100-Menit-untuk-Menjawab-110-Soal-SKD-dengan-CAT-BKN.pdf" }
      ]
    }
  };

  SKD.bankRaw = [];
  SKD.passages = {};
  /** Daftarkan soal. sec: "twk" | "tiu" | "tkp".
   *  Soal TWK/TIU: o[0] adalah jawaban benar (kecuali ada `a`), opsi diacak saat tampil.
   *  Soal TKP: o diurutkan dari 5 poin (o[0]) sampai 1 poin (o[4]). */
  SKD.add = function (sec, list, extra) {
    for (var i = 0; i < list.length; i++) {
      list[i].sec = sec;
      if (extra) for (var k in extra) if (list[i][k] == null) list[i][k] = extra[k];
      SKD.bankRaw.push(list[i]);
    }
  };
  SKD.addPassages = function (map) {
    for (var k in map) SKD.passages[k] = map[k];
  };
})();
