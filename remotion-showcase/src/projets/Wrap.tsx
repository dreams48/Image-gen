import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, mono, sans, serif} from '../theme';
import {Folder} from './Intro';
import {Caption, Hl, Scene, StepHeader, clamp, useSpring} from './ui';

// ---------- Bonus : partage en équipe ----------
const PEOPLE = [
  {initials: 'AM', color: C.yellow, angle: -150, role: 'Peut modifier'},
  {initials: 'JK', color: C.teal, angle: -30, role: 'Peut utiliser'},
  {initials: 'SL', color: C.blue, angle: 90, role: 'Peut utiliser'},
];

export const Share: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 960;
  const cy = 560;
  const R = 330;
  return (
    <Scene tint={C.yellow}>
      <StepHeader step="BONUS" title="Travailler en équipe" color={C.yellow} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {PEOPLE.map((p, i) => {
          const a = (p.angle * Math.PI) / 180;
          const draw = interpolate(frame, [30 + i * 18, 50 + i * 18], [0, 1], clamp);
          return (
            <line
              key={p.initials}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(a) * R * draw}
              y2={cy + Math.sin(a) * R * 0.75 * draw}
              stroke={p.color}
              strokeWidth={4}
              strokeOpacity={0.6}
            />
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: cx - 130, top: cy - 104}}>
        <Folder open={1} />
      </div>
      {PEOPLE.map((p, i) => {
        const s = useSpring(40 + i * 18, 11);
        const a = (p.angle * Math.PI) / 180;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R * 0.75;
        return (
          <div
            key={p.initials}
            style={{
              position: 'absolute',
              left: x - 60,
              top: y - 60,
              width: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `scale(${s})`,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                background: p.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: sans,
                fontWeight: 800,
                fontSize: 42,
                color: C.bg,
              }}
            >
              {p.initials}
            </div>
            <div
              style={{
                marginTop: 12,
                whiteSpace: 'nowrap',
                fontFamily: mono,
                fontSize: 22,
                color: p.color,
                border: `2px solid ${p.color}`,
                borderRadius: 20,
                padding: '4px 14px',
              }}
            >
              {p.role}
            </div>
          </div>
        );
      })}
      <Caption delay={20}>
        Avec les offres <Hl color={C.yellow}>Team</Hl> et <Hl color={C.yellow}>Enterprise</Hl>, partagez un projet avec vos
        collègues.
      </Caption>
    </Scene>
  );
};

// ---------- Bonnes pratiques ----------
const TIPS = [
  {n: '1', title: 'Un projet = un objectif', text: 'Une formation, un client, un cours…', color: C.coral},
  {n: '2', title: 'Des instructions courtes', text: 'Précises plutôt qu’exhaustives', color: C.yellow},
  {n: '3', title: 'Des documents à jour', text: 'Retirez ce qui est obsolète', color: C.teal},
];

export const Tips: React.FC = () => (
  <Scene>
    <StepHeader step="BONNES PRATIQUES" title="3 réflexes à prendre" />
    <div style={{position: 'absolute', top: 300, left: 110, right: 110, display: 'flex', gap: 50}}>
      {TIPS.map((t, i) => {
        const s = useSpring(15 + i * 30, 13);
        return (
          <div
            key={t.n}
            style={{
              flex: 1,
              borderRadius: 28,
              background: C.bg2,
              borderTop: `10px solid ${t.color}`,
              padding: 40,
              boxSizing: 'border-box',
              height: 400,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [100, 0])}px)`,
              boxShadow: '0 30px 60px #0008',
            }}
          >
            <div style={{fontFamily: serif, fontWeight: 800, fontSize: 110, color: t.color, lineHeight: 1}}>{t.n}</div>
            <div style={{fontFamily: sans, fontWeight: 800, fontSize: 42, color: C.cream, marginTop: 30}}>{t.title}</div>
            <div style={{fontFamily: sans, fontSize: 30, color: C.muted, marginTop: 14}}>{t.text}</div>
          </div>
        );
      })}
    </div>
    <Caption delay={120}>
      Astuce : les conversations ne se lisent pas entre elles. Ce qui doit servir partout va dans les{' '}
      <Hl color={C.teal}>connaissances</Hl>.
    </Caption>
  </Scene>
);

// ---------- Récapitulatif ----------
const RECAP = [
  {label: 'Créer', color: C.coral},
  {label: 'Instruire', color: C.yellow},
  {label: 'Alimenter', color: C.teal},
  {label: 'Discuter', color: C.blue},
];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const end = useSpring(95, 12);
  const fadeOut = interpolate(frame, [190, 210], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      <Scene>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            {RECAP.map((r, i) => {
              const s = useSpring(5 + i * 15, 12);
              return (
                <div key={r.label} style={{display: 'flex', alignItems: 'center', gap: 20}}>
                  <div
                    style={{
                      transform: `scale(${s})`,
                      width: 250,
                      height: 150,
                      borderRadius: 26,
                      border: `4px solid ${r.color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: C.bg2,
                    }}
                  >
                    <div style={{fontFamily: mono, fontSize: 24, color: r.color}}>0{i + 1}</div>
                    <div style={{fontFamily: sans, fontWeight: 800, fontSize: 40, color: C.cream}}>{r.label}</div>
                  </div>
                  {i < RECAP.length - 1 && (
                    <div style={{fontFamily: sans, fontSize: 50, color: C.muted, opacity: s}}>→</div>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 90,
              fontFamily: serif,
              fontWeight: 800,
              fontSize: 110,
              color: C.cream,
              opacity: end,
              transform: `translateY(${interpolate(end, [0, 1], [50, 0])}px)`,
            }}
          >
            À vous de <span style={{color: C.coral}}>jouer</span> !
          </div>
        </AbsoluteFill>
      </Scene>
    </AbsoluteFill>
  );
};
