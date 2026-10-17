import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {P, body} from './theme';
import {Segment, msToFrame} from './timeline';

type CWord = {text: string; start: number; end: number};

// Re-attach the punctuation that the TTS word timings leave out.
const withPunctuation = (seg: Segment): CWord[] => {
  let cursor = 0;
  return seg.words.map((w) => {
    const idx = seg.text.indexOf(w.text, cursor);
    cursor = idx + w.text.length;
    const m = seg.text.slice(cursor).match(/^(\s?[?!:]|[,.])/);
    // French typography: narrow space before ? ! :
    const punct = m ? (m[1].trim() === ',' || m[1] === '.' ? m[1] : `\u202F${m[1].trim()}`) : '';
    return {text: w.text + punct, start: msToFrame(w.startMs), end: msToFrame(w.endMs)};
  });
};

const chunk = (words: CWord[]) => {
  const out: CWord[][] = [];
  let cur: CWord[] = [];
  words.forEach((w) => {
    cur.push(w);
    if (cur.length >= 4 || /[,.!?:]$/.test(w.text)) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};

export const Captions: React.FC<{seg: Segment}> = ({seg}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chunks = chunk(withPunctuation(seg));
  const i = chunks.findIndex((c, k) => frame >= c[0].start - 2 && (k === chunks.length - 1 || frame < chunks[k + 1][0].start - 2));
  if (i < 0) return null;
  const c = chunks[i];
  const pop = spring({frame: frame - (c[0].start - 2), fps, config: {damping: 14, stiffness: 220}});
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 1330,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: P.white,
          borderRadius: 26,
          padding: '18px 30px',
          boxShadow: `8px 8px 0 ${P.black}`,
          border: `4px solid ${P.black}`,
          transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 22px',
          maxWidth: 940,
        }}
      >
        {c.map((w, k) => {
          const active = frame >= w.start && frame < (c[k + 1]?.start ?? w.end + 6);
          const spoken = frame >= w.start;
          return (
            <span
              key={k}
              style={{
                fontFamily: body,
                fontWeight: 800,
                fontSize: 58,
                lineHeight: 1.2,
                color: active ? P.red : P.black,
                opacity: spoken ? 1 : 0.35,
                display: 'inline-block',
                transform: `scale(${active ? 1.04 : 1})`,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
