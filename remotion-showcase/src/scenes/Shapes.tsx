import {AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {evolvePath, getLength, getPointAtLength, interpolatePath, translatePath} from '@remotion/paths';
import {makeCircle, makePolygon, makeStar, makeTriangle} from '@remotion/shapes';
import {Background, SceneLabel} from '../components';
import {C, sans} from '../theme';

const centered = (s: {path: string; width: number; height: number}, cx: number, cy: number) =>
  translatePath(s.path, cx - s.width / 2, cy - s.height / 2);

const CX = 520;
const CY = 500;
const MORPHS = [
  centered(makeCircle({radius: 190}), CX, CY),
  centered(makeStar({points: 5, innerRadius: 85, outerRadius: 210, cornerRadius: 12}), CX, CY),
  centered(makeTriangle({length: 380, direction: 'up', cornerRadius: 20}), CX, CY + 20),
  centered(makePolygon({points: 6, radius: 200, cornerRadius: 16}), CX, CY),
];
const MORPH_COLORS = [C.coral, C.yellow, C.teal, C.blue];

const WAVE = 'M 1000 640 C 1120 300, 1260 300, 1340 520 S 1560 760, 1660 420 S 1760 240, 1820 300';

export const Shapes: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Morph through the shape list, holding each one briefly.
  const step = 32;
  const seg = Math.min(Math.floor(frame / step), MORPHS.length - 2);
  const t = interpolate(frame - seg * step, [10, step], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const d = interpolatePath(t, MORPHS[seg], MORPHS[seg + 1]);
  const fill = interpolateColors(t, [0, 1], [MORPH_COLORS[seg], MORPH_COLORS[seg + 1]]);
  const appear = spring({frame, fps, config: {damping: 10}});
  const spin = interpolate(frame, [0, 150], [0, 90]);

  // Self-drawing line with a dot riding on it.
  const draw = interpolate(frame, [15, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const {strokeDasharray, strokeDashoffset} = evolvePath(draw, WAVE);
  const pt = getPointAtLength(WAVE, getLength(WAVE) * draw) ?? {x: 1000, y: 640};

  return (
    <AbsoluteFill>
      <Background tint={C.teal} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g
          style={{
            transform: `rotate(${spin}deg) scale(${appear})`,
            transformOrigin: `${CX}px ${CY}px`,
          }}
        >
          <path d={d} fill={fill} />
        </g>
        <path d={WAVE} stroke={C.cream} strokeOpacity={0.12} strokeWidth={10} fill="none" strokeLinecap="round" />
        <path
          d={WAVE}
          stroke={C.cream}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
        <circle cx={pt.x} cy={pt.y} r={22 * Math.min(1, draw * 10)} fill={C.coral} />
        <circle cx={pt.x} cy={pt.y} r={40 * Math.min(1, draw * 10)} fill={C.coral} opacity={0.25} />
        {/* Bouncing balls: spring physics with low damping. */}
        {[C.coral, C.yellow, C.teal, C.blue, C.pink].map((col, i) => {
          const b = spring({frame: frame - 20 - i * 6, fps, config: {damping: 6, mass: 0.8}});
          return (
            <circle key={col} cx={1060 + i * 150} cy={interpolate(b, [0, 1], [-80, 860])} r={30} fill={col} />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: CX - 300,
          width: 600,
          top: 780,
          textAlign: 'center',
          fontFamily: sans,
          fontSize: 30,
          color: C.muted,
        }}
      >
        Morphing de formes
      </div>
      <SceneLabel index="02" text="Formes, tracés SVG qui se dessinent, physique de ressort" color={C.teal} />
    </AbsoluteFill>
  );
};
