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
