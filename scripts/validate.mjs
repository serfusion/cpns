// Validasi bank soal: struktur, opsi ganda, soal ganda, materi, bacaan.
// Jalankan: node scripts/validate.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of ["js/config.js", "data/twk.js", "data/tiu.js", "data/tkp.js", "js/figural.js", "js/engine.js"]) {
  vm.runInContext(readFileSync(join(root, f), "utf8"), ctx, { filename: f });
}
const SKD = ctx.window.SKD;
const materi = Object.fromEntries(SKD.config.materi.map((m) => [m.id, m]));
const errors = [];
const count = {};
const seenId = new Map();
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();

SKD.bankRaw.forEach((q, i) => {
  const where = `${q.sec}/${q.m} #${i + 1}: ${String(q.q).slice(0, 60)}`;
  const m = materi[q.m];
  if (!m) errors.push(`materi tidak dikenal — ${where}`);
  else if (m.sec !== q.sec) errors.push(`materi ${q.m} bukan bagian ${q.sec} — ${where}`);
  if (typeof q.q !== "string" || q.q.trim().length < 8) errors.push(`teks soal kosong/pendek — ${where}`);
  if (!Array.isArray(q.o) || q.o.length !== 5) errors.push(`opsi harus 5 — ${where}`);
  else {
    if (q.o.some((o) => typeof o !== "string" || !o.trim())) errors.push(`opsi kosong — ${where}`);
    if (new Set(q.o.map(norm)).size !== 5) errors.push(`opsi kembar — ${where}`);
  }
  if (q.a != null && !(Number.isInteger(q.a) && q.a >= 0 && q.a < 5)) errors.push(`kunci di luar rentang — ${where}`);
  if (q.fix && q.a == null) errors.push(`fix tanpa kunci a — ${where}`);
  if (typeof q.x !== "string" || q.x.trim().length < 10) errors.push(`pembahasan kosong/pendek — ${where}`);
  if (q.p && !SKD.passages[q.p]) errors.push(`bacaan "${q.p}" tidak ada — ${where}`);
  if (q.tb && (!Array.isArray(q.tb.h) || !Array.isArray(q.tb.r) || q.tb.r.some((r) => r.length !== q.tb.h.length))) errors.push(`tabel tidak rapi — ${where}`);
  const id = SKD.engine.hash(q.sec + "|" + (q.p || "") + "|" + q.q);
  if (seenId.has(id)) errors.push(`soal ganda — ${where}`);
  seenId.set(id, where);
  count[q.m] = (count[q.m] || 0) + 1;
});

const usedPassages = new Set(SKD.bankRaw.map((q) => q.p).filter(Boolean));
for (const k of Object.keys(SKD.passages)) if (!usedPassages.has(k)) errors.push(`bacaan "${k}" tidak dipakai`);

// ---------- uji pembangkit jaring-jaring kubus ----------
{
  const F = SKD.fig;
  const cellsOf = (rows) => F._netCells(rows);
  const rot = (rows) => rows[0].split("").map((_, c) => rows.map((r) => r[c]).reverse().join(""));
  const mir = (rows) => rows.map((r) => r.split("").reverse().join(""));
  if (F._nets.length !== 11) errors.push(`jaring-jaring kubus harus 11, ada ${F._nets.length}`);
  for (const base of F._nets) {
    let rows = base;
    for (let i = 0; i < 4; i++) {
      for (const v of [rows, mir(rows)]) {
        const face = F._lipat(cellsOf(v));
        if (new Set(face).size !== 6) errors.push(`jaring ${v.join("/")} tidak terlipat menjadi 6 sisi berbeda`);
      }
      rows = rot(rows);
    }
  }
  // Fakta yang sudah dikenal: pada deret lurus 4 sisi, sisi ke-1 dan ke-3 serta ke-2 dan ke-4 berhadapan.
  const known = ["#...", "####", "#..."], kc = cellsOf(known), kf = F._lipat(kc);
  const at = (r, c) => kf[kc.findIndex(([a, b]) => a === r && b === c)];
  if ((at(1, 0) ^ 1) !== at(1, 2) || (at(1, 1) ^ 1) !== at(1, 3) || (at(0, 0) ^ 1) !== at(2, 0)) errors.push("lipatan jaring-jaring tidak sesuai fakta sisi berhadapan");
  const R = SKD.engine.rng(20261120);
  for (let i = 0; i < 400; i++) {
    const g = F.generate("fig-kubus", R);
    if (g.opts.length !== 5 || new Set(g.opts).size !== 5) errors.push("soal kubus: opsi tidak 5 atau kembar");
    const rows = g.figs[0].rows, cells = cellsOf(rows), face = F._lipat(cells);
    const lab = cells.map(([r, c]) => rows[r][c]);
    const opp = (x) => lab[face.indexOf(face[lab.indexOf(x)] ^ 1)];
    const m = g.text.match(/sisi ([1-6])/), ans = g.opts[0];
    if (/pasangan/.test(g.text)) { const [, a, , b] = ans.split(" "); if (opp(a) !== b) errors.push("soal kubus: pasangan salah"); }
    else if (!m || opp(m[1]) !== ans) errors.push("soal kubus: kunci salah " + g.text);
  }
  console.log("Jaring-jaring kubus: 11 bentuk x 8 posisi terlipat benar, 400 soal acak terperiksa.");
}

let total = 0;
for (const sec of SKD.config.sections) {
  const rows = SKD.config.materi.filter((m) => m.sec === sec.id);
  const sum = rows.reduce((a, m) => a + (count[m.id] || 0), 0);
  total += sum;
  console.log(`${sec.short}: ${sum} soal`);
  for (const m of rows) {
    const n = count[m.id] || 0;
    const hot = SKD.bankRaw.filter((q) => q.m === m.id && q.h).length;
    const need = m.gen >= 1 ? 0 : m.quota;
    console.log(`  ${m.id.padEnd(9)} ${String(n).padStart(3)}  (prioritas ${hot})${m.gen >= 1 ? "  otomatis" : n < need ? "  << kurang dari kuota satu paket" : ""}`);
  }
}
console.log(`Total: ${total} soal`);
if (errors.length) {
  console.error(`\n${errors.length} masalah:`);
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log("Bank soal valid.");
