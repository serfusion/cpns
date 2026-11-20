"""Ubah naskah audio (keluaran scripts/audio-teks.mjs) menjadi MP3 per materi dengan Piper TTS.

Pakai:  python scripts/audio.py naskah.json model.onnx folder-keluaran [awalan-berkas ...]
Butuh:  pip install piper-tts==1.8.0, ffmpeg. Suara: id_ID-news_tts-medium (rhasspy/piper-voices).
"""
import json
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np
from piper import PiperVoice, SynthesisConfig


def main():
    naskah, model, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
    pilih = sys.argv[4:]
    os.makedirs(outdir, exist_ok=True)
    voice = PiperVoice.load(model)
    sr = voice.config.sample_rate
    cfg = SynthesisConfig(length_scale=1.0)
    data = json.load(open(naskah, encoding="utf-8"))
    for no, item in enumerate(data, 1):
        if pilih and not any(item["file"].startswith(p) for p in pilih):
            continue
        parts = []
        for seg in item["segmen"]:
            for chunk in voice.synthesize(seg["t"], syn_config=cfg):
                parts.append(chunk.audio_int16_array)
            parts.append(np.zeros(int(sr * float(seg.get("jeda", 0.5))), dtype=np.int16))
        audio = np.concatenate(parts)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            wav_path = tmp.name
        with wave.open(wav_path, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(audio.tobytes())
        out = os.path.join(outdir, item["file"])
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "48k",
            "-metadata", "title=" + item["judul"], "-metadata", "album=" + item["album"],
            "-metadata", "artist=Latihan SKD CPNS", "-metadata", "track=%d/%d" % (no, len(data)), out,
        ], check=True)
        os.unlink(wav_path)
        print("%s  %d soal  %.1f menit" % (item["file"], item["jumlah"], len(audio) / sr / 60), flush=True)


if __name__ == "__main__":
    main()
