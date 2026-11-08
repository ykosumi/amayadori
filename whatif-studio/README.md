# What-If Studio（Blenderなし）

Claude Code 1プロンプトで「What If?」3Dカートゥーン科学アニメを量産するための再利用システム。
Three.js + Playwright + FFmpeg。**リポジトリ内で動作確認済み**: キャラリグ(歩→走→ジャンプ)・ダスト/ストリーク・追従カメラ・ダークネイビー図解・フレーム書き出し→MP4（`projects/demo`、12秒）。

## 家のPCでのセットアップ (Windows可)
1. 入れるもの: Node.js 20+, FFmpeg(PATH), Python 3.10+, Git
2. `git clone` → `git checkout claude/3d-science-animation-system-6f3azd` → `cd whatif-studio`
3. `npm run setup`（three/vite/playwright + Chromium）
4. 動作確認: `npm run preview` → `out/preview.mp4`（デモ）。GPUがあれば `set GPU=1`(PowerShell: `$env:GPU=1`)で高速化
5. 任意(無料): `pip install opencv-python numpy faster-whisper kokoro soundfile`（解析・ナレーション用。日本語Kokoroは `pip install "misaki[ja]"` も）
6. リファレンス動画を `reference/` に置く

## Claude Codeへの最初の一言
> `whatif-studio/CLAUDE.md` に従って開始。`reference/xxx.mp4` を分析して、トピックとボイスを私に質問して。

（CLAUDE.md に承認ゲート=スクリプト→ドラフト→最終 を定義済み。以後はClaudeが順に進めます）

## Premiere / After Effects で仕上げる
`scripts/export_ae.sh <project>` で **環境 / キャラ(透過ProRes 4444)** を別パス出力。AEで影・グレード・ブラー・テキスト、Premiereでナレ/BGM合わせ。
2D図解は `kind:'info'` ショットをそのまま使うか、`infographic.js` の配色(navy `#0b1a33`)をAEのテンプレに流用可。

## 構成
```
whatif-studio/
  CLAUDE.md            運用ルール・承認ゲート
  src/engine/          character / env / fx / camera / infographic / motion / ease
  src/main.js          フレーム単位レンダ(window.renderFrame(t))
  projects/demo        動作する手本   projects/_template  新規用(project.json, STORYBOARD.md, scenes.js)
  scripts/             render.mjs / analyze_reference.py / contact_sheet.py / narrate.py / export_ae.sh
```
新規: `cp -r projects/_template projects/<name>`
## 未確認・未実装（正直に）
- 添付リファレンス動画は私の環境に届いていないため、**参照動画の分析はまだ未実施**（家で `analyze_reference.py` を実行）。
- Kokoro音声・音楽ミックス(`narrate.py`)は未検証（SFX生成のみ検証）。
- 日本語フォントはOS依存(Noto Sans JP推奨)。この環境では描画を確認済みだが字形は環境差あり。
