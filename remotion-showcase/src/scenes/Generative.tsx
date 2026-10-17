import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {Background, SceneLabel} from '../components';
import {C, serif} from '../theme';

const COLS = 32;
const ROWS = 18;
const GAP = 60;

export const Generative: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = COLS / 2 + Math.sin(frame / 25) * 6;
  const cy = ROWS / 2 + Math.cos(frame / 30) * 3;
  const text = interpolate(frame, [20, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Background tint={C.pink} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {new Array(COLS * ROWS).fill(0).map((_, i) => {
          const x = i % COLS;
          const y = Math.floor(i / COLS);
          const dist = Math.hypot(x - cx, y - cy);
          const wave = (Math.sin(dist * 0.7 - frame / 5) + 1) / 2;
          const color = interpolateColors(wave, [0, 0.5, 1], [C.blue, C.pink, C.yellow]);
          return (
            <circle
              key={i}
              cx={30 + x * GAP + wave * 8}
              cy={30 + y * GAP}
              r={4 + wave * 14}
              fill={color}
              opacity={0.25 + wave * 0.75}
            />
          );
        })}
      </svg>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 800,
            fontSize: 150,
            color: C.cream,
            textShadow: `0 10px 60px ${C.bg}`,
            opacity: text,
            transform: `scale(${interpolate(text, [0, 1], [1.2, 1])})`,
            filter: `blur(${(1 - text) * 12}px)`,
          }}
        >
          Génératif.
        </div>
      </AbsoluteFill>
      <SceneLabel index="05" text="576 points pilotés par une seule formule mathématique" color={C.pink} />
    </AbsoluteFill>
  );
};
