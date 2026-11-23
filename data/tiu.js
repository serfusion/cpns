/* Bank soal TIU. o[0] selalu jawaban benar; opsi diacak saat ditampilkan.
   Perbandingan kuantitatif memakai urutan opsi tetap (fix:1) dengan kunci di `a`.
   Soal figural dan sebagian deret angka dibangkitkan otomatis (js/figural.js, js/engine.js). */
(function () {
  "use strict";
  var SKD = window.SKD;
  var PK = ["x > y", "x < y", "x = y", "2x = y", "Hubungan x dan y tidak dapat ditentukan"];

  // ===================== ANALOGI =====================
  SKD.add("tiu", [
    { m: "ana", h: 2, q: "PADI : PETANI = ... : ...",
      o: ["IKAN : NELAYAN", "BUKU : PEMBACA", "OBAT : PASIEN", "SEPATU : PEMAKAI", "JALAN : PENGEMUDI"],
      x: "Padi dihasilkan oleh petani, seperti ikan dihasilkan (ditangkap) oleh nelayan. Pilihan lain menunjukkan hubungan benda dengan penggunanya." },
    { m: "ana", h: 2, q: "GURU : SEKOLAH : MURID = ... : ... : ...",
      o: ["DOKTER : RUMAH SAKIT : PASIEN", "HAKIM : PENGADILAN : JAKSA", "PETANI : SAWAH : CANGKUL", "PILOT : PESAWAT : BANDARA", "PENJUAL : PEMBELI : PASAR"],
      x: "Polanya profesi : tempat bekerja : pihak yang dilayani. Guru bekerja di sekolah melayani murid; dokter bekerja di rumah sakit melayani pasien." }
  ]);

  // ===================== SILOGISME =====================
  SKD.add("tiu", [
    { m: "sil", h: 2, q: "Semua pegawai yang lulus pelatihan dasar mendapat sertifikat.\nSebagian pegawai baru lulus pelatihan dasar.\nKesimpulan yang tepat adalah ...",
      o: ["Sebagian pegawai baru mendapat sertifikat", "Semua pegawai baru mendapat sertifikat", "Semua yang mendapat sertifikat adalah pegawai baru",
        "Sebagian pegawai baru tidak lulus pelatihan dasar", "Tidak ada pegawai baru yang mendapat sertifikat"],
      x: "Premis umum (semua) digabung dengan premis khusus (sebagian) menghasilkan kesimpulan khusus: sebagian pegawai baru mendapat sertifikat. Pernyataan bahwa sebagian tidak lulus tidak dapat dipastikan." },
    { m: "sil", h: 2, q: "Jika hujan turun, maka upacara dipindahkan ke aula.\nUpacara tidak dipindahkan ke aula.\nKesimpulan yang tepat adalah ...",
      o: ["Hujan tidak turun", "Hujan turun", "Upacara dibatalkan", "Hujan turun tetapi upacara tetap di lapangan", "Tidak dapat ditarik kesimpulan"],
      x: "Modus tollens: jika p maka q; tidak q; jadi tidak p. Karena upacara tidak dipindahkan, hujan tidak turun." }
  ]);

  // ===================== ANALITIS =====================
  SKD.add("tiu", [
    { m: "anl", h: 2, q: "Andi, Bima, Citra, Dewi, dan Eko mengikuti lomba lari. Citra tiba lebih dulu daripada Andi tetapi setelah Eko. Bima tiba tepat setelah Andi. Dewi tiba paling akhir.\nSiapa yang tiba di urutan ketiga?",
      o: ["Andi", "Bima", "Citra", "Dewi", "Eko"],
      x: "Eko sebelum Citra, Citra sebelum Andi, Bima tepat setelah Andi, Dewi terakhir. Urutannya: Eko, Citra, Andi, Bima, Dewi. Urutan ketiga adalah Andi." }
  ]);

  // ===================== BERHITUNG =====================
  SKD.add("tiu", [
    { m: "hit", h: 2, q: "Nilai dari 37,5% × 64 + 0,25 × 48 adalah ...",
      o: ["36", "32", "34", "38", "40"],
      x: "37,5% = 3/8, sehingga 3/8 × 64 = 24. Lalu 0,25 × 48 = 12. Jumlahnya 24 + 12 = 36." },
    { m: "hit", h: 1, q: "√(15² + 20²) + 3³ = ...",
      o: ["52", "50", "48", "62", "34"],
      x: "15² + 20² = 225 + 400 = 625, akarnya 25. Lalu 3³ = 27. Jadi 25 + 27 = 52." }
  ]);

  // ===================== DERET ANGKA =====================
  SKD.add("tiu", [
    { m: "der", h: 2, q: "Tentukan suku berikutnya dari deret:\n3, 7, 15, 31, 63, ...",
      o: ["127", "126", "125", "95", "94"],
      x: "Setiap suku adalah suku sebelumnya dikali 2 lalu ditambah 1 (selisihnya 4, 8, 16, 32, lalu 64). 63 × 2 + 1 = 127." }
  ]);

  // ===================== PERBANDINGAN KUANTITATIF =====================
  SKD.add("tiu", [
    { m: "pk", h: 2, fix: 1, a: 2, q: "Jika x = 3/8 dari 72 dan y = 45% dari 60, maka ...", o: PK,
      x: "x = 3/8 × 72 = 27 dan y = 0,45 × 60 = 27. Jadi x = y." },
    { m: "pk", h: 1, fix: 1, a: 4, q: "Diketahui x² = 49 dan y = 6. Maka ...", o: PK,
      x: "x² = 49 berarti x = 7 atau x = −7. Jika x = 7 maka x > y, jika x = −7 maka x < y. Hubungannya tidak dapat ditentukan." }
  ]);

  // ===================== SOAL CERITA =====================
  SKD.add("tiu", [
    { m: "cer", h: 2, q: "Sebuah mobil menghabiskan 12 liter bensin untuk menempuh 150 km. Dengan pemakaian yang sama, berapa liter bensin yang dibutuhkan untuk menempuh 400 km?",
      o: ["32 liter", "30 liter", "34 liter", "36 liter", "28 liter"],
      x: "Perbandingan senilai: 12/150 = x/400, sehingga x = 12 × 400 ÷ 150 = 32 liter." },
    { m: "cer", h: 2, q: "Sebuah proyek dapat diselesaikan oleh 12 pekerja dalam 30 hari. Setelah berjalan 10 hari, pekerjaan terhenti selama 4 hari. Agar proyek tetap selesai tepat waktu, berapa pekerja yang harus ditambahkan?",
      o: ["3 orang", "4 orang", "5 orang", "6 orang", "2 orang"],
      x: "Total pekerjaan 12 × 30 = 360 hari-orang. Selesai 12 × 10 = 120, sisa 240. Sisa waktu 30 − 10 − 4 = 16 hari, butuh 240 ÷ 16 = 15 pekerja. Tambahan 15 − 12 = 3 orang." },
    { m: "cer", h: 1, q: "Berdasarkan tabel penjualan berikut, bulan dengan pendapatan terbesar adalah ...",
      tb: { h: ["Bulan", "Terjual (unit)", "Harga per unit (Rp)"], r: [["Januari", "120", "50.000"], ["Februari", "150", "48.000"], ["Maret", "100", "60.000"]] },
      o: ["Februari", "Januari", "Maret", "Januari dan Maret", "Februari dan Maret"],
      x: "Januari: 120 × 50.000 = 6.000.000. Februari: 150 × 48.000 = 7.200.000. Maret: 100 × 60.000 = 6.000.000. Terbesar Februari." }
  ]);

  // ===================== TAMBAHAN: VERBAL =====================
  SKD.add("tiu", [
    { m: "ana", h: 2, q: "DOKTER : STETOSKOP = ... : ...",
      o: ["FOTOGRAFER : KAMERA", "PENJAHIT : KAIN", "PETANI : SAWAH", "GURU : MURID", "PILOT : BANDARA"],
      x: "Stetoskop adalah alat kerja dokter, seperti kamera alat kerja fotografer. Kain adalah bahan, sawah tempat, murid pihak yang dilayani, bandara tempat." },
    { m: "ana", h: 2, q: "API : PANAS = ... : ...",
      o: ["ES : DINGIN", "LAMPU : LISTRIK", "MATAHARI : SIANG", "HUJAN : PAYUNG", "GARAM : LAUT"],
      x: "Panas adalah sifat api, dingin adalah sifat es." },
    { m: "ana", h: 2, q: "KAKI : SEPATU = ... : ...",
      o: ["TANGAN : SARUNG TANGAN", "TELINGA : MENDENGAR", "KEPALA : RAMBUT", "MULUT : GIGI", "MATA : MELIHAT"],
      x: "Sepatu adalah pelindung yang dikenakan pada kaki, sarung tangan dikenakan pada tangan. Rambut dan gigi adalah bagian tubuh, bukan benda yang dikenakan." },
    { m: "ana", h: 2, q: "BOROS : HEMAT = ... : ...",
      o: ["RAJIN : MALAS", "CERDAS : PINTAR", "TINGGI : JANGKUNG", "BESAR : RAKSASA", "CEPAT : KILAT"],
      x: "Boros dan hemat berlawanan makna (antonim). Pilihan lain bersinonim atau berupa tingkatan." },
    { m: "ana", h: 2, q: "SENYUM : TERTAWA : TERBAHAK-BAHAK = ... : ... : ...",
      o: ["GERIMIS : HUJAN : BADAI", "PAGI : SIANG : MALAM", "MERAH : KUNING : HIJAU", "MAKAN : MINUM : TIDUR", "SEDIH : MENANGIS : AIR MATA"],
      x: "Polanya tingkatan intensitas dari lemah ke kuat. Gerimis, hujan, badai juga makin kuat. Pagi-siang-malam hanya urutan waktu." },
    { m: "ana", h: 2, q: "PENULIS : PENA : BUKU = ... : ... : ...",
      o: ["PENJAHIT : JARUM : PAKAIAN", "PETANI : SAWAH : PADI", "KOKI : DAPUR : MASAKAN", "GURU : SEKOLAH : MURID", "NELAYAN : LAUT : IKAN"],
      x: "Polanya pelaku : alat : hasil karya. Sawah, dapur, sekolah, dan laut adalah tempat, bukan alat." },
    { m: "ana", h: 2, q: "MOBIL : BENSIN = ... : ...",
      o: ["LAMPU : LISTRIK", "KAPAL : LAUT", "SEPEDA : RODA", "PESAWAT : PILOT", "RUMAH : ATAP"],
      x: "Bensin adalah sumber energi mobil, listrik sumber energi lampu." },
    { m: "ana", h: 2, q: "KATAK : AMFIBI = ... : ...",
      o: ["ULAR : REPTIL", "PAUS : IKAN", "KELELAWAR : BURUNG", "AYAM : TELUR", "KUCING : TIKUS"],
      x: "Katak termasuk golongan amfibi, ular golongan reptil. Paus mamalia, bukan ikan; kelelawar mamalia, bukan burung." },
    { m: "ana", h: 2, q: "BUKU : PERPUSTAKAAN = ... : ...",
      o: ["LUKISAN : GALERI", "OBAT : APOTEKER", "KERTAS : PENSIL", "IKAN : NELAYAN", "SURAT : PERANGKO"],
      x: "Perpustakaan adalah tempat menyimpan dan memajang buku, galeri tempat menyimpan dan memajang lukisan." },

    { m: "sil", h: 2, q: "Semua ASN wajib bersikap netral dalam pemilu.\nBudi tidak bersikap netral dalam pemilu.\nKesimpulan yang tepat adalah ...",
      o: ["Budi bukan ASN", "Budi adalah ASN", "Sebagian ASN tidak netral", "Budi wajib bersikap netral", "Tidak dapat ditarik kesimpulan"],
      x: "Jika semua A adalah B dan Budi bukan B, maka Budi bukan A (modus tollens)." },
    { m: "sil", h: 2, q: "Tidak ada pegawai yang malas mendapat promosi.\nSebagian pegawai bagian teknik mendapat promosi.\nKesimpulan yang tepat adalah ...",
      o: ["Sebagian pegawai bagian teknik tidak malas", "Semua pegawai bagian teknik tidak malas", "Sebagian pegawai bagian teknik malas",
        "Tidak ada pegawai bagian teknik yang malas", "Semua pegawai yang tidak malas mendapat promosi"],
      x: "Yang mendapat promosi pasti tidak malas. Karena sebagian pegawai teknik mendapat promosi, sebagian pegawai teknik pasti tidak malas. Tentang sisanya tidak dapat dipastikan." },
    { m: "sil", h: 2, q: "Jika jalan licin, maka banyak terjadi kecelakaan.\nJika banyak terjadi kecelakaan, maka rumah sakit penuh.\nKesimpulan yang tepat adalah ...",
      o: ["Jika jalan licin, maka rumah sakit penuh", "Jika rumah sakit penuh, maka jalan licin", "Jika jalan tidak licin, maka rumah sakit tidak penuh",
        "Jalan licin dan rumah sakit penuh", "Rumah sakit penuh"],
      x: "Silogisme: p → q dan q → r, maka p → r." },
    { m: "sil", h: 2, q: "Jika Rina lulus SKD, maka ia mengikuti SKB.\nRina lulus SKD.\nKesimpulan yang tepat adalah ...",
      o: ["Rina mengikuti SKB", "Rina tidak mengikuti SKB", "Rina lulus SKB", "Rina mungkin mengikuti SKB", "Tidak dapat ditarik kesimpulan"],
      x: "Modus ponens: p → q dan p, maka q. Lulus SKB tidak dapat dipastikan." },
    { m: "sil", h: 2, q: "Jika hujan turun, maka jalan basah.\nJalan basah.\nKesimpulan yang tepat adalah ...",
      o: ["Tidak dapat ditarik kesimpulan yang pasti", "Hujan turun", "Hujan tidak turun", "Jalan tidak basah", "Hujan turun dan jalan basah"],
      x: "Dari p → q dan q tidak dapat disimpulkan p, karena jalan bisa basah oleh sebab lain (kesalahan menegaskan konsekuen)." },
    { m: "sil", h: 2, q: "Ingkaran dari pernyataan \"Semua pegawai datang tepat waktu\" adalah ...",
      o: ["Ada pegawai yang tidak datang tepat waktu", "Semua pegawai tidak datang tepat waktu", "Tidak ada pegawai yang datang tepat waktu",
        "Sebagian pegawai datang tepat waktu", "Ada pegawai yang datang tepat waktu"],
      x: "Ingkaran \"semua p\" adalah \"ada (beberapa) yang tidak p\"." },
    { m: "sil", h: 2, q: "Andi berangkat ke kantor naik bus atau kereta.\nAndi tidak naik kereta.\nKesimpulan yang tepat adalah ...",
      o: ["Andi naik bus", "Andi tidak berangkat ke kantor", "Andi naik bus dan kereta", "Andi naik kendaraan pribadi", "Tidak dapat ditarik kesimpulan"],
      x: "Silogisme disjungtif: p atau q; bukan q; maka p." },
    { m: "sil", h: 2, q: "Semua peserta yang hadir membawa KTP.\nSebagian peserta yang membawa KTP membawa kartu ujian.\nKesimpulan yang tepat adalah ...",
      o: ["Tidak dapat dipastikan apakah peserta yang hadir membawa kartu ujian", "Sebagian peserta yang hadir membawa kartu ujian",
        "Semua peserta yang hadir membawa kartu ujian", "Semua peserta yang membawa kartu ujian hadir", "Tidak ada peserta hadir yang membawa kartu ujian"],
      x: "Yang membawa kartu ujian hanya \"sebagian\" pembawa KTP, dan bisa saja mereka semua tidak hadir. Tidak ada kesimpulan pasti tentang peserta yang hadir." },

    { m: "anl", h: 2, q: "P, Q, R, S, dan T duduk berjajar pada lima kursi bernomor 1 sampai 5 dari kiri ke kanan. Q duduk di kursi paling kiri. T duduk di kursi tengah. R duduk tepat di sebelah kanan T. S tidak duduk bersebelahan dengan Q.\nSiapa yang duduk di kursi paling kanan?",
      o: ["S", "R", "P", "T", "Q"],
      x: "Q = 1, T = 3, R = 4. S tidak boleh di kursi 2 (bersebelahan dengan Q), sehingga S = 5 dan P = 2." },
    { m: "anl", h: 1, q: "Rapat A, B, C, D, dan E dijadwalkan Senin sampai Jumat, satu rapat setiap hari. Rapat B tepat sehari sebelum rapat D. Rapat A hari Rabu. Rapat E tidak pada hari Senin maupun Jumat. Rapat C tidak pada hari Senin.\nRapat apa yang dijadwalkan hari Jumat?",
      o: ["C", "D", "E", "B", "A"],
      x: "A = Rabu. Pasangan B–D hanya bisa Senin–Selasa atau Kamis–Jumat. Jika Kamis–Jumat, E harus Selasa dan C terpaksa Senin (dilarang). Jadi B Senin, D Selasa, E Kamis, C Jumat." },
    { m: "anl", h: 2, q: "Nilai Dina lebih tinggi daripada Eka. Nilai Fajar lebih rendah daripada Eka tetapi lebih tinggi daripada Gita. Nilai Hana lebih tinggi daripada Dina.\nSiapa yang nilainya paling rendah?",
      o: ["Gita", "Fajar", "Eka", "Dina", "Hana"],
      x: "Urutannya: Hana > Dina > Eka > Fajar > Gita." },
    { m: "anl", h: 2, q: "Berdasarkan tabel berikut, unit dengan persentase pegawai yang sudah mengikuti pelatihan paling tinggi adalah ...",
      tb: { h: ["Unit", "Jumlah pegawai", "Sudah pelatihan"], r: [["A", "40", "10"], ["B", "25", "10"], ["C", "50", "15"], ["D", "20", "4"]] },
      o: ["Unit B", "Unit C", "Unit A", "Unit D", "Unit A dan C"],
      x: "A = 25%, B = 40%, C = 30%, D = 20%. Unit C paling banyak orangnya, tetapi persentase tertinggi ada pada unit B." },
    { m: "anl", h: 1, q: "Dari enam pegawai K, L, M, N, O, dan P akan dipilih tim beranggotakan tiga orang dengan syarat: K dan L tidak boleh dalam satu tim; jika M dipilih, N harus dipilih; O wajib dipilih.\nSusunan tim yang memenuhi syarat adalah ...",
      o: ["O, M, N", "O, K, M", "O, K, L", "K, M, N", "O, L, M"],
      x: "O, K, M dan O, L, M melanggar syarat M–N; O, K, L melanggar syarat K–L; K, M, N tidak memuat O." },
    { m: "anl", h: 2, q: "A lebih tinggi daripada B. C lebih pendek daripada B. D lebih tinggi daripada A.\nPernyataan yang pasti benar adalah ...",
      o: ["C paling pendek", "A paling tinggi", "B lebih tinggi daripada A", "D lebih pendek daripada C", "A lebih pendek daripada C"],
      x: "Urutan tinggi: D > A > B > C." }
  ]);

  // ===================== TAMBAHAN: NUMERIK =====================
  SKD.add("tiu", [
    { m: "hit", h: 2, q: "2/5 + 3/4 − 0,15 = ...", o: ["1", "0,85", "1,15", "1,25", "0,95"],
      x: "0,4 + 0,75 − 0,15 = 1." },
    { m: "hit", h: 2, q: "0,125 × 64 ÷ 0,5 = ...", o: ["16", "4", "8", "32", "12"],
      x: "0,125 × 64 = 8, lalu 8 ÷ 0,5 = 16." },
    { m: "hit", h: 1, q: "(2⁵ × 3²) ÷ 2³ = ...", o: ["36", "72", "18", "48", "24"],
      x: "2⁵ ÷ 2³ = 2² = 4, lalu 4 × 9 = 36." },
    { m: "hit", h: 2, q: "Jika 3x − 7 = 2x + 5, maka nilai 2x + 1 adalah ...", o: ["25", "23", "24", "13", "27"],
      x: "3x − 2x = 5 + 7, sehingga x = 12. Maka 2x + 1 = 25." },
    { m: "hit", h: 2, q: "15% dari 240 ditambah 1/3 dari 90 adalah ...", o: ["66", "60", "64", "72", "56"],
      x: "15% × 240 = 36 dan 1/3 × 90 = 30. Jumlahnya 66." },
    { m: "hit", q: "√0,0144 = ...", o: ["0,12", "0,012", "1,2", "0,0012", "0,144"],
      x: "0,12 × 0,12 = 0,0144." },
    { m: "hit", h: 2, q: "999 × 25 = ...", o: ["24.975", "24.925", "24.995", "25.025", "23.975"],
      x: "999 × 25 = (1.000 − 1) × 25 = 25.000 − 25 = 24.975." },
    { m: "hit", h: 2, q: "1 ÷ (1/3 + 1/6) = ...", o: ["2", "1/2", "9", "3", "6"],
      x: "1/3 + 1/6 = 1/2, sehingga 1 ÷ 1/2 = 2." },
    { m: "hit", h: 1, q: "Jika a = 2 dan b = −3, nilai a² − 2ab + b² adalah ...", o: ["25", "1", "−1", "13", "5"],
      x: "a² − 2ab + b² = (a − b)² = (2 + 3)² = 25." },

    { m: "der", h: 2, q: "Tentukan suku berikutnya dari deret:\n2, 3, 5, 8, 12, 17, ...", o: ["23", "22", "24", "25", "21"],
      x: "Selisihnya +1, +2, +3, +4, +5, berikutnya +6: 17 + 6 = 23." },
    { m: "der", h: 2, q: "Tentukan suku berikutnya dari deret:\n100, 95, 85, 70, 50, ...", o: ["25", "30", "20", "15", "35"],
      x: "Selisihnya −5, −10, −15, −20, berikutnya −25: 50 − 25 = 25." },
    { m: "der", h: 2, q: "Tentukan huruf berikutnya dari deret:\nA, C, F, J, O, ...", o: ["U", "T", "V", "S", "W"],
      x: "Urutan huruf 1, 3, 6, 10, 15 (selisih +2, +3, +4, +5). Berikutnya +6 = 21, yaitu U." },
    { m: "der", h: 2, q: "Tentukan huruf berikutnya dari deret:\nB, D, G, K, ...", o: ["P", "O", "Q", "N", "R"],
      x: "Urutan huruf 2, 4, 7, 11 (selisih +2, +3, +4). Berikutnya +5 = 16, yaitu P." },
    { m: "der", h: 2, q: "Tentukan suku berikutnya dari deret:\n2, 6, 3, 9, 6, 18, ...", o: ["15", "54", "21", "12", "16"],
      x: "Polanya ×3, −3 berselang: 2×3=6, 6−3=3, 3×3=9, 9−3=6, 6×3=18, lalu 18−3 = 15." },
    { m: "der", h: 2, q: "Tentukan suku berikutnya dari deret:\n1, 1, 2, 6, 24, ...", o: ["120", "48", "96", "72", "100"],
      x: "Dikali 1, 2, 3, 4, lalu dikali 5: 24 × 5 = 120." },
    { m: "der", h: 2, q: "Tentukan suku berikutnya dari deret:\n81, 27, 9, 3, ...", o: ["1", "0", "1/3", "2", "1/9"],
      x: "Setiap suku dibagi 3: 3 ÷ 3 = 1." },

    { m: "pk", h: 2, fix: 1, a: 1, q: "x = 0,6 × 0,6 dan y = 0,6. Maka ...", o: PK, x: "x = 0,36 dan y = 0,6, sehingga x < y." },
    { m: "pk", h: 1, fix: 1, a: 0, q: "x = (−2)⁴ dan y = −2⁴. Maka ...", o: PK, x: "x = 16, sedangkan y = −(2⁴) = −16. Jadi x > y." },
    { m: "pk", h: 2, fix: 1, a: 0, q: "Sebuah barang seharga Rp100.000.\nx = harga setelah diskon 20% lalu diskon lagi 10%\ny = harga setelah diskon 30%\nMaka ...", o: PK,
      x: "x = 100.000 × 0,8 × 0,9 = 72.000; y = 70.000. Diskon bertingkat tidak sama dengan menjumlahkan persentasenya. Jadi x > y." },
    { m: "pk", h: 2, fix: 1, a: 0, q: "x = 3/7 dan y = 5/12. Maka ...", o: PK, x: "Bandingkan silang: 3 × 12 = 36 dan 5 × 7 = 35. Karena 36 > 35, x > y." },
    { m: "pk", h: 1, fix: 1, a: 2, q: "x = √50 + √18 dan y = √128. Maka ...", o: PK, x: "x = 5√2 + 3√2 = 8√2, dan y = √(64 × 2) = 8√2. Jadi x = y." },
    { m: "pk", h: 2, fix: 1, a: 4, q: "x adalah bilangan bulat yang memenuhi 2 < x < 6, dan y = 4. Maka ...", o: PK, x: "x bisa 3, 4, atau 5, sehingga x bisa lebih kecil, sama, atau lebih besar dari y." },
    { m: "pk", h: 2, fix: 1, a: 0, q: "x = rata-rata dari 4, 6, 8, 10 dan y = median dari 3, 5, 8, 12. Maka ...", o: PK, x: "x = 28 ÷ 4 = 7; y = (5 + 8) ÷ 2 = 6,5. Jadi x > y." },
    { m: "pk", h: 2, fix: 1, a: 2, q: "x = 25% dari 80 dan y = 80% dari 25. Maka ...", o: PK, x: "x = 20 dan y = 20, sehingga x = y." },
    { m: "pk", h: 2, fix: 1, a: 1, q: "x = luas persegi bersisi 6 cm dan y = luas lingkaran berjari-jari 3,5 cm (π = 22/7). Maka ...", o: PK,
      x: "x = 36 cm²; y = 22/7 × 3,5 × 3,5 = 38,5 cm². Jadi x < y." },
    { m: "pk", h: 1, fix: 1, a: 4, q: "Diketahui p > 0, x = p², dan y = p. Maka ...", o: PK, x: "Jika p = 2, x = 4 > y. Jika p = 0,5, x = 0,25 < y. Hubungannya tidak dapat ditentukan." },

    { m: "cer", h: 1, q: "Sebuah barang dibeli seharga Rp80.000 dan dijual Rp92.000. Persentase keuntungannya adalah ...", o: ["15%", "12%", "13%", "18%", "20%"],
      x: "Untung 12.000 ÷ 80.000 × 100% = 15%. Persentase untung dihitung dari harga beli." },
    { m: "cer", h: 1, q: "Setelah mendapat diskon 25%, Rina membayar Rp150.000 untuk sebuah tas. Harga tas sebelum diskon adalah ...", o: ["Rp200.000", "Rp187.500", "Rp175.000", "Rp225.000", "Rp190.000"],
      x: "150.000 adalah 75% harga awal, sehingga harga awal = 150.000 ÷ 0,75 = 200.000." },
    { m: "cer", h: 1, q: "Jarak kota A ke kota B 180 km. Sebuah bus berangkat pukul 07.15 dengan kecepatan rata-rata 60 km/jam. Bus tiba di kota B pukul ...", o: ["10.15", "10.00", "10.30", "09.45", "10.45"],
      x: "Waktu tempuh 180 ÷ 60 = 3 jam. 07.15 + 3 jam = 10.15." },
    { m: "cer", h: 1, q: "Dua mobil berangkat bersamaan dari dua kota yang berjarak 300 km dan bergerak saling mendekat dengan kecepatan 70 km/jam dan 50 km/jam. Keduanya bertemu setelah ...", o: ["2 jam 30 menit", "2 jam", "3 jam", "2 jam 15 menit", "2 jam 45 menit"],
      x: "Kecepatan saling mendekat 70 + 50 = 120 km/jam. Waktu = 300 ÷ 120 = 2,5 jam." },
    { m: "cer", h: 1, q: "Andi dapat menyelesaikan sebuah pekerjaan dalam 6 hari, sedangkan Budi dalam 12 hari. Jika bekerja bersama, pekerjaan itu selesai dalam ...", o: ["4 hari", "3 hari", "5 hari", "6 hari", "9 hari"],
      x: "Per hari: 1/6 + 1/12 = 3/12 = 1/4 pekerjaan. Jadi selesai dalam 4 hari." },
    { m: "cer", h: 2, q: "Sebuah pekerjaan selesai dalam 15 hari oleh 8 pekerja. Jika dikerjakan 10 pekerja dengan kemampuan sama, pekerjaan selesai dalam ...", o: ["12 hari", "10 hari", "13 hari", "14 hari", "9 hari"],
      x: "Perbandingan berbalik nilai: 8 × 15 = 120 hari-orang, lalu 120 ÷ 10 = 12 hari." },
    { m: "cer", h: 1, q: "Usia ayah sekarang tiga kali usia anaknya. Sepuluh tahun lagi, usia ayah dua kali usia anaknya. Usia anak sekarang adalah ...", o: ["10 tahun", "8 tahun", "12 tahun", "15 tahun", "20 tahun"],
      x: "Misal usia anak a: 3a + 10 = 2(a + 10), sehingga a = 10." },
    { m: "cer", h: 1, q: "Rata-rata nilai 5 siswa adalah 70. Setelah satu siswa baru bergabung, rata-ratanya menjadi 72. Nilai siswa baru itu adalah ...", o: ["82", "80", "84", "74", "78"],
      x: "Jumlah awal 5 × 70 = 350; jumlah baru 6 × 72 = 432. Nilai siswa baru 432 − 350 = 82." },
    { m: "cer", h: 1, q: "Dari 40 pegawai, 25 orang suka teh, 20 orang suka kopi, dan 8 orang suka keduanya. Banyak pegawai yang tidak suka teh maupun kopi adalah ...", o: ["3", "5", "7", "8", "0"],
      x: "Yang suka minimal satu: 25 + 20 − 8 = 37. Yang tidak suka keduanya: 40 − 37 = 3." },
    { m: "cer", q: "Sebuah kotak berisi 4 bola merah dan 6 bola biru. Diambil 2 bola sekaligus secara acak. Peluang terambil keduanya merah adalah ...", o: ["2/15", "4/25", "1/5", "2/9", "1/15"],
      x: "C(4,2) ÷ C(10,2) = 6 ÷ 45 = 2/15." },
    { m: "cer", h: 1, q: "Perbandingan uang A dan B adalah 3 : 5. Selisih uang mereka Rp60.000. Jumlah uang keduanya adalah ...", o: ["Rp240.000", "Rp180.000", "Rp300.000", "Rp160.000", "Rp200.000"],
      x: "Selisih 2 bagian = 60.000, jadi 1 bagian = 30.000. Jumlah 8 bagian = 240.000." },
    { m: "cer", q: "Pada peta berskala 1 : 250.000, jarak dua kota 8 cm. Jarak sebenarnya adalah ...", o: ["20 km", "2 km", "200 km", "25 km", "16 km"],
      x: "8 × 250.000 = 2.000.000 cm = 20 km." },
    { m: "cer", q: "Tabungan Rp2.000.000 mendapat bunga tunggal 6% per tahun. Jumlah tabungan setelah 8 bulan adalah ...", o: ["Rp2.080.000", "Rp2.120.000", "Rp2.096.000", "Rp2.060.000", "Rp2.160.000"],
      x: "Bunga = 2.000.000 × 6% × 8/12 = 80.000. Jumlah = 2.080.000." },
    { m: "cer", h: 1, q: "Produksi padi sebuah desa pada tahun 2023 sebesar 150 ton dan pada tahun 2024 sebesar 135 ton. Persentase penurunannya adalah ...", o: ["10%", "11,1%", "15%", "12,5%", "9%"],
      x: "Turun 15 ton dari 150 ton: 15 ÷ 150 × 100% = 10%. Persentase dihitung dari nilai awal." },
    { m: "cer", h: 1, q: "Sebuah bak berkapasitas 1.200 liter diisi keran dengan debit 20 liter/menit, tetapi bak bocor 5 liter/menit. Bak kosong itu akan penuh dalam ...", o: ["1 jam 20 menit", "1 jam", "1 jam 30 menit", "48 menit", "1 jam 40 menit"],
      x: "Debit bersih 20 − 5 = 15 liter/menit. 1.200 ÷ 15 = 80 menit." },
    { m: "cer", h: 2, q: "Sebuah motor menghabiskan 1 liter bensin untuk 45 km. Harga bensin Rp10.000 per liter. Biaya bensin untuk perjalanan pulang-pergi ke kota berjarak 135 km adalah ...", o: ["Rp60.000", "Rp30.000", "Rp54.000", "Rp66.000", "Rp45.000"],
      x: "Jarak total 270 km membutuhkan 270 ÷ 45 = 6 liter, biayanya 6 × 10.000 = 60.000." }
  ]);

  // ===================== TAMBAHAN NOV 2026: pola yang dilaporkan peserta SKD 2024 =====================
  // Silogisme tiga premis, analisis tabel, susunan duduk melingkar, antrean.
  SKD.add("tiu", [
    { m: "sil", h: 2, q: "Semua pegawai yang lulus uji kompetensi mendapat sertifikat.\nSemua pemegang sertifikat boleh menjadi instruktur.\nSebagian staf baru lulus uji kompetensi.\nKesimpulan yang tepat adalah ...",
      o: ["Sebagian staf baru boleh menjadi instruktur", "Semua staf baru boleh menjadi instruktur", "Semua instruktur adalah staf baru",
        "Sebagian staf baru tidak boleh menjadi instruktur", "Tidak ada staf baru yang boleh menjadi instruktur"],
      x: "Rantai: lulus uji → bersertifikat → boleh menjadi instruktur. Karena sebagian staf baru lulus uji, sebagian staf baru boleh menjadi instruktur. Tentang staf baru lainnya tidak dapat dipastikan." },
    { m: "sil", h: 2, q: "Jika hujan deras, maka sungai meluap.\nJika sungai meluap, maka jalan desa tergenang.\nJalan desa tidak tergenang.\nKesimpulan yang tepat adalah ...",
      o: ["Hujan tidak deras", "Hujan deras", "Sungai meluap", "Sungai meluap, tetapi jalan desa tidak tergenang", "Tidak dapat ditarik kesimpulan"],
      x: "Dari p → q dan q → r diperoleh p → r. Karena tidak r, maka tidak p (modus tollens): hujan tidak deras, dan sungai pun tidak meluap." },
    { m: "sil", h: 2, q: "Semua peserta pelatihan wajib membawa laptop.\nSebagian pembawa laptop memakai sistem operasi terbaru.\nRina adalah peserta pelatihan.\nKesimpulan yang pasti benar adalah ...",
      o: ["Rina membawa laptop", "Rina memakai sistem operasi terbaru", "Rina tidak memakai sistem operasi terbaru",
        "Semua peserta memakai sistem operasi terbaru", "Rina bukan pembawa laptop"],
      x: "Rina peserta, maka ia membawa laptop. Premis kedua hanya menyebut sebagian pembawa laptop, sehingga sistem operasi Rina tidak dapat dipastikan." },
    { m: "sil", h: 2, q: "Tidak ada pegawai yang sering terlambat mendapat tunjangan penuh.\nSemua pegawai bagian keuangan mendapat tunjangan penuh.\nSebagian pegawai yang rajin berolahraga adalah pegawai bagian keuangan.\nKesimpulan yang tepat adalah ...",
      o: ["Sebagian pegawai yang rajin berolahraga tidak sering terlambat", "Semua pegawai yang rajin berolahraga tidak sering terlambat",
        "Sebagian pegawai yang rajin berolahraga sering terlambat", "Semua pegawai yang tidak sering terlambat bekerja di bagian keuangan",
        "Tidak ada pegawai bagian keuangan yang rajin berolahraga"],
      x: "Pegawai keuangan mendapat tunjangan penuh, sehingga mereka tidak sering terlambat. Sebagian yang rajin berolahraga adalah pegawai keuangan, jadi sebagian yang rajin berolahraga tidak sering terlambat." },
    { m: "sil", h: 2, q: "Andi memilih formasi A atau formasi B.\nJika memilih formasi A, Andi harus pindah ke luar Jawa.\nAndi tidak pindah ke luar Jawa.\nKesimpulan yang tepat adalah ...",
      o: ["Andi memilih formasi B", "Andi memilih formasi A", "Andi tidak memilih formasi mana pun", "Andi memilih formasi A dan B", "Tidak dapat ditarik kesimpulan"],
      x: "Modus tollens: tidak pindah, maka tidak memilih A. Silogisme disjungtif: A atau B, bukan A, maka B." }
  ]);
  SKD.add("tiu", [
    { m: "anl", h: 2, q: "Berdasarkan tabel berikut, instansi dengan jumlah pelamar per formasi paling sedikit adalah ...",
      tb: { h: ["Instansi", "Pelamar", "Formasi"], r: [["A", "1.200", "40"], ["B", "900", "20"], ["C", "750", "30"], ["D", "2.000", "50"]] },
      o: ["Instansi C", "Instansi A", "Instansi B", "Instansi D", "Instansi A dan C"],
      x: "A = 30, B = 45, C = 25, D = 40 pelamar per formasi. Pelamar paling sedikit bukan jaminan persaingan paling ringan; yang menentukan adalah rasionya." },
    { m: "anl", h: 2, q: "Berdasarkan tabel produksi berikut, persentase kenaikan produksi dari tahun 2025 ke tahun 2026 adalah ...",
      tb: { h: ["Tahun", "Produksi (ton)"], r: [["2023", "180"], ["2024", "200"], ["2025", "250"], ["2026", "300"]] },
      o: ["20%", "16,7%", "25%", "50%", "30%"],
      x: "Naik 300 − 250 = 50 ton. Persentase dihitung dari tahun awal: 50 ÷ 250 × 100% = 20%." },
    { m: "anl", h: 2, q: "Berdasarkan tabel berikut, unit dengan jumlah pegawai perempuan terbanyak adalah ...",
      tb: { h: ["Unit", "Jumlah pegawai", "Bagian perempuan"], r: [["A", "40", "3/8"], ["B", "36", "4/9"], ["C", "30", "2/5"]] },
      o: ["Unit B", "Unit A", "Unit C", "Unit A dan B sama banyak", "Tidak dapat ditentukan"],
      x: "A = 3/8 × 40 = 15, B = 4/9 × 36 = 16, C = 2/5 × 30 = 12. Unit A paling banyak pegawainya, tetapi perempuan terbanyak ada di unit B." },
    { m: "anl", h: 2, q: "Enam orang A, B, C, D, E, dan F duduk mengelilingi meja bundar dengan jarak sama dan menghadap ke tengah. A berhadapan dengan D. B duduk bersebelahan dengan A dan C. E duduk bersebelahan dengan D dan F.\nSiapa yang duduk berhadapan dengan B?",
      o: ["E", "C", "F", "D", "A"],
      x: "A dan D berhadapan. B di samping A, lalu C di samping B; E di samping D, lalu F di samping E. Dari kedua kemungkinan susunan, B selalu berhadapan dengan E, dan C berhadapan dengan F." },
    { m: "anl", h: 2, q: "Lima orang P, Q, R, S, dan T mengantre di loket. T berada paling depan. P berada di depan Q, tetapi di belakang R. S berada tepat di belakang Q.\nSiapa yang berada di urutan ketiga?",
      o: ["P", "Q", "R", "S", "T"],
      x: "Urutan dari depan: T, R, P, Q, S. Urutan ketiga adalah P." }
  ]);
})();
