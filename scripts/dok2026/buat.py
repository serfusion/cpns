"""Buat data/dok2026.js dari scripts/dok2026/sumber.json (formasi CPNS 2026 dari pengumuman/lampiran resmi instansi).

Sumber kebenaran ada di sumber.json; skrip ini hanya menghitung ringkasan lalu menulis berkas yang dimuat aplikasi.
- ilkomKursi: jumlah kursi formasi yang mencantumkan nama prodi "S-1 Ilmu Komunikasi" persis (formasi bertanda c="tidak" tidak dihitung).
- smaKursi: jumlah kursi formasi yang menerima SMA/SMK/SLTA.
Pakai (dari akar repo): python3 scripts/dok2026/buat.py
"""
import json, os, sys

AKAR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SUMBER = os.path.join(AKAR, "scripts", "dok2026", "sumber.json")
KELUAR = os.path.join(AKAR, "data", "dok2026.js")


def ilkom(f):
    return f.get("c") != "tidak" and any(p.strip().upper() == "S-1 ILMU KOMUNIKASI" for p in f["p"])


def sma(f):
    return any(("SMA" in p.upper() or "SLTA" in p.upper() or "SMK" in p.upper()) for p in f["p"])


def main():
    d = json.load(open(SUMBER, encoding="utf-8"))
    for I in d["instansi"]:
        for f in I["formasi"]:
            assert f.get("j") and isinstance(f.get("k"), int) and f.get("p"), "formasi tidak lengkap di " + I["n"]
        I["ilkomKursi"] = sum(f["k"] for f in I["formasi"] if ilkom(f))
        I["smaKursi"] = sum(f["k"] for f in I["formasi"] if sma(f))
        I["ilkom"] = "ya" if I["ilkomKursi"] else "tidak"
    d["ringkas"] = {
        "ilkom": sum(I["ilkomKursi"] for I in d["instansi"]),
        "ilkomInstansi": sum(1 for I in d["instansi"] if I["ilkomKursi"]),
        "sma": sum(I["smaKursi"] for I in d["instansi"]),
        "smaInstansi": sum(1 for I in d["instansi"] if I["smaKursi"]),
    }
    teks = ("/* Formasi CPNS 2026 dari pengumuman dan lampiran resmi instansi (dibuat scripts/dok2026/buat.py dari sumber.json;\n"
            "   jangan diubah langsung). Nama prodi persis seperti di dokumen; S-1 Ilmu Komunikasi dihitung hanya bila tercantum persis. */\n"
            "(function () {\n  \"use strict\";\n  var SKD = (window.SKD = window.SKD || {});\n  SKD.dok2026 = "
            + json.dumps(d, ensure_ascii=False, indent=1) + ";\n})();\n")
    open(KELUAR, "w", encoding="utf-8").write(teks)
    r = d["ringkas"]
    print("S-1 Ilmu Komunikasi %d kursi di %d instansi; SMA/SMK %d kursi di %d instansi" % (r["ilkom"], r["ilkomInstansi"], r["sma"], r["smaInstansi"]))
    for I in d["instansi"]:
        print("  %-45s ilkom %4d  sma %4d" % (I["n"], I["ilkomKursi"], I["smaKursi"]))


if __name__ == "__main__":
    sys.exit(main())
