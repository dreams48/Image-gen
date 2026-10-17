# Image-gen

## Okok sucré — motion design de 6,3 s

`output/okok_sucre.mp4` (1024×1536, 30 i/s, sans son) est entièrement fabriquée à partir de l'affiche `assets/reference.png` :
l'affiche est découpée en calques (papier vierge, fragments du collage, post-it rouges, encre du titre et du texte), chaque calque est animé, puis la dernière seconde affiche l'image d'origine telle quelle.

| Temps | Scène |
|---|---|
| 0–0,4 s | Papier blanc vierge |
| 0,4–2,6 s | 21 fragments du portrait arrivent en flottant (rotations 3D, flottement, ombres portées) et reforment le collage |
| 2,6–3,55 s | Les trois post-it se posent, puis leur texte s'écrit à l'encre |
| 3,55–5,4 s | « Okok sucré » s'écrit à la main, le texte du bas apparaît mot par mot, « Ange » grossit jusqu'à 110 % puis revient à 100 % |
| 5,4–6,35 s | Affiche finale fixe, identique pixel pour pixel à la référence |

```bash
pip install -r requirements.txt   # ffmpeg doit aussi être installé
python3 animate.py                # -> output/okok_sucre.mp4
python3 animate.py --preview      # quelques images fixes de contrôle
```

## Claude × Remotion — démonstration de motion design (31,5 s)

`output/claude_motion_showcase.mp4` (1920×1080, 30 i/s, sans son) est entièrement codée en React avec [Remotion](https://www.remotion.dev) dans `remotion-showcase/`. Chaque scène montre une technique différente, et chaque passage d'une scène à l'autre utilise une transition différente (glissement, volet, retournement 3D, volet horaire, fondu).

| Temps | Scène | Technique |
|---|---|---|
| 0–5 s | Intro « Claude » | Étoile qui se déploie rayon par rayon, lettres en ressort, espacement qui se resserre |
| 5–9,3 s | « Animer. Raconter. Expliquer. » | Typographie cinétique : masque, brouillage de lettres, échelle élastique + soulignement |
| 9,3–13,7 s | Formes | Morphing cercle → étoile → triangle → hexagone, tracé SVG qui se dessine, balles qui rebondissent |
| 13,7–18 s | Données | Barres, anneau et compteur animés (chiffres d'exemple) |
| 18–23,3 s | Workflow d'agent IA | Nœuds façon n8n, connexions qui se tracent, paquets de données qui circulent |
| 23,3–26,3 s | Génératif | 576 points animés par une seule formule d'onde |
| 26,3–31,5 s | Outro | Code tapé à l'écran, « Tout ceci est du code. » |

```bash
cd remotion-showcase
npm install
npm run studio   # aperçu interactif dans le navigateur
npm run render   # -> ../output/claude_motion_showcase.mp4
```

## Tutoriel « Les Projets dans Claude » (1 min 23)

`output/projets_claude_tutoriel.mp4` (1920×1080, 30 i/s, sans son) explique, avec des sous-titres à l'écran, comment utiliser les Projets dans Claude. Source : `remotion-showcase/src/projets/` (composition `ProjetsClaude`). L'interface montrée est une maquette simplifiée, pas une capture de claude.ai.

| Temps | Scène |
|---|---|
| 0–5 s | Titre |
| 5–13,5 s | Le problème : sans projet, chaque conversation repart de zéro |
| 13,5–22 s | La solution : instructions + connaissances + conversations |
| 22–31,5 s | Étape 1 : créer le projet (nom, description) |
| 31,5–41 s | Étape 2 : instructions du projet (rôle, public, ton, format) |
| 41–49,5 s | Étape 3 : ajouter des documents de référence |
| 49,5–60 s | Étape 4 : discuter dans le projet |
| 60–67,5 s | Bonus : partage en équipe (offres Team et Enterprise) |
| 67,5–77 s | 3 bonnes pratiques |
| 77–83,5 s | Récapitulatif : Créer → Instruire → Alimenter → Discuter |

```bash
cd remotion-showcase
npm run render:projets   # -> ../output/projets_claude_tutoriel.mp4
```

## « Les Projets dans Claude » : version WhatsApp 9:16 (47 s)

`output/projets_claude_whatsapp_9x16.mp4` (1080×1920, 30 i/s, H.264 + AAC, moins de 60 s) est le même tutoriel au format vertical, pour les statuts et les discussions WhatsApp. Source : `remotion-showcase/src/whatsapp/` (composition `ProjetsWhatsApp`).

- **Voix off** générée avec [HyperFrames](https://www.npmjs.com/package/hyperframes) : `hyperframes tts` (modèle local Kokoro-82M, voix française `ff_siwis`), puis `hyperframes transcribe` (Whisper, en français) pour le minutage de chaque mot. Le script `scripts/voiceover.py` recale ces minutages sur le texte exact du script et les enregistre dans `src/whatsapp/voiceover.json`.
- **Sons** fabriqués en code par `scripts/sfx.py` (numpy, aucun fichier externe, donc aucun souci de droits) : « whoosh » à chaque changement de scène, impact sous les mots qui tombent, pops, petits balayages, tic des étiquettes, clic et frappe au clavier à l'étape 1, carillon final, et une musique de fond légère (104 BPM) gardée bien en dessous de la voix.
- **Mixage** : volume final à −16 LUFS, pic à −1,5 dB.
- **Sous-titres** synchronisés mot par mot : le mot prononcé passe en rouge.
- **Typographie cinétique** (police Anton) calée sur le mot prononcé.
- **Fond animé** crème, rouge, blanc et noir (cible 60/20/10/10).

```bash
cd remotion-showcase
pip install kokoro-onnx soundfile numpy
npm run voiceover        # voix off HyperFrames (texte dans scripts/voiceover.py)
npm run sfx              # effets sonores et musique
npm run render:whatsapp  # -> ../output/projets_claude_whatsapp_9x16.mp4 (mixage à -16 LUFS inclus)
```
