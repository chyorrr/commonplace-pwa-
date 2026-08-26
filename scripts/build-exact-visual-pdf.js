import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Commonplace — User Manual</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background-color: #FAF7F2;
      font-family: 'DM Sans', sans-serif;
      color: #2A2430;
      position: relative;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Outer aesthetic border */
    .page-container {
      width: 210mm;
      min-height: 297mm;
      padding: 14mm 16mm;
      position: relative;
      background-color: #FAF7F2;
    }

    .outer-frame {
      position: absolute;
      top: 8mm;
      left: 8mm;
      right: 8mm;
      bottom: 8mm;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 6px;
      pointer-events: none;
      z-index: 1;
    }

    /* Dreamy Pastel Watercolor Clouds */
    .watercolor-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.55;
      pointer-events: none;
      z-index: 0;
    }

    .blob-pink {
      width: 130mm;
      height: 130mm;
      background: radial-gradient(circle, #FFD1E0 0%, rgba(255, 209, 224, 0) 70%);
      top: -20mm;
      left: -20mm;
    }

    .blob-purple {
      width: 140mm;
      height: 140mm;
      background: radial-gradient(circle, #EAD9FF 0%, rgba(234, 217, 255, 0) 70%);
      top: 80mm;
      right: -30mm;
    }

    .blob-green {
      width: 150mm;
      height: 150mm;
      background: radial-gradient(circle, #D6F5E3 0%, rgba(214, 245, 227, 0) 70%);
      bottom: -20mm;
      right: -20mm;
    }

    .blob-peach {
      width: 110mm;
      height: 110mm;
      background: radial-gradient(circle, #FFE4D6 0%, rgba(255, 228, 214, 0) 70%);
      bottom: 60mm;
      left: -20mm;
    }

    /* Content Area */
    .content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Top Brand Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding-bottom: 8px;
      margin-bottom: 2px;
    }

    .mascot-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 1.5px solid #2A2430;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }

    .mascot-badge img {
      width: 26px;
      height: 26px;
      object-fit: contain;
    }

    .header-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #1F1B24;
      text-transform: uppercase;
    }

    /* Feature Sections (Alternating 2-Column Grid) */
    .feature-row {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      align-items: center;
      gap: 16px;
      position: relative;
    }

    .feature-row.reverse {
      grid-template-columns: 1.15fr 1fr;
    }

    /* Scrapbook Paper Cards */
    .scrapbook-card {
      background: #FFFDF9;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 6px;
      padding: 14px;
      position: relative;
      box-shadow: 0 4px 14px rgba(45, 27, 78, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 82px;
    }

    /* Washi Tapes */
    .washi-tape {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 75px;
      height: 16px;
      opacity: 0.88;
      border-radius: 1px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .tape-floral {
      background-color: #F8B4C8;
      background-image: radial-gradient(#FFFFFF 1.5px, transparent 1.5px);
      background-size: 6px 6px;
    }

    .tape-grid {
      background-color: #D9C2F8;
      background-image: 
        linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
      background-size: 5px 5px;
    }

    .tape-sage {
      background-color: #A3C9A8;
      opacity: 0.85;
    }

    .tape-polka {
      background-color: #B5D6EA;
      background-image: radial-gradient(#FFFFFF 1.5px, transparent 1.5px);
      background-size: 6px 6px;
    }

    .tape-leaf {
      background-color: #D6C8B8;
      background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 3px, transparent 3px, transparent 6px);
    }

    /* Feature Text Descriptions */
    .feature-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
      position: relative;
    }

    .feature-heading {
      font-family: 'Playfair Display', serif;
      font-size: 14.5px;
      font-weight: 700;
      color: #231E28;
      line-height: 1.25;
    }

    .feature-bullets {
      font-size: 9px;
      line-height: 1.45;
      color: #554D5D;
      list-style: none;
      margin-top: 2px;
    }

    .feature-bullets li {
      position: relative;
      padding-left: 10px;
      margin-bottom: 2px;
    }

    .feature-bullets li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #8B5CF6;
      font-weight: bold;
    }

    /* Connector Squiggles */
    .connector-arrow {
      font-family: 'Caveat', cursive;
      font-size: 16px;
      color: #7C3AED;
      opacity: 0.75;
      line-height: 1;
      display: inline-block;
      margin: 1px 0;
    }

    /* Graphic Illustrations */
    /* 1. Polaroid & Paper Swatches */
    .polaroid-group {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      justify-content: center;
    }

    .polaroid-frame {
      width: 48px;
      height: 58px;
      background: #FFFFFF;
      border: 1px solid #DDD6CE;
      padding: 4px 4px 12px 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.06);
      transform: rotate(-3deg);
    }

    .polaroid-inner {
      width: 100%;
      height: 38px;
      background: #F0EDE8;
      border: 1px solid #E5E0D8;
    }

    .swatches-stack {
      display: flex;
      flex-direction: column;
      gap: 4px;
      transform: rotate(2deg);
    }

    .swatch {
      width: 32px;
      height: 14px;
      border-radius: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .swatch-1 { background: #FFD1DC; }
    .swatch-2 { background: #FFF3C4; border: 1px dashed #E2D6A5; }
    .swatch-3 { background: #D2EBD9; }

    /* 2. Cassette Tape & Soundwave */
    .voice-group {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      justify-content: center;
    }

    .cassette-box {
      width: 62px;
      height: 40px;
      background: #E8DEEE;
      border: 1.5px solid #3A3242;
      border-radius: 4px;
      padding: 3px;
      position: relative;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }

    .cassette-window {
      width: 38px;
      height: 16px;
      background: #6B5579;
      border-radius: 2px;
      margin: 6px auto 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 3px;
    }

    .cassette-spool {
      width: 10px;
      height: 10px;
      background: #FFFFFF;
      border-radius: 50%;
      border: 1.5px solid #2B2332;
    }

    .soundwave-svg {
      display: flex;
      align-items: center;
      gap: 2.5px;
      height: 28px;
    }

    .wave-bar {
      width: 2.5px;
      background: #2B2332;
      border-radius: 2px;
    }

    /* 3. Spotify Pill & Vinyl */
    .spotify-group {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      justify-content: center;
    }

    .spotify-pill {
      background: #D9E4D7;
      border: 1.2px solid #2B332B;
      border-radius: 16px;
      padding: 4px 8px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .spotify-icon-circle {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #1DB954;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .vinyl-disc {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1E1D1C;
      border: 2px solid #332F2C;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
    }

    .vinyl-label {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #D9C2F8;
      border: 1px solid #1E1D1C;
    }

    .music-pin-label {
      font-family: 'Caveat', cursive;
      font-size: 13px;
      color: #5A4E65;
      text-align: center;
      margin-top: 2px;
    }

    /* 4. Heart Tap & Sticker Sheet */
    .stickers-group {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      justify-content: center;
    }

    .heart-tap-box {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .heart-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #FFAEC5;
      border: 1.5px solid #2A2430;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(255, 105, 180, 0.25);
    }

    .stickers-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      background: #FAF6F0;
      padding: 4px 6px;
      border-radius: 4px;
      border: 1px dashed #D0C6B8;
    }

    .mini-sticker {
      font-size: 12px;
      text-align: center;
      line-height: 1;
    }

    /* 5. Folder Export */
    .export-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 100%;
    }

    .export-title {
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #2A2430;
    }

    .folders-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .folder-pill {
      background: #E8EDE4;
      border: 1px solid #333830;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 9px;
      font-weight: 700;
      font-family: 'DM Sans', sans-serif;
      color: #2B332B;
    }

    /* Bottom Info Card */
    .bottom-card {
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 6px;
      padding: 8px 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 2px;
    }

    .bottom-title {
      font-family: 'Playfair Display', serif;
      font-size: 11px;
      font-weight: 700;
      color: #2A2430;
      margin-bottom: 2px;
    }

    .bottom-desc {
      font-size: 8px;
      line-height: 1.35;
      color: #5A5262;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="outer-frame"></div>

    <!-- Watercolor Washes -->
    <div class="watercolor-blob blob-pink"></div>
    <div class="watercolor-blob blob-purple"></div>
    <div class="watercolor-blob blob-green"></div>
    <div class="watercolor-blob blob-peach"></div>

    <div class="content">
      <!-- Top Brand Header -->
      <div class="header">
        <div class="mascot-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2A2430" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.6 8.4L6 22l3.4-1.2c.8.2 1.7.2 2.6.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
            <path d="M8 10h.01M16 10h.01M9 15c1 1 5 1 6 0"/>
          </svg>
        </div>
        <h1 class="header-title">COMMONPLACE — USER MANUAL</h1>
      </div>

      <!-- 1. Scrapbook Boards & Aesthetic Themes -->
      <div class="feature-row">
        <div class="scrapbook-card">
          <div class="washi-tape tape-floral"></div>
          <div class="polaroid-group">
            <div class="polaroid-frame">
              <div class="polaroid-inner"></div>
            </div>
            <div class="swatches-stack">
              <div class="swatch swatch-1"></div>
              <div class="swatch swatch-2"></div>
              <div class="swatch swatch-3"></div>
            </div>
          </div>
        </div>

        <div class="feature-info">
          <h2 class="feature-heading">1. Scrapbook Boards & Aesthetic Themes</h2>
          <span class="connector-arrow">⤴</span>
          <ul class="feature-bullets">
            <li>Create custom boards with 7 pastel atmospheres (Sakura, Lilac, Matcha, Butter, Peach, Sky, Midnight Noir).</li>
            <li>Custom background tints & textured stationery framing.</li>
            <li>Privacy Passcode Locks for secret personal diaries.</li>
          </ul>
        </div>
      </div>

      <!-- 2. Voice Memos & Soundwaves -->
      <div class="feature-row reverse">
        <div class="feature-info">
          <h2 class="feature-heading">2. Voice Memos & Soundwaves</h2>
          <span class="connector-arrow">⤵</span>
          <ul class="feature-bullets">
            <li>Real microphone audio recording with live waveform frequency analysis.</li>
            <li>High-fidelity playback on phone speakers (iOS Safari MP4 + Android WebM).</li>
            <li>Persistent offline Base64 audio storage with optional text transcriptions.</li>
          </ul>
        </div>

        <div class="scrapbook-card">
          <div class="washi-tape tape-grid"></div>
          <div class="voice-group">
            <div class="cassette-box">
              <div class="cassette-window">
                <div class="cassette-spool"></div>
                <div class="cassette-spool"></div>
              </div>
            </div>
            <div class="soundwave-svg">
              <div class="wave-bar" style="height: 8px;"></div>
              <div class="wave-bar" style="height: 16px;"></div>
              <div class="wave-bar" style="height: 24px;"></div>
              <div class="wave-bar" style="height: 14px;"></div>
              <div class="wave-bar" style="height: 28px;"></div>
              <div class="wave-bar" style="height: 18px;"></div>
              <div class="wave-bar" style="height: 26px;"></div>
              <div class="wave-bar" style="height: 10px;"></div>
              <div class="wave-bar" style="height: 22px;"></div>
              <div class="wave-bar" style="height: 6px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Spotify Music Pins with Vinyl Disc -->
      <div class="feature-row">
        <div class="scrapbook-card" style="flex-direction: column;">
          <div class="washi-tape tape-sage"></div>
          <div class="spotify-group">
            <div class="spotify-pill">
              <div class="spotify-icon-circle">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.58 14.42c-.18.3-.54.39-.84.22-2.3-1.4-5.2-1.72-8.62-.94-.34.08-.68-.13-.76-.47-.08-.34.13-.68.47-.76 3.74-.85 6.96-.48 9.53 1.11.3.18.39.54.22.84zm1.22-2.72c-.23.37-.71.49-1.08.26-2.63-1.62-6.64-2.09-9.75-1.14-.42.13-.86-.11-.99-.53-.13-.42.11-.86.53-.99 3.56-1.08 7.98-.56 11.03 1.32.37.23.49.71.26 1.08zm.1-2.83C14.75 9.07 9.56 8.9 6.56 9.81c-.48.15-1-.13-1.15-.61-.15-.48.13-1 .61-1.15 3.46-1.05 9.21-.85 12.86 1.32.43.26.57.82.31 1.25-.26.43-.82.57-1.25.31z"/>
                </svg>
              </div>
              <span style="font-size: 8px; font-weight: 700; color: #2B332B; letter-spacing: 1px;">|||·||·|||</span>
            </div>
            <div class="vinyl-disc">
              <div class="vinyl-label"></div>
            </div>
          </div>
          <div class="music-pin-label">music pin ♫</div>
        </div>

        <div class="feature-info">
          <h2 class="feature-heading">3. Spotify Music Pins with Vinyl Disc</h2>
          <span class="connector-arrow">⤴</span>
          <ul class="feature-bullets">
            <li>Paste any Spotify track link to automatically embed song metadata.</li>
            <li>In-app 30-second official Spotify preview mini-player.</li>
            <li>Spinning vinyl disc aesthetic with 1-tap "Open in Spotify" button.</li>
          </ul>
        </div>
      </div>

      <!-- 4. Double-Tap Favorites & Stickers -->
      <div class="feature-row reverse">
        <div class="feature-info">
          <h2 class="feature-heading">4. Double-Tap Favorites & Stickers</h2>
          <span class="connector-arrow">⤵</span>
          <ul class="feature-bullets">
            <li>Double-tap or double-click any pin to instantly favorite with heart-pop animation.</li>
            <li>Discreet corner heart badge marks favorites and populates your Saved shelf.</li>
            <li>Sticker Studio: create and affix custom stickers directly onto memory cards.</li>
          </ul>
        </div>

        <div class="scrapbook-card">
          <div class="washi-tape tape-polka"></div>
          <div class="stickers-group">
            <div class="heart-tap-box">
              <div class="heart-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#FF2E7E" stroke="#FF2E7E" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>
            <div class="stickers-grid">
              <span class="mini-sticker">🌸</span>
              <span class="mini-sticker">🏷️</span>
              <span class="mini-sticker">📷</span>
              <span class="mini-sticker">☕</span>
              <span class="mini-sticker">🌷</span>
              <span class="mini-sticker">⭐</span>
              <span class="mini-sticker">🐈</span>
              <span class="mini-sticker">☁️</span>
              <span class="mini-sticker">🐾</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. PNG & PDF Export -->
      <div class="feature-row">
        <div class="scrapbook-card">
          <div class="washi-tape tape-leaf"></div>
          <div class="export-group">
            <div class="export-title">PNG & PDF</div>
            <div class="folders-row">
              <div class="folder-pill">PNG</div>
              <span style="font-size: 11px; color: #7C3AED;">→</span>
              <div class="folder-pill">PDF</div>
            </div>
          </div>
        </div>

        <div class="feature-info">
          <h2 class="feature-heading">5. High-Resolution PNG, JPG & PDF Export</h2>
          <span class="connector-arrow">⤴</span>
          <ul class="feature-bullets">
            <li>Export the full decorated board layout exactly as designed with washi tape & stickers.</li>
            <li>2x Retina lossless PNG, compressed JPG, and standalone printable PDF.</li>
            <li>Direct "Save to Photos" on iPhone camera roll and WhatsApp/Instagram sharing.</li>
          </ul>
        </div>
      </div>

      <!-- Bottom Quick Reference Card -->
      <div class="bottom-card">
        <div>
          <h3 class="bottom-title">6. Workspaces & Quick Capture</h3>
          <p class="bottom-desc">
            • <b>The Desk</b>: Scratchpad for unfiled ideas.<br>
            • <b>Tasks</b>: Minimalist to-do tracker with timestamps.<br>
            • <b>Search</b>: Instant multi-criteria search.
          </p>
        </div>
        <div>
          <h3 class="bottom-title">7. 100% Private Offline Storage</h3>
          <p class="bottom-desc">
            • <b>Offline & Local</b>: Stored in client-side IndexedDB.<br>
            • <b>Smart Back Button</b>: Steps back through sheets.<br>
            • <b>PWA Standalone</b>: Zero app store install needed.
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

const htmlPath = path.resolve('scripts/visual_manual.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log(`[HTML] Template generated at: ${htmlPath}`);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputPath = path.resolve('public/Commonplace_User_Manual.pdf');
const fileUrl = `file:///${htmlPath.replace(/\\\\/g, '/')}`;

console.log(`[PDF] Rendering exact visual PDF with Edge headless...`);
const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outputPath}" --no-pdf-header-footer "${fileUrl}"`;

try {
  execSync(cmd);
  console.log(`[PDF] Successfully created exact visual PDF at: ${outputPath}`);
} catch (e) {
  console.error(`[PDF] Edge render notice:`, e);
}
