import {Composition} from 'remotion';
import {Showcase, SHOWCASE_DURATION} from './Showcase';

export const Root: React.FC = () => (
  <Composition
    id="ClaudeShowcase"
    component={Showcase}
    durationInFrames={SHOWCASE_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
);
