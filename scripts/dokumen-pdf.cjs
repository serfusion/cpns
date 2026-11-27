// Ubah dokumen Markdown di docs/ menjadi PDF A4 (pandoc + Chromium/Playwright).
// Pakai: node scripts/dokumen-pdf.cjs docs/pemindaian-formasi-cpns-2026.md
// Butuh: pandoc dan Playwright (Chromium). Hasil: berkas .pdf di sebelah .md.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const src = path.resolve(process.argv[2] || "docs/pemindaian-formasi-cpns-2026.md");
const out = src.replace(/\.md$/, ".pdf");
// Font disisipkan sebagai data URI: halaman setContent tidak boleh memuat file:// lokal.
const font = "data:font/woff2;base64," + fs.readFileSync(path.resolve(__dirname, "../fonts/plus-jakarta-sans.woff2")).toString("base64");
const body = execFileSync("pandoc", ["--from=gfm", "--to=html5", src], { encoding: "utf8" });
const title = (fs.readFileSync(src, "utf8").match(/^# (.+)$/m) || [, "Dokumen"])[1];

const css = `
@font-face { font-family: "Plus Jakarta Sans"; src: url("${font}") format("woff2"); font-weight: 200 800; }
:root { --navy: #132f5a; --ink: #121d2d; --muted: #525b69; --line: #d7deea; --soft: #eef2f7; --amber: #f2bb3b; }
* { box-sizing: border-box; }
html { font-size: 9.6pt; }
body { margin: 0; font-family: "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif; color: var(--ink); line-height: 1.5; }
h1 { font-size: 20pt; line-height: 1.2; color: var(--navy); margin: 0 0 10pt; padding-bottom: 8pt; border-bottom: 3pt solid var(--navy); }
h2 { font-size: 13pt; color: var(--navy); margin: 18pt 0 6pt; padding-left: 8pt; border-left: 4pt solid var(--amber); break-after: avoid; }
h3 { font-size: 10.5pt; margin: 12pt 0 4pt; break-after: avoid; }
p { margin: 0 0 6pt; }
ul, ol { margin: 0 0 8pt; padding-left: 16pt; }
li { margin: 0 0 3pt; }
hr { border: 0; border-top: 1pt solid var(--line); margin: 12pt 0; }
a { color: var(--navy); word-break: break-all; }
strong { font-weight: 700; }
table { width: 100%; border-collapse: collapse; margin: 4pt 0 10pt; font-size: 8.2pt; line-height: 1.35; break-inside: auto; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th { background: var(--navy); color: #fff; font-weight: 700; text-align: left; padding: 4pt 5pt; }
td { border-bottom: 0.6pt solid var(--line); padding: 4pt 5pt; vertical-align: top; }
tbody tr:nth-child(even) td { background: #f6f8fc; }
td[align="right"], th[align="right"] { text-align: right; font-variant-numeric: tabular-nums; }
em { color: var(--muted); }
`;
const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: out, format: "A4", printBackground: true,
    margin: { top: "16mm", bottom: "18mm", left: "15mm", right: "15mm" },
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: '<div style="width:100%;font-size:7.5pt;color:#525b69;padding:0 15mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif">' +
      "<span>" + title.replace(/</g, "&lt;") + '</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
  });
  await browser.close();
  console.log(path.relative(process.cwd(), out), Math.round(fs.statSync(out).size / 1024) + " KB");
})();
