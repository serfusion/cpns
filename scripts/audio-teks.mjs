// Susun naskah audio "mode hafalan": soal -> jeda berpikir -> jawaban benar -> pembahasan.
// Hanya materi tanpa hitungan (TWK, TIU analogi dan silogisme, TKP). Setiap berkas berisi paling banyak 10 soal,
// jadi bila berhenti di tengah, lanjutkan dari bagian berikutnya tanpa mengulang dari awal.
// Tiga album: 1 Sangat Sering Keluar (boleh diulang-ulang), 2 Per Materi, 3 Fakta TWK (pasal, lembaga, butir Pancasila, sejarah).
// Jalankan: node scripts/audio-teks.mjs > naskah.json
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of ["js/config.js", "data/twk.js", "data/tiu.js", "data/tkp.js", "data/fakta.js"]) {
  vm.runInContext(readFileSync(join(root, f), "utf8"), ctx, { filename: f });
}
const SKD = ctx.window.SKD;

// ---------- normalisasi teks untuk mesin suara ----------
const EJA = [
  "BPUPKI", "PPKI", "LHKPN", "KBBI", "KNIP", "BPKP", "BUMN", "UMKM", "APBN", "APBD", "PDRI", "CPNS", "UUD", "NRI", "ASN", "PNS", "TNI",
  "KPK", "MPR", "DPR", "DPD", "BPK", "BKR", "TKR", "PNI", "SKD", "SKB", "TIK", "EYD", "OJK", "KTP", "BKN", "IKN", "TPS", "PBB", "PKH",
  "SDM", "BPS", "KPU", "CAT", "TWK", "TIU", "TKP", "UNCAC", "JDIH", "NIK", "MK", "MA", "KY", "RT", "RW", "RI", "TI", "AI", "PT", "PP"
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
  s = s.replace(/_([^_\n]+)_/g, "$1, kata yang dicetak miring,");
  s = s.replace(/Rp\s?(\d{1,3}(?:\.\d{3})+|\d+)/g, "$1 rupiah");
  s = s.replace(/\r?\n+/g, ". ").replace(/[“”"]/g, "").replace(/\s*\.\.\.\s*$/g, ".").replace(/\.\.\./g, ",").replace(/\.\s*\./g, ".");
  s = s.replace(/(\d)\.(?=\d{3}\b)/g, "$1").replace(/(\d)\.(?=\d{3}\b)/g, "$1");
  s = s.replace(/(\d+),(\d+)/g, (_, a, b) => a + " koma " + b.split("").join(" "));
  s = s.replace(/\b(\d+|[a-z])\s*\/\s*(\d+|[a-z])\b/g, "$1 per $2").replace(/\//g, " atau ");
  s = s.replace(/\((\d+)\)/g, "$1").replace(/(\d+)([A-J])\b/g, "$1 $2").replace(/[()]/g, ", ");
  s = s.replace(/%/g, " persen").replace(/×/g, " kali ").replace(/÷/g, " dibagi ").replace(/−/g, " min ").replace(/\+/g, " tambah ");
  s = s.replace(/→/g, " maka ").replace(/(\d)\s*–\s*(\d)/g, "$1 sampai $2").replace(/(\d+ [A-Z][a-z]+)–(\d)/g, "$1 sampai $2").replace(/–/g, " dan ").replace(/=/g, " sama dengan ").replace(/>/g, " lebih besar dari ").replace(/</g, " lebih kecil dari ");
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
const MATERI = Object.fromEntries(SKD.config.materi.map((m) => [m.id, m]));
// Materi tanpa hitungan. Analitis tidak dibacakan karena susunan duduk dan tabel sulit diikuti lewat suara.
const TANPA_HITUNG = ["nas", "int", "bela", "pilar", "bind", "ana", "sil", "pel", "jej", "sos", "tik", "pro", "rad"];
const PER_BAGIAN = 10;
const ALBUM = { 1: "SKD 1 Sangat Sering Keluar", 2: "SKD 2 Per Materi Tanpa Hitungan", 3: "SKD 3 Fakta TWK" };
const slug = (t) => t.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
/** Bagi rata menjadi bagian berisi paling banyak `maks` butir (11 soal menjadi 6 + 5, bukan 10 + 1). */
function bagi(arr, maks) {
  const nb = Math.ceil(arr.length / maks), base = Math.floor(arr.length / nb), sisa = arr.length % nb, out = [];
  for (let b = 0, i = 0; b < nb; b++) { const n = base + (b < sisa ? 1 : 0); out.push(arr.slice(i, i + n)); i += n; }
  return out;
}
const pad = (n, w = 2) => String(n).padStart(w, "0");

function urut(qs) {
  // sangat sering lebih dulu, lalu sering keluar, lalu lainnya; soal dengan bacaan yang sama dikelompokkan
  return qs.map((q, i) => ({ q, i })).sort((a, b) => (b.q.h || 0) - (a.q.h || 0) || String(a.q.p || "").localeCompare(String(b.q.p || "")) || a.i - b.i).map((x) => x.q);
}
function bacakanSoal(seg, q, no, ctx) {
  if (q.p && q.p !== ctx.bacaan) {
    ctx.bacaan = q.p;
    seg.push({ t: "Bacaan untuk soal berikut.", jeda: 0.5 });
    seg.push({ t: bersih(SKD.passages[q.p]), jeda: 1.0 });
  }
  seg.push({ t: "Soal " + no + ".", jeda: 0.35 });
  seg.push({ t: (bersih(q.q) + " " + bersih(tabel(q.tb))).trim(), jeda: 2.2 }); // jeda untuk menjawab dalam hati
  const benar = q.a != null ? q.o[q.a] : q.o[0];
  if (q.sec === "tkp") {
    seg.push({ t: "Jawaban terbaik: " + bersih(benar), jeda: 0.5 });
    seg.push({ t: "Hindari: " + bersih(q.o[4]), jeda: 0.5 });
  } else {
    seg.push({ t: "Jawaban: " + bersih(benar), jeda: 0.5 });
  }
  seg.push({ t: "Pembahasan. " + bersih(q.x), jeda: 1.6 });
}
function penutup(b, nb) {
  return b < nb
    ? "Akhir bagian " + b + " dari " + nb + ". Lain kali lanjutkan dari bagian " + (b + 1) + "."
    : "Ini bagian terakhir. Ulangi dari bagian 1 sampai Anda bisa menjawab sebelum jawabannya dibacakan.";
}

const out = [];
const track = { 1: 0, 2: 0, 3: 0 };
function tambah(album, file, judul, jumlah, segmen) {
  out.push({ file, judul, album: ALBUM[album], albumNo: album, track: ++track[album], jumlah, segmen });
}

// ---------- album 1: sangat sering keluar ----------
{
  const qs = [];
  for (const id of TANPA_HITUNG) urut(SKD.bankRaw.filter((q) => q.m === id && (q.h || 0) >= 2)).forEach((q) => qs.push(q));
  const parts = bagi(qs, PER_BAGIAN), nb = parts.length;
  let a = 1;
  for (let b = 1; b <= nb; b++, a += parts[b - 2].length) {
    const part = parts[b - 1], z = a + part.length - 1;
    const seg = [{ t: bersih("Latihan S K D. Sangat sering keluar. Bagian " + b + " dari " + nb + ". Soal " + a + " sampai " + z + ". Setelah soal dibacakan ada jeda singkat: jawab dalam hati, lalu dengarkan jawabannya."), jeda: 1.2 }];
    const ctx = { bacaan: null };
    let materi = null;
    part.forEach((q, k) => {
      if (q.m !== materi) {
        materi = q.m;
        seg.push({ t: bersih(SEC[q.sec].short + ", " + MATERI[q.m].name + "."), jeda: 0.6 });
      }
      bacakanSoal(seg, q, a + k, ctx);
    });
    seg.push({ t: penutup(b, nb), jeda: 0.5 });
    tambah(1, "1-Sangat-Sering-bagian-" + pad(b) + ".mp3", "Sangat sering keluar " + pad(b) + " dari " + nb + " (soal " + a + "-" + z + ")", part.length, seg);
  }
}

// ---------- album 2: per materi ----------
TANPA_HITUNG.forEach((id, mi) => {
  const m = MATERI[id], sec = SEC[m.sec], qs = urut(SKD.bankRaw.filter((q) => q.m === id));
  if (!qs.length) return;
  const parts = bagi(qs, PER_BAGIAN), nb = parts.length;
  let a = 1;
  for (let b = 1; b <= nb; b++, a += parts[b - 2].length) {
    const part = parts[b - 1], z = a + part.length - 1;
    const seg = [{ t: bersih("Latihan S K D. " + sec.name + ". Materi " + m.name + ". Bagian " + b + " dari " + nb + ". Soal " + a + " sampai " + z + "."), jeda: 1.2 }];
    const ctx = { bacaan: null };
    part.forEach((q, k) => bacakanSoal(seg, q, a + k, ctx));
    seg.push({ t: penutup(b, nb), jeda: 0.5 });
    tambah(2, "2-" + pad(mi + 1) + "-" + sec.short + "-" + slug(m.name) + "-bagian-" + b + ".mp3", sec.short + " " + m.name + " " + b + " dari " + nb + " (soal " + a + "-" + z + ")", part.length, seg);
  }
});

// ---------- album 3: fakta TWK ----------
{
  const F = SKD.fakta, URUT = ["pertama", "kedua", "ketiga", "keempat", "kelima"];
  const pasal = (p) => p.replace(/ayat \((\d+)\)/g, "ayat $1");
  const topik = [
    { nama: "Pasal UUD 1945", per: 15, isi: F.pasal.map((e) => pasal(e.p) + ". " + e.isi) },
    { nama: "Wewenang Lembaga Negara", per: 12, isi: Object.keys(F.lembaga).flatMap((id) => F.wewenang.filter((w) => w.l === id).map((w) => F.lembaga[id] + " " + w.w + ". Dasarnya " + pasal(w.p) + ".")) },
    { nama: "Butir Pancasila", per: 0, isi: null },
    { nama: "Sejarah BPUPKI PPKI dan Pergerakan", per: 15, isi: F.sejarah.map((e) => e.q.replace(/\s*\.\.\.\s*$/, " " + e.a + ".")) },
    { nama: "Hari Nasional", per: 16, isi: F.hari.map((e) => e.tgl + ": " + e.nama + ". Mengenang " + e.asal + ".") }
  ];
  topik.forEach((t, ti) => {
    let bagian;
    if (t.nama === "Butir Pancasila") {
      const sila = (i) => ["Sila " + URUT[i] + ", " + F.sila[i] + ". Ada " + F.butir[i].length + " butir."].concat(F.butir[i].map((b, k) => "Butir " + (k + 1) + ". " + b));
      bagian = [sila(0).concat(sila(1)), sila(2).concat(sila(3)), sila(4)];
    } else {
      bagian = bagi(t.isi, t.per);
    }
    bagian.forEach((isi, bi) => {
      const b = bi + 1, nb = bagian.length;
      const seg = [{ t: bersih("Fakta T W K. " + t.nama + ". Bagian " + b + " dari " + nb + "."), jeda: 1.0 }];
      isi.forEach((x) => seg.push({ t: bersih(x), jeda: 1.1 }));
      seg.push({ t: penutup(b, nb), jeda: 0.5 });
      tambah(3, "3-" + (ti + 1) + "-Fakta-" + slug(t.nama) + "-bagian-" + b + ".mp3", "Fakta " + t.nama + " " + b + " dari " + nb, isi.length, seg);
    });
  });
}

for (const o of out) o.total = track[o.albumNo];
process.stdout.write(JSON.stringify(out, null, 1));
