"""Synthesises the opening's sound, every hit placed on a moment in compose.html (numpy only, nothing sampled).

    ~/.venv/bin/python sound.py out/sound.wav 10.8

The times below are compose.html's: change one there, change it here.
"""
import sys
import wave

import numpy as np

SR = 48000
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 10.8
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(11)


def tt(d):
    return np.arange(int(d * SR)) / SR


def put(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def mx(*sigs):
    """Sum sounds of different lengths."""
    out = np.zeros(max(len(x) for x in sigs))
    for x in sigs:
        out[: len(x)] += x
    return out


def band(sig, lo, hi):
    f = np.fft.rfft(sig)
    fr = np.fft.rfftfreq(len(sig), 1 / SR)
    f[(fr < lo) | (fr > hi)] = 0
    return np.fft.irfft(f, len(sig))


def noise(d):
    return rng.standard_normal(int(d * SR))


def click(d=0.03, lo=2500, hi=9000, decay=260):
    t = tt(d)
    return band(noise(d), lo, hi) * np.exp(-t * decay)


def key(gain=1.0):
    """A keyboard key: a click and a small body thump."""
    t = tt(0.06)
    return mx(click(0.06, 1800, 7000, 180) * 0.6, np.sin(2 * np.pi * 180 * t) * np.exp(-t * 90) * 0.4) * gain


def thump(f0=110, f1=42, d=0.5, decay=8):
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay)


def pluck(freq, d=1.2, bright=1.0):
    """Soft mallet: a few harmonics with faster decay on the upper ones."""
    t = tt(d)
    s = np.zeros(len(t))
    for h, a in ((1, 1.0), (2, 0.35 * bright), (3, 0.12 * bright), (4.2, 0.05 * bright)):
        s += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-t * (3.2 + 2.2 * h))
    return s * (1 - np.exp(-t * 900))


def hat(d=0.05):
    t = tt(d)
    return band(noise(d), 7000, 16000) * np.exp(-t * 90)


def swell(d, lo, hi, shape=3.0):
    """Noise rising into a moment (a reverse whoosh)."""
    t = tt(d)
    return band(noise(d), lo, hi) * (t / d) ** shape


def whoosh(d, lo, hi):
    t = tt(d)
    env = np.sin(np.pi * t / d) ** 2
    return band(noise(d), lo, hi) * env


def scratch(d, wob=9.0):
    """Felt pen on paper: band noise, fluttering with the stroke."""
    t = tt(d)
    env = (0.55 + 0.45 * np.abs(np.sin(np.pi * wob * t / d))) * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.05)
    return band(noise(d), 2500, 8000) * env


def chord(freqs, d, attack=0.01, decay=1.2):
    t = tt(d)
    s = sum(np.sin(2 * np.pi * f * t + i) * (0.8 ** i) for i, f in enumerate(freqs))
    # slow shimmer: a chorus of slightly detuned copies
    s += sum(0.35 * np.sin(2 * np.pi * f * 1.004 * t) for f in freqs[1:])
    return s * np.minimum(1, t / attack) * np.exp(-t / decay)


A = 220.0
note = lambda semis: A * 2 ** (semis / 12)

# 0 · the cursor
put(key(0.5), 0.22)
for b in (0.62, 0.92):
    put(click(0.02, 3000, 9000, 400), b, 0.12)
put(mx(thump(140, 60, 0.35, 14) * 0.5, click(0.03, 2000, 8000, 300) * 0.4), 0.98)

# 1 · the traces: a pen-line swish per run, a soft pluck where each one lands
TRACES = [(1.12, 1.5), (1.3, 1.66), (1.5, 1.95), (1.55, 2.0), (1.66, 2.08), (1.7, 2.12), (1.85, 2.2),
          (1.95, 2.25), (2.0, 2.3), (2.05, 2.35), (2.1, 2.32), (2.12, 2.36), (2.18, 2.42)]
PENT = [0, 3, 5, 7, 10, 12, 15]
for i, (a, b) in enumerate(TRACES):
    pan = ((i * 0.37) % 1.4) - 0.7
    put(scratch(b - a, 3) * (0.16 if i < 2 else 0.07), a, pan=pan)
    put(pluck(note(12 + PENT[i % len(PENT)]), 0.9, 0.7), b, 0.16 if i < 7 else 0.07, pan=pan)
# typing: the code panel (from 2.45) and the prompt (2.9 -> 3.35)
for k in range(30):
    put(key(0.12 + 0.05 * rng.random()), 2.45 + k * 0.036 + rng.random() * 0.012, pan=0.5)
for k in range(12):
    put(key(0.22), 2.9 + k * 0.0375, pan=0.0)
put(pluck(note(19), 1.4, 1.4), 3.42, 0.22)   # [ OK ]

# 2 · the prints, on the beat: 120 BPM from 3.5
for b in np.arange(3.5, 6.0, 0.5):
    put(mx(thump(150, 45, 0.45, 7), click(0.02, 2000, 6000, 300) * 0.15), b, 0.55)
    put(thump(70, 55, 0.5, 5) * 0.4, b, 0.4)   # a sub under each kick
for k, b in enumerate(np.arange(3.75, 6.0, 0.25)):
    put(hat(), b, 0.07 + 0.04 * (k % 2), pan=0.3)
CARDS = [3.5, 3.85, 4.2, 4.55, 4.9, 5.15, 5.35, 5.52, 5.66]
for k, c in enumerate(CARDS):
    # a print hitting the desk: a paper slap and a camera-shutter tick
    put(band(noise(0.09), 400, 5000) * np.exp(-tt(0.09) * 55) * 0.3, c, pan=((k * 0.61) % 1.2) - 0.6)
    put(click(0.025, 4000, 12000, 220) * 0.35, c + 0.01)
    put(pluck(note(PENT[(k * 2) % len(PENT)]), 0.8, 0.5), c, 0.08)
put(swell(0.8, 1500, 9000, 2.5), 5.2, 0.14)

# 3 · the contact sheet snaps, then the implosion
put(mx(thump(180, 50, 0.4, 9) * 0.6, band(noise(0.12), 800, 4000) * np.exp(-tt(0.12) * 40) * 0.4), 6.0)
for k in range(9):
    put(click(0.02, 3000, 10000, 300), 6.08 + k * 0.035, 0.18, pan=(k - 4) / 5)
sw = swell(0.43, 200, 6000, 3.5)
sw[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR))
put(sw, 6.55, 0.42)

# 4 · the point writes the lettering: the one big hit, then the pen
put(thump(90, 34, 2.2, 1.6) * 0.9, 7.0)
put(click(0.05, 1000, 9000, 120) * 0.5, 7.0)
put(chord([note(-12), note(-5), note(2), note(4), note(7)], 3.8, 0.02, 1.4), 7.0, 0.09)
put(scratch(0.68, 9), 7.04, 0.32)
put(scratch(0.32, 1.5), 7.66, 0.3)
for k in range(12):
    put(key(0.2), 7.98 + k * 0.027)

# 5 · the hand-off
put(whoosh(0.76, 150, 2500), 8.32, 0.3)
put(mx(thump(120, 60, 0.3, 12) * 0.35, band(noise(0.06), 600, 4000) * np.exp(-tt(0.06) * 60) * 0.25), 9.08)
for at, semis in ((9.32, 16), (9.56, 19), (9.8, 24)):    # I build it. / I break it. / Then I ship it.
    put(pluck(note(semis), 1.6, 1.0 if semis < 24 else 1.6), at, 0.24)
put(chord([note(0), note(4), note(7), note(11)], 1.6, 0.25, 0.9), 9.8, 0.05)

# master: gentle limiter, fade the tail
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.6) / 1.6
mix /= max(1e-9, np.abs(mix).max()) / 0.89
fade = int(0.35 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "sound.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("wrote", sys.argv[1] if len(sys.argv) > 1 else "sound.wav", f"{DUR}s")
