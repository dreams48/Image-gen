import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {Intro} from './Intro';
import {Problem} from './Problem';
import {Concept} from './Concept';
import {StepChat, StepCreate, StepInstructions, StepKnowledge} from './Steps';
import {Outro, Share, Tips} from './Wrap';

const T = 15;
const SCENES: [React.FC, number][] = [
  [Intro, 150],
  [Problem, 270],
  [Concept, 270],
  [StepCreate, 300],
  [StepInstructions, 300],
  [StepKnowledge, 270],
  [StepChat, 330],
  [Share, 240],
  [Tips, 300],
  [Outro, 210],
];
export const PROJETS_DURATION = SCENES.reduce((a, [, d]) => a + d, 0) - T * (SCENES.length - 1);

export const ProjetsVideo: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <TransitionSeries>
      {SCENES.flatMap(([Comp, d], i) => [
        ...(i > 0
          ? [
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={i % 2 ? slide({direction: 'from-right'}) : fade()}
                timing={i % 2 ? springTiming({config: {damping: 200}, durationInFrames: T}) : linearTiming({durationInFrames: T})}
              />,
            ]
          : []),
        <TransitionSeries.Sequence key={`s${i}`} durationInFrames={d}>
          <Comp />
        </TransitionSeries.Sequence>,
      ])}
    </TransitionSeries>
  </AbsoluteFill>
);
