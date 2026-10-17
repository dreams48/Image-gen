import vo from './voiceover.json';

export const FPS = 30;
export const LEAD = 8; // frames of silence before the first word
export const GAP = 8; // frames of breathing room after each segment
export const TAIL = 30; // frames held after the last segment

export type Word = {text: string; startMs: number; endMs: number};
export type Segment = {id: string; file: string; text: string; durationMs: number; words: Word[]};

export const SEGMENTS = vo.segments as Segment[];

export const segFrames = (s: Segment) => Math.ceil((s.durationMs / 1000) * FPS) + GAP;

export const TIMELINE = (() => {
  let from = LEAD;
  return SEGMENTS.map((s, i) => {
    const dur = segFrames(s);
    const item = {seg: s, from, duration: i === SEGMENTS.length - 1 ? dur + TAIL : dur};
    from += dur;
    return item;
  });
})();

export const TOTAL_FRAMES = TIMELINE[TIMELINE.length - 1].from + TIMELINE[TIMELINE.length - 1].duration;

export const msToFrame = (ms: number) => Math.round((ms / 1000) * FPS);

// Frame (relative to the segment start) at which the n-th occurrence of `word` is spoken.
export const wordAt = (seg: Segment, word: string, nth = 0) => {
  const hits = seg.words.filter((w) => w.text.toLowerCase() === word.toLowerCase());
  const w = hits[nth] ?? hits[0];
  if (!w) throw new Error(`"${word}" not found in segment ${seg.id}`);
  return msToFrame(w.startMs);
};

export const seg = (id: string) => {
  const s = SEGMENTS.find((x) => x.id === id);
  if (!s) throw new Error(`segment ${id} missing`);
  return s;
};
