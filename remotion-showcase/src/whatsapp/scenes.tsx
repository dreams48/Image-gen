import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Block, Drop, Rise, Slam, Tag, clamp, useSpr} from './kinetic';
import {P, body, display} from './theme';
import {Segment, wordAt} from './timeline';

type S = React.FC<{seg: Segment}>;

const Top: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 230}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {children}
  </div>
);

const Folder: React.FC<{size?: number}> = ({size = 300}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 260 208">
    <path d="M10 30 Q10 14 26 14 L96 14 L118 38 L234 38 Q250 38 250 54 L250 190 Q250 200 240 200 L20 200 Q10 200 10 190 Z" fill={P.black} />
    <rect x={40} y={24} width={180} height={120} rx={10} fill={P.white} stroke={P.black} strokeWidth={6} />
    <rect x={64} y={50} width={110} height={12} rx={6} fill={P.red} />
    <path d="M10 84 Q10 74 22 74 L238 74 Q250 74 250 86 L250 190 Q250 200 240 200 L20 200 Q10 200 10 190 Z" fill={P.red} stroke={P.black} strokeWidth={6} />
  </svg>
);

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: P.white,
      border: `5px solid ${P.black}`,
      borderRadius: 30,
      boxShadow: `12px 12px 0 ${P.black}`,
      padding: 34,
      boxSizing: 'border-box',
      fontFamily: body,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------- hook
export const Hook: S = ({seg}) => {
  const frame = useCurrentFrame();
  const bubbles = [wordAt(seg, 'chaque'), wordAt(seg, 'nouvelle'), wordAt(seg, 'conversation')];
  return (
    <AbsoluteFill>
      <Top top={190}>
        <Tag text="TUTO CLAUDE" />
        <div style={{height: 30}} />
        <Drop text="TU" at={wordAt(seg, 'Tu')} size={170} />
        <Slam text="RÉEXPLIQUES" at={wordAt(seg, 'réexpliques')} size={160} color={P.red} />
        <Block text="TOUT ?" at={wordAt(seg, 'tout')} size={150} bg={P.black} color={P.cream} />
      </Top>
      <div style={{position: 'absolute', top: 900, left: 90, right: 90}}>
        {bubbles.map((at, i) => {
          const s = useSpr(at, 12);
          const shake = frame > at + 6 ? Math.sin(frame / 1.6 + i) * 3 : 0;
          return (
            <div
              key={i}
              style={{
                marginLeft: i * 60,
                marginBottom: 22,
                width: 760,
                fontFamily: body,
                fontWeight: 600,
                fontSize: 36,
                color: P.black,
                background: P.white,
                border: `4px solid ${P.black}`,
                borderRadius: '30px 30px 30px 6px',
                padding: '18px 26px',
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-300, shake])}px) rotate(${(i - 1) * 1.5}deg)`,
              }}
            >
              « Je suis formateur, mon public est… »
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- solution
export const Solution: S = ({seg}) => {
  const p = wordAt(seg, 'Projets');
  const folder = useSpr(p - 4, 9);
  return (
    <AbsoluteFill>
      <Top top={220}>
        <Rise text="BONNE NOUVELLE" at={wordAt(seg, 'Bonne')} size={140} />
        <div style={{height: 20}} />
        <Block text="LA SOLUTION EXISTE" at={wordAt(seg, 'solution')} size={96} bg={P.black} color={P.cream} />
      </Top>
      <div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{transform: `scale(${folder}) rotate(${interpolate(folder, [0, 1], [-25, 4])}deg)`}}>
          <Folder size={300} />
        </div>
        <Slam text="LES PROJETS" at={p} size={190} color={P.red} style={{marginTop: 10}} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- concept
export const Concept: S = ({seg}) => (
  <AbsoluteFill>
    <Top top={220}>
      <Tag text="1 PROJET =" at={wordAt(seg, 'projet')} />
      <div style={{height: 26}} />
      <Rise text="UN ESPACE" at={wordAt(seg, 'espace')} size={150} />
      <Rise text="DE TRAVAIL" at={wordAt(seg, 'travail')} size={150} />
    </Top>
    <div style={{position: 'absolute', top: 820, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
      <Block text="INSTRUCTIONS" at={wordAt(seg, 'instructions')} size={110} bg={P.red} color={P.white} />
      <Block text="DOCUMENTS" at={wordAt(seg, 'documents')} size={110} bg={P.black} color={P.cream} />
      <Block text="CONVERSATIONS" at={wordAt(seg, 'conversations')} size={110} bg={P.white} color={P.black} />
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- step 1
export const Create: S = ({seg}) => {
  const frame = useCurrentFrame();
  const press = wordAt(seg, 'Nouveau');
  const name = wordAt(seg, 'nom');
  const card = useSpr(wordAt(seg, 'menu'), 14);
  const typed = 'Formation IA'.slice(0, Math.round(interpolate(frame, [name, name + 24], [0, 12], clamp)));
  return (
    <AbsoluteFill>
      <Top>
        <Tag text="ÉTAPE 01" />
        <div style={{height: 50}} />
        <Drop text="CRÉER" at={wordAt(seg, 'un')} size={260} color={P.red} />
      </Top>
      <div style={{position: 'absolute', top: 760, left: 110, right: 110, opacity: card, transform: `translateY(${(1 - card) * 120}px)`}}>
        <Card>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontWeight: 800, fontSize: 48}}>Projets</div>
            <div
              style={{
                background: P.red,
                color: P.white,
                fontWeight: 800,
                fontSize: 32,
                borderRadius: 18,
                padding: '14px 24px',
                border: `4px solid ${P.black}`,
                transform: `scale(${frame >= press && frame < press + 6 ? 0.9 : 1})`,
              }}
            >
              + Nouveau projet
            </div>
          </div>
          <div style={{marginTop: 34, fontSize: 28, color: '#6b6258'}}>Nom du projet</div>
          <div
            style={{
              marginTop: 10,
              border: `4px solid ${frame >= press ? P.red : P.black}`,
              borderRadius: 18,
              padding: '16px 22px',
              fontSize: 44,
              fontWeight: 600,
              minHeight: 56,
            }}
          >
            {typed}
            {frame >= press && Math.floor(frame / 12) % 2 === 0 && <span style={{color: P.red}}>|</span>}
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- step 2
export const Instruct: S = ({seg}) => {
  const tags = [
    {t: 'RÔLE', at: wordAt(seg, 'rôle'), bg: P.red, c: P.white},
    {t: 'PUBLIC', at: wordAt(seg, 'public'), bg: P.black, c: P.cream},
    {t: 'TON', at: wordAt(seg, 'ton', 2), bg: P.white, c: P.black},
    {t: 'FORMAT', at: wordAt(seg, 'format'), bg: P.red, c: P.white},
  ];
  return (
    <AbsoluteFill>
      <Top>
        <Tag text="ÉTAPE 02" />
        <div style={{height: 50}} />
        <Drop text="INSTRUIRE" at={wordAt(seg, 'écris')} size={200} stagger={1} />
      </Top>
      <div style={{position: 'absolute', top: 800, left: 100, right: 100, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34}}>
        {tags.map((g, i) => {
          const s = useSpr(g.at, 9);
          return (
            <div
              key={g.t}
              style={{
                height: 190,
                background: g.bg,
                border: `5px solid ${P.black}`,
                borderRadius: 30,
                boxShadow: `10px 10px 0 ${P.black}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: display,
                fontSize: 96,
                color: g.c,
                transform: `scale(${s}) rotate(${(i % 2 ? 3 : -3) * s}deg)`,
              }}
            >
              {g.t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- step 3
const FILES = [
  {n: 'programme.pdf', ext: 'PDF', bg: P.red, c: P.white},
  {n: 'exemples.docx', ext: 'DOC', bg: P.black, c: P.cream},
  {n: 'glossaire.md', ext: 'MD', bg: P.white, c: P.black},
];

export const Docs: S = ({seg}) => {
  const start = wordAt(seg, 'documents');
  const sticker = useSpr(wordAt(seg, 'chaque'), 10);
  return (
    <AbsoluteFill>
      <Top>
        <Tag text="ÉTAPE 03" />
        <div style={{height: 50}} />
        <Drop text="ALIMENTER" at={wordAt(seg, 'ajoute')} size={200} stagger={1} color={P.red} />
      </Top>
      <div style={{position: 'absolute', top: 740, left: 120, right: 120, display: 'flex', flexDirection: 'column', gap: 22}}>
        {FILES.map((f, i) => {
          const s = useSpr(start + i * 6, 12);
          return (
            <div
              key={f.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                background: P.white,
                border: `5px solid ${P.black}`,
                borderRadius: 26,
                boxShadow: `10px 10px 0 ${P.black}`,
                padding: '14px 26px',
                transform: `translateX(${interpolate(s, [0, 1], [900, 0])}px) rotate(${interpolate(s, [0, 1], [20, 0])}deg)`,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 96,
                  borderRadius: 14,
                  background: f.bg,
                  border: `4px solid ${P.black}`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 10,
                  boxSizing: 'border-box',
                  fontFamily: display,
                  fontSize: 32,
                  color: f.c,
                }}
              >
                {f.ext}
              </div>
              <div style={{fontFamily: body, fontWeight: 700, fontSize: 44, color: P.black}}>{f.n}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1225, right: 70, transform: `scale(${sticker}) rotate(-6deg)`}}>
        <Block text="DANS CHAQUE CONVERSATION" at={wordAt(seg, 'chaque')} size={56} bg={P.black} color={P.cream} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- step 4
const ANSWER = ['Séance 2 – 3 h', '1. Les ingrédients d’un bon prompt', '2. Démo avec tes exemples', '3. Exercice pratique'];

export const Chat: S = ({seg}) => {
  const frame = useCurrentFrame();
  const q = useSpr(wordAt(seg, 'discute') + 4, 12);
  const a = wordAt(seg, 'répond');
  const aSpr = useSpr(a, 12);
  return (
    <AbsoluteFill>
      <Top>
        <Tag text="ÉTAPE 04" />
        <div style={{height: 50}} />
        <Drop text="DISCUTER" at={wordAt(seg, 'discute')} size={220} />
      </Top>
      <div style={{position: 'absolute', top: 760, left: 90, right: 90}}>
        <div style={{display: 'flex', justifyContent: 'flex-end', opacity: q, transform: `translateY(${(1 - q) * 60}px)`}}>
          <div
            style={{
              background: P.black,
              color: P.cream,
              fontFamily: body,
              fontWeight: 700,
              fontSize: 40,
              borderRadius: '30px 30px 6px 30px',
              padding: '20px 30px',
            }}
          >
            Prépare la séance 2
          </div>
        </div>
        <div style={{marginTop: 26, opacity: aSpr, transform: `translateY(${(1 - aSpr) * 60}px)`}}>
          <Card style={{borderRadius: '30px 30px 30px 6px', padding: '26px 34px', width: 800}}>
            {ANSWER.map((l, i) => (
              <div
                key={l}
                style={{
                  fontSize: i === 0 ? 40 : 34,
                  fontWeight: i === 0 ? 800 : 600,
                  color: i === 0 ? P.red : P.black,
                  lineHeight: 1.5,
                  opacity: interpolate(frame, [a + 6 + i * 6, a + 12 + i * 6], [0, 1], clamp),
                }}
              >
                {l}
              </div>
            ))}
          </Card>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1170, right: 60}}>
        <Block text="DANS TON CONTEXTE" at={wordAt(seg, 'contexte')} size={64} style={{transform: 'rotate(-5deg)'}} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tip
export const Tip: S = ({seg}) => {
  const frame = useCurrentFrame();
  const words = [
    {t: 'UNE FORMATION', at: wordAt(seg, 'formation')},
    {t: 'UN CLIENT', at: wordAt(seg, 'client')},
    {t: 'UN COURS', at: wordAt(seg, 'cours')},
  ];
  const current = [...words].reverse().find((w) => frame >= w.at);
  return (
    <AbsoluteFill>
      <Top>
        <Tag text="MON CONSEIL" bg={P.red} color={P.white} />
        <div style={{height: 30}} />
        <Slam text="1 PROJET" at={wordAt(seg, 'projet')} size={210} />
        <Slam text="=" at={wordAt(seg, 'objectif') - 4} size={150} color={P.red} />
        <Slam text="1 OBJECTIF" at={wordAt(seg, 'objectif')} size={210} color={P.red} />
      </Top>
      <div style={{position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        {current && <Block key={current.t} text={current.t} at={current.at} size={110} bg={P.black} color={P.cream} />}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- outro
export const Outro: S = ({seg}) => {
  const frame = useCurrentFrame();
  const verbs = [
    {t: 'CRÉER', c: P.black},
    {t: 'INSTRUIRE', c: P.red},
    {t: 'ALIMENTER', c: P.black},
    {t: 'DISCUTER', c: P.red},
  ];
  const finale = wordAt(seg, 'À');
  const grow = interpolate(frame, [finale - 4, finale + 10], [0, 1], {...clamp});
  return (
    <AbsoluteFill>
      <Top top={260}>
        {verbs.map((v) => (
          <Slam key={v.t} text={v.t} at={wordAt(seg, v.t.toLowerCase() === 'créer' ? 'Créer' : v.t.toLowerCase())} size={190} color={v.c} />
        ))}
      </Top>
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
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, S> = {
  hook: Hook,
  solution: Solution,
  concept: Concept,
  create: Create,
  instruct: Instruct,
  docs: Docs,
  chat: Chat,
  tip: Tip,
  outro: Outro,
};
