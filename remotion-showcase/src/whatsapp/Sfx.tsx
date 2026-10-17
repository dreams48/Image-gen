import {Audio, Sequence, staticFile} from 'remotion';

export type SfxName = 'whoosh' | 'impact' | 'pop' | 'swish' | 'tick' | 'click' | 'typing' | 'ding';

// Plays a synthesised sound effect (see scripts/sfx.py) at frame `at` of the current sequence.
export const Sfx: React.FC<{name: SfxName; at: number; volume?: number}> = ({name, at, volume = 0.4}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={60} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
