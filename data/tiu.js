/* Bank soal TIU. o[0] selalu jawaban benar; opsi diacak saat ditampilkan.
   Perbandingan kuantitatif memakai urutan opsi tetap (fix:1) dengan kunci di `a`.
   Soal figural dan sebagian deret angka dibangkitkan otomatis (js/figural.js, js/engine.js). */
(function () {
  "use strict";
  var SKD = window.SKD;
  var PK = ["x > y", "x < y", "x = y", "2x = y", "Hubungan x dan y tidak dapat ditentukan"];

  // ===================== ANALOGI =====================
  SKD.add("tiu", [
    { m: "ana", h: 1, q: "PADI : PETANI = ... : ...",
      o: ["IKAN : NELAYAN", "BUKU : PEMBACA", "OBAT : PASIEN", "SEPATU : PEMAKAI", "JALAN : PENGEMUDI"],
      x: "Padi dihasilkan oleh petani, seperti ikan dihasilkan (ditangkap) oleh nelayan. Pilihan lain menunjukkan hubungan benda dengan penggunanya." },
    { m: "ana", h: 1, q: "GURU : SEKOLAH : MURID = ... : ... : ...",
      o: ["DOKTER : RUMAH SAKIT : PASIEN", "HAKIM : PENGADILAN : JAKSA", "PETANI : SAWAH : CANGKUL", "PILOT : PESAWAT : BANDARA", "PENJUAL : PEMBELI : PASAR"],
      x: "Polanya profesi : tempat bekerja : pihak yang dilayani. Guru bekerja di sekolah melayani murid; dokter bekerja di rumah sakit melayani pasien." }
  ]);

  // ===================== SILOGISME =====================
  SKD.add("tiu", [
    { m: "sil", h: 1, q: "Semua pegawai yang lulus pelatihan dasar mendapat sertifikat.\nSebagian pegawai baru lulus pelatihan dasar.\nKesimpulan yang tepat adalah ...",
      o: ["Sebagian pegawai baru mendapat sertifikat", "Semua pegawai baru mendapat sertifikat", "Semua yang mendapat sertifikat adalah pegawai baru",
        "Sebagian pegawai baru tidak lulus pelatihan dasar", "Tidak ada pegawai baru yang mendapat sertifikat"],
      x: "Premis umum (semua) digabung dengan premis khusus (sebagian) menghasilkan kesimpulan khusus: sebagian pegawai baru mendapat sertifikat. Pernyataan bahwa sebagian tidak lulus tidak dapat dipastikan." },
    { m: "sil", h: 1, q: "Jika hujan turun, maka upacara dipindahkan ke aula.\nUpacara tidak dipindahkan ke aula.\nKesimpulan yang tepat adalah ...",
      o: ["Hujan tidak turun", "Hujan turun", "Upacara dibatalkan", "Hujan turun tetapi upacara tetap di lapangan", "Tidak dapat ditarik kesimpulan"],
      x: "Modus tollens: jika p maka q; tidak q; jadi tidak p. Karena upacara tidak dipindahkan, hujan tidak turun." }
  ]);

  // ===================== ANALITIS =====================
  SKD.add("tiu", [
    { m: "anl", h: 1, q: "Andi, Bima, Citra, Dewi, dan Eko mengikuti lomba lari. Citra tiba lebih dulu daripada Andi tetapi setelah Eko. Bima tiba tepat setelah Andi. Dewi tiba paling akhir.\nSiapa yang tiba di urutan ketiga?",
      o: ["Andi", "Bima", "Citra", "Dewi", "Eko"],
      x: "Eko sebelum Citra, Citra sebelum Andi, Bima tepat setelah Andi, Dewi terakhir. Urutannya: Eko, Citra, Andi, Bima, Dewi. Urutan ketiga adalah Andi." }
  ]);

  // ===================== BERHITUNG =====================
  SKD.add("tiu", [
    { m: "hit", h: 1, q: "Nilai dari 37,5% × 64 + 0,25 × 48 adalah ...",
      o: ["36", "32", "34", "38", "40"],
      x: "37,5% = 3/8, sehingga 3/8 × 64 = 24. Lalu 0,25 × 48 = 12. Jumlahnya 24 + 12 = 36." },
    { m: "hit", h: 1, q: "√(15² + 20²) + 3³ = ...",
      o: ["52", "50", "48", "62", "34"],
      x: "15² + 20² = 225 + 400 = 625, akarnya 25. Lalu 3³ = 27. Jadi 25 + 27 = 52." }
  ]);

  // ===================== DERET ANGKA =====================
  SKD.add("tiu", [
    { m: "der", h: 1, q: "Tentukan suku berikutnya dari deret:\n3, 7, 15, 31, 63, ...",
      o: ["127", "126", "125", "95", "94"],
      x: "Setiap suku adalah suku sebelumnya dikali 2 lalu ditambah 1 (selisihnya 4, 8, 16, 32, lalu 64). 63 × 2 + 1 = 127." }
  ]);

  // ===================== PERBANDINGAN KUANTITATIF =====================
  SKD.add("tiu", [
    { m: "pk", h: 1, fix: 1, a: 2, q: "Jika x = 3/8 dari 72 dan y = 45% dari 60, maka ...", o: PK,
      x: "x = 3/8 × 72 = 27 dan y = 0,45 × 60 = 27. Jadi x = y." },
    { m: "pk", h: 1, fix: 1, a: 4, q: "Diketahui x² = 49 dan y = 6. Maka ...", o: PK,
      x: "x² = 49 berarti x = 7 atau x = −7. Jika x = 7 maka x > y, jika x = −7 maka x < y. Hubungannya tidak dapat ditentukan." }
  ]);

  // ===================== SOAL CERITA =====================
  SKD.add("tiu", [
    { m: "cer", h: 1, q: "Sebuah mobil menghabiskan 12 liter bensin untuk menempuh 150 km. Dengan pemakaian yang sama, berapa liter bensin yang dibutuhkan untuk menempuh 400 km?",
      o: ["32 liter", "30 liter", "34 liter", "36 liter", "28 liter"],
      x: "Perbandingan senilai: 12/150 = x/400, sehingga x = 12 × 400 ÷ 150 = 32 liter." },
    { m: "cer", h: 1, q: "Sebuah proyek dapat diselesaikan oleh 12 pekerja dalam 30 hari. Setelah berjalan 10 hari, pekerjaan terhenti selama 4 hari. Agar proyek tetap selesai tepat waktu, berapa pekerja yang harus ditambahkan?",
      o: ["3 orang", "4 orang", "5 orang", "6 orang", "2 orang"],
      x: "Total pekerjaan 12 × 30 = 360 hari-orang. Selesai 12 × 10 = 120, sisa 240. Sisa waktu 30 − 10 − 4 = 16 hari, butuh 240 ÷ 16 = 15 pekerja. Tambahan 15 − 12 = 3 orang." },
    { m: "cer", h: 1, q: "Berdasarkan tabel penjualan berikut, bulan dengan pendapatan terbesar adalah ...",
      tb: { h: ["Bulan", "Terjual (unit)", "Harga per unit (Rp)"], r: [["Januari", "120", "50.000"], ["Februari", "150", "48.000"], ["Maret", "100", "60.000"]] },
      o: ["Februari", "Januari", "Maret", "Januari dan Maret", "Februari dan Maret"],
      x: "Januari: 120 × 50.000 = 6.000.000. Februari: 150 × 48.000 = 7.200.000. Maret: 100 × 60.000 = 6.000.000. Terbesar Februari." }
  ]);
})();
