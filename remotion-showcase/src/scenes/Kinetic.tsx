import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, SceneLabel} from '../components';
import {C, sans, serif} from '../theme';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@';

// Technique 1: the word slides up from behind an invisible mask.
const MaskReveal: React.FC<{text: string; delay: number; color: string}> = ({text, delay, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div style={{overflow: 'hidden', height: 190}}>
      <div style={{transform: `translateY(${interpolate(p, [0, 1], [190, 0])}px)`, color}}>{text}</div>
    </div>
  );
};

// Technique 2: each letter cycles through random glyphs before settling.
const Scramble: React.FC<{text: string; delay: number; color: string}> = ({text, delay, color}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{color, height: 190}}>
      {text.split('').map((ch, i) => {
        const settle = delay + i * 3 + 8;
        const local = frame - delay - i * 3;
        if (local < 0) return <span key={i} style={{opacity: 0}}>{ch}</span>;
        const shown =
          frame >= settle || ch === '.'
            ? ch
            : GLYPHS[Math.floor(random(`${i}-${Math.floor(frame / 2)}`) * GLYPHS.length)];
        return (
          <span key={i} style={{display: 'inline-block', opacity: frame >= settle ? 1 : 0.6}}>
            {shown}
          </span>
        );
      })}
    </div>
  );
};

// Technique 3: elastic scale + an underline that draws itself.
const Elastic: React.FC<{text: string; delay: number; color: string}> = ({text, delay, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 7, stiffness: 120}});
  const line = spring({frame: frame - delay - 12, fps, config: {damping: 200}});
  return (
    <div style={{position: 'relative', height: 190, color, alignSelf: 'flex-start'}}>
      <div style={{transform: `scale(${p})`, transformOrigin: 'left center'}}>{text}</div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 18,
          height: 14,
          width: `${line * 92}%`,
          background: C.coral,
          borderRadius: 7,
        }}
      />
    </div>
  );
};

export const Kinetic: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, 30], [0, 100], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Background tint={C.blue} />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: `${wipe * 0.32}%`,
          background: `linear-gradient(180deg, ${C.coral}, ${C.pink})`,
        }}
      />
      <AbsoluteFill style={{padding: '130px 160px', fontFamily: serif, fontWeight: 800, fontSize: 170, lineHeight: 1.1}}>
        <MaskReveal text="Animer." delay={5} color={C.cream} />
        <Scramble text="Raconter." delay={30} color={C.yellow} />
        <Elastic text="Expliquer." delay={60} color={C.teal} />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          right: 70,
          top: '50%',
          transform: 'translateY(-50%)',
          writingMode: 'vertical-rl',
          whiteSpace: 'nowrap',
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 12,
          color: C.bg,
          opacity: interpolate(frame, [25, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        TYPOGRAPHIE CINÉTIQUE
      </div>
      <SceneLabel index="01" text="Masques, brouillage de lettres, ressorts élastiques" />
    </AbsoluteFill>
  );
};
