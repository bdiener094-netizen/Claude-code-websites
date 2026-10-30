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

## Adding the voice-over (next step)

At the moment narration timing is **estimated** at about 2.5 words per second. Once the AI voice is chosen, the plan is:
1. Generate each episode's narration with word-level timestamps (ElevenLabs returns these).
2. Replace `estimateWords()` in `src/timing.ts` with the real timestamps, so captions, arrows and reveals land exactly on the spoken words.
3. Add the audio track, plus music and sound effects, to `Episode.tsx`.
