/* Soal figural TIU: penggambar SVG + pembangkit soal (analogi, ketidaksamaan, serial).
   Soal dibangkitkan dari aturan, jadi jawabannya benar menurut konstruksi dan selalu baru. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});

  function n2(v) { return Math.round(v * 100) / 100; }
  function mod(a, m) { return ((a % m) + m) % m; }

  // ---------- bentuk dasar ----------
  // mode isi: 0 kosong, 1 berisi, 2 "lubang" (kosong di atas bentuk berisi)
  function paint(mode, sw) {
    if (mode === 1) return 'fill="currentColor" stroke="currentColor" stroke-width="' + sw + '"';
    if (mode === 2) return 'fill="var(--fig-bg)" stroke="var(--fig-bg)" stroke-width="1"';
    return 'fill="none" stroke="currentColor" stroke-width="' + sw + '"';
  }
  function polyPts(n, cx, cy, r, rot) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var t = ((rot + (i * 360) / n) * Math.PI) / 180;
      out.push(n2(cx + r * Math.cos(t)) + "," + n2(cy + r * Math.sin(t)));
    }
    return out.join(" ");
  }
  var SHAPE_NAME = { c: "lingkaran", s: "persegi", t: "segitiga", p: "segilima", h: "segienam", d: "belah ketupat" };
  var SIDES_SHAPE = { 3: "t", 4: "s", 5: "p", 6: "h" };
  var SIDES_NAME = { 3: "segitiga", 4: "persegi", 5: "segilima", 6: "segienam" };

  function shape(id, cx, cy, r, mode, sw) {
    var p = paint(mode, sw);
    if (id === "c") return '<circle cx="' + cx + '" cy="' + cy + '" r="' + n2(r * 0.95) + '" ' + p + "/>";
    if (id === "s") {
      var k = r * 0.84;
      return '<rect x="' + n2(cx - k) + '" y="' + n2(cy - k) + '" width="' + n2(2 * k) + '" height="' + n2(2 * k) + '" ' + p + "/>";
    }
    if (id === "t") {
      return '<polygon points="' + cx + "," + n2(cy - 1.05 * r) + " " + n2(cx + 0.95 * r) + "," + n2(cy + 0.75 * r) + " " +
        n2(cx - 0.95 * r) + "," + n2(cy + 0.75 * r) + '" ' + p + "/>";
    }
    if (id === "p") return '<polygon points="' + polyPts(5, cx, cy + r * 0.04, r * 1.02, -90) + '" ' + p + "/>";
    if (id === "h") return '<polygon points="' + polyPts(6, cx, cy, r, 0) + '" ' + p + "/>";
    return '<polygon points="' + polyPts(4, cx, cy, r * 1.08, -90) + '" ' + p + "/>"; // d
  }
  // titik pusat "isi" sebuah bentuk (segitiga lebih rendah)
  function innerY(id, cy, r) { return id === "t" ? cy + r * 0.18 : cy; }

  // ---------- glif tak simetris (bisa dibedakan dari bayangan cerminnya) ----------
  var GLYPH = [
    { n: "bendera", fill: true, d: function (s) { return '<path d="M50 86V14" fill="none"/><path d="M50 14L84 28 50 42Z" fill="' + (s ? "currentColor" : "none") + '"/>'; } },
    { n: "bentuk L", fill: false, d: function () { return '<path d="M34 16V84H76" fill="none"/>'; } },
    { n: "bentuk F", fill: false, d: function () { return '<path d="M36 86V16H76M36 48H64" fill="none"/>'; } },
    { n: "segitiga siku-siku", fill: true, d: function (s) { return '<path d="M22 80H84L22 36Z" fill="' + (s ? "currentColor" : "none") + '"/>'; } },
    { n: "jarum dan titik", fill: false, d: function () { return '<circle cx="50" cy="50" r="34" fill="none"/><path d="M50 50V22" fill="none"/><circle cx="70" cy="40" r="5" fill="currentColor"/>'; } },
    { n: "panah bercabang", fill: false, d: function () { return '<path d="M50 86V16M36 32L50 16 64 32M50 60L74 46" fill="none"/>'; } },
    { n: "bentuk tangga", fill: true, d: function (s) { return '<path d="M24 82V30H46V58H78V82Z" fill="' + (s ? "currentColor" : "none") + '"/>'; } }
  ];

  var LAY = {
    1: [[50, 50]],
    2: [[34, 50], [66, 50]],
    3: [[22, 50], [50, 50], [78, 50]],
    4: [[34, 34], [66, 34], [34, 66], [66, 66]],
    5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
    6: [[22, 34], [50, 34], [78, 34], [22, 66], [50, 66], [78, 66]],
    7: [[22, 24], [50, 24], [78, 24], [50, 50], [22, 76], [50, 76], [78, 76]],
    8: [[22, 24], [50, 24], [78, 24], [36, 50], [64, 50], [22, 76], [50, 76], [78, 76]],
    9: [[22, 22], [50, 22], [78, 22], [22, 50], [50, 50], [78, 50], [22, 78], [50, 78], [78, 78]]
  };
  var RINGPOS = [[16, 16], [50, 16], [84, 16], [84, 50], [84, 84], [50, 84], [16, 84], [16, 50]];

  // ---------- penggambar ----------
  function inner(f) {
    var i, out = "";
    switch (f.k) {
      case "g": {
        var g = GLYPH[f.g];
        return '<g stroke="currentColor" stroke-width="5.5" transform="rotate(' + mod(f.a, 360) + ' 50 50) translate(50 50) scale(' +
          (f.f ? -0.9 : 0.9) + ' 0.9) translate(-50 -50)">' + g.d(f.s) + "</g>";
      }
      case "r": {
        var sq = RINGPOS[mod(f.s, 8)], dt = RINGPOS[mod(f.d, 8)];
        out = '<rect x="16" y="16" width="68" height="68" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>';
        out += '<rect x="' + (sq[0] - 11) + '" y="' + (sq[1] - 11) + '" width="22" height="22" fill="var(--fig-bg)" stroke="currentColor" stroke-width="4"/>';
        out += '<circle cx="' + dt[0] + '" cy="' + dt[1] + '" r="6" fill="currentColor"/>';
        return out;
      }
      case "n": {
        var pos = LAY[f.n] || LAY[9], rad = f.n > 6 ? 9 : 10.5;
        for (i = 0; i < pos.length; i++) out += shape(f.sh, pos[i][0], pos[i][1], rad, f.fl ? 1 : 0, 3.5);
        return out;
      }
      case "x": {
        out = shape(f.o, 50, 50, 37, f.fo ? 1 : 0, 5);
        out += shape(f.i, 50, innerY(f.o, 50, 37), 14, f.fi ? 1 : f.fo ? 2 : 0, 4);
        return out;
      }
      case "p": {
        var sh = SIDES_SHAPE[f.sd];
        out = shape(sh, 50, 50, 38, 0, 4.5);
        var cy = innerY(sh, 50, 38), lay = LAY[f.dt] || [];
        for (i = 0; i < lay.length; i++) {
          out += '<circle cx="' + n2(50 + (lay[i][0] - 50) * 0.42) + '" cy="' + n2(cy + (lay[i][1] - 50) * 0.42) + '" r="3.6" fill="currentColor"/>';
        }
        return out;
      }
      case "j": {
        var hR = f.rows.length, wR = 0, r, c;
        for (r = 0; r < hR; r++) wR = Math.max(wR, f.rows[r].length);
        var sz = Math.min(92 / wR, 92 / hR), ox = (100 - sz * wR) / 2, oy = (100 - sz * hR) / 2;
        for (r = 0; r < hR; r++) {
          for (c = 0; c < f.rows[r].length; c++) {
            var ch = f.rows[r].charAt(c);
            if (ch === ".") continue;
            var x = n2(ox + c * sz), y = n2(oy + r * sz);
            out += '<rect x="' + x + '" y="' + y + '" width="' + n2(sz) + '" height="' + n2(sz) + '" fill="none" stroke="currentColor" stroke-width="1.6"/>';
            out += '<text x="' + n2(ox + (c + 0.5) * sz) + '" y="' + n2(oy + (r + 0.5) * sz + sz * 0.17) + '" font-size="' + n2(sz * 0.5) +
              '" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="inherit">' + ch + "</text>";
          }
        }
        return out;
      }
      default:
        return '<text x="50" y="68" font-size="54" font-weight="700" text-anchor="middle" fill="currentColor" font-family="inherit">?</text>';
    }
  }
  function svg(f) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" stroke-linejoin="round" stroke-linecap="round">' + inner(f) + "</svg>";
  }
  function sig(f) {
    switch (f.k) {
      case "g": return "g" + f.g + "|" + mod(f.a, 360) + "|" + (f.f ? 1 : 0) + "|" + (GLYPH[f.g].fill && f.s ? 1 : 0);
      case "r": return "r" + mod(f.d, 8) + "|" + mod(f.s, 8);
      case "n": return "n" + f.n + f.sh + (f.fl ? 1 : 0);
      case "x": return "x" + f.o + f.i + (f.fo ? 1 : 0) + (f.fi ? 1 : 0);
      case "p": return "p" + f.sd + "|" + f.dt;
      case "j": return "j" + f.rows.join("/");
      default: return "?";
    }
  }
  function describe(f) {
    switch (f.k) {
      case "g": return GLYPH[f.g].n + (GLYPH[f.g].fill ? (f.s ? " berisi" : " kosong") : "") + ", diputar " + mod(f.a, 360) + "°" + (f.f ? ", tercermin" : "");
      case "r": return "titik di posisi " + (mod(f.d, 8) + 1) + " dan kotak di posisi " + (mod(f.s, 8) + 1) + " dari 8 posisi keliling";
      case "n": return f.n + " " + SHAPE_NAME[f.sh] + (f.fl ? " berisi" : " kosong");
      case "x": return SHAPE_NAME[f.o] + (f.fo ? " berisi" : " kosong") + " dengan " + SHAPE_NAME[f.i] + (f.fi ? " berisi" : " kosong") + " di dalamnya";
      case "p": return SIDES_NAME[f.sd] + " dengan " + f.dt + " titik";
      case "j": return "jaring-jaring kubus. " + f.rows.map(function (row, r) {
        var cells = [];
        for (var c = 0; c < row.length; c++) if (row.charAt(c) !== ".") cells.push(row.charAt(c) + " di kolom " + (c + 1));
        return "Baris " + (r + 1) + ": " + cells.join(", ");
      }).join(". ");
      default: return "tanda tanya";
    }
  }

  // ---------- konstruktor ringkas ----------
  function G(g, a, f, s) { return { k: "g", g: g, a: mod(a, 360), f: f ? 1 : 0, s: GLYPH[g].fill && s ? 1 : 0 }; }
  function RG(d, s) { return { k: "r", d: mod(d, 8), s: mod(s, 8) }; }
  function CN(n, sh, fl) { return { k: "n", n: n, sh: sh, fl: fl ? 1 : 0 }; }
  function NX(o, i, fo, fi) { return { k: "x", o: o, i: i, fo: fo ? 1 : 0, fi: fi ? 1 : 0 }; }
  function PD(sd, dt) { return { k: "p", sd: sd, dt: dt }; }
  var Q = { k: "q" };

  // Susun 5 opsi: jawaban benar di indeks 0, pengecoh unik diambil dari kandidat.
  function options(ans, cands, R, filler) {
    var seen = {}, out = [ans], i;
    seen[sig(ans)] = 1;
    for (i = 0; i < cands.length && out.length < 5; i++) {
      var s = sig(cands[i]);
      if (!seen[s]) { seen[s] = 1; out.push(cands[i]); }
    }
    var guard = 0;
    while (out.length < 5 && filler && guard++ < 200) {
      var c = filler(), cs = sig(c);
      if (!seen[cs]) { seen[cs] = 1; out.push(c); }
    }
    return out;
  }
  function arah(v) { return v > 0 ? "searah jarum jam" : "berlawanan arah jarum jam"; }

  // ---------- SERIAL ----------
  function seriRot(R) {
    var g = R.int(0, GLYPH.length - 1), f = R.int(0, 1), fillable = GLYPH[g].fill;
    var step = R.pick([45, 90, 135, -45, -90, -135]), a0 = R.int(0, 7) * 45;
    var alt = fillable && R.chance(0.5), s0 = fillable ? R.int(0, 1) : 0, figs = [], i;
    for (i = 0; i < 4; i++) figs.push(G(g, a0 + i * step, f, alt ? (s0 + i) % 2 : s0));
    var aa = a0 + 4 * step, ans = G(g, aa, f, s0), cands = [];
    if (fillable) cands.push(G(g, aa, f, 1 - s0));
    cands.push(G(g, aa + 45, f, s0), G(g, aa - 45, f, s0), G(g, aa + 180, f, s0), G(g, aa, 1 - f, s0), G(g, aa + 90, f, s0), G(g, aa - 90, f, s0));
    return {
      layout: "seri", figs: figs.concat([Q]),
      text: "Tentukan gambar berikutnya yang melanjutkan pola.",
      opts: options(ans, R.shuffle(cands), R),
      expl: "Gambar berputar " + Math.abs(step) + "° " + arah(step) + " pada setiap langkah" +
        (alt ? ", sedangkan arsirannya berganti-ganti (berisi, kosong, berisi, ...)" : "") + ". Gambar kelima adalah kelanjutan putaran itu."
    };
  }
  function seriRing(R) {
    var d0 = R.int(0, 7), s0 = R.int(0, 7), kd = R.pick([1, 2, 3, -1, -2, -3]);
    var ks = R.pick([1, 2, 3, -1, -2, -3].filter(function (k) { return k !== kd; })), figs = [], i;
    for (i = 0; i < 4; i++) figs.push(RG(d0 + i * kd, s0 + i * ks));
    var dA = d0 + 4 * kd, sA = s0 + 4 * ks, ans = RG(dA, sA);
    var cands = [RG(dA + 1, sA), RG(dA - 1, sA), RG(dA, sA + 1), RG(dA, sA - 1), RG(dA + kd, sA), RG(dA, sA + ks), RG(sA, dA), RG(dA - kd, sA - ks)];
    return {
      layout: "seri", figs: figs.concat([Q]),
      text: "Tentukan gambar berikutnya yang melanjutkan pola.",
      opts: options(ans, R.shuffle(cands), R, function () { return RG(R.int(0, 7), R.int(0, 7)); }),
      expl: "Ada 8 posisi di keliling bingkai. Titik hitam bergeser " + Math.abs(kd) + " posisi " + arah(kd) +
        " dan kotak bergeser " + Math.abs(ks) + " posisi " + arah(ks) + " pada setiap langkah."
    };
  }
  function seriCount(R) {
    var figs = [], i, ans, cands, expl, s0 = R.int(0, 1);
    if (R.chance(0.5)) {
      var sh = R.pick(["c", "s", "t", "d"]), dn = R.pick([1, 1, 2]), n0 = dn === 2 ? 1 : R.int(1, 3), alt = R.chance(0.6);
      for (i = 0; i < 4; i++) figs.push(CN(n0 + i * dn, sh, alt ? (s0 + i) % 2 : s0));
      var nA = n0 + 4 * dn;
      ans = CN(nA, sh, s0);
      cands = [CN(nA, sh, 1 - s0), CN(nA - 1, sh, s0), CN(Math.min(9, nA + 1), sh, s0), CN(nA - 1, sh, 1 - s0), CN(nA - dn, sh, s0),
        CN(nA, R.pick(["c", "s", "t", "d"].filter(function (x) { return x !== sh; })), s0)];
      expl = "Jumlah " + SHAPE_NAME[sh] + " bertambah " + dn + " pada setiap langkah" + (alt ? " dan arsirannya berganti-ganti" : "") +
        ", sehingga gambar kelima memuat " + nA + " " + SHAPE_NAME[sh] + (s0 ? " berisi" : " kosong") + ".";
    } else {
      var shs = R.shuffle(["c", "s", "t", "d"]).slice(0, 3), m0 = R.int(1, 3);
      for (i = 0; i < 4; i++) figs.push(CN(m0 + i, shs[i % 3], s0));
      ans = CN(m0 + 4, shs[1], s0);
      cands = [CN(m0 + 4, shs[0], s0), CN(m0 + 4, shs[2], s0), CN(m0 + 3, shs[1], s0), CN(m0 + 5, shs[1], s0), CN(m0 + 4, shs[1], 1 - s0), CN(m0 + 3, shs[0], s0)];
      expl = "Jumlah bentuk bertambah satu pada setiap langkah, sedangkan bentuknya bergiliran " + SHAPE_NAME[shs[0]] + ", " + SHAPE_NAME[shs[1]] +
        ", " + SHAPE_NAME[shs[2]] + ". Gambar kelima: " + (m0 + 4) + " " + SHAPE_NAME[shs[1]] + ".";
    }
    return { layout: "seri", figs: figs.concat([Q]), text: "Tentukan gambar berikutnya yang melanjutkan pola.", opts: options(ans, R.shuffle(cands), R), expl: expl };
  }
  function seriPoly(R) {
    var pair = R.shuffle([3, 4, 5, 6]).slice(0, 2), d0 = R.int(1, 2), up = R.chance(0.7), figs = [], i;
    var start = up ? d0 : d0 + 4;
    for (i = 0; i < 4; i++) figs.push(PD(pair[i % 2], up ? start + i : start - i));
    var dA = up ? start + 4 : start - 4, ans = PD(pair[0], dA);
    var other = [3, 4, 5, 6].filter(function (x) { return x !== pair[0] && x !== pair[1]; });
    var cands = [PD(pair[1], dA), PD(pair[0], dA + 1), PD(pair[0], Math.max(0, dA - 1)), PD(pair[1], dA + 1), PD(other[0], dA), PD(pair[1], Math.max(0, dA - 1))];
    return {
      layout: "seri", figs: figs.concat([Q]), text: "Tentukan gambar berikutnya yang melanjutkan pola.",
      opts: options(ans, R.shuffle(cands), R),
      expl: "Bangun bergantian antara " + SIDES_NAME[pair[0]] + " dan " + SIDES_NAME[pair[1]] + ", sedangkan jumlah titik " +
        (up ? "bertambah" : "berkurang") + " satu pada setiap langkah. Gambar kelima: " + SIDES_NAME[pair[0]] + " dengan " + dA + " titik."
    };
  }
  function matriks(R) {
    var cell, expl, v = R.int(0, 2), r, c, figs = [], cands = [], ans;
    if (v === 0) {
      var shs = R.shuffle(["c", "s", "t", "d"]).slice(0, 3), o1 = R.int(0, 2), o2 = R.int(0, 2), fl = R.int(0, 1);
      cell = function (rr, cc) { return CN(mod(2 * rr + cc + o2, 3) + 1, shs[mod(rr + cc + o1, 3)], fl); };
      ans = cell(2, 2);
      for (r = 0; r < 3; r++) for (c = 1; c <= 3; c++) cands.push(CN(c, shs[r], fl));
      expl = "Setiap baris dan setiap kolom memuat ketiga bentuk dan ketiga jumlah (1, 2, 3) masing-masing tepat satu kali. Baris ketiga belum memiliki " +
        SHAPE_NAME[ans.sh] + " dan belum memiliki jumlah " + ans.n + ".";
    } else if (v === 1) {
      var sh3 = R.shuffle(["c", "s", "t", "d"]).slice(0, 3), base = R.int(1, 2), fl2 = R.int(0, 1), byRow = R.chance(0.5);
      cell = function (rr, cc) { return CN(base + rr + cc, sh3[byRow ? rr : cc], fl2); };
      ans = cell(2, 2);
      cands = [CN(ans.n - 1, ans.sh, fl2), CN(ans.n + 1, ans.sh, fl2), CN(ans.n, sh3[0], fl2), CN(ans.n, sh3[1], fl2), CN(ans.n, ans.sh, 1 - fl2), CN(ans.n - 1, sh3[0], fl2), CN(ans.n - 2, ans.sh, fl2)];
      expl = "Jumlah bentuk bertambah satu ke kanan dan bertambah satu ke bawah, sedangkan jenis bentuk tetap dalam satu " + (byRow ? "baris" : "kolom") +
        ". Kotak terakhir berisi " + ans.n + " " + SHAPE_NAME[ans.sh] + ".";
    } else {
      var g = R.int(0, GLYPH.length - 1), f = R.int(0, 1), s = R.int(0, 1), a0 = R.int(0, 7) * 45;
      var sc = R.pick([45, 90, -45, -90]), sr = R.pick([45, 90, -45, -90, 180].filter(function (x) { return x !== sc; }));
      cell = function (rr, cc) { return G(g, a0 + cc * sc + rr * sr, f, s); };
      ans = cell(2, 2);
      cands = [G(g, ans.a + 45, f, s), G(g, ans.a - 45, f, s), G(g, ans.a + 90, f, s), G(g, ans.a + 180, f, s), G(g, ans.a, 1 - f, s), G(g, ans.a - 90, f, s)];
      expl = "Ke kanan gambar berputar " + Math.abs(sc) + "° " + arah(sc) + "; ke bawah berputar " + Math.abs(sr) + "° " + (Math.abs(sr) === 180 ? "" : arah(sr)) +
        ". Kotak terakhir mengikuti kedua putaran itu.";
    }
    for (r = 0; r < 3; r++) for (c = 0; c < 3; c++) figs.push(r === 2 && c === 2 ? Q : cell(r, c));
    return { layout: "matriks", figs: figs, text: "Tentukan gambar yang tepat untuk mengisi kotak bertanda tanya.", opts: options(ans, R.shuffle(cands), R), expl: expl };
  }

  // ---------- ANALOGI ----------
  var TF = {
    r90: { f: function (x) { return G(x.g, x.a + 90, x.f, x.s); }, t: "diputar 90° searah jarum jam" },
    l90: { f: function (x) { return G(x.g, x.a - 90, x.f, x.s); }, t: "diputar 90° berlawanan arah jarum jam" },
    r180: { f: function (x) { return G(x.g, x.a + 180, x.f, x.s); }, t: "diputar 180°" },
    mir: { f: function (x) { return G(x.g, -x.a, 1 - x.f, x.s); }, t: "dicerminkan kiri-kanan" },
    flip: { f: function (x) { return G(x.g, 180 - x.a, 1 - x.f, x.s); }, t: "dicerminkan atas-bawah" },
    inv: { f: function (x) { return G(x.g, x.a, x.f, 1 - x.s); }, t: "diubah arsirannya (kosong menjadi berisi atau sebaliknya)", fill: true },
    r90inv: { f: function (x) { return G(x.g, x.a + 90, x.f, 1 - x.s); }, t: "diputar 90° searah jarum jam sekaligus diubah arsirannya", fill: true }
  };
  function anaGlyph(R) {
    var key = R.pick(["r90", "l90", "r180", "mir", "flip", "inv", "r90inv"]), T = TF[key];
    var pool = [];
    for (var i = 0; i < GLYPH.length; i++) if (!T.fill || GLYPH[i].fill) pool.push(i);
    var gs = R.shuffle(pool), A = G(gs[0], R.int(0, 7) * 45, R.int(0, 1), R.int(0, 1)), C = G(gs[1], R.int(0, 7) * 45, R.int(0, 1), R.int(0, 1));
    var ans = T.f(C), cands = [C];
    ["r90", "l90", "r180", "mir", "flip", "inv", "r90inv"].forEach(function (k) {
      if (k !== key && (!TF[k].fill || GLYPH[C.g].fill)) cands.push(TF[k].f(C));
    });
    cands.push(G(C.g, ans.a + 45, ans.f, ans.s), G(C.g, ans.a - 45, ans.f, ans.s));
    return {
      layout: "analogi", figs: [A, T.f(A), C, Q],
      text: "Gambar pertama berhubungan dengan gambar kedua sebagaimana gambar ketiga berhubungan dengan gambar ...",
      opts: options(ans, [cands[0]].concat(R.shuffle(cands.slice(1))), R),
      expl: "Gambar kedua adalah gambar pertama yang " + T.t + ". Perlakuan yang sama diterapkan pada gambar ketiga."
    };
  }
  function anaNest(R) {
    var sh = R.shuffle(["c", "s", "t", "p", "h", "d"]), X = sh[0], Y = sh[1], P = sh[2], Qq = sh[3], v = R.int(0, 2), A, B, C, ans, cands, expl;
    if (v === 0) {
      var fl = R.pick([[0, 0], [0, 1], [1, 0]]);
      A = NX(X, Y, fl[0], fl[1]); B = NX(Y, X, fl[0], fl[1]); C = NX(P, Qq, fl[0], fl[1]); ans = NX(Qq, P, fl[0], fl[1]);
      cands = [C, NX(Qq, Qq, fl[0], fl[1]), NX(P, P, fl[0], fl[1]), NX(Qq, P, fl[1], fl[0]), B, NX(Qq, X, fl[0], fl[1]), NX(Y, P, fl[0], fl[1])];
      expl = "Bentuk luar dan bentuk dalam bertukar tempat, sedangkan arsirannya tetap.";
    } else if (v === 1) {
      var d = R.int(0, 1);
      A = NX(X, Y, d, 1 - d); B = NX(X, Y, 1 - d, d); C = NX(P, Qq, d, 1 - d); ans = NX(P, Qq, 1 - d, d);
      cands = [C, NX(Qq, P, 1 - d, d), NX(Qq, P, d, 1 - d), NX(P, Qq, 0, 0), B, NX(P, P, 1 - d, d), NX(X, Qq, 1 - d, d)];
      expl = "Bentuknya tetap, tetapi arsiran bentuk luar dan bentuk dalam bertukar (yang berisi menjadi kosong dan sebaliknya).";
    } else {
      var e = R.int(0, 1);
      A = NX(X, Y, e, 1 - e); B = NX(Y, X, 1 - e, e); C = NX(P, Qq, e, 1 - e); ans = NX(Qq, P, 1 - e, e);
      cands = [C, NX(Qq, P, e, 1 - e), NX(P, Qq, 1 - e, e), NX(Qq, P, 0, 0), B, NX(Qq, Qq, 1 - e, e), NX(P, P, 1 - e, e)];
      expl = "Bentuk luar dan bentuk dalam bertukar tempat, dan arsirannya juga bertukar.";
    }
    return {
      layout: "analogi", figs: [A, B, C, Q],
      text: "Gambar pertama berhubungan dengan gambar kedua sebagaimana gambar ketiga berhubungan dengan gambar ...",
      opts: options(ans, [cands[0]].concat(R.shuffle(cands.slice(1))), R), expl: expl
    };
  }
  function anaPoly(R) {
    var ds = R.pick([1, -1]), dd = R.pick([1, 2, -1]);
    var s1 = ds > 0 ? R.int(3, 5) : R.int(4, 6), s2;
    do { s2 = ds > 0 ? R.int(3, 5) : R.int(4, 6); } while (s2 === s1);
    // rentang k1 dipilih agar perubahan titik tidak bisa ditafsirkan sebagai kali/bagi (mis. 2 -> 4)
    var r1 = dd === 1 ? [2, 5] : dd === 2 ? [3, 4] : [3, 5], r2 = dd === 1 ? [1, 5] : dd === 2 ? [1, 4] : [2, 6];
    var k1 = R.int(r1[0], r1[1]), k2;
    do { k2 = R.int(r2[0], r2[1]); } while (k2 === k1);
    var A = PD(s1, k1), B = PD(s1 + ds, k1 + dd), C = PD(s2, k2), ans = PD(s2 + ds, k2 + dd);
    var cands = [C, PD(s2 + ds, k2), PD(s2, k2 + dd), PD(s2 + ds, Math.max(0, k2 - dd)), PD(s2 - ds < 3 || s2 - ds > 6 ? s2 : s2 - ds, k2 + dd), PD(s2 + ds, k2 + dd + 1), PD(s2 + ds, Math.max(0, k2 + dd - 1))];
    return {
      layout: "analogi", figs: [A, B, C, Q],
      text: "Gambar pertama berhubungan dengan gambar kedua sebagaimana gambar ketiga berhubungan dengan gambar ...",
      opts: options(ans, [cands[0]].concat(R.shuffle(cands.slice(1))), R),
      expl: "Jumlah sisi bangun " + (ds > 0 ? "bertambah" : "berkurang") + " satu dan jumlah titik " + (dd > 0 ? "bertambah " + dd : "berkurang " + -dd) +
        ". Gambar ketiga (" + SIDES_NAME[s2] + ", " + k2 + " titik) menjadi " + SIDES_NAME[s2 + ds] + " dengan " + (k2 + dd) + " titik."
    };
  }

  // ---------- KETIDAKSAMAAN ----------
  function bedaMirror(R) {
    var g = R.int(0, GLYPH.length - 1), f = R.int(0, 1), s = R.int(0, 1), ang = R.shuffle([0, 45, 90, 135, 180, 225, 270, 315]);
    var odd = G(g, ang[4], 1 - f, s), opts = [odd, G(g, ang[0], f, s), G(g, ang[1], f, s), G(g, ang[2], f, s), G(g, ang[3], f, s)];
    return {
      layout: "beda", figs: [], text: "Manakah gambar yang tidak sekelompok dengan empat gambar lainnya?", opts: opts,
      expl: "Empat gambar adalah gambar yang sama yang hanya diputar. Satu gambar merupakan bayangan cermin, sehingga tidak bisa diperoleh dengan memutar gambar lainnya."
    };
  }
  function bedaRule(R) {
    var v = R.int(0, 3), opts, expl, sh;
    if (v === 0) {
      var sd = R.shuffle([3, 4, 5, 6]), on = R.pick([3, 4, 5, 6]);
      opts = [PD(on, on + R.pick([-1, 1])), PD(sd[0], sd[0]), PD(sd[1], sd[1]), PD(sd[2], sd[2]), PD(sd[3], sd[3])];
      expl = "Pada empat gambar, jumlah titik sama dengan jumlah sisi bangunnya. Pada satu gambar, jumlah titiknya tidak sama dengan jumlah sisi.";
    } else if (v === 1) {
      sh = R.shuffle(["c", "s", "t", "p", "h", "d"]);
      var d = R.int(0, 1);
      opts = [NX(sh[0], sh[5], 1 - d, d), NX(sh[1], sh[0], d, 1 - d), NX(sh[2], sh[1], d, 1 - d), NX(sh[3], sh[2], d, 1 - d), NX(sh[4], sh[3], d, 1 - d)];
      expl = "Pada empat gambar, bentuk luar " + (d ? "berisi" : "kosong") + " dan bentuk dalam " + (d ? "kosong" : "berisi") + ". Pada satu gambar arsirannya terbalik.";
    } else if (v === 2) {
      sh = R.shuffle(["c", "s", "t", "p", "h", "d"]);
      var fi = R.int(0, 1);
      opts = [NX(sh[4], sh[5], 0, fi), NX(sh[0], sh[0], 0, fi), NX(sh[1], sh[1], 0, fi), NX(sh[2], sh[2], 0, fi), NX(sh[3], sh[3], 0, fi)];
      expl = "Pada empat gambar, bentuk dalam sama dengan bentuk luarnya. Pada satu gambar, bentuk dalam berbeda dari bentuk luarnya.";
    } else {
      var s1 = R.pick(["c", "s", "t", "d"]), fl = R.int(0, 1), even = R.chance(0.5);
      var reg = even ? [2, 4, 6, 8] : [1, 3, 5, 7, 9], od = even ? R.pick([3, 5, 7]) : R.pick([2, 4, 6, 8]);
      reg = R.shuffle(reg).slice(0, 4);
      opts = [CN(od, s1, fl), CN(reg[0], s1, fl), CN(reg[1], s1, fl), CN(reg[2], s1, fl), CN(reg[3], s1, fl)];
      expl = "Empat gambar memuat bentuk berjumlah " + (even ? "genap" : "ganjil") + ". Satu gambar memuat " + od + " bentuk, yaitu bilangan " + (even ? "ganjil" : "genap") + ".";
    }
    return { layout: "beda", figs: [], text: "Manakah gambar yang tidak sekelompok dengan empat gambar lainnya?", opts: opts, expl: expl };
  }

  // ---------- JARING-JARING KUBUS ----------
  // 11 jaring-jaring kubus (hasil enumerasi semua heksomino, lihat scripts/validate.mjs). "#" = sisi.
  var NETS = [["...#", "####", "...#"], ["..#.", "####", "...#"], [".#..", "####", "...#"], ["#...", "####", "...#"],
    [".#..", "####", ".#.."], ["..#.", "####", ".#.."], [".#.", ".#.", "###", "..#"], ["###..", "..###"],
    [".#..", "###.", "..##"], ["#...", "###.", "..##"], ["##..", ".##.", "..##"]];
  // Menggelindingkan kubus di atas jaring: posisi bawah (D) menyentuh sel yang sedang ditempati.
  var ROLL = {
    E: function (o) { return { D: o.E, E: o.U, U: o.W, W: o.D, N: o.N, S: o.S }; },
    W: function (o) { return { D: o.W, W: o.U, U: o.E, E: o.D, N: o.N, S: o.S }; },
    N: function (o) { return { D: o.N, N: o.U, U: o.S, S: o.D, E: o.E, W: o.W }; },
    S: function (o) { return { D: o.S, S: o.U, U: o.N, N: o.D, E: o.E, W: o.W }; }
  };
  var STEP = { N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] };
  /** cells: [[baris, kolom], ...]. Hasil: nomor sisi fisik (0..5) untuk tiap sel; 0-1, 2-3, 4-5 saling berhadapan. */
  function lipat(cells) {
    var idx = {}, face = cells.map(function () { return null; }), stack = [[0, { D: 0, U: 1, N: 2, S: 3, E: 4, W: 5 }]];
    cells.forEach(function (x, i) { idx[x[0] + "," + x[1]] = i; });
    face[0] = 0;
    while (stack.length) {
      var top = stack.pop(), cell = cells[top[0]];
      for (var d in STEP) {
        var j = idx[(cell[0] + STEP[d][0]) + "," + (cell[1] + STEP[d][1])];
        if (j === undefined || face[j] !== null) continue;
        var o2 = ROLL[d](top[1]);
        face[j] = o2.D;
        stack.push([j, o2]);
      }
    }
    return face;
  }
  function netCells(rows) {
    var out = [];
    rows.forEach(function (row, r) { for (var c = 0; c < row.length; c++) if (row.charAt(c) !== ".") out.push([r, c]); });
    return out;
  }
  function putar(rows) { // 90 derajat searah jarum jam
    var h = rows.length, w = rows[0].length, out = [];
    for (var c = 0; c < w; c++) { var line = ""; for (var r = h - 1; r >= 0; r--) line += rows[r].charAt(c); out.push(line); }
    return out;
  }
  function cermin(rows) { return rows.map(function (row) { return row.split("").reverse().join(""); }); }
  function kubus(R) {
    var rows = R.pick(NETS).slice(), i;
    for (i = R.int(0, 3); i > 0; i--) rows = putar(rows);
    if (R.int(0, 1)) rows = cermin(rows);
    var cells = netCells(rows), face = lipat(cells), huruf = R.shuffle(["1", "2", "3", "4", "5", "6"]);
    var label = cells.map(function (x, k) { return huruf[k]; });
    rows = rows.map(function (row, r) {
      return row.split("").map(function (ch, c) {
        if (ch === ".") return ".";
        for (var k = 0; k < cells.length; k++) if (cells[k][0] === r && cells[k][1] === c) return label[k];
        return ".";
      }).join("");
    });
    var lawan = function (k) { var f = face[k] ^ 1; return face.indexOf(f); };
    var pasangan = [], dipakai = {};
    for (i = 0; i < 6; i++) {
      if (dipakai[i]) continue;
      var j = lawan(i);
      dipakai[i] = dipakai[j] = 1;
      pasangan.push(label[i] + "–" + label[j]);
    }
    var net = { k: "j", rows: rows }, t = R.int(0, 5), opp = lawan(t), ragam = R.int(0, 3), text, opts;
    var tetangga = label.filter(function (x, k) { return k !== t && k !== opp; });
    if (ragam === 3) {
      // Pasangan sisi yang berhadapan.
      var salah = [];
      for (i = 0; i < 6; i++) for (var j2 = i + 1; j2 < 6; j2++) if (lawan(i) !== j2) salah.push(label[i] + " dan " + label[j2]);
      text = "Jika jaring-jaring berikut dirakit menjadi kubus, pasangan sisi yang saling berhadapan adalah ...";
      opts = ["sisi " + label[t] + " dan " + label[opp]].concat(R.shuffle(salah).slice(0, 4).map(function (x) { return "sisi " + x; }));
    } else {
      text = [
        "Jika jaring-jaring berikut dirakit menjadi kubus, sisi yang berhadapan dengan sisi " + label[t] + " adalah sisi ...",
        "Jika jaring-jaring berikut dirakit menjadi kubus dan sisi " + label[t] + " menjadi alas, sisi yang menjadi tutup (atas) adalah sisi ...",
        "Jika jaring-jaring berikut dirakit menjadi kubus, sisi yang tidak mungkin bersebelahan dengan sisi " + label[t] + " adalah sisi ..."
      ][ragam];
      opts = [label[opp]].concat(tetangga);
    }
    return {
      layout: "jaring", figs: [net], text: text, opts: opts,
      expl: "Bayangkan sisi-sisi dilipat ke atas. Dua sisi yang terpisah tepat satu sisi pada satu garis lurus akan saling berhadapan, dan sisi yang saling berhadapan tidak pernah bersebelahan. Pada jaring-jaring ini pasangan yang berhadapan adalah " +
        pasangan.join(", ") + ". Jadi jawabannya " + (ragam === 3 ? opts[0] : "sisi " + opts[0]) + "."
    };
  }

  var GEN = {
    "fig-seri": [seriRot, seriRing, seriCount, seriPoly, matriks, matriks],
    "fig-ana": [anaGlyph, anaGlyph, anaNest, anaPoly],
    "fig-beda": [bedaMirror, bedaRule, bedaRule],
    "fig-kubus": [kubus]
  };

  SKD.fig = {
    svg: svg,
    sig: sig,
    describe: describe,
    /** Bangkitkan satu soal figural. Jawaban benar selalu opts[0]. */
    generate: function (materi, R) {
      var list = GEN[materi];
      for (var tries = 0; tries < 20; tries++) {
        var out = R.pick(list)(R), seen = {}, ok = out.opts.length === 5;
        for (var i = 0; ok && i < out.opts.length; i++) {
          var s = typeof out.opts[i] === "string" ? "t:" + out.opts[i] : sig(out.opts[i]);
          if (seen[s]) ok = false;
          seen[s] = 1;
        }
        if (ok) return out;
      }
      return bedaMirror(R);
    },
    _gen: GEN,
    _nets: NETS,
    _lipat: lipat,
    _netCells: netCells
  };
})();
