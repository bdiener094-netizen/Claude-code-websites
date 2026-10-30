"""Generate an episode's narration with Kokoro TTS (open-source, Apache 2.0).

Writes one WAV per line to public/voice/<ep>/ and the real word timings to
src/episodes/<ep>.voice.json, which the template uses for captions and animation sync.

Usage (from byzantine-thrace/video):
    npx tsx scripts/export-lines.ts ep01
    python scripts/voiceover.py ep01 --voice bm_george --speed 0.95
"""
import argparse
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

SR = 24000
ROOT = Path(__file__).resolve().parent.parent


def alnum(s: str) -> bool:
    return bool(re.search(r"[A-Za-z0-9]", s))


def align(caption: str, tokens: list[tuple[str, float, float]]) -> list[dict]:
    """Map on-screen caption words to spoken token times (seconds)."""
    words = caption.split()
    spoken = [t for t in tokens if alnum(t[0])]
    if len(spoken) == len(words):
        return [{"text": w, "start": s, "end": e} for w, (_, s, e) in zip(words, spoken)]
    # Caption and speech differ (e.g. "413" vs "four-thirteen"): spread words over the spoken span by length.
    start, end = spoken[0][1], spoken[-1][2]
    weights = [max(1, len(re.sub(r"\W", "", w))) for w in words]
    total, t, out = sum(weights), start, []
    for w, wt in zip(words, weights):
        d = (end - start) * wt / total
        out.append({"text": w, "start": t, "end": t + d})
        t += d
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--voice", default="bm_george")
    ap.add_argument("--speed", type=float, default=0.95)
    args = ap.parse_args()

    lines = json.loads((ROOT / "out" / f"{args.episode}.lines.json").read_text())
    pipe = KPipeline(lang_code=args.voice[0], repo_id="hexgrad/Kokoro-82M")
    out_dir = ROOT / "public" / "voice" / args.episode
    out_dir.mkdir(parents=True, exist_ok=True)

    result = []
    for i, line in enumerate(lines, 1):
        chunks, tokens, offset = [], [], 0.0
        for r in pipe(line["speak"], voice=args.voice, speed=args.speed):
            audio = r.audio.numpy()
            chunks.append(audio)
            tokens += [(t.text, offset + (t.start_ts or 0), offset + (t.end_ts or 0)) for t in r.tokens]
            offset += len(audio) / SR
        audio = np.concatenate(chunks)
        name = f"{i:02d}.wav"
        sf.write(out_dir / name, audio, SR)
        result.append(
            {
                "file": f"voice/{args.episode}/{name}",
                "duration": round(len(audio) / SR, 3),
                "words": align(line["text"], tokens),
            }
        )
        print(f"{name}  {len(audio) / SR:5.2f}s  {line['text'][:60]}")

    meta = {"voice": args.voice, "speed": args.speed, "lines": result}
    (ROOT / "src" / "episodes" / f"{args.episode}.voice.json").write_text(json.dumps(meta, indent=1))
    print(f"total {sum(r['duration'] for r in result):.1f}s of narration")


if __name__ == "__main__":
    main()
