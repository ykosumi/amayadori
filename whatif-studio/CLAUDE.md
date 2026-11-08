# What-If Studio — Claude Code 運用ルール

目的: 無制限に「What If?」3Dカートゥーン科学アニメ (1080×1920, 9:16, 24fps, 75–85秒) を作る再利用システム。**Blender不使用**。
スタック: Three.js(手続き型3D) + Playwright(決定論的フレーム書き出し) + FFmpeg + Canvas2D(ダークネイビー図解) + Kokoro(無料ローカルTTS)。

## 現行の画風 (2026-11-08 決定): フラット2Dベクター (Kurzgesagt式 × 1950s UPAビンテージ)
- チョーク風3D(`chalk.js`/`character.js` chalk)は**置き換え済み・今後は使わない**(コードは参考で残置)。
- 部品: `src/engine/flat.js` — 限定5色(生成り#F2EAD8/マスタード#D9A441/レンガ#B5502F/ティール#3E7C74/墨#2B2620)、ハーフトーン影 `shape()`、spring登場 `pop()`、微ブレ `boil()`、12fpsホールド `hold()`、版ズレ見出し `headline()`、`finish()`(グレイン+周辺減光+フィルムストリップ)、`captionBand()`(シリーズ名+キュー番号+ナレ全文)。
- ルール: 主役は画面幅の約7割・幾何形パーツのみ・モーフィング禁止(置き換えカット)・動きは**強くしすぎない**。出力 1080×1920 / 30fps(動きは12fpsホールド)。手本: `projects/flatdemo`。
- すべて `kind:'info'` ショット(Canvas2D)で描く。

## 絶対ルール
- 実在しないものを「生成した/レンダリングした」と言わない。実行して存在確認してから報告。
- 有料ツール(ElevenLabs等)は使う前に必ず確認。デフォルトは無料/ローカル。
- 認識可能な既存キャラ・シーンをコピーしない。リファレンスからは「制作技法・質感・テンポ」だけ学ぶ。
- 静止スライド/単純ズーム禁止。全ショットに本物のキャラ動作。フットスライド・固まり・繰り返しの単調さを避ける。
- すべての動きは `t(秒)` の純関数。乱数は `rng(seed)`。これで任意フレームを再現できる。

## 工程と承認ゲート (順番を飛ばさない)
1. `python3 scripts/analyze_reference.py reference/<file>.mp4` → コンタクトシート2枚/カット間隔/パレット/文字起こし。キャラ・照明・色・カメラ・ペーシングを要約。
1.5. **コンセプトアート(リファレンス受領後)**: `projects/<name>/character.json`(色・名前・パレット)を参照から作り、`node scripts/concept.mjs --project <p>` でキャラシート(ターンアラウンド+表情+パレット)、`render.mjs --still <秒> --format landscape` で世界観キーアート(環境・照明・色)を出して**承認待ち**。体型・顔が違えば `src/engine/character.js` を調整。
2. **ユーザーにトピックとボイスサービスを質問**(または5案提示)。
3. 75–85秒スクリプト(下の構成)+ファクトチェック(出典URL・仮定ラベル)+タイムスタンプ付きストーリーボードを `projects/<name>/STORYBOARD.md` に書いて**承認待ち**。承認前にアセットを作らない。
4. 承認後: `projects/<name>/scenes.js` を実装(`projects/demo` が手本)。必要なら `src/engine` を拡張。
5. プレビュー提示: 16フレームコンタクトシート×2 / オープニング / キャラ移動 / 図解 / 低解像度フルドラフト(`--w 540 --h 960 --fps 12`)。
6. 自己チェック(キャラ一貫性・動き・物理・照明・文字・音同期・フレーミング)→修正→**最終レンダリング承認待ち**。
7. 承認後に最終: 1080×1920 / 24fps / H.264 / CRF16–18 (`--crf 17`, ブラー付きは `--subframes 4`)。

## スクリプト構成 (秒)
0–5 衝撃フック / 5–15 最初の驚く結果 / 15–27 ダイアグラムで科学説明 / 27–42 3Dで日常の結果 / 42–55 より大きな例でエスカレート / 55–70 予期せぬデメリット / 70–85 最後のひねり+記憶に残る終わり。
全文に明確なビジュアルアクション。ナレーションは1文=1ショット以上で対応させる。

## 縦横フォーマット
`--format portrait|landscape|square`(既定 portrait 1080×1920)。2Dは向きに応じて設計座標(1080×1920 / 1920×1080)が切替わり、`draw(ctx,t,l,w,h,I)` の `w>h` で縦横レイアウトを分岐(demo参照)。3Dは同じシーンを再レンダでき、カメラ構図だけ要調整。AE合成は `scripts/export_ae.sh <p> 24 landscape`。

## コマンド
- セットアップ(初回): `npm run setup`  (Linuxで古いChromium固定の場合 `CHROME_PATH=/path/to/chromium`)
- プレビュー: `node scripts/render.mjs --project <p> --w 540 --h 960 --fps 12 --out out/draft.mp4`
- 部分レンダ: `--from 10 --to 14`   / GPU使用: `GPU=1 node scripts/render.mjs ...`
- コンタクトシート: `python3 scripts/contact_sheet.py out/draft.mp4 out/contact.png`
- 音: `python3 scripts/narrate.py projects/<p>/project.json` → `out/<p>/mix.wav`、レンダ時 `--audio out/<p>/mix.wav`
- Adobe用パス分離: `scripts/export_ae.sh <p>`  (env / char(透過ProRes4444))

## エンジン部品 (`src/engine`)
`character.js` リグ(歩/走 gait・ジャンプ予備動作→着地・まばたき・表情 neutral/happy/shock/worry/dizzy・squash&stretch) / `motion.js` 距離→歩調位相(足滑り防止) / `env.js` 郊外・車・照明 / `fx.js` ダスト・スピードストリーク・衝撃リング / `camera.js` キーフレーム&追従+手持ち揺れ / `infographic.js` 図解(カウンター・バー・ゲージ・矢印・カード・字幕) / `ease.js`。
新ショットは `shots[]` に `{id,start,end,kind:'3d'|'info', update|draw, captions?, overlay?}` を追加。

## 既知の制約 (正直に)
- キャラは手続き型ジオメトリ(カプセル/球)。IKなしのFKリグなので、足の接地は歩幅式で近似(長距離でも滑りにくいが完全ではない)。
- ソフトウェアGL(SwiftShader)は遅い。自宅のGPUなら `GPU=1`。
- 影キャッチャー/合成用の影passは未実装(AE側で影を作るか `char` に床を追加)。
