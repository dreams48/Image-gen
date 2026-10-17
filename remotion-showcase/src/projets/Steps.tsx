import {interpolate, useCurrentFrame} from 'remotion';
import {C, mono, sans} from '../theme';
import {AppWindow, Caption, Hl, Pointer, Scene, SideItem, StepHeader, Typewriter, clamp, useSpring} from './ui';

const PROJECT = 'Formation IA – Débutants';

const Sidebar: React.FC<{projectsActive: boolean}> = ({projectsActive}) => (
  <>
    <SideItem label="Nouvelle conversation" icon="+" />
    <SideItem label="Conversations" icon="≡" />
    <SideItem label="Projets" icon="▣" active={projectsActive} />
  </>
);

const Field: React.FC<{label: string; children: React.ReactNode; focus?: boolean}> = ({label, children, focus}) => (
  <div style={{marginBottom: 18}}>
    <div style={{fontFamily: sans, fontSize: 22, color: C.muted, marginBottom: 8}}>{label}</div>
    <div
      style={{
        fontFamily: sans,
        fontSize: 30,
        color: C.cream,
        border: `2px solid ${focus ? C.coral : `${C.cream}26`}`,
        borderRadius: 14,
        padding: '14px 18px',
        minHeight: 40,
      }}
    >
      {children}
    </div>
  </div>
);

const Button: React.FC<{label: string; pressed?: boolean; style?: React.CSSProperties}> = ({label, pressed, style}) => (
  <div
    style={{
      display: 'inline-block',
      fontFamily: sans,
      fontWeight: 600,
      fontSize: 26,
      color: C.bg,
      background: C.coral,
      borderRadius: 14,
      padding: '14px 26px',
      transform: `scale(${pressed ? 0.94 : 1})`,
      ...style,
    }}
  >
    {label}
  </div>
);

// ---------- Étape 1 : créer le projet ----------
export const StepCreate: React.FC = () => {
  const frame = useCurrentFrame();
  const modal = useSpring(95, 16);
  const created = frame >= 225;
  return (
    <Scene>
      <StepHeader step="ÉTAPE 1" title="Créer le projet" />
      <AppWindow sidebar={<Sidebar projectsActive={frame >= 45} />}>
        <div style={{fontFamily: sans, fontWeight: 800, fontSize: 40, color: C.cream}}>
          {frame >= 45 ? 'Projets' : 'Bonjour !'}
        </div>
        {frame >= 45 && (
          <Button label="+ Nouveau projet" pressed={frame >= 85 && frame < 91} style={{position: 'absolute', right: 40, top: 34}} />
        )}
        {created && (
          <div
            style={{
              marginTop: 40,
              width: 460,
              borderRadius: 20,
              border: `2px solid ${C.coral}`,
              padding: 24,
              fontFamily: sans,
              transform: `scale(${interpolate(frame, [225, 240], [0.8, 1], clamp)})`,
            }}
          >
            <div style={{fontWeight: 800, fontSize: 30, color: C.cream}}>▣ {PROJECT}</div>
            <div style={{fontSize: 22, color: C.muted, marginTop: 6}}>Supports et exercices de formation</div>
          </div>
        )}
        {frame >= 95 && !created && (
          <div
            style={{
              position: 'absolute',
              left: 300,
              top: 80,
              width: 760,
              borderRadius: 24,
              background: C.bg,
              border: `2px solid ${C.cream}26`,
              padding: 30,
              boxSizing: 'border-box',
              boxShadow: '0 30px 60px #000a',
              opacity: modal,
              transform: `scale(${interpolate(modal, [0, 1], [0.9, 1])})`,
            }}
          >
            <div style={{fontFamily: sans, fontWeight: 800, fontSize: 34, color: C.cream, marginBottom: 24}}>
              Nouveau projet
            </div>
            <Field label="Nom" focus={frame < 160}>
              <Typewriter text={PROJECT} start={105} duration={40} cursor={frame < 160} />
            </Field>
            <Field label="Description (facultatif)" focus={frame >= 160}>
              <Typewriter text="Supports et exercices de formation" start={160} duration={35} cursor={frame >= 160} />
            </Field>
            <Button label="Créer le projet" pressed={frame >= 212 && frame < 218} style={{float: 'right'}} />
          </div>
        )}
      </AppWindow>
      <Pointer
        path={[
          {f: 15, x: 900, y: 700},
          {f: 40, x: 290, y: 430},
          {f: 60, x: 290, y: 430},
          {f: 82, x: 1560, y: 330},
          {f: 180, x: 1560, y: 330},
          {f: 208, x: 1420, y: 722},
          {f: 260, x: 1420, y: 722},
        ]}
        clicks={[40, 85, 212]}
      />
      <Caption delay={10}>
        Menu <Hl>Projets</Hl> → <Hl>Nouveau projet</Hl> : donnez-lui un nom clair et une courte description.
      </Caption>
    </Scene>
  );
};

// ---------- Étape 2 : instructions ----------
const INSTRUCTIONS = [
  'Tu es mon assistant pédagogique.',
  'Public : adultes débutants en IA.',
  'Ton : simple, concret et bienveillant.',
  'Format : étapes numérotées + un exercice pratique.',
];

export const StepInstructions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene tint={C.yellow}>
      <StepHeader step="ÉTAPE 2" title="Donner des instructions" color={C.yellow} />
      <AppWindow title={`claude.ai · ${PROJECT}`}>
        <div style={{fontFamily: sans, fontWeight: 800, fontSize: 36, color: C.yellow, marginBottom: 20}}>
          Instructions du projet
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 32,
            lineHeight: 1.7,
            color: C.cream,
            border: `2px solid ${C.yellow}`,
            borderRadius: 18,
            padding: '24px 30px',
            height: 340,
            boxSizing: 'border-box',
          }}
        >
          {INSTRUCTIONS.map((line, i) => (
            <div key={i}>
              <Typewriter text={line} start={20 + i * 45} duration={38} cursor={frame < 20 + (i + 1) * 45 && frame >= 20 + i * 45} />
            </div>
          ))}
        </div>
        {/* labels pointing at each kind of instruction */}
        {['rôle', 'public', 'ton', 'format'].map((tag, i) => {
          const s = useSpring(55 + i * 45, 12);
          return (
            <div
              key={tag}
              style={{
                position: 'absolute',
                right: 70,
                top: 134 + i * 54,
                fontFamily: sans,
                fontWeight: 800,
                fontSize: 22,
                color: C.bg,
                background: C.yellow,
                borderRadius: 20,
                padding: '4px 16px',
                transform: `scale(${s})`,
              }}
            >
              {tag}
            </div>
          );
        })}
      </AppWindow>
      <Caption delay={10}>
        Ces consignes s'appliquent à <Hl color={C.yellow}>toutes les conversations</Hl> du projet : rôle, public, ton,
        format.
      </Caption>
    </Scene>
  );
};

// ---------- Étape 3 : connaissances ----------
const FILES = [
  {name: 'programme_formation.pdf', ext: 'PDF', color: C.coral},
  {name: 'charte_graphique.docx', ext: 'DOC', color: C.blue},
  {name: 'exemples_prompts.md', ext: 'MD', color: C.teal},
  {name: 'glossaire_IA.txt', ext: 'TXT', color: C.yellow},
];

export const StepKnowledge: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [30, 190], [0, 0.34], clamp);
  return (
    <Scene tint={C.teal}>
      <StepHeader step="ÉTAPE 3" title="Ajouter vos documents" color={C.teal} />
      <AppWindow title={`claude.ai · ${PROJECT}`}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontFamily: sans, fontWeight: 800, fontSize: 36, color: C.teal}}>Connaissances du projet</div>
          <div style={{fontFamily: sans, fontWeight: 800, fontSize: 40, color: C.teal}}>+</div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 30}}>
          {FILES.map((f, i) => {
            const d = 25 + i * 40;
            const s = useSpring(d, 14);
            return (
              <div
                key={f.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  borderRadius: 18,
                  background: C.bg,
                  border: `2px solid ${C.cream}1f`,
                  padding: 20,
                  opacity: s,
                  transform: `translate(${interpolate(s, [0, 1], [400, 0])}px, ${interpolate(s, [0, 1], [-200, 0])}px) rotate(${interpolate(s, [0, 1], [12, 0])}deg)`,
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 90,
                    borderRadius: 10,
                    background: f.color,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: 10,
                    boxSizing: 'border-box',
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: 20,
                    color: C.bg,
                  }}
                >
                  {f.ext}
                </div>
                <div style={{fontFamily: mono, fontSize: 26, color: C.cream}}>{f.name}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 36, fontFamily: sans, fontSize: 22, color: C.muted}}>Capacité utilisée</div>
        <div style={{marginTop: 10, height: 16, borderRadius: 8, background: `${C.cream}1a`}}>
          <div style={{height: 16, borderRadius: 8, width: `${fill * 100}%`, background: C.teal}} />
        </div>
      </AppWindow>
      <Caption delay={10}>
        Déposez vos <Hl color={C.teal}>documents de référence</Hl> (PDF, Word, texte…) : Claude s'en sert dans chaque
        conversation.
      </Caption>
    </Scene>
  );
};

// ---------- Étape 4 : discuter ----------
const ANSWER = [
  "D'après votre programme, la séance 2 dure 3 h. Voici un déroulé :",
  '1. Les 4 ingrédients d’un bon prompt',
  '2. Démonstration avec vos exemples de prompts',
  '3. Exercice : réécrire 3 prompts trop vagues',
];

export const StepChat: React.FC = () => {
  const frame = useCurrentFrame();
  const user = useSpring(10, 16);
  const thinking = frame >= 70 && frame < 100;
  return (
    <Scene tint={C.blue}>
      <StepHeader step="ÉTAPE 4" title="Discuter dans le projet" color={C.blue} />
      <AppWindow
        title={`claude.ai · ${PROJECT}`}
        sidebar={
          <>
            <div style={{fontSize: 20, marginBottom: 14, letterSpacing: 2}}>CE PROJET</div>
            <SideItem label="Instructions ✓" icon="▣" />
            <SideItem label="4 documents ✓" icon="▣" />
            <SideItem label="Séance 2" icon="•" active />
          </>
        }
      >
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <div
            style={{
              maxWidth: 760,
              fontFamily: sans,
              fontSize: 30,
              color: C.cream,
              background: `${C.blue}33`,
              borderRadius: 22,
              padding: '16px 24px',
              opacity: user,
              transform: `translateY(${interpolate(user, [0, 1], [30, 0])}px)`,
            }}
          >
            <Typewriter text="Prépare la séance 2 : rédiger un bon prompt." start={15} duration={45} cursor={false} />
          </div>
        </div>
        {thinking && (
          <div style={{marginTop: 30, display: 'flex', gap: 10}}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: C.coral,
                  opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame - i * 4) / 6)),
                }}
              />
            ))}
          </div>
        )}
        {frame >= 100 && (
          <div style={{marginTop: 30, fontFamily: sans, fontSize: 29, lineHeight: 1.55, color: C.cream}}>
            {ANSWER.map((line, i) => {
              const o = interpolate(frame, [100 + i * 22, 112 + i * 22], [0, 1], clamp);
              return (
                <div key={i} style={{opacity: o, transform: `translateX(${(1 - o) * -20}px)`, fontWeight: i === 0 ? 400 : 600}}>
                  {line}
                </div>
              );
            })}
            <div
              style={{
                display: 'inline-block',
                marginTop: 20,
                fontFamily: mono,
                fontSize: 22,
                color: C.teal,
                border: `2px solid ${C.teal}`,
                borderRadius: 20,
                padding: '6px 16px',
                opacity: interpolate(frame, [200, 215], [0, 1], clamp),
              }}
            >
              ↳ s’appuie sur programme_formation.pdf
            </div>
          </div>
        )}
      </AppWindow>
      <Caption delay={150}>
        Résultat : Claude répond <Hl color={C.blue}>dans votre contexte</Hl>, sans que vous ayez à tout réexpliquer.
      </Caption>
    </Scene>
  );
};
