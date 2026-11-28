// Audit tingkat kesulitan bank soal: jenjang kognitif (taksonomi Bloom, seperti "skema soal" di peraturan BKN),
// panjang soal, dan susunan paket tryout. Dipakai untuk menjawab "apakah soal di aplikasi setara SKD asli?".
// Pakai: node scripts/audit-kesulitan.mjs [--json]
// Klasifikasi memakai ciri yang bisa diperiksa (bukan penilaian subjektif):
//   C1 mengingat  : soal pendek (<= 28 kata) yang meminta fakta/nama/definisi tanpa kasus atau data
//   C2 memahami   : definisi/makna/inti kalimat dengan konteks singkat
//   C3 menerapkan : hitungan, deret, pola gambar, penerapan aturan pada kasus singkat
//   C4+ menganalisis/mengevaluasi: kasus panjang (> 45 kata) atau bacaan, silogisme/analitis/induktif, perbandingan,
//                   evaluasi informasi, TKP berbasis situasi (semua TKP adalah penilaian situasi)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sandbox = { window: {}, console, Math, Date, JSON, localStorage: { getItem() { return null; }, setItem() {} } };
sandbox.window.localStorage = sandbox.localStorage;
vm.createContext(sandbox);
for (const f of ["js/config.js", "data/twk.js", "data/tiu.js", "data/tkp.js", "data/setara.js", "data/fakta.js", "js/figural.js", "js/acak.js", "js/engine.js"]) {
  vm.runInContext(readFileSync(join(root, f), "utf8"), sandbox, { filename: f });
}
const SKD = sandbox.window.SKD;
const E = SKD.engine;

function kata(s) { return String(s || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length; }
const RE_INGAT = /\b(siapa|kapan|tahun berapa|pada tahun|disebut|dinamakan|nama|adalah|yaitu|merupakan|terdapat dalam|tercantum|diatur dalam|bunyi|lambang|semboyan|ditetapkan|dibentuk|didirikan|diketuai|pencipta|berasal dari)\b/i;
const RE_KASUS = /(sikap|tindakan|langkah|upaya|seharusnya|sebaiknya|paling tepat|paling sesuai|cerminan|contoh|penerapan|bertentangan|mencerminkan|menunjukkan|relevan|dampak|analisis|simpulan|kesimpulan|pernyataan berikut|berdasarkan|jika|apabila|ketika)/i;
const MATERI_C4 = /(silogisme|analitis|induktif|kuantitatif|perbandingan|matriks|evaluasi|bacaan|simpulan|inti paragraf|gagasan)/i;

function jenjang(q) {
  const sec = q.sec, m = (E.materi(q.m) || { name: "" }).name || "";
  const text = q.text != null ? q.text : q.q, passage = q.passage != null ? q.passage : q.p;
  const n = kata(text) + kata(passage) + kata(q.stem);
  const t = String(text || "");
  if (sec === "tkp") return "C4";                       // semua TKP: penilaian situasi kerja
  if (q.opts && q.opts[0] && q.opts[0].fig) return "C3"; // pola gambar: menerapkan aturan pola
  if (q.gen || !text) return sec === "tiu" ? "C3" : "C2";  // soal bangkitan (acak.js, deret, figural)
  if (passage || n > 45) return "C4";
  if (MATERI_C4.test(m)) return "C4";
  if (sec === "tiu") return /deret|hitung|cerita|aritmet|numerik|persen|rasio|pecahan/i.test(m + " " + t) ? "C3" : "C3";
  if (RE_KASUS.test(t) && n > 20) return "C3";
  if (n <= 28 && RE_INGAT.test(t)) return "C1";
  return "C2";
}

const bank = SKD.bankRaw;
if (!bank) { console.error("SKD.bankRaw tidak ada"); process.exit(1); }
const per = {};
const contoh = { C1: [], C4: [] };
for (const q of bank) {
  const k = q.sec, j = jenjang(q);
  per[k] = per[k] || { n: 0, C1: 0, C2: 0, C3: 0, C4: 0, kata: 0, hots: 0 };
  per[k].n++; per[k][j]++; per[k].kata += kata(q.q) + kata(q.p);
  if (q.b) per[k].hots++;
  if (k === "twk" && (j === "C1" || j === "C4") && contoh[j].length < 400) contoh[j].push(q.q);
}
// susunan paket tryout tetap (6 paket) dan tryout setara CAT, plus skor peserta "asal pilih opsi terpanjang"
// (strategi menebak dari panjang opsi; di CAT asli strategi ini tidak lebih baik dari acak)
const TIU_LUNAK = ["sil", "ind", "anl", "der", "fig-ana", "fig-seri", "fig-mat", "fig-kubus"];
function tebakTerpanjang(items) {
  const sk = { twk: 0, tiu: 0, tkp: 0 };
  items.forEach((it) => {
    const L = it.pq.opts.map((o) => String(o.t || "").length), mx = Math.max(...L), i = L.indexOf(mx);
    sk[it.pq.sec] += it.pq.opts[i].pts;
  });
  return sk;
}
const paket = [];
const semuaPaket = [];
for (let p = 1; p <= 6; p++) semuaPaket.push(["Paket " + p, E.buildPackage(p, "full")]);
semuaPaket.push(["Setara CAT", E.buildSetara(1, "full", TIU_LUNAK)]);
for (const [nama, items] of semuaPaket) {
  const c = { nama, C1: 0, C2: 0, C3: 0, C4: 0, n: items.length, tebak: tebakTerpanjang(items) };
  items.forEach((it) => { c[jenjang(it.pq)]++; });
  paket.push(c);
}
const hasil = { bank: per, paket, contohC1: contoh.C1 };
if (process.argv.includes("--json")) { console.log(JSON.stringify(hasil, null, 1)); process.exit(0); }
const pc = (a, b) => (b ? Math.round((a / b) * 100) + "%" : "-");
console.log("Bank soal per subtes (jenjang kognitif, kata rata-rata, ditandai HOTS 2026):");
for (const [k, v] of Object.entries(per)) {
  console.log(`  ${k.toUpperCase()}  n=${v.n}  C1 ${pc(v.C1, v.n)}  C2 ${pc(v.C2, v.n)}  C3 ${pc(v.C3, v.n)}  C4+ ${pc(v.C4, v.n)}  kata ${Math.round(v.kata / v.n)}  HOTS ${v.hots}`);
}
console.log("Paket tryout (jenjang kognitif; skor bila asal memilih opsi terpanjang, acak murni ≈ TWK 30 / TIU 35 / TKP 135):");
paket.forEach((c) => console.log(`  ${c.nama.padEnd(10)} n=${c.n}  C1 ${pc(c.C1, c.n)}  C2 ${pc(c.C2, c.n)}  C3 ${pc(c.C3, c.n)}  C4+ ${pc(c.C4, c.n)}  | tebak terpanjang: TWK ${c.tebak.twk}, TIU ${c.tebak.tiu}, TKP ${c.tebak.tkp}`));
