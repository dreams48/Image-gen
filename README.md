# Image-gen

## Okok sucré — motion design de 7,5 s

`output/okok_sucre.mp4` (1024×1536, 30 i/s, sans son) est entièrement fabriquée à partir de l'affiche `assets/reference.png` :
l'affiche est découpée en calques (papier vierge, fragments du collage, post-it rouges, encre du titre et du texte), chaque calque est animé, puis la dernière seconde affiche l'image d'origine telle quelle.

| Temps | Scène |
|---|---|
| 0–0,9 s | Papier blanc vierge |
| 0,9–3,75 s | 21 fragments du portrait arrivent en flottant (rotations 3D, flottement, ombres portées) et reforment le collage |
| 3,75–4,7 s | Les trois post-it se posent, puis leur texte s'écrit à l'encre |
| 4,7–6,55 s | « Okok sucré » s'écrit à la main, le texte du bas apparaît mot par mot, « Ange » grossit jusqu'à 110 % puis revient à 100 % |
| 6,55–7,5 s | Affiche finale fixe, identique pixel pour pixel à la référence |

```bash
pip install -r requirements.txt   # ffmpeg doit aussi être installé
python3 animate.py                # -> output/okok_sucre.mp4
python3 animate.py --preview      # quelques images fixes de contrôle
```
