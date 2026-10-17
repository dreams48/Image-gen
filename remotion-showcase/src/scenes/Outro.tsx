import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components';
import {C, mono, sans, serif} from '../theme';

const CODE = [
  {t: 'const ', c: C.pink},
  {t: 'scale', c: C.cream},
  {t: ' = ', c: C.muted},
  {t: 'spring', c: C.blue},
  {t: '({', c: C.muted},
  {t: 'frame', c: C.yellow},
  {t: ', ', c: C.muted},
  {t: 'fps', c: C.yellow},
  {t: '});', c: C.muted},
];
const FULL = CODE.map((p) => p.t).join('');

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typed = Math.floor(interpolate(frame, [5, 50], [0, FULL.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const cursor = Math.floor(frame / 8) % 2 === 0;

  // Render only the typed characters while keeping the syntax colours.
  let remaining = typed;
  const parts = CODE.map((p, i) => {
    const shown = p.t.slice(0, Math.max(0, remaining));
    remaining -= p.t.length;
    return (
      <span key={i} style={{color: p.c}}>
        {shown}
      </span>
    );
  });

  const lift = spring({frame: frame - 60, fps, config: {damping: 200}});
  const end = spring({frame: frame - 70, fps, config: {damping: 12}});
  const sign = interpolate(frame, [95, 115], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [150, 165], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      <Background />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 56,
            background: C.bg2,
            border: `2px solid ${C.cream}22`,
            borderRadius: 24,
            padding: '36px 56px',
            transform: `translateY(${interpolate(lift, [0, 1], [0, -230])}px) scale(${interpolate(lift, [0, 1], [1, 0.7])})`,
            opacity: interpolate(lift, [0, 1], [1, 0.55]),
          }}
        >
          {parts}
          <span style={{color: C.coral, opacity: cursor ? 1 : 0}}>▍</span>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 470,
            textAlign: 'center',
            opacity: end,
            transform: `translateY(${interpolate(end, [0, 1], [60, 0])}px)`,
          }}
        >
          <div style={{fontFamily: serif, fontWeight: 800, fontSize: 110, color: C.cream}}>
            Tout ceci est <span style={{color: C.coral}}>du code</span>.
          </div>
          <div style={{fontFamily: sans, fontSize: 40, color: C.muted, marginTop: 24, opacity: sign}}>
            Écrit par Claude · rendu avec Remotion (React)
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
