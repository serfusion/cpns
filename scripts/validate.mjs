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
