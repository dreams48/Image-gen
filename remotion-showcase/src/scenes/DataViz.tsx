import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Background, SceneLabel} from '../components';
import {C, mono, sans, serif} from '../theme';

// Illustrative numbers only (shown as "exemple" on screen).
const BARS = [
  {label: 'Rédaction', value: 5, color: C.coral},
  {label: 'Recherche', value: 3.5, color: C.yellow},
  {label: 'E-mails', value: 2.5, color: C.teal},
  {label: 'Diapos', value: 4, color: C.blue},
];
const MAX = 6;

const Donut: React.FC<{progress: number}> = ({progress}) => {
  const r = 150;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={400} height={400} viewBox="0 0 400 400">
      <circle cx={200} cy={200} r={r} stroke={C.cream} strokeOpacity={0.1} strokeWidth={40} fill="none" />
      <circle
        cx={200}
        cy={200}
        r={r}
        stroke={C.coral}
        strokeWidth={40}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - 0.75 * progress)}
        transform="rotate(-90 200 200)"
      />
    </svg>
  );
};

export const DataViz: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const donut = interpolate(frame, [20, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const total = BARS.reduce((s, b) => s + b.value, 0);
  const counter = interpolate(frame, [20, 100], [0, total], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const title = spring({frame, fps, config: {damping: 200}});

  return (
    <AbsoluteFill>
      <Background tint={C.yellow} />
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 110,
          fontFamily: serif,
          fontWeight: 800,
          fontSize: 72,
          color: C.cream,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [30, 0])}px)`,
        }}
      >
        Heures gagnées par semaine
        <span style={{fontFamily: sans, fontSize: 30, color: C.muted, fontWeight: 400, marginLeft: 20}}>(exemple)</span>
      </div>

      {/* Bar chart */}
      <div style={{position: 'absolute', left: 160, top: 300, width: 900}}>
        {BARS.map((b, i) => {
          const p = spring({frame: frame - 15 - i * 8, fps, config: {damping: 14}});
          return (
            <div key={b.label} style={{display: 'flex', alignItems: 'center', height: 130}}>
              <div style={{width: 220, fontFamily: sans, fontSize: 34, color: C.cream, opacity: p}}>{b.label}</div>
              <div
                style={{
                  height: 70,
                  width: (b.value / MAX) * 600 * p,
                  background: b.color,
                  borderRadius: 14,
                }}
              />
              <div style={{marginLeft: 20, fontFamily: mono, fontSize: 34, color: b.color, opacity: p}}>
                {(b.value * Math.min(p, 1)).toFixed(1)} h
              </div>
            </div>
          );
        })}
      </div>

      {/* Donut + counter */}
      <div style={{position: 'absolute', right: 180, top: 300, width: 400, height: 400}}>
        <Donut progress={donut} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
          <div style={{fontFamily: mono, fontWeight: 700, fontSize: 96, color: C.cream}}>{counter.toFixed(1)}</div>
          <div style={{fontFamily: sans, fontSize: 28, color: C.muted}}>heures au total</div>
        </AbsoluteFill>
      </div>
      <SceneLabel index="03" text="Graphiques et compteurs animés à partir de données" color={C.yellow} />
    </AbsoluteFill>
  );
};
