#!/usr/bin/env bash
# Adobe hand-off: render passes separately so you can composite in After Effects / Premiere.
# usage: scripts/export_ae.sh <project> [fps]   (needs: npm run setup done)
# Produces ProRes 4444 (alpha) for the character pass, ProRes 422 for env, and PNG sequences.
set -e; P=${1:-demo}; FPS=${2:-24}; FMT=${3:-landscape}  # 3rd arg: portrait|landscape
for PASS in env char; do
  node scripts/render.mjs --project "$P" --pass $PASS --fps $FPS --format $FMT --frames-only
  ffmpeg -y -framerate $FPS -i out/$P/frames_${PASS}_$FMT/f_%06d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le out/${P}_${PASS}_${FMT}_alpha.mov
done
echo "Import out/${P}_*.mov (or the frames_* PNG sequences) into AE/Premiere. 'char' = character+FX on transparent."
