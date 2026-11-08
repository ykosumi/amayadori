#!/usr/bin/env python3
"""16-frame contact sheet from a video OR a frames dir.  usage: contact_sheet.py <video|frames_dir> [out.png] [cols=4]"""
import subprocess, sys, glob, os
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else "out/contact.png"; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
if os.path.isdir(src):
    fr = sorted(glob.glob(os.path.join(src, "*.png"))); step = max(1, len(fr) // 16)
    sel = "+".join(f"eq(n\\,{i})" for i in range(0, len(fr), step)[:16])
    cmd = ["ffmpeg", "-y", "-framerate", "1", "-i", os.path.join(src, "f_%06d.png"), "-vf", f"select='{sel}',scale=270:-1,tile={cols}x{-(-16 // cols)}", "-frames:v", "1", out]
else:
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]))
    cmd = ["ffmpeg", "-y", "-i", src, "-vf", f"fps=16/{dur},scale=270:-1,tile={cols}x{-(-16 // cols)}", "-frames:v", "1", out]
subprocess.run(cmd, check=True, capture_output=True); print(out)
