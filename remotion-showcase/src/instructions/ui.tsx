import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, useSpr} from '../whatsapp/kinetic';
import {Sfx} from '../whatsapp/Sfx';
import {P, body} from '../whatsapp/theme';

export const STAGE = {left: 90, top: 470, width: 900, height: 800};

// ------------------------------------------------------------------ header pill
// Black pill at the top: red badge (step number or ✓) + short instruction + step dots.
export const StepPill: React.FC<{badge?: string; title: string; step?: number; steps?: number}> = ({
  badge,
  title,
  step = -1,
  steps = 4,
}) => {
  const s = useSpr(0, 14);
  return (
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: P.black,
          borderRadius: 50,
          padding: '14px 34px 14px 16px',
          opacity: s,
          transform: `translateY(${interpolate(s, [0, 1], [-40, 0])}px)`,
        }}
      >
        {badge && (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: P.red,
              color: P.white,
              fontFamily: body,
              fontWeight: 800,
              fontSize: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {badge}
          </div>
        )}
        <div style={{fontFamily: body, fontWeight: 800, fontSize: 40, color: P.cream, paddingLeft: badge ? 0 : 18}}>{title}</div>
      </div>
      <div style={{display: 'flex', gap: 12, marginTop: 16}}>
        {new Array(steps).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 44 : 14,
              height: 14,
              borderRadius: 7,
              background: i === step ? P.red : i < step ? P.black : `${P.black}40`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ camera
type Shot = {f: number; x: number; y: number; zoom: number; rx?: number; ry?: number};

// Frames a 900×800 "screen" like a moving camera: each shot centres point (x, y)
// at `zoom`, with an optional 3D tilt. Shots are interpolated with ease-in-out.
export const Camera: React.FC<{shots: Shot[]; children: React.ReactNode; swish?: boolean}> = ({shots, children, swish = true}) => {
  const frame = useCurrentFrame();
  const fs = shots.map((s) => s.f);
  const opt = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const v = (k: keyof Shot) =>
    shots.length === 1 ? (shots[0][k] ?? 0) : interpolate(frame, fs, shots.map((s) => s[k] ?? 0), opt);
  const zoom = v('zoom');
  const tx = STAGE.width / 2 - v('x') * zoom;
  const ty = STAGE.height / 2 - v('y') * zoom;
  const enter = useSpr(0, 16);
  return (
    <div
      style={{
        position: 'absolute',
        ...STAGE,
        perspective: 1800,
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 7%, #000 93%, transparent 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: STAGE.width,
          height: STAGE.height,
          transformOrigin: '0 0',
          transform: `translate(${tx}px, ${ty + (1 - enter) * 300}px) scale(${zoom}) rotateX(${v('rx')}deg) rotateY(${v('ry')}deg)`,
          opacity: enter,
        }}
      >
        {children}
      </div>
      {swish && shots.slice(1).map((s, i) => <Sfx key={i} name="swish" at={shots[i].f} volume={0.2} />)}
    </div>
  );
};

// ------------------------------------------------------------------ app frame
export const Screen: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: 30,
      top: 30,
      width: 840,
      height: 740,
      background: P.white,
      border: `5px solid ${P.black}`,
      borderRadius: 40,
      boxShadow: `14px 14px 0 ${P.black}`,
      overflow: 'hidden',
      fontFamily: body,
      color: P.black,
      ...style,
    }}
  >
    {children}
  </div>
);

// ------------------------------------------------------------------ finger tap
type Pt = {f: number; x: number; y: number};

// Red "finger" dot that glides between points; at each tap frame it presses and sends a ripple.
export const Tap: React.FC<{path: Pt[]; taps: number[]}> = ({path, taps}) => {
  const frame = useCurrentFrame();
  const fs = path.map((p) => p.f);
  const opt = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const x = path.length === 1 ? path[0].x : interpolate(frame, fs, path.map((p) => p.x), opt);
  const y = path.length === 1 ? path[0].y : interpolate(frame, fs, path.map((p) => p.y), opt);
  const show = interpolate(frame, [fs[0], fs[0] + 6], [0, 1], clamp);
  const pressed = taps.some((t) => frame >= t && frame < t + 5);
  return (
    <>
      <div style={{position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, zIndex: 20, opacity: show}}>
        {taps.map((t) => {
          const r = interpolate(frame, [t, t + 18], [0, 1], clamp);
          if (r <= 0 || r >= 1) return null;
          return (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: 30 - 70 * r,
                top: 30 - 70 * r,
                width: 140 * r,
                height: 140 * r,
                borderRadius: '50%',
                border: `5px solid ${P.red}`,
                opacity: 1 - r,
              }}
            />
          );
        })}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            background: P.red,
            border: `4px solid ${P.white}`,
            boxShadow: `0 6px 18px ${P.black}55`,
            transform: `scale(${pressed ? 0.75 : 1})`,
          }}
        />
      </div>
      {taps.map((t) => (
        <Sfx key={t} name="click" at={t} volume={0.6} />
      ))}
    </>
  );
};

// ------------------------------------------------------------------ toast
export const Toast: React.FC<{text: string; at: number}> = ({text, at}) => {
  const s = useSpr(at, 12);
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <div style={{position: 'absolute', top: STAGE.top + 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30}}>
      <div
        style={{
          background: P.black,
          color: P.cream,
          fontFamily: body,
          fontWeight: 800,
          fontSize: 40,
          borderRadius: 40,
          padding: '18px 36px',
          transform: `translateY(${interpolate(s, [0, 1], [-80, 0])}px) scale(${s})`,
        }}
      >
        {text} <span style={{color: P.red}}>✓</span>
      </div>
      <Sfx name="pop" at={at} volume={0.45} />
      <Sfx name="ding" at={at + 2} volume={0.3} />
    </div>
  );
};

// Text typed progressively between `start` and `start + dur`.
export const typed = (frame: number, text: string, start: number, dur: number) =>
  text.slice(0, Math.round(interpolate(frame, [start, start + dur], [0, text.length], clamp)));
