// Writes an episode's narration lines to JSON for the voice generator.
// Usage: npx tsx scripts/export-lines.ts ep01
import {writeFileSync, mkdirSync} from 'node:fs';

const id = process.argv[2];
const mod = await import(`../src/episodes/${id}.ts`);
const lines = (mod[id] as {text: string; speak?: string}[]).map((s) => ({text: s.text, speak: s.speak ?? s.text}));
mkdirSync('out', {recursive: true});
writeFileSync(`out/${id}.lines.json`, JSON.stringify(lines, null, 2));
console.log(`${lines.length} lines → out/${id}.lines.json`);
