# Byzantine Thrace: video template

A Remotion (React) project that renders the series' 1080×1920 Shorts. Each episode is a **data file**: you write the narration lines and pick a scene for each, and the template handles the visuals, captions, branding and timing.

## Run it on your computer

Install Node.js 20+ from nodejs.org first.

```bash
cd byzantine-thrace/video
npm install
npm run studio        # live preview in the browser: scrub, tweak, re-render
npx remotion render src/index.ts Ep01-TheWallsThatNeverFell out/ep01.mp4 --crf=18
```

Remotion's license is free for individuals and companies of up to 3 people.

## Project layout

| Path | What it is |
|---|---|
| `src/brand.ts` | Colours, fonts, frame size: the Byzantine Thrace brand system |
| `src/episodes/ep01.ts` | Episode 1 script and scene choices. **Copy this file to make a new episode.** |
| `src/Root.tsx` | Register each new episode here |
| `src/scenes/` | Reusable scene types (below) |
| `src/map/constantinople.ts` | Map geometry, wall line, label positions |
| `src/timing.ts` | Narration timing (estimated until real voice-over is added) |

## Scene types

| `type` | Use it for |
|---|---|
| `hook` | Opening line as big type over the wall silhouette |
| `map` | Parchment map with camera move, walls (`draw` / `show` / `glow`), labels, attack arrows synced to spoken words, year stamp, dusk fade |
| `section` | Cross-section of the triple defence, built up one layer per line |
| `statement` | Short punchy lines on dark, optional stamp (e.g. REPELLED) |
| `counter` | Year counting up, with a timeline of sieges |
| `yearSlam` | Big dramatic year reveal |
| `end` | Final line, then the branded end card with the next episode |

## Voice-over and sound (generated in code)

The narration is made with **Kokoro**, an open-source text-to-speech model (Apache 2.0 license, so commercial use is allowed and it costs nothing). It returns word-level timestamps, which drive the captions, arrow launches and reveals. Sound effects are synthesised in Python: a low drone, an impact boom on hard cuts, and a whoosh on arrows.

Set up once (Python 3.10–3.12):

```bash
python3.12 -m venv .venv && source .venv/bin/activate
pip install kokoro soundfile scipy
pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl
```

For each episode:

```bash
npx tsx scripts/export-lines.ts ep02                            # narration lines → out/ep02.lines.json
python scripts/voiceover.py ep02 --voice bm_george --speed 0.95  # → public/voice/ep02/*.wav + src/episodes/ep02.voice.json
python scripts/sfx.py                                            # only needed once
```

Then register the episode, and its `.voice.json`, in `src/Root.tsx`.

**Pronunciation:** in the episode file, `text` is what appears in the captions and `speak` is what the voice says. Use `speak` for years ("1453" → "fourteen-fifty-three"; keep a year hyphenated so it counts as one word) and for names the model gets wrong (Mehmed → "Meh-med").

An episode with no `.voice.json` falls back to an estimated pace of about 2.5 words per second, which is handy for drafting visuals before the voice exists.
