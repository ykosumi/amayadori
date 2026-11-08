#!/usr/bin/env python3
"""Narration -> per-line wav (Kokoro, free/local) -> timed mix with SFX.  usage: narrate.py projects/<name>/project.json
project.json "narration": [{"id":"l1","start":0.0,"text":"...","lang":"j"}]  and  "sfx": [{"at":4.0,"kind":"whoosh"}]
Voice engine is swappable: set "voice":{"engine":"kokoro","name":"jf_alpha"}; add engines in synth()."""
import json, os, subprocess, sys
proj = json.load(open(sys.argv[1])); name = proj["name"]; out = f"out/{name}/audio"; os.makedirs(out, exist_ok=True)
def synth(line, path):
    v = proj.get("voice", {"engine": "kokoro", "name": "jf_alpha"})
    if v["engine"] == "kokoro":
        from kokoro import KPipeline; import soundfile as sf, numpy as np
        pipe = KPipeline(lang_code=line.get("lang", "j")); chunks = [a for _, _, a in pipe(line["text"], voice=v["name"], speed=v.get("speed", 1.0))]
        sf.write(path, np.concatenate(chunks), 24000)
    else: raise SystemExit(f"engine {v['engine']} not implemented (add ElevenLabs etc. here)")
def sfx(kind, path):  # procedural, royalty-free: generated with FFmpeg
    g = {"whoosh": "anoisesrc=d=0.7:c=pink,highpass=f=400,lowpass=f=5000,afade=t=in:d=0.3,afade=t=out:st=0.3:d=0.4,volume=0.8",
         "impact": "sine=f=60:d=0.5,afade=t=out:d=0.5,volume=1.4", "step": "anoisesrc=d=0.08:c=brown,lowpass=f=800,afade=t=out:d=0.08",
         "pop": "sine=f=520:d=0.12,afade=t=out:d=0.12"}[kind]
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", g, "-ar", "48000", path], capture_output=True, check=True)
inputs, delays = [], []
for l in proj.get("narration", []):
    p = f"{out}/{l['id']}.wav"
    if not os.path.exists(p): synth(l, p)
    inputs.append(p); delays.append(l["start"])
for i, s in enumerate(proj.get("sfx", [])):
    p = f"{out}/sfx_{s['kind']}.wav"
    if not os.path.exists(p): sfx(s["kind"], p)
    inputs.append(p); delays.append(s["at"])
cmd = ["ffmpeg", "-y"]; [cmd.extend(["-i", p]) for p in inputs]
fl = ";".join(f"[{i}:a]aresample=48000,adelay={int(d*1000)}|{int(d*1000)}[a{i}]" for i, d in enumerate(delays))
if os.path.exists(proj.get("music", "")): cmd.extend(["-i", proj["music"]]); fl += f";[{len(inputs)}:a]volume=0.18[m]"; mix = "".join(f"[a{i}]" for i in range(len(delays))) + "[m]"; n = len(delays) + 1
else: mix = "".join(f"[a{i}]" for i in range(len(delays))); n = len(delays)
fl += f";{mix}amix=inputs={n}:normalize=0,alimiter=limit=0.95[o]"
cmd += ["-filter_complex", fl, "-map", "[o]", f"out/{name}/mix.wav"]; subprocess.run(cmd, check=True); print(f"out/{name}/mix.wav")
