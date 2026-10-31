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

## « Les instructions personnalisées dans Claude » : version WhatsApp 9:16 (41 s)

`output/instructions_claude_whatsapp_9x16.mp4` (1080×1920, H.264 + AAC, −16 LUFS) reprend la charte et la chaîne de production de la vidéo « Projets » : voix off HyperFrames (`ff_siwis`), sous-titres mot par mot, typographie cinétique, sons et fond crème/rouge/blanc/noir. Source : `remotion-showcase/src/instructions/` (composition `InstructionsWhatsApp`).

Éléments repris de la vidéo de référence :
- un déroulé « Je te montre » puis Étape 1 à 4, et le résultat ;
- un bandeau d'étape noir en haut, avec pastille numérotée rouge et points de progression ;
- un « doigt » rouge qui tape sur l'écran, avec une onde à chaque appui ;
- des écrans d'application filmés par une caméra qui zoome et s'incline ;
- une notification de confirmation (« Préférences enregistrées ✓ »).

| Scène | Contenu |
|---|---|
| Accroche | « Claude ne sait jamais qui tu es ? Un seul réglage change tout. » |
| Étape 1 | Clic sur les initiales → menu → Paramètres |
| Étape 2 | Profil → champ des préférences personnelles |
| Étape 3 | On écrit qui on est, ce qu'on fait, comment on veut les réponses (QUI / QUOI / COMMENT) |
| Étape 4 | Enregistrer → notification de confirmation |
| Résultat | Une nouvelle conversation où la réponse est adaptée |
| Conseil | Court et précis : 3 ou 4 phrases suffisent |
| Fin | Récapitulatif, puis « À toi de jouer ! » |

L'interface montrée est une maquette simplifiée : les libellés exacts de claude.ai peuvent légèrement différer.

```bash
cd remotion-showcase
npm run voiceover:instructions   # voix off (texte dans scripts/voiceover.py, liste INSTRUCTIONS)
npm run render:instructions      # -> ../output/instructions_claude_whatsapp_9x16.mp4
```

## Tutoriel web « Les 4D de l'IA » (Motion)

`web/4d-ia/index.html` est un tutoriel interactif sur le cadre AI Fluency d'Anthropic (Délégation, Description, Discernement, Diligence), animé avec [Motion](https://motion.dev) (`motion@11.11.13`, chargé depuis jsDelivr). Chaque étape propose un petit exercice :
- **Délégation** : répartir quatre tâches entre « Moi », « L'IA » et « Ensemble » ;
- **Description** : assembler un prompt avec les ingrédients Produit, Processus et Performance ;
- **Discernement** : repérer trois problèmes dans une réponse ;
- **Diligence** : cocher la liste de vérifications avant diffusion.

Le schéma final montre les 4D en boucle. La page fonctionne en clair et en sombre, au téléphone, et sans animation quand l'appareil le demande. Elle est publiée comme artifact claude.ai.

## Moteur à courant continu en 3D

`web/moteur-cc/index.html` présente un moteur à courant continu en coupe, en 3D avec Three.js (`three@0.128.0`). On le fait tourner à la souris ou au doigt. Un clic sur une pièce, ou sur sa pastille sous la vue, ouvre une feuille qui monte du bas de l'écran : rôle, fonctionnement, matériaux et une formule ou une idée à retenir. La page propose aussi une vue éclatée et la rotation de l'induit. Pièces : carcasse, pôles inducteurs, bobines inductrices, induit, conducteurs d'induit, collecteur, balais, arbre, flasques et roulements, boîte à bornes.

## Atelier de séparation (sérigraphie)

`web/separation/index.html` est une application web qui décompose une image en films pour la sérigraphie. On charge une image (bouton, glisser-déposer ou coller), on choisit un style et un textile, et on récupère les films.

| Style | Ce que fait l'appli | Films |
|---|---|---|
| Tons directs | Réduit l'image à 2–8 couleurs (k-moyennes en Lab), nettoie les petits îlots | Aplats aux contours lissés |
| Quadrichromie CMJN | Conversion CMJN avec remplacement par le noir (GCR) réglable | Trame ronde, angles 7,5° / 52,5° / 22,5° / 82,5° (décalés de 7,5° contre le moiré avec le tamis) |
| Quadri simulée | 3–10 encres opaques tirées de l'image, réparties en demi-teintes entre les deux encres les plus proches | Trame ronde à 22,5°, blanc de rehaut imprimé en dernier |
| Couleurs indexées | 3–12 couleurs, diffusion d'erreur (Floyd–Steinberg serpentin) | Pixels carrés de 100 à 300 ppi |

La taille de l'image fait référence : l'appli en déduit le format de film à utiliser (A4, A3 ou A3+, en portrait ou en paysage, sinon un rouleau), marges de 1,6 cm comprises. Le format apparaît sous les réglages, dans l'aperçu et dans la fiche d'impression.

Options communes : couleur du textile (la couleur la plus proche du textile peut être remplacée par le textile, ce qui économise un écran), sous-couche blanche rétrécie d'environ 0,2 mm avec flash sur textile foncé, retrait automatique d'un fond uni, largeur imprimée et résolution des films (150 à 360 dpi). La loupe montre une zone réelle de 2 × 2 cm du film, avec ses points de trame.

L'export ZIP contient :
- un PNG noir sur blanc par écran, numéroté dans l'ordre d'impression, avec la résolution inscrite dans le fichier (chunk pHYs), quatre repères de calage et une légende (couleur, trame, format) ;
- `apercu-impression.png`, le rendu simulé sur le textile ;
- `fiche-impression.txt` : ordre d'impression, couleurs, couverture, tamis conseillé (fils/cm) et conseils.

Tout le calcul se fait dans le navigateur ; seul JSZip (`jszip@3.10.1`, cdnjs) est chargé de l'extérieur. Publiée comme artifact claude.ai, la page enregistre le ZIP via la capacité `downloads` ; ouverte en fichier local, elle le télécharge directement.
