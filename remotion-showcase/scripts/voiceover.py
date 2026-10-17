"""Generate the French voice-over for the WhatsApp (9:16) video.

Each segment is synthesised separately with edge-tts, which also returns
word-level timings used for the synced captions. Output:
  public/vo/<id>.mp3
  src/whatsapp/voiceover.json

Usage: python3 scripts/voiceover.py
(behind a TLS-intercepting proxy, set SSL_CERT_FILE to its CA bundle)
"""
import asyncio
import json
import os
import subprocess
from pathlib import Path

import edge_tts

VOICE = "fr-FR-DeniseNeural"
RATE = "+6%"
ROOT = Path(__file__).resolve().parent.parent

SEGMENTS = [
    ("hook", "Tu réexpliques tout à Claude, à chaque nouvelle conversation ?"),
    ("solution", "Bonne nouvelle : la solution existe. Ce sont les Projets."),
    ("concept", "Un projet, c'est un espace de travail qui réunit tes instructions, tes documents, et tes conversations."),
    ("create", "Étape un : dans le menu Projets, clique sur Nouveau projet, et donne-lui un nom clair."),
    ("instruct", "Étape deux : écris les instructions. Ton rôle, ton public, le ton, et le format attendu."),
    ("docs", "Étape trois : ajoute tes documents de référence. Claude s'en sert dans chaque conversation."),
    ("chat", "Étape quatre : discute ! Claude répond directement dans ton contexte, sans que tu aies à tout réexpliquer."),
    ("tip", "Mon conseil : un projet, un objectif. Une formation, un client, ou un cours."),
    ("outro", "Créer, instruire, alimenter, discuter. À toi de jouer !"),
]


async def synth(seg_id: str, text: str) -> dict:
    out = ROOT / "public" / "vo" / f"{seg_id}.mp3"
    words = []
    com = edge_tts.Communicate(
        text, VOICE, rate=RATE, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY")
    )
    with open(out, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 10_000  # 100 ns ticks -> ms
                words.append({"text": chunk["text"], "startMs": round(start), "endMs": round(start + chunk["duration"] / 10_000)})
    duration = float(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)]
        )
    )
    return {"id": seg_id, "file": f"vo/{seg_id}.mp3", "text": text, "durationMs": round(duration * 1000), "words": words}


async def main() -> None:
    segments = [await synth(i, t) for i, t in SEGMENTS]
    dest = ROOT / "src" / "whatsapp" / "voiceover.json"
    dest.write_text(json.dumps({"voice": VOICE, "segments": segments}, ensure_ascii=False, indent=1))
    total = sum(s["durationMs"] for s in segments) / 1000
    print(f"{len(segments)} segments, {total:.1f} s of speech -> {dest}")


asyncio.run(main())
