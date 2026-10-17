# Image-gen

## Okok sucré — motion design de 8 s

`output/okok_sucre.mp4` (1024×1536, 30 i/s, son stéréo) est entièrement fabriquée à partir de l'affiche `assets/reference.png` :
l'affiche est découpée en calques (papier vierge, fragments du collage, post-it rouges, encre du titre et du texte), chaque calque est animé, puis la dernière seconde affiche l'image d'origine telle quelle.

| Temps | Scène |
|---|---|
| 0–1 s | Papier blanc vierge |
| 1–4 s | 21 fragments du portrait arrivent en flottant (rotations 3D, flottement, ombres portées) et reforment le collage |
| 4–5 s | Les trois post-it se posent, puis leur texte s'écrit à l'encre |
| 5–7 s | « Okok sucré » s'écrit à la main, le texte du bas apparaît mot par mot, « Ange » grossit jusqu'à 110 % puis revient à 100 % |
| 7–8 s | Affiche finale fixe, identique pixel pour pixel à la référence |

Le son (papier qui flotte, souffles, petits impacts, grattement de plume, « pop » grave sur « Ange ») est synthétisé par `sound.py`. Pas de musique ni de voix.

```bash
pip install -r requirements.txt   # ffmpeg doit aussi être installé
python3 animate.py                # -> output/okok_sucre.mp4
python3 animate.py --preview      # quelques images fixes de contrôle
```
