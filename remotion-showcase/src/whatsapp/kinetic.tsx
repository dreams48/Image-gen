import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {P, display} from './theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const useSpr = (at: number, damping = 14, stiffness = 160) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - at, fps, config: {damping, stiffness}});
};

type KT = {text: string; at: number; size?: number; color?: string; style?: React.CSSProperties};

const base = (size: number, color: string): React.CSSProperties => ({
  fontFamily: display,
  fontSize: size,
  lineHeight: 0.95,
  color,
  textTransform: 'uppercase',
  letterSpacing: 1,
  whiteSpace: 'nowrap',
  // red words get a black outline so they stay readable over the red shapes
  ...(color === P.red ? {WebkitTextStroke: `8px ${P.black}`, paintOrder: 'stroke fill'} : {}),
});

// Comes down from 3× with motion blur and lands hard.
export const Slam: React.FC<KT> = ({text, at, size = 200, color = P.black, style}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 7], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const shake = frame >= at + 7 && frame < at + 13 ? Math.sin(frame * 3) * 6 : 0;
  return (
    <div
      style={{
        ...base(size, color),
        opacity: p,
        filter: `blur(${(1 - p) * 14}px)`,
        transform: `scale(${interpolate(p, [0, 1], [3, 1])}) translate(${shake}px, ${shake / 2}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// Letters drop in one after another with a bounce.
export const Drop: React.FC<KT & {stagger?: number}> = ({text, at, size = 200, color = P.black, stagger = 2, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{...base(size, color), display: 'flex', ...style}}>
      {text.split('').map((ch, i) => {
        const s = spring({frame: frame - at - i * stagger, fps, config: {damping: 10, stiffness: 200}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: s > 0.01 ? 1 : 0,
              transform: `translateY(${interpolate(s, [0, 1], [-260, 0])}px) rotate(${interpolate(s, [0, 1], [-20, 0])}deg)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// Slides up from behind an invisible mask.
export const Rise: React.FC<KT> = ({text, at, size = 200, color = P.black, style}) => {
  const s = useSpr(at, 200);
  return (
    <div style={{overflow: 'hidden', paddingTop: 10, ...style}}>
      <div style={{...base(size, color), transform: `translateY(${interpolate(s, [0, 1], [size * 1.1, 0])}px)`}}>{text}</div>
    </div>
  );
};

// Word on a solid block that wipes in from the left.
export const Block: React.FC<KT & {bg?: string}> = ({text, at, size = 150, color = P.white, bg = P.red, style}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [at, at + 8], [0, 100], {...clamp, easing: Easing.out(Easing.cubic)});
  const t = interpolate(frame, [at + 4, at + 12], [0, 1], clamp);
  return (
    <div style={{position: 'relative', display: 'inline-block', padding: '6px 26px 0', ...style}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${w}%`, background: bg}} />
      <div style={{...base(size, color), position: 'relative', opacity: t, transform: `translateX(${(1 - t) * -30}px)`}}>
        {text}
      </div>
    </div>
  );
};

// Small black pill label ("ÉTAPE 01").
export const Tag: React.FC<{text: string; at?: number; bg?: string; color?: string}> = ({
  text,
  at = 0,
  bg = P.black,
  color = P.cream,
}) => {
  const s = useSpr(at, 12);
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: display,
        fontSize: 44,
        letterSpacing: 6,
        color,
        background: bg,
        borderRadius: 40,
        padding: '8px 30px 4px',
        transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-10, -3])}deg)`,
      }}
    >
      {text}
    </div>
  );
};
