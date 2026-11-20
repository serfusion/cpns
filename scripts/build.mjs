// Gabungkan aplikasi menjadi satu file HTML: dist/latihan-skd.html (bisa dibuka offline, termasuk di APK).
// Font lokal disisipkan sebagai data URI. Jalankan: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let css = readFileSync(join(root, "css/style.css"), "utf8");
css = css.replace(/url\("\.\.\/fonts\/([^"]+\.woff2)"\)/g, (_, f) => `url("data:font/woff2;base64,${readFileSync(join(root, "fonts", f)).toString("base64")}")`);
let html = readFileSync(join(root, "index.html"), "utf8");
html = html.replace(/<link rel="stylesheet" href="css\/style\.css">/, () => `<style>\n${css}\n</style>`);
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => `<script>\n${readFileSync(join(root, src), "utf8").replace(/<\/script/gi, "<\\/script")}\n</script>`);
mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist/latihan-skd.html"), html);
console.log(`dist/latihan-skd.html (${Math.round(html.length / 1024)} KB)`);
