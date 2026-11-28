// Tangkap halaman tertentu dari pratinjau Google Drive jadi gambar (untuk memeriksa tabel dengan mata).
// Pakai: node scripts/drive/potret.cjs <id-berkas> <folder-keluar> <halaman,dipisah,koma> [skala, bawaan 2]
const { chromium } = require("playwright");
const fs = require("fs");
const [id, out, daftar, sk] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1500, height: 1250 }, deviceScaleFactor: Number(sk || 2), locale: "id-ID" })).newPage();
  await p.goto(`https://drive.google.com/file/d/${id}/view`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await p.waitForTimeout(7000);
  for (const i of daftar.split(",").map(Number)) {
    const inp = p.locator('input[type="text"]').first();
    await inp.fill(String(i)); await inp.press("Enter");
    await p.waitForTimeout(3000);
    const box = await p.evaluate(() => {
      let best = null, bv = 0;
      for (const e of document.querySelectorAll("img, canvas")) { const r = e.getBoundingClientRect(); if (r.width < 400 || r.height < 300) continue; const v = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)); if (v > bv) { bv = v; best = { x: r.x, y: r.y, w: r.width, h: r.height }; } }
      return best;
    });
    if (!box) { console.log("tidak ada", i); continue; }
    await p.screenshot({ path: `${out}/p${String(i).padStart(3, "0")}.png`, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: Math.min(box.h, 1250 - Math.max(0, box.y)) } });
    console.log(i, Math.round(box.w), Math.round(box.h));
  }
  await b.close();
})();
