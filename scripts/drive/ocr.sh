#!/bin/bash
# OCR semua gambar halaman hNNN.png di folder ($1) ke hNNN.txt (bahasa Indonesia + Inggris).
# Butuh tesseract: sudo apt-get install -y tesseract-ocr tesseract-ocr-ind
d="$1"
for f in "$d"/h*.png; do
  o="${f%.png}.txt"
  [ -s "$o" ] && continue
  tesseract "$f" "${f%.png}" -l ind+eng --psm 6 >/dev/null 2>&1
done
ls "$d"/h*.txt | wc -l
