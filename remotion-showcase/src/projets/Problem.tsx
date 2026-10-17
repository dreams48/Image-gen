import {interpolate, useCurrentFrame} from 'remotion';
import {C, mono, sans} from '../theme';
import {Caption, Hl, Scene, StepHeader, Typewriter, clamp, useSpring} from './ui';

const REPEAT = 'Je suis formateur en IA. Mon public : des débutants. Voici mon programme…';

const ChatCard: React.FC<{i: number; delay: number}> = ({i, delay}) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, 16);
  const shake = frame > delay + 60 ? Math.sin(frame / 2) * interpolate(frame, [delay + 60, delay + 75], [4, 0], clamp) : 0;
  return (
    <div
      style={{
        width: 500,
        borderRadius: 24,
        background: C.bg2,
        border: `2px solid ${C.cream}1f`,
        padding: 28,
        boxSizing: 'border-box',
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px) translateX(${shake}px)`,
        boxShadow: '0 30px 60px #0008',
      }}
    >
      <div style={{fontFamily: mono, fontSize: 22, color: C.muted, marginBottom: 18}}>Conversation {i}</div>
      <div
        style={{
          fontFamily: sans,
          fontSize: 28,
          lineHeight: 1.4,
          color: C.cream,
          background: `${C.coral}26`,
          borderRadius: 18,
          padding: '16px 20px',
          minHeight: 160,
        }}
      >
        <Typewriter text={REPEAT} start={delay + 8} duration={50} cursor={false} />
      </div>
    </div>
  );
};

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const badge = useSpring(170, 10);
  return (
    <Scene tint={C.pink}>
      <StepHeader step="LE PROBLÈME" title="Sans projet, on se répète" color={C.pink} />
      <div style={{position: 'absolute', top: 360, left: 110, right: 110, display: 'flex', justifyContent: 'space-between'}}>
        <ChatCard i={1} delay={10} />
        <ChatCard i={2} delay={60} />
        <ChatCard i={3} delay={110} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 250,
          transform: `scale(${badge}) rotate(-8deg)`,
          background: C.pink,
          color: C.bg,
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 40,
          padding: '12px 28px',
          borderRadius: 40,
          opacity: frame > 165 ? 1 : 0,
        }}
      >
        Encore !
      </div>
      <Caption delay={20}>
        Chaque nouvelle conversation <Hl color={C.pink}>repart de zéro</Hl> : il faut tout réexpliquer.
      </Caption>
    </Scene>
  );
};
