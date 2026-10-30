"""Synthesise the series' sound bed in code: a low cinematic drone, an impact boom for
hard cuts, and a whoosh for attack arrows. Writes WAVs to public/sfx/.

Usage (from byzantine-thrace/video):  python scripts/sfx.py
"""
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(1453)


def lowpass(x, hz):
    return sosfilt(butter(4, hz, "low", fs=SR, output="sos"), x)


def bandpass(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def reverb(x, seconds=2.2, mix=0.35):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    wet = np.pad(fftconvolve(x, lowpass(ir, 5000)), (0, 1))[: len(x) + n]
    dry = np.pad(x, (0, n))
    return dry * (1 - mix) + wet / np.max(np.abs(wet)) * np.max(np.abs(x)) * mix


def norm(x, db):
    return x / np.max(np.abs(x)) * 10 ** (db / 20)


def stereo(x, width=0.0):
    delay = int(0.012 * SR * width)
    return np.stack([x, np.roll(x, delay)], axis=1)


def drone(seconds=75):
    t = np.arange(int(seconds * SR)) / SR
    x = np.zeros_like(t)
    for f, amp, lfo in [(55, 1.0, 0.05), (82.4, 0.55, 0.07), (110, 0.35, 0.031), (164.8, 0.15, 0.043)]:
        x += amp * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.11 * t)) * (0.7 + 0.3 * np.sin(2 * np.pi * lfo * t))
    wind = lowpass(np.cumsum(rng.standard_normal(len(t))) * 0.02, 400)
    wind -= np.convolve(wind, np.ones(SR) / SR, "same")  # remove drift
    x = x + norm(wind, 0) * 0.45
    fade = np.minimum(1, np.minimum(t / 3, (seconds - t) / 3))
    return norm(x * fade, -16)


def boom(seconds=3.0):
    t = np.arange(int(seconds * SR)) / SR
    sweep = np.sin(2 * np.pi * np.cumsum(35 + 70 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2)
    crack = lowpass(rng.standard_normal(len(t)), 1800) * np.exp(-t * 28)
    return norm(reverb(sweep + 0.6 * norm(crack, 0)), -3)


def whoosh(seconds=0.7):
    t = np.arange(int(seconds * SR)) / SR
    env = np.sin(np.pi * t / seconds) ** 2
    x = np.zeros_like(t)
    for i, (lo, hi) in enumerate([(300, 900), (700, 2000), (1500, 4000)]):
        x += bandpass(rng.standard_normal(len(t)), lo, hi) * np.roll(env, int(i * 0.05 * SR))
    return norm(reverb(x * env, 0.8, 0.25), -6)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, sound in [("drone", drone()), ("boom", boom()), ("whoosh", whoosh())]:
        sf.write(OUT / f"{name}.wav", stereo(sound, 1.0), SR)
        print(f"{name}.wav  {len(sound) / SR:.1f}s")
