/* Lembar hasil tryout sebagai gambar 1080 x 1350 (kanvas), siap disimpan atau dibagikan. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var C = { navy: "#132f5a", ink: "#121d2d", muted: "#5c6677", line: "#d7deea", paper: "#f6f8fc", amber: "#f2bb3b", ok: "#1f7a46", bad: "#c0352b", track: "#dfe5ee" };
  var FONT = "'Plus Jakarta Sans', 'Segoe UI', Roboto, Arial, sans-serif";

  function font(ctx, w, px) { ctx.font = w + " " + px + "px " + FONT; }
  function spaced(ctx, text, x, y, gap) {
    for (var i = 0; i < text.length; i++) { ctx.fillText(text[i], x, y); x += ctx.measureText(text[i]).width + gap; }
    return x;
  }
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function mark(ctx, x, y, s) {
    ctx.fillStyle = C.navy; rrect(ctx, x, y, s, s, s * 0.22); ctx.fill();
    ctx.fillStyle = C.amber; font(ctx, 800, s * 0.36); ctx.textAlign = "center"; ctx.fillText("SKD", x + s / 2, y + s * 0.63); ctx.textAlign = "left";
  }

  /** d: { title, date, total, pass, answered, n, minutes, app, rows:[{code,name,score,max,batas}], kuat, lemah } */
  function draw(cv, d) {
    var ctx = cv.getContext("2d"), W = 1080, H = 1350, L = 88, R = 992;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = C.paper; ctx.fillRect(36, 36, W - 72, H - 72);

    // kepala
    mark(ctx, L, 78, 58);
    ctx.fillStyle = C.navy; font(ctx, 800, 36); ctx.fillText("Latihan SKD", L + 74, 120);
    ctx.fillStyle = C.ink; font(ctx, 500, 30); ctx.textAlign = "right"; ctx.fillText(d.date, R, 120); ctx.textAlign = "left";
    ctx.fillStyle = C.navy; ctx.fillRect(L, 156, R - L, 5); ctx.fillRect(L, 168, R - L, 2);

    ctx.fillStyle = C.muted; font(ctx, 600, 25); spaced(ctx, "LEMBAR HASIL TRYOUT SKD CPNS", L, 238, 4);
    ctx.fillStyle = C.ink; font(ctx, 800, 50); ctx.fillText(d.title, L, 300);

    ctx.fillStyle = C.ink; font(ctx, 700, 25); spaced(ctx, "TOTAL SKOR", L, 392, 5);
    ctx.fillStyle = C.amber; ctx.fillRect(L, 410, 70, 7);

    // skor besar
    ctx.fillStyle = C.navy; font(ctx, 800, 300);
    var sw = ctx.measureText(String(d.total)).width;
    ctx.fillText(String(d.total), L - 8, 668);
    ctx.fillStyle = C.muted; font(ctx, 700, 66); ctx.fillText("/550", L + sw + 8, 668);

    // stempel
    var col = d.pass ? C.ok : C.bad;
    ctx.save(); ctx.translate(828, 372); ctx.rotate(-0.12);
    ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.strokeRect(-172, -86, 344, 172);
    ctx.lineWidth = 2.5; ctx.strokeRect(-156, -70, 312, 140);
    ctx.fillStyle = col; ctx.textAlign = "center";
    var word = d.pass ? "LOLOS" : "BELUM LOLOS", fs = 88;
    font(ctx, 800, fs);
    while (ctx.measureText(word).width > 280 && fs > 30) { fs -= 2; font(ctx, 800, fs); }
    ctx.fillText(word, 0, 18);
    font(ctx, 700, 25); var t = "PASSING GRADE", tw = ctx.measureText(t).width + 4 * (t.length - 1);
    ctx.textAlign = "left"; spaced(ctx, t, -tw / 2, 54, 4);
    ctx.restore();

    ctx.fillStyle = C.ink; font(ctx, 500, 32); ctx.fillText(d.answered + " dari " + d.n + " soal dijawab  ·  " + d.minutes + " menit", L, 730);

    // tabel subtes
    ctx.fillStyle = C.muted; font(ctx, 700, 23);
    spaced(ctx, "SUBTES", L, 820, 4);
    ctx.textAlign = "right"; ctx.fillText("SKOR", 640, 820); ctx.fillText("BATAS", 820, 820); ctx.fillText("SELISIH", R, 820); ctx.textAlign = "left";
    ctx.fillStyle = C.ink; ctx.fillRect(L, 836, R - L, 3);
    d.rows.forEach(function (r, i) {
      var y = 906 + i * 100, diff = r.score - r.batas;
      ctx.fillStyle = C.ink; font(ctx, 800, 50); ctx.fillText(r.code, L, y);
      font(ctx, 500, 24); ctx.fillText(r.name, L + 128, y - 6);
      ctx.textAlign = "right"; font(ctx, 800, 50); ctx.fillText(String(r.score), 560, y);
      ctx.textAlign = "left"; ctx.fillStyle = C.muted; font(ctx, 600, 25); ctx.fillText("/" + r.max, 566, y);
      ctx.fillStyle = C.ink; font(ctx, 500, 36); ctx.textAlign = "right"; ctx.fillText(String(r.batas), 820, y);
      ctx.fillStyle = diff >= 0 ? C.ok : C.bad; font(ctx, 800, 48); ctx.fillText((diff >= 0 ? "+" : "−") + Math.abs(diff), R, y); ctx.textAlign = "left";
      var by = y + 22;
      ctx.fillStyle = C.track; ctx.fillRect(L, by, R - L, 8);
      ctx.fillStyle = C.navy; ctx.fillRect(L, by, (R - L) * Math.min(1, r.score / r.max), 8);
      ctx.fillStyle = C.amber; ctx.fillRect(L + (R - L) * (r.batas / r.max) - 3, by - 8, 6, 24);
      ctx.fillStyle = C.line; ctx.fillRect(L, y + 48, R - L, 1.5);
    });

    // kaki
    ctx.fillStyle = C.ink; font(ctx, 500, 30);
    ctx.fillText("Terkuat: " + d.kuat, L, 1198);
    ctx.textAlign = "right"; ctx.fillText("Perlu dilatih: " + d.lemah, R, 1198); ctx.textAlign = "left";
    ctx.fillStyle = C.navy; ctx.fillRect(L, 1222, R - L, 3);
    mark(ctx, L, 1244, 44);
    ctx.fillStyle = C.navy; font(ctx, 800, 34); ctx.fillText("Latihan SKD", L + 58, 1278);
    ctx.fillStyle = C.ink; font(ctx, 500, 26); ctx.textAlign = "right"; ctx.fillText("Tryout SKD CPNS · latihan mandiri", R, 1278); ctx.textAlign = "left";
  }

  SKD.lembar = { draw: draw };
})();
