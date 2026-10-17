"""Okok sucré - 8 s paper-collage motion design, rendered from the reference poster.

Every pixel of the animation comes from assets/reference.png: the poster is split into
layers (clean paper, collage fragments, sticky notes, ink/typography), each layer is
animated, and the last second holds the untouched reference image.

Usage: python3 animate.py [--preview]   -> output/okok_sucre.mp4 (6.35 s, silent)
"""
import argparse
import math
import os
import subprocess
import sys

import cv2
import numpy as np

FPS = 30
# The choreography below is written on an 8 s timeline; playback remaps it:
# a short blank page and a brisk assembly, then the notes and typography at 1.07x.
PLAYBACK = [0.0, 0.4, 2.6, 6.35]  # output time (s)
TIMELINE = [0.0, 1.0, 4.0, 8.0]   # timeline time (s)
DURATION = PLAYBACK[-1]
REF = os.path.join(os.path.dirname(__file__), "assets", "reference.png")
OUT_DIR = os.path.join(os.path.dirname(__file__), "output")
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- easing helpers
def clamp01(x):
    return min(1.0, max(0.0, x))


def ease_out_cubic(p):
    return 1 - (1 - p) ** 3


def ease_in_out_sine(p):
    return 0.5 - 0.5 * math.cos(math.pi * p)


def smoothstep(a, b, x):
    p = clamp01((x - a) / (b - a))
    return p * p * (3 - 2 * p)


def luma(img):
    return img[..., 0] * 0.114 + img[..., 1] * 0.587 + img[..., 2] * 0.299  # BGR


# ---------------------------------------------------------------- layer extraction
class Layers:
    def __init__(self, path):
        self.I0 = cv2.imread(path).astype(np.float32)
        H, W = self.I0.shape[:2]
        self.H, self.W = H, W
        yy, xx = np.mgrid[0:H, 0:W]
        L0 = luma(self.I0)

        # Clean paper plate: grain borrowed from the blank left margin, lighting from the real background.
        bg = np.median(self.I0[:, :60].reshape(-1, 3), 0)
        diff = np.abs(cv2.GaussianBlur(self.I0, (0, 0), 3) - bg).max(2)
        content = (diff > 9).astype(np.uint8)
        strip = self.I0[:, :90]
        cols = np.abs((np.arange(W) % 180) - 90).clip(0, 89)
        tex = strip[:, cols]
        tex = np.where((yy // 256 % 2 == 1)[..., None], tex[::-1], tex)
        bgmask = (cv2.dilate(content, np.ones((25, 25), np.uint8)) == 0).astype(np.float32)
        small = cv2.resize(self.I0, (W // 8, H // 8), interpolation=cv2.INTER_AREA).astype(np.uint8)
        hole = cv2.resize(1 - bgmask, (W // 8, H // 8), interpolation=cv2.INTER_NEAREST).astype(np.uint8)
        small = cv2.inpaint(small, cv2.dilate(hole, np.ones((3, 3), np.uint8)), 9, cv2.INPAINT_TELEA)
        low_bg = cv2.GaussianBlur(cv2.resize(small.astype(np.float32), (W, H)), (0, 0), 20)
        synth = (tex - cv2.GaussianBlur(tex, (0, 0), 60) + low_bg).clip(0, 255)
        keep = cv2.GaussianBlur(cv2.erode(bgmask, np.ones((9, 9), np.uint8)), (0, 0), 4)[..., None]
        self.P = self.I0 * keep + synth * (1 - keep)  # real paper wherever it is visible

        # Sticky notes: large square red components.
        b, g, r = self.I0[..., 0], self.I0[..., 1], self.I0[..., 2]
        red = ((r > 150) & (g < 120) & (b < 110) & (r - g > 70)).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(red)
        self.notes = []
        for i in range(1, n):
            x, y, w, h, a = st[i]
            if a > 15000 and 0.8 < w / h < 1.25:
                pts = np.column_stack(np.where(lab == i))[:, ::-1].astype(np.int32)
                hull = np.zeros((H, W), np.uint8)
                cv2.fillConvexPoly(hull, cv2.convexHull(pts), 1)
                hull = cv2.dilate(hull, np.ones((3, 3), np.uint8))
                rect = cv2.minAreaRect(pts)
                self.notes.append(dict(hull=hull, rect=rect, bbox=(x, y, w, h)))
        self.notes.sort(key=lambda d: d["bbox"][1])  # DIVINE ENERGY, QUIT POWER, OLD SOUL

        # Title "Okok sucré": dark strokes in the top band.
        tcore = ((L0 < 120) & (yy < 235)).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(tcore)
        keep = [i for i in range(1, n) if st[i, 1] < 185 and st[i, 4] > 15]
        tcore = np.isin(lab, keep).astype(np.uint8)
        self.title_mask = cv2.dilate(tcore, np.ones((5, 5), np.uint8))

        # Bottom typography.
        bcore = ((np.abs(self.I0 - bg).max(2) > 30) & (yy > 1295) & (yy < 1485)
                 & (xx > 200) & (xx < 840)).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(bcore)
        bcore = np.isin(lab, [i for i in range(1, n) if st[i, 4] >= 25]).astype(np.uint8)
        self.bottom_mask = cv2.dilate(bcore, np.ones((5, 5), np.uint8))

        # Handwriting on the notes.
        ntext = np.zeros((H, W), np.uint8)
        for nt in self.notes:
            inner = cv2.erode(nt["hull"], np.ones((9, 9), np.uint8))
            core = ((L0 < 85) & (inner > 0)).astype(np.uint8)
            nt["text_mask"] = cv2.dilate(core, np.ones((5, 5), np.uint8)) & nt["hull"]
            ntext |= nt["text_mask"]

        # Clean poster without any ink.
        ink = self.title_mask | self.bottom_mask | ntext
        I8 = self.I0.astype(np.uint8)
        self.Iclean = cv2.inpaint(I8, ink, 5, cv2.INPAINT_TELEA).astype(np.float32)
        # The bottom text sits on blank paper: use the plate there for a perfectly clean result.
        bm = cv2.GaussianBlur(self.bottom_mask.astype(np.float32), (0, 0), 2)[..., None]
        self.Iclean = self.Iclean * (1 - bm) + self.P * bm

        # Ink layers (alpha un-mixed against the clean poster).
        Lc = luma(self.Iclean)
        self.inks = {}

        def ink_layer(mask, core):
            col = np.median(self.I0[(core > 0) & (L0 <= np.percentile(L0[core > 0], 20))], 0)
            Lk = luma(col[None, None])[0, 0]
            a = ((Lc - L0) / np.maximum(Lc - Lk, 1)).clip(0, 1) * (mask > 0)
            return a.astype(np.float32), col.astype(np.float32)

        self.title_alpha, self.title_col = ink_layer(self.title_mask, tcore)
        # split the bottom text into words: line 1, line 2, and the red "Ange"
        n, lab, st, _ = cv2.connectedComponentsWithStats(bcore)
        comps = []
        for i in range(1, n):
            x, y, w, h, a = st[i]
            px = self.I0[lab == i]
            is_red = np.median(px[:, 2] - px[:, 1]) > 60
            comps.append(dict(i=i, x=x, y=y, w=w, h=h, red=is_red))
        groups = {"l1": [], "l2": [], "ange": []}
        for c in comps:
            key = "ange" if c["red"] else ("l1" if c["y"] < 1335 else "l2")
            groups[key].append(c)
        self.words = []
        for key in ("l1", "l2", "ange"):
            cs = sorted(groups[key], key=lambda c: c["x"])
            merged = []
            for c in cs:
                if merged and c["x"] <= merged[-1]["x1"] + 10:
                    merged[-1]["ids"].append(c["i"])
                    merged[-1]["x1"] = max(merged[-1]["x1"], c["x"] + c["w"])
                else:
                    merged.append(dict(ids=[c["i"]], x0=c["x"], x1=c["x"] + c["w"]))
            for m in merged:
                core = np.isin(lab, m["ids"]).astype(np.uint8)
                mask = cv2.dilate(core, np.ones((5, 5), np.uint8))
                a, col = ink_layer(mask, core)
                ys, xs = np.where(mask)
                self.words.append(dict(line=key, alpha=a, col=col,
                                       bbox=(xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)))
        for nt in self.notes:
            core = cv2.erode(nt["text_mask"], np.ones((5, 5), np.uint8))
            nt["alpha"], nt["col"] = ink_layer(nt["text_mask"], core)
            nt["lines"] = self._note_lines(nt)

        # Collage alpha (paper pieces + their contact shadows).
        coll = content.copy()
        coll[yy < 186] = 0
        coll[yy > 1300] = 0
        coll &= (1 - self.title_mask)
        n, lab, st, _ = cv2.connectedComponentsWithStats(coll)
        big = 1 + np.argmax(st[1:, 4])
        coll = (lab == big).astype(np.uint8)
        coll = cv2.morphologyEx(coll, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
        dmin = np.abs(cv2.GaussianBlur(self.Iclean, (0, 0), 1) - self.P).max(2)
        A = ((dmin - 3) / 10).clip(0, 1) * cv2.dilate(coll, np.ones((9, 9), np.uint8))
        A = np.maximum(A, cv2.erode(coll, np.ones((5, 5), np.uint8)).astype(np.float32))
        # Under each note the collage is unknown: lay a plain grey paper square there
        # (it reads as one more collage piece until the red note lands on it).
        grey = self._grey_paper()
        Cn = self.Iclean.copy()
        for nt in self.notes:
            nt["ring"] = cv2.dilate(nt["hull"], np.ones((9, 9), np.uint8))
            under = cv2.GaussianBlur(cv2.dilate(nt["hull"], np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 1)
            Cn = Cn * (1 - under[..., None]) + grey * under[..., None]
            A = np.maximum(A, under)
        self.Cn = Cn  # settled collage (no notes, no ink) over the plate
        # fragment colour un-mixed so that fragments over the plate rebuild Cn exactly
        Am = np.maximum(A, 1e-3)[..., None]
        self.Cfrag = ((Cn - self.P * (1 - Am)) / Am).clip(0, 255)
        self.A = np.where(A > 0.04, A, 0).astype(np.float32)
        self.Cn = self.Cfrag * self.A[..., None] + self.P * (1 - self.A[..., None])
        for nt in self.notes:
            nt["ring_soft"] = cv2.GaussianBlur(nt["ring"].astype(np.float32), (0, 0), 3)
            nt["alpha_shape"] = cv2.GaussianBlur(nt["hull"].astype(np.float32), (0, 0), 0.8)

    def _grey_paper(self):
        """Tile the flattest grey paper patch of the collage over the whole frame."""
        g = self.I0
        best, pos = 1e9, None
        for y in range(200, 1250, 16):
            for x in range(110, 900, 16):
                p = g[y:y + 64, x:x + 64]
                m = p.mean((0, 1))
                if not (150 < m.mean() < 215) or np.ptp(m) > 12:
                    continue
                v = p.std((0, 1)).mean()
                if v < best:
                    best, pos = v, (x, y)
        x, y = pos
        p = g[y:y + 64, x:x + 64]
        tile = np.vstack([np.hstack([p, p[:, ::-1]]), np.hstack([p[::-1], p[::-1, ::-1]])])
        reps = (self.H // 128 + 1, self.W // 128 + 1, 1)
        return np.tile(tile, reps)[: self.H, : self.W]

    def _note_lines(self, nt):
        """Order the ink pixels of a note in writing order (line by line, left to right)."""
        (cx, cy), _, ang = nt["rect"]
        if ang > 45:
            ang -= 90
        th = math.radians(ang)
        ys, xs = np.where(nt["alpha"] > 0)
        u = (xs - cx) * math.cos(th) + (ys - cy) * math.sin(th)
        v = -(xs - cx) * math.sin(th) + (ys - cy) * math.cos(th)
        vs = np.sort(v)
        gaps = np.diff(vs)
        k = np.argmax(gaps)
        split = (vs[k] + vs[k + 1]) / 2
        nt["uv"] = (th, cx, cy, split)
        line = (v > split).astype(np.float32)
        umin, umax = u.min(), u.max()
        prog = np.zeros(nt["alpha"].shape, np.float32)
        # progress 0..1 for line 1, 1..2 for line 2
        prog[ys, xs] = line + (u - umin) / (umax - umin + 1e-6)
        return prog


# ---------------------------------------------------------------- 3D paper warp
def project_quad(w, h, pos, rz, rx, ry, scale, f=2200.0):
    """Corners of a w*h paper rotated in 3D about its centre, projected to the screen."""
    cz, sz = math.cos(rz), math.sin(rz)
    cxr, sxr = math.cos(rx), math.sin(rx)
    cyr, syr = math.cos(ry), math.sin(ry)
    Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    Rx = np.array([[1, 0, 0], [0, cxr, -sxr], [0, sxr, cxr]])
    Ry = np.array([[cyr, 0, syr], [0, 1, 0], [-syr, 0, cyr]])
    Rm = Rz @ Ry @ Rx
    pts = np.array([[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0]]) * scale
    p = pts @ Rm.T
    zf = f / (f + p[:, 2])
    out = np.column_stack([p[:, 0] * zf + pos[0], p[:, 1] * zf + pos[1]])
    normal = Rm @ np.array([0, 0, -1.0])
    return out.astype(np.float32), normal


def draw_paper(canvas, rgb, alpha, src_box, pos, rz, rx, ry, scale, height, shade=True):
    """Warp an RGBA paper crop onto the canvas with a soft height-dependent shadow."""
    H, W = canvas.shape[:2]
    x0, y0, x1, y1 = src_box
    w, h = x1 - x0, y1 - y0
    dst, normal = project_quad(w, h, pos, rz, rx, ry, scale)
    pad = int(8 + 70 * height)
    sx = int(10 + 45 * height)
    sy = int(14 + 60 * height)
    bx0 = int(max(0, math.floor(dst[:, 0].min()) - pad))
    by0 = int(max(0, math.floor(dst[:, 1].min()) - pad))
    bx1 = int(min(W, math.ceil(dst[:, 0].max()) + pad + sx))
    by1 = int(min(H, math.ceil(dst[:, 1].max()) + pad + sy))
    if bx1 <= bx0 or by1 <= by0:
        return
    src = np.array([[0, 0], [w, 0], [w, h], [0, h]], np.float32)
    M = cv2.getPerspectiveTransform(src, dst - np.array([bx0, by0], np.float32))
    bw, bh = bx1 - bx0, by1 - by0
    crop = np.dstack([rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1]])
    warped = cv2.warpPerspective(crop, M, (bw, bh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    a = warped[..., 3:4].clip(0, 1)
    col = warped[..., :3]
    if shade:
        light = np.array([-0.35, -0.5, -0.8])
        light /= np.linalg.norm(light)
        k = 1 + 0.9 * (float(normal @ light) - 0.8)
        col = col * k
    region = canvas[by0:by1, bx0:bx1]
    op = 0.32 * smoothstep(0.0, 0.25, height)
    if op > 0.003:
        sh = np.zeros((bh, bw), np.float32)
        Msh = np.float32([[1, 0, sx], [0, 1, sy]])
        sh = cv2.warpAffine(a[..., 0], Msh, (bw, bh))
        sigma = 2 + 22 * height
        sh = cv2.GaussianBlur(sh, (0, 0), sigma)
        region *= (1 - op * sh)[..., None]
    region[:] = region * (1 - a) + col * a


# ---------------------------------------------------------------- choreography
class Choreo:
    def __init__(self, L):
        self.L = L
        H, W = L.H, L.W
        ys, xs = np.where(L.A > 0)
        top, bot, left, right = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        rows = [top, 355, 520, 700, 880, 1060, bot]
        self.frags = []
        for r in range(len(rows) - 1):
            ncol = 3 if r % 2 == 0 else 4
            cuts = np.linspace(left, right, ncol + 1)
            cuts[1:-1] += rng.uniform(-40, 40, ncol - 1)
            for c in range(ncol):
                x0, x1 = int(cuts[c]), int(cuts[c + 1])
                y0, y1 = int(rows[r]), int(rows[r + 1])
                cell = np.zeros((H, W), np.float32)
                cell[y0:y1, x0:x1] = 1
                a = L.A * cell
                if a.sum() < 500:
                    continue
                yy, xx = np.where(a > 0)
                box = (xx.min(), yy.min(), xx.max() + 1, yy.max() + 1)
                self.frags.append(dict(alpha=a, box=box))
        # landing order: roughly bottom-up/outside-in, ending inside the 1-4 s window
        n = len(self.frags)
        order = rng.permutation(n)
        for k, fi in enumerate(order):
            f = self.frags[fi]
            f["t0"] = 1.0 + 1.5 * k / (n - 1) + rng.uniform(-0.05, 0.05)
            f["dur"] = rng.uniform(1.25, 1.45)
            f["t0"] = min(f["t0"], 3.95 - f["dur"])
            x0, y0, x1, y1 = f["box"]
            end = np.array([(x0 + x1) / 2, (y0 + y1) / 2])
            ang = math.radians(rng.uniform(-165, -15))
            dist = rng.uniform(1100, 1400)
            f["end"] = end
            f["start"] = end + dist * np.array([math.cos(ang), math.sin(ang)])
            f["rz0"] = math.radians(rng.uniform(-55, 55))
            f["rx0"] = math.radians(rng.uniform(-50, 50))
            f["ry0"] = math.radians(rng.uniform(-50, 50))
            f["sway"] = rng.uniform(30, 70)
            f["freq"] = rng.uniform(0.6, 1.0)
            f["phase"] = rng.uniform(0, 2 * math.pi)
            f["flut"] = rng.uniform(5, 9)
        self.frags.sort(key=lambda f: f["t0"] + f["dur"])
        self.frag_end = max(f["t0"] + f["dur"] for f in self.frags)

        # Sticky notes: (enter time, approach angle)
        for nt, t0, ang, spin in zip(L.notes, (3.85, 4.0, 4.15), (-150, -30, 160), (-35, 30, 25)):
            x, y, w, h = nt["bbox"]
            nt["t0"], nt["dur"] = t0, 0.6
            nt["end"] = np.array([x + w / 2, y + h / 2])
            a = math.radians(ang)
            nt["start"] = nt["end"] + 800 * np.array([math.cos(a), math.sin(a)])
            nt["rz0"] = math.radians(spin)
            nt["box"] = (x - 2, y - 2, x + w + 2, y + h + 2)
            nt["write0"] = t0 + nt["dur"] + 0.02
            nt["write_dur"] = 0.36

        # Typography
        self.title_t0, self.title_dur = 5.0, 1.0
        ys, xs = np.where(L.title_alpha > 0)
        self.title_x0, self.title_x1 = xs.min(), xs.max()
        Hh, Ww = L.H, L.W
        yy, xx = np.mgrid[0:Hh, 0:Ww]
        self.title_coord = (xx + (yy - 120) * 0.35).astype(np.float32)  # italic slant of the script
        l1 = [w for w in L.words if w["line"] == "l1"]
        l2 = [w for w in L.words if w["line"] == "l2"]
        ange = [w for w in L.words if w["line"] == "ange"]
        for i, w in enumerate(l1):
            w["t0"], w["dur"] = 5.45 + 0.13 * i, 0.45
        for i, w in enumerate(l2):
            w["t0"], w["dur"] = 5.95 + 0.11 * i, 0.4
        # merge "Ange" letters into a single word layer
        a = sum(w["alpha"] for w in ange)
        bb = (min(w["bbox"][0] for w in ange), min(w["bbox"][1] for w in ange),
              max(w["bbox"][2] for w in ange), max(w["bbox"][3] for w in ange))
        self.ange = dict(alpha=a.clip(0, 1), col=ange[0]["col"], bbox=bb, t0=6.35, dur=0.6)
        self.words = l1 + l2

    # -- per-element state
    def frag_state(self, f, t):
        p = clamp01((t - f["t0"]) / f["dur"])
        e = ease_out_cubic(p)
        rem = 1 - e
        d = f["end"] - f["start"]
        perp = np.array([-d[1], d[0]]) / (np.linalg.norm(d) + 1e-6)
        sway = f["sway"] * math.sin(2 * math.pi * f["freq"] * (t - f["t0"]) + f["phase"]) * rem
        pos = f["start"] + d * e + perp * sway
        flut = math.sin(2 * math.pi * f["flut"] * t + f["phase"]) * rem
        rz = f["rz0"] * rem ** 2 + 0.06 * flut
        rx = f["rx0"] * rem ** 1.5 + 0.25 * flut
        ry = f["ry0"] * rem ** 1.5 + 0.18 * math.cos(2 * math.pi * f["flut"] * 0.8 * t) * rem
        height = rem ** 1.3
        return p, pos, rz, rx, ry, 1 + 0.18 * height, height


def render_frame(L, C, t):
    if t >= 7.0:
        k = smoothstep(7.0, 7.12, t)
        if k >= 1:
            return L.I0
    # ---- paper + collage
    if t < C.frag_end:
        canvas = L.P.copy()
        for f in C.frags:
            if t < f["t0"]:
                continue
            p, pos, rz, rx, ry, s, hgt = C.frag_state(f, t)
            draw_paper(canvas, L.Cfrag, f["alpha"], f["box"], pos, rz, rx, ry, s, hgt)
    else:
        canvas = L.Cn.copy()
    # ---- sticky notes
    for nt in L.notes:
        if t < nt["t0"]:
            continue
        p = clamp01((t - nt["t0"]) / nt["dur"])
        if p < 1:
            e = ease_out_cubic(p)
            rem = 1 - e
            pos = nt["start"] + (nt["end"] - nt["start"]) * e
            pos = pos + np.array([0, -18 * math.sin(math.pi * e)])
            fl = math.sin(2 * math.pi * 4 * t) * rem
            draw_paper(canvas, L.Iclean, nt["alpha_shape"], nt["box"], pos,
                       nt["rz0"] * rem ** 2, 0.5 * rem ** 2 + 0.12 * fl, -0.4 * rem ** 2 + 0.1 * fl,
                       1 + 0.12 * rem, rem ** 1.2)
        else:
            w = smoothstep(0, 0.2, t - nt["t0"] - nt["dur"])
            m = (nt["ring_soft"] * w)[..., None]
            canvas = canvas * (1 - m) + L.Iclean * m
            # ink writing
            wp = clamp01((t - nt["write0"]) / nt["write_dur"]) * 2.0
            if wp > 0:
                reveal = ((wp - nt["lines"]) / 0.08).clip(0, 1)
                a = (nt["alpha"] * reveal)[..., None]
                canvas = canvas * (1 - a) + nt["col"] * a
    # ---- title handwriting
    if t > C.title_t0:
        p = clamp01((t - C.title_t0) / C.title_dur)
        # natural pen speed: small accelerations and a short breath between the two words
        q = p + 0.025 * math.sin(2 * math.pi * 3 * p)
        q = clamp01(q)
        span = C.title_x1 - C.title_x0 + 140
        front = C.title_x0 - 50 + q * span
        reveal = ((front - C.title_coord) / 28).clip(0, 1)
        a = (L.title_alpha * reveal)[..., None]
        canvas = canvas * (1 - a) + L.title_col * a
    # ---- kinetic typography
    for w in C.words:
        if t < w["t0"]:
            continue
        p = clamp01((t - w["t0"]) / w["dur"])
        e = ease_out_cubic(p)
        dy = 26 * (1 - e)
        a = w["alpha"] * smoothstep(0, 0.7, p)
        if dy > 0.01:
            a = cv2.warpAffine(a, np.float32([[1, 0, 0], [0, 1, dy]]), (L.W, L.H))
        a = a[..., None]
        canvas = canvas * (1 - a) + w["col"] * a
    g = C.ange
    if t >= g["t0"]:
        p = clamp01((t - g["t0"]) / g["dur"])
        if p < 0.55:
            s = 1.1 * ease_out_cubic(p / 0.55)
        else:
            q = (p - 0.55) / 0.45
            s = 1.0 + 0.1 * math.exp(-4 * q) * math.cos(2.6 * math.pi * q) * (1 - q)
        if s > 0.01:
            x0, y0, x1, y1 = g["bbox"]
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            M = np.float32([[s, 0, cx - s * cx], [0, s, cy - s * cy]])
            a = cv2.warpAffine(g["alpha"], M, (L.W, L.H)) * smoothstep(0, 0.15, p)
            a = a[..., None]
            canvas = canvas * (1 - a) + g["col"] * a
    if t >= 7.0:
        canvas = canvas * (1 - k) + L.I0 * k
    return canvas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true", help="save contact sheet frames only")
    args = ap.parse_args()
    os.makedirs(OUT_DIR, exist_ok=True)
    L = Layers(REF)
    C = Choreo(L)
    print(f"{len(C.frags)} fragments, {len(L.notes)} notes, {len(C.words)} words + Ange", file=sys.stderr)
    if args.preview:
        for t in (0.5, 1.6, 2.4, 3.2, 3.9, 4.3, 4.75, 5.1, 5.5, 6.1, 6.5, 6.75, 7.5):
            cv2.imwrite(os.path.join(OUT_DIR, f"preview_{t:.2f}.png"), render_frame(L, C, t).clip(0, 255).astype(np.uint8))
        return

    out = os.path.join(OUT_DIR, "okok_sucre.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{L.W}x{L.H}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart", out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    nframes = int(DURATION * FPS)
    for i in range(nframes):
        frame = render_frame(L, C, float(np.interp(i / FPS, PLAYBACK, TIMELINE)))
        proc.stdin.write(frame.clip(0, 255).astype(np.uint8).tobytes())
        if i % 30 == 0:
            print(f"frame {i}/{nframes}", file=sys.stderr)
    proc.stdin.close()
    proc.wait()
    print(out)


if __name__ == "__main__":
    main()
