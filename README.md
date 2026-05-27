# amayadori
GitHub PagesでJekyllを使って構築したポートフォリオサイト。カスタムドメインとMarkdownによるブログ投稿。
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEON STRIKER - Belt Scroll Action Prototype</title>
    <!-- Google Fonts: レトロ用とモダンUI用 -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Press+Start+2P&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0a0a0e;
            --container-bg: #12121a;
            --neon-blue: #00f0ff;
            --neon-pink: #ff007f;
            --neon-purple: #9d00ff;
            --text-color: #f0f0f5;
            --text-muted: #8a8a9d;
            --border-color: #232335;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: 'Outfit', sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow-x: hidden;
            background-image: 
                radial-gradient(at 0% 0%, rgba(157, 0, 255, 0.1) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(0, 240, 255, 0.1) 0px, transparent 50%);
        }
        header {
            text-align: center;
            margin-bottom: 20px;
        }
        h1 {
            font-family: 'Press Start 2P', cursive;
            font-size: 1.8rem;
            color: #fff;
            text-shadow: 
                0 0 5px #fff,
                0 0 10px var(--neon-pink),
                0 0 20px var(--neon-pink),
                0 0 40px var(--neon-pink);
            letter-spacing: 2px;
            margin-bottom: 8px;
            animation: pulse 2s infinite alternate;
        }
        @keyframes pulse {
            0% {
                text-shadow: 0 0 5px #fff, 0 0 10px var(--neon-pink), 0 0 15px var(--neon-pink);
            }
            100% {
                text-shadow: 0 0 8px #fff, 0 0 15px var(--neon-pink), 0 0 30px var(--neon-pink), 0 0 40px var(--neon-purple);
            }
        }
        .subtitle {
            font-size: 0.95rem;
            color: var(--text-muted);
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .game-container {
            position: relative;
            background-color: var(--container-bg);
            border: 4px solid var(--border-color);
            border-radius: 12px;
            padding: 10px;
            box-shadow: 
                0 10px 30px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.05),
                0 0 20px rgba(0, 240, 255, 0.15);
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .canvas-wrapper {
            position: relative;
            border-radius: 6px;
            overflow: hidden;
            border: 2px solid #1a1a24;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
        }
        canvas {
            display: block;
            background-color: #000;
            image-rendering: pixelated; /* ドット絵感を際立たせる */
        }
        /* 画面の走査線（スキャンライン）風レトロエフェクト */
        .scanlines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                rgba(18, 16, 16, 0) 50%, 
                rgba(0, 0, 0, 0.15) 50%
            ), linear-gradient(
                90deg,
                rgba(255, 0, 0, 0.03),
                rgba(0, 255, 0, 0.01),
                rgba(0, 0, 255, 0.03)
            );
            background-size: 100% 4px, 6px 100%;
            pointer-events: none;
            z-index: 10;
        }
        /* 画面の湾曲（CRT風）をシミュレートするシャドウ */
        .crt-glow {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.8);
            pointer-events: none;
            z-index: 11;
        }
        .controls-panel {
            margin-top: 20px;
            width: 100%;
            max-width: 820px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background-color: var(--container-bg);
            border: 1px solid var(--border-color);
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .control-group {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .control-title {
            font-family: 'Press Start 2P', cursive;
            font-size: 0.65rem;
            color: var(--neon-blue);
            margin-bottom: 12px;
            letter-spacing: 1px;
        }
        .keys-list {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
        }
        .key-badge {
            background: linear-gradient(135deg, #1f1f2e, #14141f);
            border: 1px solid #33334d;
            border-bottom: 3px solid #0f0f15;
            padding: 6px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-weight: bold;
            font-size: 0.9rem;
            color: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            text-shadow: 0 1px 0 rgba(0,0,0,0.5);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 36px;
        }
        .key-badge.wide {
            min-width: 80px;
        }
        .instruction-text {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-left: 8px;
        }
        footer {
            margin-top: 25px;
            font-size: 0.75rem;
            color: var(--text-muted);
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        /* レトロなインジケーター */
        .status-bar {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 10px 10px 10px;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.6rem;
            color: var(--text-muted);
        }
        .indicator {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .indicator-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #00ff66;
            box-shadow: 0 0 8px #00ff66;
            animation: blink 1s infinite alternate;
        }
        @keyframes blink {
            0% { opacity: 0.4; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <header>
        <h1>NEON STRIKER</h1>
        <div class="subtitle">Belt-Scroller Prototype v1.0</div>
    </header>
    <div class="game-container">
        <div class="status-bar">
            <div class="indicator">
                <div class="indicator-dot"></div>
                <span>SYSTEM: ONLINE</span>
            </div>
            <div>FPS: <span id="fps-counter">60</span></div>
        </div>
        <div class="canvas-wrapper">
            <canvas id="gameCanvas" width="800" height="450"></canvas>
            <div class="scanlines"></div>
            <div class="crt-glow"></div>
        </div>
    </div>
    <div class="controls-panel">
        <div class="control-group">
            <div class="control-title">MOVEMENT (移動)</div>
            <div class="keys-list">
                <span class="key-badge">W</span>
                <span class="key-badge">A</span>
                <span class="key-badge">S</span>
                <span class="key-badge">D</span>
                <span class="instruction-text">または</span>
                <span class="key-badge">↑</span>
                <span class="key-badge">↓</span>
                <span class="key-badge">←</span>
                <span class="key-badge">→</span>
            </div>
        </div>
        <div class="control-group">
            <div class="control-title">ACTION (攻撃)</div>
            <div class="keys-list">
                <span class="key-badge">J</span>
                <span class="instruction-text">または</span>
                <span class="key-badge wide">Space</span>
                <span class="instruction-text">前方にパンチ！</span>
            </div>
        </div>
    </div>
    <footer>
        &copy; 2026 ANTIGRAVITY ENGINE. ALL RIGHTS RESERVED.
    </footer>
    <!-- ゲームロジックの読み込み -->
    <script src="game.js"></script>
</body>
</html>
