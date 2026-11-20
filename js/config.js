/* Konfigurasi format SKD + peta materi hasil riset.
   Semua angka format ujian ada di sini supaya mudah diubah kalau aturan 2026 terbit. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});

  SKD.config = {
    appName: "Latihan SKD CPNS",
    // Acuan: KepmenPANRB 321/2024 (seleksi CPNS terakhir). Aturan khusus CPNS 2026
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
        id: "nas", sec: "twk", name: "Nasionalisme", quota: 6,
        def: "Mewujudkan kepentingan nasional melalui cita-cita dan tujuan yang sama dengan tetap mempertahankan identitas nasional.",
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
        def: "Menjunjung tinggi kejujuran, ketangguhan, komitmen, dan konsistensi sebagai satu kesatuan sikap untuk mencapai tujuan nasional.",
        pola: [
          "Sembilan nilai antikorupsi (jujur, disiplin, tanggung jawab, adil, berani, peduli, kerja keras, sederhana, mandiri) pada kasus dan kisah tokoh",
          "Gratifikasi, suap, konflik kepentingan, LHKPN",
          "Kode etik dan disiplin ASN, netralitas dalam pemilu",
          "Trisula pemberantasan korupsi: penindakan, pencegahan, pendidikan"
        , "Nilai integritas pada tokoh dan peristiwa sejarah (Hoegeng, Hatta, Palagan Ambarawa)"]
      },
      {
        id: "bela", sec: "twk", name: "Bela Negara", quota: 6,
        def: "Berperan aktif dalam mempertahankan eksistensi bangsa dan negara.",
        pola: [
          "Pasal 27 ayat (3) dan Pasal 30 UUD 1945, UU 3/2002, UU 23/2019",
          "Nilai dasar bela negara dan contoh perilakunya",
          "Bentuk keikutsertaan warga negara, termasuk pengabdian sesuai profesi",
          "Ancaman militer, nonmiliter, dan hibrida; kewaspadaan dan ketahanan nasional",
          "Sistem pertahanan semesta: kerakyatan, kesemestaan, kewilayahan"
        ]
      },
      {
        id: "pilar", sec: "twk", name: "Pilar Negara", quota: 7,
        def: "Membentuk karakter positif melalui pemahaman dan pengamalan nilai-nilai dalam Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika.",
        pola: [
          "Kasus penerapan sila Pancasila (sila ke berapa) dan butir pengamalannya",
          "Sejarah perumusan Pancasila: BPUPKI, Panitia Sembilan, Piagam Jakarta, PPKI",
          "Pasal UUD 1945 dan maknanya; Pembukaan (alinea dan pokok pikiran); amandemen",
          "Lembaga negara dan wewenangnya (MPR, DPR, DPD, Presiden, MA, MK, KY, BPK), pemilu, HAM",
          "NKRI, otonomi daerah, wawasan nusantara, Bhinneka Tunggal Ika"
        , "BPUPKI (ketua, sidang I dan II), Panitia Sembilan, hasil sidang PPKI 18 Agustus 1945", "Wewenang MPR, BPK, DPD, KY; pemberhentian Presiden (Pasal 7B)"]
      },
      {
        id: "bind", sec: "twk", name: "Bahasa Indonesia", quota: 5,
        def: "Mampu menggunakan bahasa Indonesia sebagai bahasa persatuan yang sangat penting kedudukannya pada masyarakat Indonesia.",
        pola: [
          "Ide pokok, simpulan, dan judul bacaan",
          "Makna kata atau istilah dalam konteks",
          "Kalimat efektif, kata baku, ejaan (huruf kapital, kata depan, tanda baca)",
          "Majas, jenis paragraf, fakta dan opini",
          "Kedudukan dan fungsi bahasa Indonesia"
        , "Huruf miring dan tanda koma"]
      },

      {
        id: "ana", sec: "tiu", name: "Analogi", group: "Verbal", quota: 3,
        def: "Bernalar melalui perbandingan dua konsep kata yang memiliki hubungan tertentu, lalu memakai hubungan itu pada situasi lain.",
        pola: ["Analogi dua kata dan tiga kata", "Hubungan fungsi, sebab-akibat, bagian-keseluruhan, alat-profesi, tingkatan, tempat"]
      },
      {
        id: "sil", sec: "tiu", name: "Silogisme", group: "Verbal", quota: 4,
        def: "Menarik kesimpulan dari dua pernyataan yang diberikan.",
        pola: ["Silogisme dua premis: semua, sebagian, tidak ada", "Modus ponens dan modus tollens (jika-maka)", "Memilih kesimpulan yang pasti benar, bukan yang mungkin benar", "Silogisme tiga premis: rantai semua–semua–sebagian dan rantai jika–maka"]
      },
      {
        id: "anl", sec: "tiu", name: "Analitis", group: "Verbal", quota: 4,
        def: "Menganalisis informasi yang diberikan dan menarik kesimpulan.",
        pola: ["Urutan dan posisi duduk", "Penjadwalan dan pengelompokan bersyarat", "Menarik kesimpulan dari tabel", "Susunan duduk melingkar dan antrean", "Analisis tabel: rasio, persentase kenaikan, pecahan"]
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
        def: "Menarik kesimpulan berdasarkan dua data kuantitatif.",
        pola: ["Membandingkan x dan y dari pecahan, persen, akar, dan pangkat", "Kasus yang hubungannya tidak dapat ditentukan"]
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
        def: "Bernalar melalui perbandingan dua gambar yang memiliki hubungan tertentu, lalu memakai hubungan itu pada gambar lain.",
        pola: ["Rotasi dan pencerminan", "Perubahan arsiran", "Pertukaran bentuk luar dan dalam"]
      },
      {
        id: "fig-beda", sec: "tiu", name: "Ketidaksamaan Gambar", group: "Figural", quota: 1, gen: 1,
        def: "Melihat perbedaan beberapa gambar.",
        pola: ["Satu gambar hasil cermin di antara gambar hasil putaran", "Aturan jumlah elemen yang dilanggar satu gambar"]
      },
      {
        id: "fig-seri", sec: "tiu", name: "Serial Gambar", group: "Figural", quota: 2, gen: 1,
        def: "Melihat pola hubungan dalam bentuk gambar.",
        pola: ["Rotasi bertahap", "Pergeseran posisi", "Penambahan elemen", "Pola 9 kotak (3×3)"]
      },
      {
        id: "fig-kubus", sec: "tiu", name: "Jaring-jaring Kubus", group: "Figural", quota: 1, gen: 1,
        def: "Membayangkan jaring-jaring yang dirakit menjadi kubus: sisi mana yang berhadapan dan mana yang bersebelahan.",
        pola: ["Sisi yang berhadapan dengan sisi tertentu", "Sisi yang menjadi tutup bila sisi tertentu menjadi alas", "Pasangan sisi yang saling berhadapan"]
      },

      {
        id: "pel", sec: "tkp", name: "Pelayanan Publik", quota: 8,
        def: "Menampilkan keramahtamahan dalam bekerja yang efektif agar bisa memenuhi kebutuhan dan kepuasan orang lain sesuai tugas dan wewenang.",
        pola: ["Menangani keluhan dan antrean", "Melayani tuntas di luar kebiasaan tanpa melanggar aturan", "Menolak imbalan", "Layanan bagi lansia dan penyandang disabilitas"]
      },
      {
        id: "jej", sec: "tkp", name: "Jejaring Kerja", quota: 7,
        def: "Membangun dan membina hubungan, bekerja sama, berbagi informasi, dan berkolaborasi dengan orang lain secara efektif.",
        pola: ["Kerja sama lintas unit dan instansi", "Berbagi informasi dan pengetahuan", "Konflik dalam tim", "Membangun relasi baru"]
      },
      {
        id: "sos", sec: "tkp", name: "Sosial Budaya", quota: 7,
        def: "Beradaptasi dan bekerja secara efektif dalam masyarakat majemuk (beragam agama, suku, budaya, dan sebagainya).",
        pola: ["Keberagaman suku dan agama di kantor", "Adaptasi di tempat tugas baru", "Empati dan menghargai adat setempat"]
      },
      {
        id: "tik", sec: "tkp", name: "Teknologi Informasi dan Komunikasi", quota: 7,
        def: "Memanfaatkan teknologi informasi secara efektif untuk meningkatkan kinerja.",
        pola: ["Aplikasi dan sistem baru di kantor", "Keamanan data dan kerahasiaan", "Hoaks dan media sosial", "Inovasi digital", "Kecerdasan artifisial generatif dan pelindungan data pribadi"]
      },
      {
        id: "pro", sec: "tkp", name: "Profesionalisme", quota: 8,
        def: "Melaksanakan tugas dan fungsi sesuai dengan tuntutan jabatan.",
        pola: ["Prioritas dan tenggat", "Tanggung jawab atas kesalahan", "Menempatkan diri di antara tugas kantor dan urusan lain", "Belajar dan berinovasi", "Kerahasiaan dan spionase, judi daring, perubahan penugasan mendadak"]
      },
      {
        id: "rad", sec: "tkp", name: "Anti Radikalisme", quota: 8,
        def: "Menjunjung tinggi dan bertindak sesuai nilai-nilai untuk tidak mengikuti atau menganut paham radikalisme (toleransi, antikekerasan, dan sebagainya).",
        pola: ["Ajakan kelompok intoleran", "Konten radikal dan isu SARA di media sosial", "Netralitas dan persatuan", "Melapor lewat jalur resmi"]
      }
    ],
    riset: {
      tanggal: "20 November 2026",
      status: [
        "Formasi dan jadwal pendaftaran CPNS 2026 belum terbit per 20 November 2026; BKN menargetkan pendaftaran pada pekan keempat November. Jadwal SKD belum diumumkan.",
        "SKD sekolah kedinasan 2026 sudah berlangsung 22 September–7 Oktober 2026 dengan CAT BKN: 110 soal, 100 menit, ambang batas TWK 65, TIU 80, TKP 156 (KepmenPANRB 406/2026).",
        "Ambang batas SKD CPNS 2026 belum ditetapkan. Acuan terakhir untuk CPNS adalah KepmenPANRB 321/2024: TWK 65, TIU 80, TKP 166.",
        "Soal CAT BKN rahasia dan diacak per peserta. Tidak ada cara sah mendapatkan soal yang akan keluar; tawaran \"bocoran\" adalah penipuan dan dapat menggugurkan peserta."
      ],
      rumus: "Prioritas pola = tercantum di kisi-kisi resmi × jumlah rangkuman laporan peserta yang menyebutnya (0–3). Soal bertanda Sering keluar mengikuti pola dengan dua laporan atau lebih.",
      temuan: [
        "TWK, dilaporkan di 3 rangkuman peserta SKD CPNS 2024: penerapan sila (kasus diskriminasi, golput), nilai integritas termasuk tokoh BPUPKI dan peristiwa sejarah, BPUPKI/PPKI, lembaga negara (MA, MK, MPR, KY), gagasan utama paragraf. Di 2 rangkuman: penerapan pasal UUD, sejarah organisasi pergerakan, nasionalisme konten kreator, huruf miring.",
        "TIU, di 3 rangkuman: silogisme (termasuk tiga premis), figural pola 9 kotak, analisis tabel. Di 2 rangkuman: deret angka, perbandingan senilai dan berbalik nilai, berhitung cepat, kecepatan, hubungan x dan y, jaring-jaring kubus, antrean dan susunan duduk.",
        "TKP, di 3 rangkuman: prioritas antara kesibukan pribadi atau masyarakat dan tugas kantor. Di 2 rangkuman: sikap terhadap spionase dan penerapan BerAKHLAK. Di 1 rangkuman: perbedaan pilihan politik, konten kreator, pelatihan, perubahan penugasan, inovasi TIK.",
        "SKD kedinasan 2026: peserta melaporkan TIU sebagai bagian paling menantang; belum ada rincian soal yang dapat diverifikasi."
      ],
      sumber: [
        { t: "Rangkuman FR SKD CPNS 2024, 16–25 Okt (AyoJakarta)", u: "https://www.ayojakarta.com/news/7613818100/terbaru-dan-lengkap-rangkuman-fr-skd-cpns-2024-sejak-hari-pertama-hingga-kemarin-twk-tiu-tkp-pasti-keluar" },
        { t: "Rangkuman FR SKD CPNS 2024, 28 Okt (AyoJakarta)", u: "https://www.ayojakarta.com/news/7613828932/lengkap-ini-rangkuman-fr-skd-cpns-2024-untuk-materi-twk-tiu-tkp-yang-dipastikan-keluar-saat-tes" },
        { t: "Rekap FR SKD CPNS 2024, 24 Okt (AyoJakarta)", u: "https://www.ayojakarta.com/news/0315783/catat-rekap-fr-skd-cpns-2024-lengkap-untuk-soal-tiu-twk-dan-tkp" },
        { t: "Laporan peserta SKD 2024 (ASN Institute)", u: "https://www.asninstitute.id/field-report-cpns-2024/" },
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
  SKD.add = function (sec, list) {
    for (var i = 0; i < list.length; i++) {
      list[i].sec = sec;
      SKD.bankRaw.push(list[i]);
    }
  };
  SKD.addPassages = function (map) {
    for (var k in map) SKD.passages[k] = map[k];
  };
})();
