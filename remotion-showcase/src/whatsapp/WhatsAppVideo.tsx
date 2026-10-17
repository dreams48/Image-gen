import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Background, Wipe} from './Background';
import {Captions} from './Captions';
import {SCENES} from './scenes';
import {P, display} from './theme';
import {TIMELINE, TOTAL_FRAMES} from './timeline';

const STEPS = ['create', 'instruct', 'docs', 'chat'];
const LABELS = ['CRÉER', 'INSTRUIRE', 'ALIMENTER', 'DISCUTER'];

// Black strip with the 4 steps; the current one turns red.
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const currentId = [...TIMELINE].reverse().find((t) => frame >= t.from)?.seg.id ?? '';
  const idx = STEPS.indexOf(currentId);
  const done = ['tip', 'outro'].includes(currentId) ? 4 : idx;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 1650,
        height: 100,
        background: P.black,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 30px',
      }}
    >
      {LABELS.map((l, i) => (
        <div
          key={l}
          style={{
            fontFamily: display,
            fontSize: 38,
            letterSpacing: 2,
            color: i === idx ? P.red : i < done ? P.cream : '#5a5048',
            transform: `scale(${i === idx ? 1.15 : 1})`,
          }}
        >
          0{i + 1} {l}
        </div>
      ))}
    </div>
  );
};

export const WhatsAppVideo: React.FC = () => (
  <AbsoluteFill style={{background: P.cream}}>
    <Background />
    {/* music bed, faded in/out, kept well under the voice */}
    <Audio
      src={staticFile('sfx/music.mp3')}
      volume={(f) => interpolate(f, [0, 20, TOTAL_FRAMES - 40, TOTAL_FRAMES], [0, 0.14, 0.14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    {TIMELINE.map(({seg, from, duration}) => {
      const Scene = SCENES[seg.id];
      return (
        <Sequence key={seg.id} from={from} durationInFrames={duration}>
          <Audio src={staticFile(seg.file)} volume={1} />
          <Scene seg={seg} />
          <Captions seg={seg} />
          <Wipe />
        </Sequence>
      );
    })}
    <Progress />
  </AbsoluteFill>
);
