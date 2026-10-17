import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Block, Drop, Rise, Slam, clamp, useSpr} from '../whatsapp/kinetic';
import {Sfx} from '../whatsapp/Sfx';
import {P, body, display} from '../whatsapp/theme';
import {Segment, wordAt} from '../whatsapp/timeline';
import {Camera, STAGE, Screen, StepPill, Tap, Toast, typed} from './ui';

type S = React.FC<{seg: Segment}>;

// Big kinetic word(s) under the pill.
const Title: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 290}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {children}
  </div>
);

// Shows `children` only between two frames (used to swap kinetic titles).
const Between: React.FC<{from: number; to?: number; children: React.ReactNode}> = ({from, to = Infinity, children}) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <>{children}</> : null;
};

const Bubble: React.FC<{text: string; at: number; side?: 'left' | 'right'; style?: React.CSSProperties}> = ({
  text,
  at,
  side = 'left',
  style,
}) => {
  const s = useSpr(at, 12);
  const mine = side === 'right';
  return (
    <div style={{display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', ...style}}>
      <div
        style={{
          maxWidth: 640,
          fontFamily: body,
          fontWeight: 600,
          fontSize: 36,
          lineHeight: 1.35,
          color: mine ? P.cream : P.black,
          background: mine ? P.black : P.white,
          border: `4px solid ${P.black}`,
          borderRadius: mine ? '30px 30px 6px 30px' : '30px 30px 30px 6px',
          padding: '18px 26px',
          opacity: s,
          transform: `translateY(${(1 - s) * 50}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        }}
      >
        {text}
      </div>
      <Sfx name="pop" at={at} volume={0.4} />
    </div>
  );
};

// ================================================================== hook
export const Hook: S = ({seg}) => {
  const frame = useCurrentFrame();
  const un = wordAt(seg, 'Un');
  const questions = ['Quel est ton niveau ?', "C'est pour quel public ?", 'Tu veux quel format ?'];
  const fall = interpolate(frame, [un, un + 14], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <StepPill title="Les instructions personnalisées" />
      <Title>
        <Between from={0} to={un}>
          <Rise text="CLAUDE NE SAIT" at={wordAt(seg, 'Claude')} size={120} />
          <Rise text="JAMAIS QUI TU ES ?" at={wordAt(seg, 'jamais')} size={110} color={P.red} />
        </Between>
        <Between from={un}>
          <Slam text="1 SEUL RÉGLAGE" at={wordAt(seg, 'réglage')} size={140} color={P.red} />
          <Block text="CHANGE TOUT" at={wordAt(seg, 'change')} size={100} bg={P.black} color={P.cream} />
        </Between>
      </Title>
      <div style={{position: 'absolute', top: STAGE.top + 80, left: 110, right: 110}}>
        {questions.map((q, i) => (
          <div key={q} style={{opacity: 1 - fall, transform: `translateY(${fall * (500 + i * 120)}px) rotate(${fall * (i - 1) * 25}deg)`}}>
            <Bubble text={q} at={8 + i * 14} side="left" style={{marginBottom: 26, marginLeft: i * 50}} />
          </div>
        ))}
      </div>
      <Between from={wordAt(seg, 'montre') - 4}>
        <div style={{position: 'absolute', top: STAGE.top + 230, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Drop text="JE TE MONTRE" at={wordAt(seg, 'montre') - 4} size={120} />
        </div>
      </Between>
    </AbsoluteFill>
  );
};

// ================================================================== step 1
const MENU = ['Paramètres', 'Langue', 'Aide', 'Se déconnecter'];

export const Open: S = ({seg}) => {
  const frame = useCurrentFrame();
  const ini = wordAt(seg, 'initiales');
  const par = wordAt(seg, 'Paramètres');
  const menu = useSpr(ini + 4, 13);
  return (
    <AbsoluteFill>
      <StepPill badge="1" title="Ouvre les Paramètres" step={0} />
      <Title>
        <Between from={0} to={par}>
          <Rise text="TES INITIALES" at={ini} size={130} />
        </Between>
        <Between from={par}>
          <Slam text="PARAMÈTRES" at={par} size={150} color={P.red} />
        </Between>
      </Title>
      <Camera
        shots={[
          {f: 0, x: 450, y: 400, zoom: 1, rx: 10, ry: -8},
          {f: ini - 8, x: 450, y: 400, zoom: 1, rx: 0, ry: 0},
          {f: ini + 4, x: 230, y: 560, zoom: 1.45},
          {f: par + 20, x: 250, y: 520, zoom: 1.55},
        ]}
      >
        <Screen>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 150, background: P.cream, borderRight: `3px solid ${P.black}22`}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{position: 'absolute', left: 45, top: 40 + i * 80, width: 60, height: 60, borderRadius: 16, background: `${P.black}${i ? '22' : 'dd'}`}} />
            ))}
            <div
              style={{
                position: 'absolute',
                left: 35,
                top: 620,
                width: 80,
                height: 80,
                borderRadius: 40,
                background: P.red,
                color: P.white,
                fontWeight: 800,
                fontSize: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              AM
            </div>
          </div>
          <div style={{position: 'absolute', left: 200, top: 180, fontWeight: 800, fontSize: 60}}>Bonjour Alex</div>
          <div
            style={{
              position: 'absolute',
              left: 200,
              top: 300,
              width: 580,
              height: 120,
              border: `4px solid ${P.black}`,
              borderRadius: 26,
              padding: 26,
              boxSizing: 'border-box',
              fontSize: 30,
              color: '#8a8178',
            }}
          >
            Comment puis-je t'aider ?
          </div>
          {frame >= ini + 4 && (
            <div
              style={{
                position: 'absolute',
                left: 40,
                top: 360,
                width: 360,
                background: P.white,
                border: `4px solid ${P.black}`,
                borderRadius: 24,
                boxShadow: `8px 8px 0 ${P.black}`,
                padding: 10,
                transformOrigin: '20% 100%',
                transform: `scale(${menu})`,
              }}
            >
              {MENU.map((m, i) => (
                <div
                  key={m}
                  style={{
                    fontSize: 32,
                    fontWeight: i === 0 ? 800 : 500,
                    padding: '12px 18px',
                    borderRadius: 14,
                    background: i === 0 && frame >= par ? P.red : 'transparent',
                    color: i === 0 && frame >= par ? P.white : P.black,
                  }}
                >
                  {m}
                </div>
              ))}
              <Sfx name="pop" at={ini + 4} volume={0.4} />
            </div>
          )}
        </Screen>
        <Tap
          path={[
            {f: 10, x: 640, y: 560},
            {f: ini, x: 105, y: 690},
            {f: par - 8, x: 105, y: 690},
            {f: par, x: 240, y: 420},
          ]}
          taps={[ini + 2, par + 1]}
        />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== step 2
const Field: React.FC<{label: string; value?: string; height?: number; focus?: boolean; children?: React.ReactNode}> = ({
  label,
  value,
  height = 70,
  focus,
  children,
}) => (
  <div style={{marginBottom: 22}}>
    <div style={{fontSize: 26, fontWeight: 600, color: '#6b6258', marginBottom: 8}}>{label}</div>
    <div
      style={{
        height,
        border: `4px solid ${focus ? P.red : `${P.black}44`}`,
        borderRadius: 18,
        padding: '14px 20px',
        boxSizing: 'border-box',
        fontSize: 32,
        fontWeight: 500,
        lineHeight: 1.4,
        overflow: 'hidden',
      }}
    >
      {value}
      {children}
    </div>
  </div>
);

const SettingsPage: React.FC<{focus?: boolean; text?: React.ReactNode; saveAt?: number}> = ({focus, text, saveAt}) => {
  const frame = useCurrentFrame();
  const pressed = saveAt !== undefined && frame >= saveAt && frame < saveAt + 6;
  const saved = saveAt !== undefined && frame >= saveAt;
  return (
    <Screen>
      <div style={{padding: '36px 44px'}}>
        <div style={{fontWeight: 800, fontSize: 48}}>Paramètres</div>
        <div style={{display: 'flex', gap: 14, marginTop: 20}}>
          {['Général', 'Compte', 'Confidentialité'].map((t, i) => (
            <div
              key={t}
              style={{
                fontSize: 26,
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: 30,
                background: i === 0 ? P.black : 'transparent',
                color: i === 0 ? P.cream : '#8a8178',
              }}
            >
              {t}
            </div>
          ))}
        </div>
        <div style={{fontWeight: 800, fontSize: 38, marginTop: 30, marginBottom: 16}}>Profil</div>
        <Field label="Nom complet" value="Alex Martin" />
        <Field label="Quelles préférences personnelles Claude doit-il prendre en compte ?" height={210} focus={focus}>
          {text}
        </Field>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              padding: '14px 30px',
              borderRadius: 18,
              border: `4px solid ${P.black}`,
              background: saved ? P.black : P.red,
              color: P.white,
              transform: `scale(${pressed ? 0.9 : 1})`,
            }}
          >
            {saved ? 'Enregistré' : 'Enregistrer'}
          </div>
        </div>
      </div>
    </Screen>
  );
};

export const FieldStep: S = ({seg}) => {
  const frame = useCurrentFrame();
  const prof = wordAt(seg, 'Profil');
  const pref = wordAt(seg, 'préférences');
  const tap = wordAt(seg, 'personnelles');
  return (
    <AbsoluteFill>
      <StepPill badge="2" title="Trouve tes préférences" step={1} />
      <Title>
        <Between from={0} to={pref}>
          <Rise text="PROFIL" at={prof} size={150} />
        </Between>
        <Between from={pref}>
          <Block text="PRÉFÉRENCES" at={pref} size={110} />
        </Between>
      </Title>
      <Camera
        shots={[
          {f: 0, x: 450, y: 400, zoom: 1, rx: 8, ry: 8},
          {f: prof - 6, x: 450, y: 400, zoom: 1, rx: 0, ry: 0},
          {f: prof + 8, x: 450, y: 330, zoom: 1.15},
          {f: pref, x: 450, y: 330, zoom: 1.15},
          {f: pref + 14, x: 450, y: 540, zoom: 1.15},
        ]}
      >
        <SettingsPage focus={frame >= tap + 1} />
        <Tap path={[{f: pref, x: 700, y: 760}, {f: tap, x: 450, y: 560}]} taps={[tap + 1]} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== step 3
const PARTS = [
  {word: 'qui', text: 'Je suis formateur en IA. '},
  {word: 'fais', text: "J'anime des ateliers pour débutants. "},
  {word: 'comment', text: 'Réponds simplement, avec des exemples concrets et des étapes numérotées.'},
];

export const Write: S = ({seg}) => {
  const frame = useCurrentFrame();
  const starts = PARTS.map((p) => wordAt(seg, p.word));
  const text = PARTS.map((p, i) => (
    <span key={i} style={{background: frame >= starts[i] && frame < starts[i] + 50 ? `${P.red}26` : 'transparent'}}>
      {typed(frame, p.text, starts[i], i === 2 ? 50 : 22)}
    </span>
  ));
  const cursor = Math.floor(frame / 10) % 2 === 0 ? <span style={{color: P.red}}>|</span> : null;
  return (
    <AbsoluteFill>
      <StepPill badge="3" title="Écris qui tu es" step={2} />
      <Title top={300}>
        <div style={{display: 'flex', gap: 22}}>
          <Block text="QUI" at={starts[0]} size={100} bg={P.red} color={P.white} />
          <Block text="QUOI" at={starts[1]} size={100} bg={P.black} color={P.cream} />
          <Block text="COMMENT" at={starts[2]} size={100} bg={P.white} color={P.black} />
        </div>
      </Title>
      <Camera
        shots={[
          {f: 0, x: 450, y: 540, zoom: 1.15},
          {f: starts[2], x: 450, y: 550, zoom: 1.15},
          {f: starts[2] + 60, x: 450, y: 560, zoom: 1.12},
        ]}
        swish={false}
      >
        <SettingsPage focus text={<>{text}{cursor}</>} />
      </Camera>
      {starts.map((s, i) => (
        <Sfx key={i} name="typing" at={s} volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};

// ================================================================== step 4
const FULL = PARTS.map((p) => p.text).join('');

export const Save: S = ({seg}) => {
  const save = wordAt(seg, 'enregistre');
  return (
    <AbsoluteFill>
      <StepPill badge="4" title="Enregistre" step={3} />
      <Title>
        <Slam text="C'EST TOUT !" at={wordAt(seg, "C'est")} size={150} color={P.red} />
      </Title>
      <Camera
        shots={[
          {f: 0, x: 450, y: 560, zoom: 1.12},
          {f: save - 4, x: 500, y: 620, zoom: 1.15},
          {f: save + 30, x: 450, y: 420, zoom: 1, rx: 6, ry: -6},
        ]}
      >
        <SettingsPage text={FULL} saveAt={save} />
        <Tap path={[{f: 0, x: 500, y: 660}, {f: save - 2, x: 730, y: 717}]} taps={[save]} />
      </Camera>
      <Toast text="Préférences enregistrées" at={save + 6} />
    </AbsoluteFill>
  );
};

// ================================================================== result
const ANSWER = [
  'Voici un atelier de 2 h pour débutants :',
  "1. Un prompt, c'est quoi ? (exemple concret)",
  "2. Les 4 ingrédients d'un bon prompt",
  '3. Exercice : améliorer 3 prompts',
];

export const Result: S = ({seg}) => {
  const frame = useCurrentFrame();
  const conv = wordAt(seg, 'nouvelle');
  const a = wordAt(seg, 'Claude');
  const ans = useSpr(a, 12);
  return (
    <AbsoluteFill>
      <StepPill badge="✓" title="Claude s'adapte à toi" step={4} />
      <Title>
        <Slam text="ET VOILÀ !" at={wordAt(seg, 'voilà')} size={150} />
      </Title>
      <Camera
        shots={[
          {f: 0, x: 450, y: 400, zoom: 1, rx: 6, ry: 10},
          {f: a, x: 450, y: 400, zoom: 1, rx: 0, ry: 0},
          {f: a + 80, x: 450, y: 430, zoom: 1.06, rx: -4, ry: -6},
        ]}
        swish={false}
      >
        <Screen>
          <div style={{padding: 34}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 26}}>
              <div style={{fontSize: 26, fontWeight: 700, color: '#8a8178', border: `3px solid ${P.black}22`, borderRadius: 30, padding: '8px 22px'}}>
                Nouvelle conversation
              </div>
            </div>
            <Bubble text="Prépare un atelier sur les prompts" at={conv} side="right" />
            <div
              style={{
                marginTop: 26,
                border: `4px solid ${P.black}`,
                borderRadius: '30px 30px 30px 6px',
                padding: '22px 28px',
                fontSize: 32,
                lineHeight: 1.5,
                opacity: ans,
                transform: `translateY(${(1 - ans) * 50}px)`,
              }}
            >
              {ANSWER.map((l, i) => (
                <div
                  key={l}
                  style={{
                    fontWeight: i === 0 ? 800 : 600,
                    color: i === 0 ? P.red : P.black,
                    opacity: interpolate(frame, [a + 6 + i * 7, a + 12 + i * 7], [0, 1], clamp),
                  }}
                >
                  {l}
                </div>
              ))}
              <Sfx name="pop" at={a} volume={0.4} />
            </div>
          </div>
        </Screen>
      </Camera>
      <div style={{position: 'absolute', top: STAGE.top + 650, right: 70, transform: 'rotate(-5deg)'}}>
        <Block text="ADAPTÉ À TOI" at={wordAt(seg, "s'adapte")} size={72} />
      </div>
    </AbsoluteFill>
  );
};

// ================================================================== tip
export const Tip: S = ({seg}) => {
  const frame = useCurrentFrame();
  const three = wordAt(seg, 'Trois');
  const good = useSpr(three, 12);
  const bad = useSpr(three + 8, 12);
  const cross = interpolate(frame, [three + 22, three + 30], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <StepPill badge="★" title="Mon conseil" />
      <Title>
        <div style={{display: 'flex', gap: 30, alignItems: 'baseline'}}>
          <Slam text="COURT" at={wordAt(seg, 'court')} size={150} />
          <Slam text="& PRÉCIS" at={wordAt(seg, 'précis')} size={150} color={P.red} />
        </div>
      </Title>
      <div style={{position: 'absolute', top: STAGE.top + 80, left: 90, right: 90, display: 'flex', gap: 40}}>
        <div
          style={{
            flex: 1,
            background: P.white,
            border: `5px solid ${P.black}`,
            borderRadius: 30,
            boxShadow: `12px 12px 0 ${P.black}`,
            padding: 30,
            transform: `scale(${good}) rotate(${-3 * good}deg)`,
          }}
        >
          <div style={{fontFamily: display, fontSize: 56, color: P.red, whiteSpace: 'nowrap'}}>✓ 3-4 PHRASES</div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{height: 22, borderRadius: 11, background: P.black, marginTop: 26, width: `${90 - i * 15}%`}} />
          ))}
          <Sfx name="pop" at={three} volume={0.45} />
        </div>
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: P.white,
            border: `5px solid ${P.black}`,
            borderRadius: 30,
            padding: 30,
            opacity: bad * 0.75,
            transform: `scale(${bad}) rotate(${3 * bad}deg)`,
          }}
        >
          <div style={{fontFamily: display, fontSize: 56, color: P.black, whiteSpace: 'nowrap'}}>✗ UN ROMAN</div>
          {new Array(9).fill(0).map((_, i) => (
            <div key={i} style={{height: 12, borderRadius: 6, background: `${P.black}66`, marginTop: 16, width: `${95 - (i % 3) * 12}%`}} />
          ))}
          <svg width="100%" height="100%" style={{position: 'absolute', left: 0, top: 0}} viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1={10} y1={10} x2={10 + 80 * cross} y2={10 + 80 * cross} stroke={P.red} strokeWidth={4} />
            <line x1={90} y1={10} x2={90 - 80 * cross} y2={10 + 80 * cross} stroke={P.red} strokeWidth={4} />
          </svg>
          <Sfx name="impact" at={three + 24} volume={0.35} />
        </div>
      </div>
      <div style={{position: 'absolute', top: STAGE.top + 560, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Block text="ÇA SUFFIT" at={wordAt(seg, 'suffisent')} size={90} bg={P.black} color={P.cream} />
      </div>
    </AbsoluteFill>
  );
};

// ================================================================== outro
export const Outro: S = ({seg}) => {
  const frame = useCurrentFrame();
  const finale = wordAt(seg, 'À');
  const grow = interpolate(frame, [finale - 4, finale + 10], [0, 1], clamp);
  const lines = [
    {t: 'QUI TU ES', at: wordAt(seg, 'Qui'), c: P.black},
    {t: 'CE QUE TU FAIS', at: wordAt(seg, 'ce'), c: P.red},
    {t: 'COMMENT TU VEUX', at: wordAt(seg, 'comment'), c: P.black},
    {t: 'TES RÉPONSES', at: wordAt(seg, 'réponses'), c: P.red},
  ];
  return (
    <AbsoluteFill>
      <Title top={330}>
        {lines.map((l) => (
          <Slam key={l.t} text={l.t} at={l.at} size={130} color={l.c} />
        ))}
      </Title>
      <Sfx name="whoosh" at={finale - 6} volume={0.5} />
      {grow > 0 && (
        <AbsoluteFill>
          <div
            style={{
              position: 'absolute',
              left: 540 - 1200 * grow,
              top: 900 - 1200 * grow,
              width: 2400 * grow,
              height: 2400 * grow,
              borderRadius: '50%',
              background: P.red,
            }}
          />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', top: -120}}>
            <Drop text="À TOI" at={finale + 2} size={250} color={P.white} />
            <Drop text="DE JOUER !" at={wordAt(seg, 'jouer') - 2} size={200} color={P.black} stagger={1} />
            <Sfx name="ding" at={wordAt(seg, 'jouer') + 6} volume={0.5} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, S> = {
  hook: Hook,
  open: Open,
  field: FieldStep,
  write: Write,
  save: Save,
  result: Result,
  tip: Tip,
  outro: Outro,
};
