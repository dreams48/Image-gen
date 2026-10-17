import {interpolate, useCurrentFrame} from 'remotion';
import {C, sans} from '../theme';
import {Folder} from './Intro';
import {Caption, Hl, Scene, StepHeader, clamp, useSpring} from './ui';

const PARTS = [
  {title: 'Instructions', text: 'Comment Claude doit travailler', color: C.yellow, x: 230, y: 330},
  {title: 'Connaissances', text: 'Vos documents de référence', color: C.teal, x: 1290, y: 330},
  {title: 'Conversations', text: 'Toutes partagent ce contexte', color: C.blue, x: 760, y: 700},
];

export const Concept: React.FC = () => {
  const frame = useCurrentFrame();
  const folder = useSpring(5, 12);
  const cx = 960;
  const cy = 440;
  return (
    <Scene tint={C.teal}>
      <StepHeader step="LA SOLUTION" title="Un projet, c'est un espace de travail" color={C.teal} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {PARTS.map((p, i) => {
          const draw = interpolate(frame, [40 + i * 25, 65 + i * 25], [0, 1], clamp);
          const tx = p.x + 200;
          const ty = p.y + 60;
          return (
            <line
              key={p.title}
              x1={cx}
              y1={cy}
              x2={cx + (tx - cx) * draw}
              y2={cy + (ty - cy) * draw}
              stroke={p.color}
              strokeWidth={4}
              strokeDasharray="10 10"
              strokeDashoffset={-frame}
            />
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: cx - 130, top: cy - 104, transform: `scale(${folder})`}}>
        <Folder open={1} />
      </div>
      {PARTS.map((p, i) => {
        const s = useSpring(55 + i * 25, 13);
        return (
          <div
            key={p.title}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: 400,
              borderRadius: 24,
              background: C.bg2,
              border: `3px solid ${p.color}`,
              padding: '22px 28px',
              boxSizing: 'border-box',
              transform: `scale(${s})`,
              fontFamily: sans,
            }}
          >
            <div style={{fontWeight: 800, fontSize: 38, color: p.color}}>{p.title}</div>
            <div style={{fontSize: 26, color: C.cream, marginTop: 6}}>{p.text}</div>
          </div>
        );
      })}
      <Caption delay={130}>
        Un projet regroupe <Hl color={C.yellow}>consignes</Hl>, <Hl color={C.teal}>documents</Hl> et{' '}
        <Hl color={C.blue}>conversations</Hl> au même endroit.
      </Caption>
    </Scene>
  );
};
