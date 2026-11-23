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
for (const f of ["js/config.js", "data/twk.js", "data/tiu.js", "data/tkp.js", "data/fakta.js", "js/figural.js", "js/acak.js", "js/engine.js"]) {
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

// ---------- uji tabel fakta dan pembangkit soal acak (js/acak.js) ----------
{
  const F = SKD.fakta, A = SKD.acak;
  const butirN = F.butir.map((b) => b.length);
  if (butirN.join(",") !== "7,10,7,10,11") errors.push(`butir Pancasila harus 7,10,7,10,11 (45), ada ${butirN.join(",")}`);
  F.silaKasus.forEach((c, i) => {
    if (!(c.s >= 1 && c.s <= 5) || !F.butir[c.s - 1] || !F.butir[c.s - 1][c.b]) errors.push(`silaKasus #${i + 1}: nomor sila/butir salah`);
  });
  for (const w of F.wewenang) {
    if (!F.lembaga[w.l]) errors.push(`wewenang: lembaga ${w.l} tidak dikenal`);
    (w.x || []).forEach((x) => { if (!F.lembaga[x]) errors.push(`wewenang ${w.w}: pengecualian ${x} tidak dikenal`); });
    if (!/\.\.\.$/.test(w.k)) errors.push(`wewenang ${w.w}: soal kasus harus diakhiri "..."`);
  }
  const ps = new Set();
  for (const e of F.pasal) {
    if (ps.has(e.p)) errors.push(`pasal ganda: ${e.p}`);
    ps.add(e.p);
    if (!e.g || !e.t || !e.isi) errors.push(`pasal ${e.p}: data tidak lengkap`);
  }
  for (const e of F.pasal) (e.x || []).forEach((x) => { if (!ps.has(x)) errors.push(`pasal ${e.p}: pengecualian ${x} tidak ada`); });
  const kata = new Map();
  for (const [b, t] of F.baku) {
    for (const w of [b, t]) { const k = w.toLowerCase(); if (kata.has(k)) errors.push(`kata baku ganda: ${w}`); kata.set(k, 1); }
  }
  const R = SKD.engine.rng(20261123), N = 1500;
  let nSil = 0;
  const cekSil = (g, tag) => {
    const c = g._cek;
    if (!c) return;
    nSil++;
    const md = c.jenis === "kat" ? A._kat.model(c.premis, c.istilah) : A._prop.model(c.premis);
    if (!md.konsisten) errors.push(`${tag}: premis tidak konsisten`);
    if (c.benar && !md.entail(c.benar)) errors.push(`${tag}: kunci tidak terbukti — ${g.text}`);
    for (const s of c.opsi) if (md.entail(s)) errors.push(`${tag}: pengecoh ikut benar — ${g.text} | ${JSON.stringify(s)}`);
  };
  for (const [name, fn] of Object.entries(A._fn)) {
    for (let i = 0; i < N; i++) {
      const g = fn(R);
      if (!g) continue;
      const tag = `acak/${name}`;
      if (!Array.isArray(g.opts) || g.opts.length !== 5) { errors.push(`${tag}: opsi harus 5 — ${g.text}`); break; }
      if (new Set(g.opts.map((o) => String(o).toLowerCase())).size !== 5) { errors.push(`${tag}: opsi kembar — ${g.text} | ${g.opts.join(" / ")}`); break; }
      if (g.opts.some((o) => !o || !String(o).trim())) { errors.push(`${tag}: opsi kosong`); break; }
      if (g.fix && !(g.a >= 0 && g.a < 5)) { errors.push(`${tag}: kunci di luar rentang`); break; }
      if (!g.text || !g.expl || /undefined|\{[a-zA-Z_]+\}/.test(g.text + g.expl + g.opts.join(" "))) { errors.push(`${tag}: teks tidak lengkap — ${g.text} | ${g.expl}`); break; }
      cekSil(g, tag);
    }
  }
  // lewat mesin: setiap materi bangkitan menghasilkan soal; filter "sangat sering" hanya memberi jenis sangat sering
  for (const m of Object.keys(A._jenis)) {
    for (const opt of [{}, { sangat: true }]) {
      if (opt.sangat && !A.bisa(m, opt)) continue;
      for (let i = 0; i < 300; i++) {
        const pq = SKD.engine.generate(m, R, opt);
        if (!pq || pq.m !== m || !pq.acak) { errors.push(`generate(${m}) gagal`); break; }
        if (opt.sangat && !pq.sangat) { errors.push(`generate(${m}, sangat) memberi soal bukan sangat sering`); break; }
        if (pq.opts.filter((o) => o.pts === 5).length !== 1 || pq.opts[pq.best].pts !== 5) { errors.push(`generate(${m}): kunci tidak tunggal`); break; }
      }
    }
  }
  console.log(`Soal acak: ${Object.keys(A._fn).length} pembangkit x ${N} soal terperiksa; ${nSil} silogisme dibuktikan (kunci terbukti, pengecoh tidak ada yang ikut benar).`);
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
    const sangat = SKD.bankRaw.filter((q) => q.m === m.id && q.h >= 2).length;
    const need = m.gen >= 1 ? 0 : m.quota;
    console.log(`  ${m.id.padEnd(9)} ${String(n).padStart(3)}  (sering ${String(hot).padStart(2)}, sangat sering ${String(sangat).padStart(2)})${m.gen >= 1 ? "  otomatis" : m.gen ? "  + soal acak" : ""}${!m.gen && n < need ? "  << kurang dari kuota satu paket" : ""}`);
  }
}
console.log(`Total: ${total} soal`);
if (errors.length) {
  console.error(`\n${errors.length} masalah:`);
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log("Bank soal valid.");
