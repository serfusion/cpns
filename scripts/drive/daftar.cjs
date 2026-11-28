// Daftar isi folder Google Drive yang dibagikan lewat tautan, tanpa login (seperti pengunjung yang membuka tautan folder),
// termasuk subfolder. Keluaran JSON: [{ id, nama, keterangan, folder, induk }]. "keterangan" = teks tanggal dan ukuran yang
// tampil di daftar (mis. "27 Nov 1,1 MB"); bila berubah dibanding scripts/dok2026/drive.json, berkas perlu dibaca ulang.
// Pakai: node scripts/drive/daftar.cjs <id-folder> [berkas-keluar.json]
const { chromium } = require("playwright");
const fs = require("fs");
const [akar, keluar] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1400, height: 1000 }, locale: "id-ID" })).newPage();
  const hasil = [], dikunjungi = new Set(), antre = [akar];
  while (antre.length) {
    const fid = antre.shift();
    if (dikunjungi.has(fid)) continue;
    dikunjungi.add(fid);
    await p.goto("https://drive.google.com/drive/folders/" + fid, { waitUntil: "domcontentloaded", timeout: 60000 });
    await p.waitForTimeout(6000);
    for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 3000); await p.waitForTimeout(500); }   // muat semua baris
    const baris = await p.evaluate((fid) => {
      const m = new Map();
      for (const e of document.querySelectorAll("[data-id]")) {
        const id = e.getAttribute("data-id"), t = (e.innerText || "").replace(/\s+/g, " ").trim();
        if (!id || id.length < 20 || id === fid) continue;
        if (!m.has(id) || t.length > m.get(id).length) m.set(id, t);
      }
      return [...m.entries()];
    }, fid);
    for (const [id, t] of baris) {
      const mt = t.match(/^(.*?)\s+(?:Dibagikan\s+)?Pemilik disembunyikan\s+(.*)$/);
      const nama = mt ? mt[1] : t, ket = mt ? mt[2] : "";
      const folder = /—$/.test(ket) || ket === "";
      if (hasil.some((x) => x.id === id)) continue;
      hasil.push({ id, nama, keterangan: ket, folder, induk: fid });
      if (folder) antre.push(id);
    }
  }
  await b.close();
  const teks = JSON.stringify(hasil, null, 1);
  if (keluar) fs.writeFileSync(keluar, teks); else console.log(teks);
})().catch((e) => { console.error(String(e && e.message || e)); process.exit(1); });
