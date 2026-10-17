import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Sfx} from './Sfx';
import {P, W, H} from './theme';

// Wobbly closed blob around (cx, cy).
const blob = (cx: number, cy: number, r: number, t: number, seed: number) => {
  const pts = 48;
  let d = '';
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const rr = r * (1 + 0.06 * Math.sin(a * 3 + t / 20 + seed) + 0.04 * Math.sin(a * 5 - t / 15 + seed * 2));
    d += `${i === 0 ? 'M' : 'L'} ${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return d + 'Z';
};

// `cuts`: frames where a new segment starts (the blobs change shape there).
export const Background: React.FC<{cuts: number[]}> = ({cuts}) => {
  const frame = useCurrentFrame();
  const t = frame;
  // red blobs breathe and drift; they swap sides a little on each new segment
  const cut = cuts.filter((c) => c <= frame).length;
  const swing = interpolate(Math.sin(t / 45), [-1, 1], [-40, 40]);
  return (
    <AbsoluteFill style={{background: P.cream}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* faint black dot grid */}
        {new Array(7 * 4).fill(0).map((_, i) => {
          const x = 70 + (i % 7) * 26;
          const y = 300 + Math.floor(i / 7) * 26 + Math.sin(t / 12 + i) * 3;
          return <circle key={i} cx={x} cy={y} r={5} fill={P.black} />;
        })}
        <path d={blob(1040 + swing, 180, 305, t, 1 + cut)} fill={P.red} />
        <path d={blob(20 - swing, 1530, 265, t, 4 + cut)} fill={P.red} />
        {/* white disc drifting behind the centre */}
        <circle cx={540 + Math.sin(t / 60) * 120} cy={900 + Math.cos(t / 70) * 80} r={250} fill={P.white} />
        {/* black ring */}
        <circle
          cx={900 + Math.cos(t / 50) * 40}
          cy={1300 + Math.sin(t / 40) * 50}
          r={95}
          fill="none"
          stroke={P.black}
          strokeWidth={34}
        />
        {/* rotating dashed red ring */}
        <circle
          cx={170}
          cy={720}
          r={70}
          fill="none"
          stroke={P.red}
          strokeWidth={10}
          strokeDasharray="22 16"
          transform={`rotate(${t * 2} 170 720)`}
        />
      </svg>
    </AbsoluteFill>
  );
};

// Red diagonal panel that sweeps across the screen at each segment change.
export const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 12], [-1.4, 1.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Sfx name="whoosh" at={0} volume={0.35} />
      {frame <= 12 && <div
        style={{
          position: 'absolute',
          left: x * W,
          top: -400,
          width: W * 0.5,
          height: H + 800,
          background: P.red,
          transform: 'rotate(14deg)',
        }}
      />}
    </AbsoluteFill>
  );
};
