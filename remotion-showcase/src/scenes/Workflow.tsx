import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {Background, SceneLabel} from '../components';
import {C, mono, sans} from '../theme';

type Node = {id: string; x: number; y: number; title: string; sub: string; color: string; delay: number};

const W = 380;
const H = 150;
const NODES: Node[] = [
  {id: 'trigger', x: 130, y: 430, title: 'Formulaire', sub: 'Déclencheur', color: C.yellow, delay: 0},
  {id: 'agent', x: 770, y: 430, title: 'Agent IA', sub: 'Claude · analyse', color: C.coral, delay: 14},
  {id: 'sheet', x: 1410, y: 250, title: 'Google Sheets', sub: 'Enregistre', color: C.teal, delay: 28},
  {id: 'mail', x: 1410, y: 610, title: 'E-mail', sub: 'Répond au client', color: C.blue, delay: 34},
];

const link = (a: Node, b: Node) => {
  const x1 = a.x + W;
  const y1 = a.y + H / 2;
  const x2 = b.x;
  const y2 = b.y + H / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
};

const LINKS = [
  {d: link(NODES[0], NODES[1]), delay: 20, color: C.yellow},
  {d: link(NODES[1], NODES[2]), delay: 40, color: C.teal},
  {d: link(NODES[1], NODES[3]), delay: 46, color: C.blue},
];

export const Workflow: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // The agent node "thinks": a pulsing halo while data flows through it.
  const pulse = (Math.sin(frame / 5) + 1) / 2;

  return (
    <AbsoluteFill>
      <Background tint={C.coral} />
      {/* dotted canvas, like a workflow editor */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.cream}22 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: `${-frame * 0.4}px 0px`,
        }}
      />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {LINKS.map((l, i) => {
          const p = interpolate(frame, [l.delay, l.delay + 25], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const ev = evolvePath(p, l.d);
          const len = getLength(l.d);
          return (
            <g key={i}>
              <path
                d={l.d}
                stroke={C.cream}
                strokeOpacity={0.5}
                strokeWidth={5}
                fill="none"
                strokeDasharray={ev.strokeDasharray}
                strokeDashoffset={ev.strokeDashoffset}
              />
              {/* data packets travelling along the connector */}
              {p >= 1 &&
                [0, 1, 2].map((k) => {
                  const t = ((frame - l.delay - 25 + k * 12) % 36) / 36;
                  if (t < 0) return null;
                  const pt = getPointAtLength(l.d, len * t);
                  if (!pt) return null;
                  return <circle key={k} cx={pt.x} cy={pt.y} r={11} fill={l.color} />;
                })}
            </g>
          );
        })}
      </svg>
      {NODES.map((n) => {
        const p = spring({frame: frame - n.delay, fps, config: {damping: 11}});
        const isAgent = n.id === 'agent';
        return (
          <div
            key={n.id}
            style={{
              position: 'absolute',
              left: n.x,
              top: n.y,
              width: W,
              height: H,
              borderRadius: 26,
              background: C.bg2,
              border: `3px solid ${n.color}`,
              boxShadow: isAgent && frame > 45 ? `0 0 ${30 + pulse * 50}px ${n.color}88` : `0 20px 40px #0008`,
              transform: `scale(${p})`,
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              padding: '0 28px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{width: 64, height: 64, borderRadius: 18, background: n.color, flexShrink: 0}} />
            <div>
              <div style={{fontFamily: sans, fontWeight: 800, fontSize: 32, color: C.cream, whiteSpace: 'nowrap'}}>{n.title}</div>
              <div style={{fontFamily: mono, fontSize: 22, color: C.muted, marginTop: 4}}>{n.sub}</div>
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          top: 110,
          width: '100%',
          textAlign: 'center',
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 60,
          color: C.cream,
          opacity: interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        Expliquer un workflow d'agent IA
      </div>
      <SceneLabel index="04" text="Schémas animés : nœuds, connexions et flux de données" />
    </AbsoluteFill>
  );
};
