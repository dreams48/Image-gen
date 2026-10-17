"""Synthesise the sound effects and the music bed for the WhatsApp video.

Everything is generated from scratch with numpy (no samples, no licence issues).
Output: public/sfx/*.wav  (mono, 44.1 kHz)

Usage: python3 scripts/sfx.py [music_seconds]
"""
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def env(n: int, attack: float, decay: float) -> np.ndarray:
    a = max(1, int(SR * attack))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[a:] = np.exp(-np.arange(n - a) / (SR * decay))
    return e


def lowpass(x: np.ndarray, cutoff: np.ndarray | float) -> np.ndarray:
    """One-pole low-pass; cutoff may vary per sample."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    alpha = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha[i] * (x[i] - acc)
        y[i] = acc
    return y


def save(name: str, x: np.ndarray, peak: float = 0.9) -> None:
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    data = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def whoosh(sec=0.45):
    n = int(SR * sec)
    noise = rng.standard_normal(n)
    sweep = np.concatenate([np.geomspace(300, 6000, n // 2), np.geomspace(6000, 500, n - n // 2)])
    x = lowpass(noise, sweep) - lowpass(noise, sweep / 4)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 2
    return x * shape


def impact():
    tt = t(0.6)
    freq = 120 * np.exp(-tt * 9) + 45
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(len(tt), 0.002, 0.18)
    click = lowpass(rng.standard_normal(len(tt)), 3000) * env(len(tt), 0.0005, 0.015)
    return body + 0.6 * click


def pop():
    tt = t(0.16)
    freq = 900 * np.exp(-tt * 25) + 380
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(len(tt), 0.001, 0.04)


def swish():
    return whoosh(0.22)


def tick():
    tt = t(0.05)
    return np.sin(2 * np.pi * 2200 * tt) * env(len(tt), 0.0005, 0.008)


def click():
    tt = t(0.08)
    x = lowpass(rng.standard_normal(len(tt)), 5000) * env(len(tt), 0.0003, 0.006)
    return x + 0.5 * np.sin(2 * np.pi * 1500 * tt) * env(len(tt), 0.0003, 0.01)


def typing(sec=0.9, cps=14):
    n = int(SR * sec)
    x = np.zeros(n)
    for k in range(int(sec * cps)):
        start = int((k / cps + rng.uniform(-0.01, 0.01)) * SR)
        c = click() * rng.uniform(0.5, 1.0)
        end = min(n, max(0, start) + len(c))
        x[max(0, start):end] += c[: end - max(0, start)]
    return x


def ding():
    tt = t(1.6)
    x = np.zeros_like(tt)
    for f, a in [(880, 1), (1320, 0.5), (1760, 0.3), (2640, 0.15)]:
        x += a * np.sin(2 * np.pi * f * tt)
    return x * env(len(tt), 0.003, 0.45)


def music(sec: float, bpm=104):
    """Light bed: kick, off-beat hats and a soft pad on a I–vi–IV–V loop."""
    n = int(SR * sec)
    x = np.zeros(n)
    beat = 60 / bpm
    kick = impact() * 0.7
    hat = lowpass(rng.standard_normal(int(SR * 0.05)), 9000) * env(int(SR * 0.05), 0.0005, 0.012)
    hat = hat - lowpass(hat, 6000)
    chords = [[261.6, 329.6, 392.0], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 246.9, 293.7]]
    k = 0
    while k * beat < sec:
        s = int(k * beat * SR)
        if k % 2 == 0:
            e = min(n, s + len(kick))
            x[s:e] += kick[: e - s]
        hs = int((k + 0.5) * beat * SR)
        if hs < n:
            e = min(n, hs + len(hat))
            x[hs:e] += 0.5 * hat[: e - hs]
        if k % 4 == 0:
            bar = chords[(k // 4) % len(chords)]
            ln = int(4 * beat * SR)
            tt = np.arange(ln) / SR
            pad = sum(np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt) for f in bar)
            pad *= np.minimum(1, tt / 0.3) * np.minimum(1, (tt[-1] - tt) / 0.3) * 0.12
            e = min(n, s + ln)
            x[s:e] += pad[: e - s]
        k += 1
    fade = int(SR * 1.5)
    x[-fade:] *= np.linspace(1, 0, fade)
    return x


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    save("whoosh", whoosh())
    save("impact", impact())
    save("pop", pop(), 0.7)
    save("swish", swish(), 0.7)
    save("tick", tick(), 0.5)
    save("click", click(), 0.7)
    save("typing", typing(), 0.6)
    save("ding", ding(), 0.8)
    save("music", music(float(sys.argv[1]) if len(sys.argv) > 1 else 60), 0.8)
    # the bed is long: keep it as mp3
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(OUT / "music.wav"), "-b:a", "96k", str(OUT / "music.mp3")], check=True)
    (OUT / "music.wav").unlink()
    print("sfx written to", OUT)
