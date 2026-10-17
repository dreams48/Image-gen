import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, mono, sans, serif} from '../theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const useSpring = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

// "Étape 2 — Donner des instructions" header shown at the top of each step.
export const StepHeader: React.FC<{step?: string; title: string; color?: string}> = ({
  step,
  title,
  color = C.coral,
}) => {
  const p = useSpring(0);
  return (
    <div
      style={{
        position: 'absolute',
        left: 110,
        top: 80,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [-30, 0])}px)`,
      }}
    >
      {step && (
        <div style={{fontFamily: mono, fontWeight: 700, fontSize: 26, color, letterSpacing: 4, marginBottom: 8}}>
          {step}
        </div>
      )}
      <div style={{fontFamily: serif, fontWeight: 800, fontSize: 64, color: C.cream}}>{title}</div>
    </div>
  );
};

// Explanatory sentence at the bottom of the screen (the "narration").
export const Caption: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 10}) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 60,
        display: 'flex',
        justifyContent: 'center',
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          textAlign: 'center',
          fontFamily: sans,
          fontSize: 38,
          lineHeight: 1.35,
          color: C.cream,
          background: `${C.bg}e6`,
          border: `1px solid ${C.cream}1a`,
          borderRadius: 22,
          padding: '20px 40px',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Hl: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.coral}) => (
  <span style={{color, fontWeight: 800}}>{children}</span>
);

// Reveals `text` character by character between `start` and `start + duration`.
export const Typewriter: React.FC<{text: string; start: number; duration: number; cursor?: boolean}> = ({
  text,
  start,
  duration,
  cursor = true,
}) => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [start, start + duration], [0, text.length], clamp));
  const typing = frame >= start && n < text.length;
  return (
    <span>
      {text.slice(0, n)}
      {cursor && (typing || Math.floor(frame / 15) % 2 === 0) && frame >= start && (
        <span style={{color: C.coral}}>|</span>
      )}
    </span>
  );
};

// Simplified app window used as a stand-in for the Claude interface.
export const AppWindow: React.FC<{
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title?: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({children, sidebar, title = 'claude.ai', delay = 0, style}) => {
  const p = useSpring(delay, 18);
  return (
    <div
      style={{
        position: 'absolute',
        left: 210,
        top: 230,
        width: 1500,
        height: 620,
        borderRadius: 28,
        background: C.bg2,
        border: `2px solid ${C.cream}1f`,
        boxShadow: '0 40px 80px #000a',
        overflow: 'hidden',
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 22px',
          borderBottom: `1px solid ${C.cream}14`,
          flexShrink: 0,
        }}
      >
        {[C.coral, C.yellow, C.teal].map((c) => (
          <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.8}} />
        ))}
        <div style={{marginLeft: 20, fontFamily: mono, fontSize: 20, color: C.muted}}>{title}</div>
      </div>
      <div style={{flex: 1, display: 'flex', minHeight: 0}}>
        {sidebar && (
          <div
            style={{
              width: 300,
              borderRight: `1px solid ${C.cream}14`,
              padding: 26,
              boxSizing: 'border-box',
              fontFamily: sans,
              fontSize: 24,
              color: C.muted,
            }}
          >
            {sidebar}
          </div>
        )}
        <div style={{flex: 1, position: 'relative', padding: 40, boxSizing: 'border-box'}}>{children}</div>
      </div>
    </div>
  );
};

export const SideItem: React.FC<{label: string; active?: boolean; icon?: string}> = ({label, active, icon = '•'}) => (
  <div
    style={{
      padding: '12px 16px',
      borderRadius: 12,
      marginBottom: 8,
      background: active ? `${C.coral}26` : 'transparent',
      color: active ? C.cream : C.muted,
      fontWeight: active ? 600 : 400,
      display: 'flex',
      gap: 12,
    }}
  >
    <span style={{color: active ? C.coral : C.muted}}>{icon}</span>
    {label}
  </div>
);

// A fake mouse pointer that glides between keyframes and "clicks" (shrinks) at click frames.
export const Pointer: React.FC<{path: {f: number; x: number; y: number}[]; clicks?: number[]}> = ({
  path,
  clicks = [],
}) => {
  const frame = useCurrentFrame();
  const fs = path.map((p) => p.f);
  const opts = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const x = interpolate(frame, fs, path.map((p) => p.x), opts);
  const y = interpolate(frame, fs, path.map((p) => p.y), opts);
  const press = clicks.some((c) => frame >= c && frame < c + 6) ? 0.8 : 1;
  const ring = clicks.map((c) => interpolate(frame, [c, c + 15], [0, 1], clamp)).find((r) => r > 0 && r < 1);
  const visible = interpolate(frame, [fs[0], fs[0] + 8], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: visible, zIndex: 10}}>
      {ring !== undefined && (
        <div
          style={{
            position: 'absolute',
            left: -30 * ring,
            top: -30 * ring,
            width: 60 * ring,
            height: 60 * ring,
            borderRadius: '50%',
            border: `3px solid ${C.coral}`,
            opacity: 1 - ring,
          }}
        />
      )}
      <svg width={40} height={40} style={{transform: `scale(${press})`, transformOrigin: '0 0'}}>
        <path d="M2 2 L2 30 L10 23 L16 36 L22 33 L16 21 L27 21 Z" fill={C.cream} stroke={C.bg} strokeWidth={2} />
      </svg>
    </div>
  );
};

export const Scene: React.FC<{children: React.ReactNode; tint?: string}> = ({children, tint = C.coral}) => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 70) * 15;
  return (
    <AbsoluteFill
      style={{background: `radial-gradient(circle at ${x}% 40%, ${tint}1f 0%, ${C.bg2} 40%, ${C.bg} 80%)`}}
    >
      {children}
    </AbsoluteFill>
  );
};
