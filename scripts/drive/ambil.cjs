// Baca berkas PDF yang dibagikan lewat tautan Google Drive lewat halaman pratinjaunya (seperti pembaca yang menggulir halaman):
// lapisan teks tiap halaman disimpan ke <folder>/teks.json, halaman tanpa teks (hasil scan) disimpan jadi gambar hNNN.png
// untuk dibaca dengan OCR (ocr.sh) atau dilihat langsung. Dipakai bila konektor Google Drive tidak bisa membaca isi berkas.
// Pakai: node scripts/drive/ambil.cjs <id-berkas-drive> <folder-keluar>
const { chromium } = require("playwright");
const fs = require("fs");
const [id, out] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1500, height: 1100 }, deviceScaleFactor: 2, locale: "id-ID" })).newPage();
  await p.goto(`https://drive.google.com/file/d/${id}/view`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await p.waitForTimeout(8000);
  const n = await p.evaluate(() => { const m = document.body.innerText.match(/Halaman\s*\n?\s*\/\s*\n?\s*(\d+)/) || document.body.innerText.match(/\/\s*\n?\s*(\d+)/); return m ? Number(m[1]) : 0; });
  console.log("halaman", n);
  const hal = {};
  const ambil = async () => {
    const t = await p.evaluate(() => document.body.innerText);
    const re = /Halaman (\d+) dari (\d+)/g; let m, idx = [];
    while ((m = re.exec(t))) idx.push([Number(m[1]), m.index + m[0].length, m.index]);
    for (let k = 0; k < idx.length; k++) {
      const seg = t.slice(idx[k][1], k + 1 < idx.length ? idx[k + 1][2] : t.length).trim();
      if (!hal[idx[k][0]] || seg.length > hal[idx[k][0]].length) hal[idx[k][0]] = seg;
    }
  };
  for (let i = 1; i <= n; i++) {
    const inp = p.locator('input[type="text"]').first();
    try { await inp.fill(String(i)); await inp.press("Enter"); } catch (e) {}
    await p.waitForTimeout(i === 1 ? 3000 : 1800);
    await ambil();
    if (!hal[i] || hal[i].length < 40) {
      await p.waitForTimeout(2500); await ambil();
    }
    if (!hal[i] || hal[i].length < 40) {
      const box = await p.evaluate(() => {
        let best = null, bv = 0;
        for (const e of document.querySelectorAll("img, canvas")) { const r = e.getBoundingClientRect(); if (r.width < 400 || r.height < 300) continue; const v = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)); if (v > bv) { bv = v; best = { x: r.x, y: r.y, w: r.width, h: r.height }; } }
        return best;
      });
      if (box) await p.screenshot({ path: `${out}/h${String(i).padStart(3, "0")}.png`, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: Math.min(box.h, 1100 - Math.max(0, box.y)) } });
    }
    if (i % 20 === 0) { fs.writeFileSync(out + "/teks.json", JSON.stringify(hal)); console.log("hal", i); }
  }
  fs.writeFileSync(out + "/teks.json", JSON.stringify(hal));
  const kosong = []; for (let i = 1; i <= n; i++) if (!hal[i] || hal[i].length < 40) kosong.push(i);
  console.log("selesai", n, "tanpa teks:", kosong.length ? kosong.join(",") : "-");
  await b.close();
})();
