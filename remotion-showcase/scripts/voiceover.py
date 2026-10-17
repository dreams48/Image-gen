"""Generate the French voice-over for the WhatsApp (9:16) video with HyperFrames.

For each segment:
  1. `npx hyperframes tts` (Kokoro-82M, French voice ff_siwis) synthesises the speech;
  2. `npx hyperframes transcribe` (Whisper, French) measures when each word is spoken;
  3. the measured timings are mapped back onto the script's own words, so captions
     always show the exact script text even if Whisper mishears a word.
Output:
  public/vo/<id>.mp3
  src/whatsapp/voiceover.json

Usage: python3 scripts/voiceover.py   (needs: pip install kokoro-onnx soundfile)
"""
import json
import os
import re
import subprocess
import tempfile
import unicodedata
from pathlib import Path

HF = ["npx", "-y", "hyperframes@0.8.169"]
VOICE = "ff_siwis"
SPEED = "1.0"
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


def letters(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if c.isalnum())


def script_words(text: str) -> list[str]:
    return [w for w in (re.sub(r"^[^\w]+|[^\w]+$", "", t) for t in text.split()) if w]


def align(words: list[str], heard: list[dict]) -> list[dict]:
    """Map each script word to a time by its relative position in the letter stream."""
    stream = []  # (start, end) per letter of what Whisper heard
    for h in heard:
        n = max(1, len(letters(h["text"])))
        for k in range(n):
            a = h["start"] + (h["end"] - h["start"]) * k / n
            stream.append(a)
    total = sum(len(letters(w)) for w in words)
    out, pos = [], 0
    for w in words:
        n = len(letters(w))
        i0 = min(len(stream) - 1, round(pos / total * len(stream)))
        i1 = min(len(stream) - 1, round((pos + n) / total * len(stream)) - 1)
        out.append({"text": w, "startMs": round(stream[i0] * 1000), "endMs": round(max(stream[i1], stream[i0]) * 1000) + 60})
        pos += n
    return out


def synth(seg_id: str, text: str, tmp: Path) -> dict:
    wav = tmp / f"{seg_id}.wav"
    subprocess.run(HF + ["tts", text, "-v", VOICE, "-s", SPEED, "-o", str(wav)], check=True, capture_output=True)
    proj = tmp / seg_id
    proj.mkdir()
    subprocess.run(
        HF + ["transcribe", str(wav), "-m", "small", "-l", "fr", "-d", str(proj), "--json"],
        check=True,
        capture_output=True,
    )
    heard = json.loads((proj / "transcript.json").read_text())
    heard = heard["words"] if isinstance(heard, dict) else heard
    mp3 = ROOT / "public" / "vo" / f"{seg_id}.mp3"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-b:a", "128k", str(mp3)], check=True)
    duration = float(
        subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)])
    )
    return {
        "id": seg_id,
        "file": f"vo/{seg_id}.mp3",
        "text": text,
        "durationMs": round(duration * 1000),
        "words": align(script_words(text), heard),
    }


def main() -> None:
    os.environ.setdefault("HYPERFRAMES_NO_TELEMETRY", "1")
    with tempfile.TemporaryDirectory() as d:
        segments = [synth(i, t, Path(d)) for i, t in SEGMENTS]
    dest = ROOT / "src" / "whatsapp" / "voiceover.json"
    dest.write_text(json.dumps({"engine": "hyperframes tts (Kokoro-82M)", "voice": VOICE, "segments": segments}, ensure_ascii=False, indent=1))
    total = sum(s["durationMs"] for s in segments) / 1000
    print(f"{len(segments)} segments, {total:.1f} s of speech -> {dest}")


main()
