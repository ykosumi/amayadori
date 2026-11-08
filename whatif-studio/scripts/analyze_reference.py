#!/usr/bin/env python3
"""Step 1 of every project: analyse a reference video.  usage: analyze_reference.py reference/ref.mp4
Outputs to out/reference/: info.json, scenes.txt (cut times), contact_sheet_{1,2}.png (16 frames each), palette.json, transcript.txt (if faster-whisper installed)."""
import json, os, re, subprocess, sys
src = sys.argv[1]; out = "out/reference"; os.makedirs(out, exist_ok=True)
sh = lambda c: subprocess.run(c, capture_output=True, text=True)
info = json.loads(sh(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", src]).stdout)
json.dump(info, open(f"{out}/info.json", "w"), indent=1)
dur = float(info["format"]["duration"]); print("duration", dur)
# cut detection -> pacing of shots
r = sh(["ffmpeg", "-i", src, "-vf", "select='gt(scene,0.25)',showinfo", "-f", "null", "-"])
cuts = [float(m) for m in re.findall(r"pts_time:([\d.]+)", r.stderr)]
open(f"{out}/scenes.txt", "w").write("\n".join(f"{c:.2f}" for c in cuts)); print(len(cuts), "cuts; avg shot", dur / (len(cuts) + 1))
# two 16-frame contact sheets (first half / second half)
for i, (a, b) in enumerate([(0, dur / 2), (dur / 2, dur)], 1):
    subprocess.run(["ffmpeg", "-y", "-ss", str(a), "-t", str(b - a), "-i", src, "-vf", f"fps=16/{b-a},scale=270:-1,tile=4x4", "-frames:v", "1", f"{out}/contact_sheet_{i}.png"], capture_output=True)
# palette via OpenCV k-means
try:
    import cv2, numpy as np
    cap = cv2.VideoCapture(src); px = []
    for k in range(24):
        cap.set(cv2.CAP_PROP_POS_MSEC, dur * 1000 * k / 24); ok, f = cap.read()
        if ok: px.append(cv2.resize(f, (48, 85)).reshape(-1, 3))
    px = np.concatenate(px).astype("float32"); _, _, c = cv2.kmeans(px, 8, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1), 3, cv2.KMEANS_PP_CENTERS)
    json.dump(["#%02x%02x%02x" % tuple(int(v) for v in x[::-1]) for x in c], open(f"{out}/palette.json", "w")); print("palette saved")
except ImportError: print("opencv not installed: pip install opencv-python numpy")
try:
    from faster_whisper import WhisperModel
    segs, _ = WhisperModel("small", compute_type="int8").transcribe(src)
    open(f"{out}/transcript.txt", "w").write("\n".join(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}" for s in segs)); print("transcript saved (narration pacing)")
except ImportError: print("faster-whisper not installed: pip install faster-whisper")
