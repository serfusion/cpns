// Susun naskah audio "mode hafalan" dari bank soal: soal -> jawaban benar -> pembahasan.
// Satu berkas per materi; soal bertanda Sering keluar dibacakan lebih dulu. Soal figural tidak dibacakan.
// Jalankan: node scripts/audio-teks.mjs > naskah.json
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of ["js/config.js", "data/twk.js", "data/tiu.js", "data/tkp.js"]) {
  vm.runInContext(readFileSync(join(root, f), "utf8"), ctx, { filename: f });
}
const SKD = ctx.window.SKD;

// ---------- normalisasi teks untuk mesin suara ----------
const EJA = [
  "BPUPKI", "PPKI", "LHKPN", "KBBI", "KNIP", "BPKP", "BUMN", "UMKM", "APBN", "APBD", "PDRI", "CPNS", "UUD", "NRI", "ASN", "PNS", "TNI",
  "KPK", "MPR", "DPR", "DPD", "BPK", "BKR", "TKR", "PNI", "SKD", "SKB", "TIK", "EYD", "OJK", "KTP", "BKN", "IKN", "TPS", "PBB", "PKH",
  "SDM", "BPS", "KPU", "CAT", "MK", "MA", "KY", "RT", "RI", "TI", "AI", "PT", "PP"
];
const KATA = [
  [/\bUU\b/g, "undang-undang"], [/\bKeppres\b/g, "keputusan presiden"], [/\bBerAKHLAK\b/g, "berakhlak"], [/\bPolri\b/g, "polri"],
  [/\bdan\/atau\b/g, "dan atau"], [/\bkm\/jam\b/g, "kilometer per jam"], [/\bliter\/menit\b/g, "liter per menit"], [/\bcm²/g, "sentimeter persegi"],
  [/\bcm\b/g, "sentimeter"], [/\bkm\b/g, "kilometer"], [/\bS\.H\./g, "S H"], [/\bM\.H\./g, "M H"], [/\bProf\./g, "Profesor"], [/\bDr\./g, "Doktor"],
  [/\bdr\./g, "dokter"], [/\bIr\./g, "Insinyur"], [/\bDrs\./g, "Doktorandus"], [/\bMr\./g, "Meester"], [/\bK\.H\./g, "Kiai Haji"], [/\bK\.R\.T\./g, "K R T"],
  [/\bE\.F\.E\./g, "E F E"], [/\bW\.R\./g, "W R"], [/\bR\.A\./g, "Raden Ajeng"], [/\bjo\./g, "juncto"], [/\bmis\./g, "misalnya"], [/\bdll\./g, "dan lain-lain"],
  [/(\d)x\b/g, "$1 eks"], [/\bx\b/g, "eks"], [/\by\b/g, "ye"]
];
const PK = { "x > y": "x lebih besar dari y", "x < y": "x lebih kecil dari y", "x = y": "x sama dengan y", "2x = y": "dua x sama dengan y" };

export function bersih(t) {
  let s = String(t);
  if (PK[s.trim()]) s = PK[s.trim()];
  s = s.replace(/Rp\s?(\d{1,3}(?:\.\d{3})+|\d+)/g, "$1 rupiah");
  s = s.replace(/\r?\n+/g, ". ").replace(/[“”"]/g, "").replace(/\s*\.\.\.\s*$/g, ".").replace(/\.\.\./g, ",").replace(/\.\s*\./g, ".");
  s = s.replace(/(\d)\.(?=\d{3}\b)/g, "$1").replace(/(\d)\.(?=\d{3}\b)/g, "$1");
  s = s.replace(/(\d+),(\d+)/g, (_, a, b) => a + " koma " + b.split("").join(" "));
  s = s.replace(/\b(\d+|[a-z])\s*\/\s*(\d+|[a-z])\b/g, "$1 per $2").replace(/\//g, " atau ");
  s = s.replace(/\((\d+)\)/g, "$1").replace(/(\d+)([A-J])\b/g, "$1 $2").replace(/[()]/g, ", ");
  s = s.replace(/%/g, " persen").replace(/×/g, " kali ").replace(/÷/g, " dibagi ").replace(/−/g, " min ").replace(/\+/g, " tambah ");
  s = s.replace(/→/g, " maka ").replace(/(\d)\s*–\s*(\d)/g, "$1 sampai $2").replace(/–/g, " dan ").replace(/=/g, " sama dengan ").replace(/>/g, " lebih besar dari ").replace(/</g, " lebih kecil dari ");
  s = s.replace(/√/g, " akar ").replace(/²/g, " kuadrat").replace(/³/g, " pangkat tiga").replace(/⁴/g, " pangkat empat").replace(/⁵/g, " pangkat lima").replace(/π/g, " pi ");
  for (const [re, rep] of KATA) s = s.replace(re, rep);
  for (const a of EJA) s = s.replace(new RegExp("\\b" + a + "\\b", "g"), a.split("").join(" "));
  s = s.replace(/\s+([,.;:?!])/g, "$1").replace(/([,.;:])(?:\s*[,])+/g, "$1").replace(/,\s*\./g, ".").replace(/^\s*,\s*/, "").replace(/\s{2,}/g, " ").trim();
  return s;
}

function tabel(tb) {
  if (!tb) return "";
  return " Tabel dengan kolom " + tb.h.join(", ") + ". " + tb.r.map((r, i) => "Baris " + (i + 1) + ": " + r.map((c, j) => tb.h[j] + " " + c).join(", ") + ".").join(" ");
}

const SEC = Object.fromEntries(SKD.config.sections.map((s) => [s.id, s]));
const out = [];
let no = 0;
for (const m of SKD.config.materi) {
  const qs = SKD.bankRaw.filter((q) => q.m === m.id);
  if (!qs.length) continue;
  // Sering keluar lebih dulu; soal dengan bacaan yang sama dikelompokkan.
  const sorted = qs.map((q, i) => ({ q, i })).sort((a, b) => ((b.q.h ? 1 : 0) - (a.q.h ? 1 : 0)) || String(a.q.p || "").localeCompare(String(b.q.p || "")) || a.i - b.i).map((x) => x.q);
  const sec = SEC[m.sec];
  no++;
  const seg = [];
  seg.push({ t: bersih("Latihan S K D. " + sec.name + ". Materi " + m.name + ". " + qs.length + " soal. Dengarkan soalnya, lalu jawaban yang benar dan pembahasannya."), jeda: 1.2 });
  let bacaan = null;
  sorted.forEach((q, i) => {
    if (q.p && q.p !== bacaan) {
      bacaan = q.p;
      seg.push({ t: "Bacaan untuk soal berikut.", jeda: 0.5 });
      seg.push({ t: bersih(SKD.passages[q.p]), jeda: 1.0 });
    }
    seg.push({ t: "Soal " + (i + 1) + ".", jeda: 0.35 });
    seg.push({ t: (bersih(q.q) + " " + bersih(tabel(q.tb))).trim(), jeda: 1.2 });
    const benar = q.a != null ? q.o[q.a] : q.o[0];
    if (q.sec === "tkp") {
      seg.push({ t: "Jawaban terbaik: " + bersih(benar), jeda: 0.5 });
      seg.push({ t: "Hindari: " + bersih(q.o[4]), jeda: 0.5 });
    } else {
      seg.push({ t: "Jawaban: " + bersih(benar), jeda: 0.5 });
    }
    seg.push({ t: "Pembahasan. " + bersih(q.x), jeda: 1.6 });
  });
  seg.push({ t: "Selesai. Ulangi materi ini sampai Anda bisa menjawab sebelum jawabannya dibacakan.", jeda: 0.5 });
  out.push({
    file: String(no).padStart(2, "0") + "-" + sec.short + "-" + m.name.replace(/[^A-Za-z0-9]+/g, "-").replace(/-+$/, "") + ".mp3",
    judul: sec.short + " " + m.name, album: "Latihan SKD CPNS - Audio Hafalan", jumlah: qs.length, segmen: seg
  });
}
process.stdout.write(JSON.stringify(out, null, 1));
