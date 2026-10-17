import {Composition} from 'remotion';
import {Showcase, SHOWCASE_DURATION} from './Showcase';
import {ProjetsVideo, PROJETS_DURATION} from './projets/ProjetsVideo';

export const Root: React.FC = () => (
  <>
  <Composition
    id="ClaudeShowcase"
    component={Showcase}
    durationInFrames={SHOWCASE_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
  <Composition
    id="ProjetsClaude"
    component={ProjetsVideo}
    durationInFrames={PROJETS_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
  </>
);
