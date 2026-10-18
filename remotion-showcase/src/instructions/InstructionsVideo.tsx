import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Background, Wipe} from '../whatsapp/Background';
import {Captions} from '../whatsapp/Captions';
import {P} from '../whatsapp/theme';
import {Segment, makeTimeline} from '../whatsapp/timeline';
import {Progress} from '../whatsapp/WhatsAppVideo';
import {SCENES} from './scenes';
import vo from './voiceover.json';

// extra hold frames so the on-screen demos can finish after the sentence
const {timeline, total} = makeTimeline(vo.segments as Segment[], {open: 15, field: 15, write: 35, save: 25, result: 20});
export const INSTRUCTIONS_FRAMES = total;

export const InstructionsVideo: React.FC = () => (
  <AbsoluteFill style={{background: P.cream}}>
    <Background cuts={timeline.map((t) => t.from)} />
    <Audio
      src={staticFile('sfx/music.mp3')}
      volume={(f) => interpolate(f, [0, 20, total - 40, total], [0, 0.14, 0.14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    {timeline.map(({seg, from, duration}) => {
      const Scene = SCENES[seg.id];
      return (
        <Sequence key={seg.id} from={from} durationInFrames={duration}>
          <Audio src={staticFile(seg.file)} />
          <Scene seg={seg} />
          <Captions seg={seg} />
          <Wipe />
        </Sequence>
      );
    })}
    <Progress
      timeline={timeline}
      steps={['open', 'field', 'write', 'save']}
      labels={['PARAMÈTRES', 'PROFIL', 'ÉCRIRE', 'ENREGISTRER']}
      after={['result', 'tip', 'outro']}
      fontSize={34}
    />
  </AbsoluteFill>
);
