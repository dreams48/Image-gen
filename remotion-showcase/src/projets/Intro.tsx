import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, sans, serif} from '../theme';
import {Scene, clamp, useSpring} from './ui';

export const Folder: React.FC<{size?: number; open?: number; color?: string}> = ({
  size = 260,
  open = 0,
  color = C.coral,
}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 260 208">
    <path d="M10 30 Q10 14 26 14 L96 14 L118 38 L234 38 Q250 38 250 54 L250 190 Q250 200 240 200 L20 200 Q10 200 10 190 Z" fill={color} opacity={0.55} />
    {/* sheet sticking out when the folder opens */}
    <rect x={40} y={60 - open * 40} width={180} height={120} rx={10} fill={C.cream} />
    <rect x={64} y={84 - open * 40} width={110} height={10} rx={5} fill={C.muted} />
    <rect x={64} y={106 - open * 40} width={130} height={10} rx={5} fill={C.muted} opacity={0.6} />
    <path
      d={`M10 ${70 + open * 14} Q10 ${60 + open * 14} 22 ${60 + open * 14} L238 ${60 + open * 14} Q250 ${60 + open * 14} 250 ${72 + open * 14} L250 190 Q250 200 240 200 L20 200 Q10 200 10 190 Z`}
      fill={color}
    />
  </svg>
);

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const icon = useSpring(0, 12);
  const title = useSpring(18);
  const sub = useSpring(40);
  const open = interpolate(frame, [30, 60], [0, 1], clamp);
  return (
    <Scene>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{transform: `scale(${icon}) rotate(${interpolate(icon, [0, 1], [-15, 0])}deg)`}}>
          <Folder open={open} />
        </div>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 800,
            fontSize: 120,
            color: C.cream,
            marginTop: 30,
            opacity: title,
            transform: `translateY(${interpolate(title, [0, 1], [50, 0])}px)`,
          }}
        >
          Les <span style={{color: C.coral}}>Projets</span> dans Claude
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 42,
            color: C.muted,
            marginTop: 16,
            opacity: sub,
          }}
        >
          Organiser son travail avec l'IA, en 4 étapes
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
