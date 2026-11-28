"""Cari baris tabel lampiran (gambar hNNN.png hasil ambil.cjs) yang kolom pendidikannya cocok dengan pola regex, lalu potong
pita barisnya jadi gambar kecil di <folder>/potong/ untuk dicek dengan mata (OCR tabel sering salah membaca angka).
Kolom pendidikan dianggap ada di 28-62% lebar halaman (tata letak lampiran KepmenPANRB); ubah KIRI/KANAN bila berbeda.
Pakai: python3 -I scripts/drive/cari_baris.py <folder> "ILMU ?KOMUNI" """
import subprocess, sys, csv, io, os, glob, re
from PIL import Image
d, kata = sys.argv[1], sys.argv[2]
out = os.path.join(d, "potong"); os.makedirs(out, exist_ok=True)
hasil = []
for f in sorted(glob.glob(os.path.join(d, "h*.png"))):
    im = Image.open(f)
    W, H = im.size
    KIRI, KANAN = 0.28, 0.62
    kol = im.crop((int(W * KIRI), 0, int(W * KANAN), H))
    tmp = os.path.join(out, "_kol.png"); kol.save(tmp)
    tsv = subprocess.run(["tesseract", tmp, "stdout", "-l", "ind+eng", "--psm", "6", "tsv"], capture_output=True, text=True).stdout
    rows = list(csv.DictReader(io.StringIO(tsv), delimiter="\t", quoting=csv.QUOTE_NONE))
    # gabung per baris teks (block,par,line)
    lines = {}
    for r in rows:
        t = (r.get("text") or "").strip()
        if not t: continue
        k = (r["block_num"], r["par_num"], r["line_num"])
        lines.setdefault(k, []).append((int(r["left"]), int(r["top"]), t))
    ys = []
    for k, ws in lines.items():
        s = " ".join(t for _, _, t in sorted(ws)).upper()
        if re.search(kata, s):
            ys.append(min(y for _, y, _ in ws))
    ys.sort()
    pita = []
    for y in ys:
        if pita and y - pita[-1][1] < 200: pita[-1][1] = y; continue
        pita.append([y, y])
    for i, (a, b) in enumerate(pita):
        y0, y1 = max(0, a - 140), min(H, b + 260)
        g = os.path.join(out, os.path.basename(f)[:-4] + f"_{i}.png")
        im.crop((0, y0, W, y1)).save(g)
        hasil.append(g)
print("\n".join(hasil))
