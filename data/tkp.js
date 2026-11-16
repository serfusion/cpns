/* Bank soal TKP. Opsi diurutkan dari 5 poin (o[0]) sampai 1 poin (o[4]); diacak saat ditampilkan.
   Kunci disusun dari definisi aspek TKP dan nilai dasar ASN BerAKHLAK, bukan kunci resmi BKN. */
(function () {
  "use strict";
  var SKD = window.SKD;

  // ===================== PELAYANAN PUBLIK =====================
  SKD.add("tkp", [
    { m: "pel", h: 1,
      q: "Anda petugas loket layanan kependudukan. Lima menit sebelum loket tutup, seorang lansia datang dengan berkas yang kurang satu lembar fotokopi, padahal rumahnya jauh. Yang Anda lakukan adalah ...",
      o: ["Tetap melayani, membantu memfotokopi berkasnya di kantor, dan menuntaskan permohonannya hari itu",
        "Menerima berkas yang ada dan menjelaskan bahwa kekurangannya dapat disusulkan keluarganya esok hari",
        "Menjelaskan kekurangan berkas dengan ramah dan memintanya datang lagi besok pagi",
        "Menyarankan beliau mencari tempat fotokopi terdekat meskipun loket segera tutup",
        "Menolak melayani karena berkas tidak lengkap dan jam layanan hampir habis"],
      x: "Pelayanan publik yang baik menuntaskan kebutuhan warga dengan ramah dan solutif selama tidak melanggar aturan, terlebih bagi kelompok rentan seperti lansia." }
  ]);

  // ===================== TEKNOLOGI INFORMASI DAN KOMUNIKASI =====================
  SKD.add("tkp", [
    { m: "tik", h: 1,
      q: "Kantor Anda mulai memakai aplikasi persuratan elektronik. Beberapa rekan senior masih memilih cara manual sehingga surat sering terlambat. Anda sudah menguasai aplikasinya. Yang Anda lakukan adalah ...",
      o: ["Menawarkan diri mendampingi rekan senior berlatih dan membuatkan panduan singkat yang mudah diikuti",
        "Mengusulkan pelatihan ulang kepada atasan dan bersedia menjadi pendampingnya",
        "Membantu rekan senior hanya ketika mereka bertanya",
        "Memakai aplikasi untuk pekerjaan sendiri dan membiarkan rekan lain dengan caranya",
        "Mengerjakan surat rekan senior secara manual agar tidak perlu repot mengajari"],
      x: "Aspek TIK menilai pemanfaatan teknologi untuk meningkatkan kinerja. Sikap terbaik adalah proaktif membantu rekan beralih ke sistem baru, bukan sekadar memakainya sendiri." }
  ]);

  // ===================== ANTI RADIKALISME =====================
  SKD.add("tkp", [
    { m: "rad", h: 1,
      q: "Di grup percakapan alumni, seorang teman membagikan tautan ceramah yang mengajak membenci kelompok agama lain dan menolak dasar negara. Beberapa anggota mulai menyetujuinya. Yang Anda lakukan adalah ...",
      o: ["Menyampaikan dengan santun bahwa isi tautan itu bertentangan dengan nilai persatuan, mengajak anggota tidak menyebarkannya, dan melaporkan kontennya melalui kanal aduan resmi",
        "Menghubungi teman tersebut secara pribadi untuk mengingatkan dampak konten itu",
        "Tidak menanggapi dan tidak ikut menyebarkan tautan tersebut",
        "Keluar dari grup agar tidak terlibat",
        "Meneruskan tautan ke grup lain agar orang lain bisa menilai sendiri"],
      x: "Sikap anti radikalisme tidak cukup dengan diam. Yang terbaik adalah menolak secara santun, mencegah penyebaran, dan melapor lewat jalur resmi." }
  ]);
})();
