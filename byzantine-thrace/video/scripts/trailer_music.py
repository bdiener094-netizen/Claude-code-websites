"""Compose the series trailer score in code: deep drones, staccato strings at 140 BPM,
orchestra hits, a riser, a silence drop and a final brass "braaam".

Writes public/music/trailer.wav and public/music/trailer-hits.json (hit beats + strength),
which the Trailer composition reads so cuts, flashes and shakes land on the music.

Usage (from byzantine-thrace/video):  python scripts/trailer_music.py
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
BPM = 140
BEAT = 60 / BPM
TOTAL_BEATS = 112
N = int(TOTAL_BEATS * BEAT * SR) + SR * 4
OUT = Path(__file__).resolve().parent.parent / "public" / "music"
rng = np.random.default_rng(1453)

# i – VI – iv – V in D minor, one chord per bar
CHORDS = [(146.83, "min"), (116.54, "maj"), (98.00, "min"), (110.00, "maj")]
TONES = {"min": [1, 2 ** (3 / 12), 2 ** (7 / 12)], "maj": [1, 2 ** (4 / 12), 2 ** (7 / 12)]}


def at(beat):
    return int(beat * BEAT * SR)


def chord(beat):
    return CHORDS[int(beat // 4) % 4]


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def saw(f, n, harmonics=40):
    t = np.arange(n) / SR
    k = np.arange(1, max(2, min(harmonics, int(11000 / f))) + 1)[:, None]
    return (np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28)) / k).sum(axis=0) * 0.6


def add(bus, start, x):
    end = min(len(bus), start + len(x))
    bus[start:end] += x[: end - start]


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


# ---------- buses ----------
strings = np.zeros(N)
lows = np.zeros(N)
hits = np.zeros(N)
drums = np.zeros(N)
drone = np.zeros(N)
fx = np.zeros(N)
hit_marks = []


def string_note(f, beat, length_beats=0.25, accent=1.0):
    n = int(length_beats * BEAT * SR * 0.95)
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.004) * np.exp(-t / 0.075) * accent
    tone = sum(saw(f * 2 ** (c / 1200), n, 30) for c in (-8, 0, 7)) / 3
    return lp(tone * env, 3200)


def orch_hit(beat, strength):
    root, q = chord(beat)
    n = int(SR * (2.2 if strength > 0.8 else 1.4))
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.008) * np.exp(-t / (0.9 if strength > 0.8 else 0.45))
    notes = [root / 2, root, root * TONES[q][1], root * TONES[q][2], root * 2, root * 2 * TONES[q][1]]
    brass = sum(saw(f * 2 ** (c / 1200), n, 24) for f in notes for c in (-6, 6)) / len(notes)
    x = lp(brass * env, 2400 if strength > 0.8 else 1800) * strength
    timp = np.sin(2 * np.pi * np.cumsum(root / 2 * (0.92 + 0.08 * np.exp(-t * 6))) / SR) * np.exp(-t / 0.5)
    sub = np.sin(2 * np.pi * np.cumsum(30 + 30 * np.exp(-t * 10)) / SR) * np.exp(-t / 0.6)
    x += (0.9 * timp + 0.9 * sub) * strength
    if strength > 0.8:
        x += hp(rng.standard_normal(n), 5000) * np.exp(-t / 1.1) * 0.25
    add(hits, at(beat), x)
    hit_marks.append({"beat": beat, "strength": strength})


def taiko(beat, amp=1.0):
    n = int(SR * 0.9)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(55 + 70 * np.exp(-t * 25)) / SR) * np.exp(-t / 0.28)
    slap = lp(rng.standard_normal(n), 1200) * np.exp(-t / 0.02) * 0.5
    add(drums, at(beat), (body + slap) * amp)


# ---------- arrangement ----------
# Intro (bars 0–3): drone, taiko, sparse hits
for b in [0]:
    orch_hit(b, 1.0)
for b in [8, 12]:
    orch_hit(b, 0.7)
for bar in range(4):
    taiko(bar * 4, 0.9)
    taiko(bar * 4 + 2.5, 0.6)

# Strings ostinato (bars 4–19), 16ths
PATTERN = [0, 0, 2, 0, 1, 0, 2, 0, 0, 0, 2, 0, 1, 2, 1, 2]
for bar in range(4, 20):
    root, q = chord(bar * 4)
    for i, step in enumerate(PATTERN):
        beat = bar * 4 + i / 4
        f = root * TONES[q][step]
        accent = 1.0 if i % 4 == 0 else 0.7
        add(strings, at(beat), string_note(f, beat, accent=accent))
        if bar >= 12:  # climax: octave doubling + low strings
            add(strings, at(beat), string_note(f * 2, beat, accent=accent * 0.55))
            if i % 2 == 0:
                add(lows, at(beat), string_note(root / 2, beat, 0.5, accent))

# Hits: every bar in section B, every 2 beats in C, every beat at the end of C
for b in range(16, 48, 4):
    orch_hit(b, 0.75)
for b in range(48, 72, 2):
    orch_hit(b, 1.0 if b in (48, 64) else 0.8)
for b in range(72, 80):
    orch_hit(b, 0.85)
for b in range(16, 80):
    taiko(b, 0.55 if b < 48 else 0.8)
    if b >= 48:
        taiko(b + 0.5, 0.35)

# Riser (beats 76–83) then one beat of silence before the drop
rs, re_ = at(76), at(83)
t = np.arange(re_ - rs) / SR
riser = hp(rng.standard_normal(len(t)), 1500) * (t / t[-1]) ** 2
riser += 0.5 * np.sin(2 * np.pi * np.cumsum(200 * 6 ** (t / t[-1])) / SR) * (t / t[-1]) ** 1.5
add(fx, rs, riser)

# BRAAAM at beat 84
bs = at(84)
n = int(SR * 7.5)
t = np.arange(n) / SR
env = np.minimum(1, t / 0.12) * np.exp(-t / 2.6)
growl = 1 + 0.18 * np.sin(2 * np.pi * 26 * t)
braam = sum(saw(f * 2 ** (c / 1200), n, 30) for f in (36.71, 73.42, 110.0, 146.83, 174.61) for c in (-9, 0, 9))
braam = lp(braam * env * growl, 900, 4) + 0.35 * lp(braam * env, 3000)
braam += np.sin(2 * np.pi * np.cumsum(28 + 40 * np.exp(-t * 4)) / SR) * np.exp(-t / 1.8) * 3
add(fx, bs, braam / np.max(np.abs(braam)) * 2.2)
hit_marks.append({"beat": 84, "strength": 1.4})
add(drums, bs, np.zeros(1))
taiko(84, 1.4)
orch_hit(96, 1.0)  # end card

# Drone under everything except the silence beat
t = np.arange(N) / SR
d = np.sin(2 * np.pi * 36.71 * t) + 0.6 * np.sin(2 * np.pi * 55 * t) + 0.5 * lp(saw(73.42, N, 12), 260)
swell = np.interp(t, [0, 2, BEAT * 48, BEAT * 80, BEAT * 83, BEAT * 83.01, BEAT * 88, BEAT * 112, BEAT * 112 + 3], [0, 0.6, 0.8, 1.0, 1.0, 0, 0, 0.7, 0])
drone += d * swell

# Silence drop: mute everything between beat 83 and 84 except reverb tails of the riser
for bus in (strings, lows, hits, drums):
    bus[at(83) : at(84)] *= 0

# ---------- mix ----------
mix = 0.30 * norm(drone) + 0.42 * norm(strings) + 0.32 * norm(lows) + 0.75 * norm(hits) + 0.45 * norm(drums) + 0.85 * norm(fx)
ir_n = int(SR * 2.8)
ir = lp(rng.standard_normal(ir_n) * np.exp(-np.linspace(0, 6.5, ir_n)), 4500)
wet = fftconvolve(mix, ir)[:N]
mix = mix * 0.8 + norm(wet) * np.max(np.abs(mix)) * 0.38
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix = mix[: at(TOTAL_BEATS) + SR]
fade = np.minimum(1, (len(mix) - np.arange(len(mix))) / (SR * 1.5))
mix *= fade
left, right = mix, np.roll(mix, int(0.008 * SR)) * 0.97 + mix * 0.03

OUT.mkdir(parents=True, exist_ok=True)
sf.write(OUT / "trailer.wav", np.stack([left, right], axis=1) * 0.9, SR)
(OUT / "trailer-hits.json").write_text(json.dumps({"bpm": BPM, "beats": TOTAL_BEATS, "hits": sorted(hit_marks, key=lambda h: h["beat"])}))
print(f"trailer.wav {len(mix) / SR:.1f}s, {len(hit_marks)} hits")
