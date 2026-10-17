import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, mono, sans} from './theme';

// Small caption shown at the bottom-left of each scene: names the technique on screen.
export const SceneLabel: React.FC<{index: string; text: string; color?: string}> = ({
  index,
  text,
  color = C.coral,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 8, fps, config: {damping: 200}});
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        bottom: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '12px 22px',
        borderRadius: 40,
        background: `${C.bg}d9`,
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
      }}
    >
      <span style={{fontFamily: mono, fontSize: 24, color, fontWeight: 700}}>{index}</span>
      <span style={{width: 60 * p, height: 2, background: color}} />
      <span style={{fontFamily: sans, fontSize: 26, color: C.cream, letterSpacing: 1}}>{text}</span>
    </div>
  );
};

export const Background: React.FC<{tint?: string}> = ({tint = C.coral}) => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 60) * 12;
  const y = 45 + Math.cos(frame / 75) * 10;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, ${tint}22 0%, ${C.bg2} 35%, ${C.bg} 75%)`,
      }}
    />
  );
};
