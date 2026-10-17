"""Synthesised sound design: paper flutter, airy whooshes, soft landings, pen scratches, low pop."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(11)


def band(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lowpass(x, f):
    return sosfilt(butter(2, f, btype="low", fs=SR, output="sos"), x)


def add(buf, sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= buf.shape[0]:
        return
    sig = sig[: buf.shape[0] - i] * gain
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[i:i + len(sig), 0] += sig * l
    buf[i:i + len(sig), 1] += sig * r


def whoosh(dur, lo=300, hi=3000):
    n = int(dur * SR)
    tt = np.linspace(0, 1, n)
    env = np.sin(np.pi * tt) ** 2 * (1 - tt) ** 0.6
    return band(rng.standard_normal(n), lo, hi) * env


def flutter(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    rate = rng.uniform(14, 22)
    am = (0.5 + 0.5 * np.sin(2 * np.pi * rate * tt + rng.uniform(0, 6))) ** 3
    am *= 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 1.3 * tt))
    env = np.sin(np.pi * np.linspace(0, 1, n)) * np.linspace(1, 0.3, n)
    return band(rng.standard_normal(n), 1200, 6000) * am * env


def landing():
    n = int(0.09 * SR)
    tt = np.arange(n) / SR
    tap = lowpass(rng.standard_normal(n), 2500) * np.exp(-tt / 0.012)
    thump = np.sin(2 * np.pi * 140 * tt) * np.exp(-tt / 0.03)
    return tap * 0.6 + thump * 0.35


def scratch(dur, rate=11):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    strokes = (0.5 + 0.5 * np.sin(2 * np.pi * rate * tt + 3 * np.sin(2 * np.pi * 2.3 * tt))) ** 2
    grain = band(rng.standard_normal(n), 2500, 9000)
    env = np.minimum(1, np.minimum(tt / 0.03, (dur - tt) / 0.05))
    return grain * strokes * env


def pop():
    n = int(0.6 * SR)
    tt = np.arange(n) / SR
    f = 75 * np.exp(-tt / 0.25) + 42
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.16)
    click = lowpass(rng.standard_normal(n), 1800) * np.exp(-tt / 0.006)
    air = whoosh(0.35, 200, 1500)
    out = body * 0.9 + click * 0.25
    out[: len(air)] += air * 0.3
    return out


def build_soundtrack(path, C, duration):
    buf = np.zeros((int(duration * SR), 2))
    W = C.L.W
    for f in C.frags:
        pan = float(np.clip((f["end"][0] / W) * 2 - 1, -0.8, 0.8))
        add(buf, whoosh(f["dur"] * 0.9), f["t0"], pan, 0.05)
        add(buf, flutter(f["dur"]), f["t0"], pan, 0.05)
        add(buf, landing(), f["t0"] + f["dur"] - 0.04, pan, 0.16)
    for nt in C.L.notes:
        pan = float(np.clip((nt["end"][0] / W) * 2 - 1, -0.8, 0.8))
        add(buf, whoosh(nt["dur"], 250, 2500), nt["t0"], pan, 0.11)
        add(buf, flutter(nt["dur"]), nt["t0"], pan, 0.08)
        add(buf, landing(), nt["t0"] + nt["dur"] - 0.03, pan, 0.3)
        add(buf, scratch(nt["write_dur"], 13), nt["write0"], pan, 0.09)
    add(buf, scratch(C.title_dur, 9), C.title_t0, 0.0, 0.11)
    for w in C.words:
        pan = float(np.clip(((w["bbox"][0] + w["bbox"][2]) / 2 / W) * 2 - 1, -0.6, 0.6))
        add(buf, whoosh(0.3, 600, 5000), w["t0"] - 0.05, pan, 0.035)
    add(buf, pop(), C.ange["t0"] + 0.1, 0.1, 0.6)
    # room tone so silence never sounds digital
    buf += lowpass(rng.standard_normal(buf.shape[0]), 400)[:, None] * 0.0015
    buf /= max(1.0, np.abs(buf).max() / 0.89)
    fade = np.minimum(1, (len(buf) - np.arange(len(buf))) / (0.3 * SR))[:, None]
    wavfile.write(path, SR, (buf * fade * 32767).astype(np.int16))
