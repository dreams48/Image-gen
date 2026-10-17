import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {flip} from '@remotion/transitions/flip';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {AbsoluteFill} from 'remotion';
import {Intro} from './scenes/Intro';
import {Kinetic} from './scenes/Kinetic';
import {Shapes} from './scenes/Shapes';
import {DataViz} from './scenes/DataViz';
import {Workflow} from './scenes/Workflow';
import {Generative} from './scenes/Generative';
import {Outro} from './scenes/Outro';
import {C} from './theme';

const T = 20;
const SCENES = [150, 150, 150, 150, 180, 120, 165];
export const SHOWCASE_DURATION = SCENES.reduce((a, b) => a + b, 0) - T * (SCENES.length - 1);

export const Showcase: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES[0]}>
        <Intro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={springTiming({config: {damping: 200}, durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[1]}>
        <Kinetic />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({direction: 'from-bottom-left'})} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[2]}>
        <Shapes />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={flip({direction: 'from-left'})} timing={springTiming({config: {damping: 200}, durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[3]}>
        <DataViz />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={clockWipe({width: 1920, height: 1080})} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[4]}>
        <Workflow />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[5]}>
        <Generative />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={springTiming({config: {damping: 200}, durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[6]}>
        <Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
