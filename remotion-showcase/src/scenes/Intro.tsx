import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Background} from '../components';
import {C, sans, serif} from '../theme';

const RAYS = 12;

const Sparkle: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rotation = interpolate(frame, [0, 150], [-30, 20]);
  const shrink = spring({frame: frame - 45, fps, config: {damping: 14}});
  const scale = interpolate(shrink, [0, 1], [1.5, 0.55]);
  const y = interpolate(shrink, [0, 1], [0, -230]);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translateY(${y}px) rotate(${rotation}deg) scale(${scale})`,
      }}
    >
      {new Array(RAYS).fill(0).map((_, i) => {
        const grow = spring({frame: frame - i * 2, fps, config: {damping: 9, mass: 0.6}});
        const length = (i % 2 === 0 ? 150 : 110) * grow;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 26,
              height: length,
              left: -13,
              top: 0,
              borderRadius: 13,
              background: C.coral,
              transformOrigin: '50% 0',
              transform: `rotate(${(360 / RAYS) * i + 180}deg) translateY(18px)`,
            }}
          />
        );
      })}
    </div>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const word = 'Claude';
  const sub = interpolate(frame, [85, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const flash = interpolate(frame, [0, 6, 20], [0, 0.35, 0], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <Background />
      <Sparkle />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', top: 120}}>
        <div style={{display: 'flex', fontFamily: serif, fontWeight: 800, fontSize: 210, color: C.cream}}>
          {word.split('').map((ch, i) => {
            const p = spring({frame: frame - 50 - i * 4, fps, config: {damping: 12}});
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [120, 0])}px) rotate(${interpolate(p, [0, 1], [25, 0])}deg)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 44,
            color: C.muted,
            marginTop: 10,
            opacity: sub,
            letterSpacing: interpolate(sub, [0, 1], [24, 4]),
          }}
        >
          <span style={{color: C.coral, fontWeight: 800}}>×</span> Remotion — démonstration de motion design
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: C.cream, opacity: flash}} />
    </AbsoluteFill>
  );
};
