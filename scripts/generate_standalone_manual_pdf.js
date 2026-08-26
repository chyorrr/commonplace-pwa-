import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();

// Color Palette matching the visual infographic
const colors = {
  bg: [250, 247, 242],        // Soft warm cream
  pinkBlob: [255, 215, 228],  // Sakura Pink
  purpleBlob: [234, 217, 255],// Lilac
  greenBlob: [218, 245, 230], // Sage Green
  cardBg: [255, 253, 249],    // Pure card cream
  cardBorder: [225, 218, 210],// Card border
  inkTitle: [31, 27, 36],     // Dark serif ink
  inkHeading: [35, 30, 40],   // Section heading ink
  inkBody: [85, 77, 93],      // Body text ink
  arrowPurple: [124, 58, 237],// Squiggle connector purple
  tapeFloral: [248, 180, 200],// Pink floral washi tape
  tapeGrid: [217, 194, 248],  // Purple grid washi tape
  tapeSage: [163, 201, 168],  // Sage green washi tape
  tapePolka: [181, 214, 234], // Light blue polka washi tape
  tapeLeaf: [214, 200, 184],  // Botanical leaf washi tape
};

// 1. Draw Background & Watercolor Clouds
doc.setFillColor(...colors.bg);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

// Watercolor blobs (simulated soft circles)
doc.setFillColor(...colors.pinkBlob);
doc.circle(28, 25, 45, 'F');

doc.setFillColor(...colors.purpleBlob);
doc.circle(pageWidth - 25, 120, 50, 'F');

doc.setFillColor(...colors.greenBlob);
doc.circle(pageWidth - 28, pageHeight - 35, 55, 'F');

doc.setFillColor(255, 235, 220);
doc.circle(30, pageHeight - 50, 40, 'F');

// 2. Outer Delicate Frame
doc.setDrawColor(220, 212, 202);
doc.setLineWidth(0.4);
doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 3, 3, 'S');

// 3. Top Header
// Mascot Circle Emblem
doc.setFillColor(255, 255, 255);
doc.setDrawColor(42, 36, 48);
doc.setLineWidth(0.5);
doc.circle(28, 19, 5, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.setTextColor(42, 36, 48);
doc.text('🐱', 26.2, 20.8);

// Title
doc.setFont('times', 'bold');
doc.setFontSize(16);
doc.setTextColor(...colors.inkTitle);
doc.text('COMMONPLACE — USER MANUAL', 37, 21);

// Helper function to draw scrapbook cards with washi tape
function drawScrapbookCard(x, y, w, h, tapeColor) {
  // Card base
  doc.setFillColor(...colors.cardBg);
  doc.setDrawColor(...colors.cardBorder);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');

  // Washi tape on top
  doc.setFillColor(...tapeColor);
  doc.roundedRect(x + w / 2 - 10, y - 2, 20, 3.5, 0.5, 0.5, 'F');
}

// ----------------------------------------------------
// SECTION 1: Scrapbook Boards & Aesthetic Themes
// ----------------------------------------------------
let y = 29;
drawScrapbookCard(14, y, 62, 38, colors.tapeFloral);

// Polaroid inside card
doc.setFillColor(255, 255, 255);
doc.setDrawColor(210, 200, 190);
doc.roundedRect(18, y + 5, 25, 28, 1, 1, 'FD');
doc.setFillColor(238, 234, 228);
doc.rect(20, y + 7, 21, 19, 'F');

// Paper swatches stack
doc.setFillColor(255, 209, 220);
doc.roundedRect(46, y + 8, 24, 7, 1, 1, 'F');
doc.setFillColor(255, 243, 196);
doc.roundedRect(48, y + 17, 22, 7, 1, 1, 'F');
doc.setFillColor(210, 235, 217);
doc.roundedRect(45, y + 26, 25, 7, 1, 1, 'F');

// Text on Right
doc.setFont('times', 'bold');
doc.setFontSize(11);
doc.setTextColor(...colors.inkHeading);
doc.text('1. Scrapbook Boards & Aesthetic Themes', 82, y + 8);

// Connector arrow
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(...colors.arrowPurple);
doc.text('⤴', 82, y + 13);

// Bullet points
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...colors.inkBody);
doc.text('• Create custom boards with 7 pastel atmospheres (Sakura, Lilac,', 82, y + 18);
doc.text('  Matcha, Butter, Peach, Sky, Midnight Noir).', 82, y + 22.5);
doc.text('• Custom background tints & textured stationery framing.', 82, y + 27);
doc.text('• Privacy Passcode Locks for secret personal diary entries.', 82, y + 31.5);

// ----------------------------------------------------
// SECTION 2: Voice Memos & Soundwaves
// ----------------------------------------------------
y += 45;

// Text on Left
doc.setFont('times', 'bold');
doc.setFontSize(11);
doc.setTextColor(...colors.inkHeading);
doc.text('2. Voice Memos & Soundwaves', 14, y + 8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(...colors.arrowPurple);
doc.text('⤵', 14, y + 13);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...colors.inkBody);
doc.text('• Real microphone audio recording with live waveform', 14, y + 18);
doc.text('  frequency analysis & live duration timer.', 14, y + 22.5);
doc.text('• High-fidelity playback on phone speakers (iOS MP4 + Android).', 14, y + 27);
doc.text('• Offline Base64 audio storage with optional text transcripts.', 14, y + 31.5);

// Card on Right
drawScrapbookCard(114, y, 82, 38, colors.tapeGrid);

// Cassette illustration
doc.setFillColor(232, 222, 238);
doc.setDrawColor(58, 50, 66);
doc.setLineWidth(0.4);
doc.roundedRect(120, y + 9, 32, 20, 2, 2, 'FD');
doc.setFillColor(107, 85, 121);
doc.roundedRect(124, y + 14, 24, 10, 1, 1, 'F');
doc.setFillColor(255, 255, 255);
doc.circle(130, y + 19, 2.5, 'FD');
doc.circle(142, y + 19, 2.5, 'FD');

// Soundwave bars
const barHeights = [4, 8, 14, 9, 16, 11, 15, 6, 13, 5];
barHeights.forEach((h, idx) => {
  doc.setFillColor(43, 35, 50);
  doc.roundedRect(158 + idx * 3.4, y + 19 - h / 2, 1.8, h, 0.5, 0.5, 'F');
});

// ----------------------------------------------------
// SECTION 3: Spotify Music Pins with Vinyl Disc
// ----------------------------------------------------
y += 45;
drawScrapbookCard(14, y, 78, 38, colors.tapeSage);

// Spotify Pill
doc.setFillColor(217, 228, 215);
doc.setDrawColor(43, 51, 43);
doc.setLineWidth(0.4);
doc.roundedRect(18, y + 9, 34, 14, 7, 7, 'FD');

// Spotify Green Icon & bars
doc.setFillColor(29, 185, 84);
doc.circle(24, y + 16, 3.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(6);
doc.setTextColor(43, 51, 43);
doc.text('|||·||·|||', 29.5, y + 17.5);

// Vinyl Disc
doc.setFillColor(30, 29, 28);
doc.setDrawColor(50, 45, 40);
doc.circle(64, y + 16, 12, 'FD');
doc.setFillColor(217, 194, 248);
doc.circle(64, y + 16, 4, 'F');

doc.setFont('times', 'italic');
doc.setFontSize(8.5);
doc.setTextColor(90, 78, 101);
doc.text('music pin ♫', 32, y + 31);

// Text on Right
doc.setFont('times', 'bold');
doc.setFontSize(11);
doc.setTextColor(...colors.inkHeading);
doc.text('3. Spotify Music Pins with Vinyl Disc', 98, y + 8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(...colors.arrowPurple);
doc.text('⤴', 98, y + 13);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...colors.inkBody);
doc.text('• Paste any Spotify track link to automatically embed songs.', 98, y + 18);
doc.text('• Built-in 30-second Spotify preview player inside the card.', 98, y + 22.5);
doc.text('• Spinning vinyl disc animation with 1-tap "Open in Spotify".', 98, y + 27);

// ----------------------------------------------------
// SECTION 4: Double-Tap Favorites & Stickers
// ----------------------------------------------------
y += 45;

// Text on Left
doc.setFont('times', 'bold');
doc.setFontSize(11);
doc.setTextColor(...colors.inkHeading);
doc.text('4. Double-Tap Favorites & Stickers', 14, y + 8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(...colors.arrowPurple);
doc.text('⤵', 14, y + 13);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...colors.inkBody);
doc.text('• Double-tap or double-click any pin to instantly favorite it.', 14, y + 18);
doc.text('• Animated heart pop feedback & corner heart badge on pins.', 14, y + 22.5);
doc.text('• Sticker Studio: craft custom stickers & affix directly to pins.', 14, y + 27);

// Card on Right
drawScrapbookCard(108, y, 88, 38, colors.tapePolka);

// Heart Tap Icon
doc.setFillColor(255, 174, 197);
doc.setDrawColor(42, 36, 48);
doc.setLineWidth(0.4);
doc.circle(122, y + 18, 7, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(255, 46, 126);
doc.text('♥', 119.5, y + 21);

// Mini stickers grid
doc.setFillColor(250, 246, 240);
doc.setDrawColor(208, 198, 184);
doc.roundedRect(136, y + 8, 54, 22, 1, 1, 'FD');

const stickerEmojis = ['🌸', '🏷️', '📷', '☕', '🌷', '⭐', '🐈', '☁️', '🐾'];
stickerEmojis.forEach((em, idx) => {
  const col = idx % 5;
  const row = Math.floor(idx / 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(em, 140 + col * 10, y + 15 + row * 8);
});

// ----------------------------------------------------
// SECTION 5: PNG & PDF Export
// ----------------------------------------------------
y += 45;
drawScrapbookCard(14, y, 68, 36, colors.tapeLeaf);

doc.setFont('times', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(42, 36, 48);
doc.text('PNG & PDF', 34, y + 12);

doc.setFillColor(232, 237, 228);
doc.setDrawColor(51, 56, 48);
doc.setLineWidth(0.4);
doc.roundedRect(24, y + 17, 18, 10, 1.5, 1.5, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.text('PNG', 28, y + 23.5);

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...colors.arrowPurple);
doc.text('→', 46, y + 23.5);

doc.setFillColor(232, 237, 228);
doc.roundedRect(52, y + 17, 18, 10, 1.5, 1.5, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.setTextColor(51, 56, 48);
doc.text('PDF', 56.5, y + 23.5);

// Text on Right
doc.setFont('times', 'bold');
doc.setFontSize(11);
doc.setTextColor(...colors.inkHeading);
doc.text('5. PNG, JPG & PDF Board Export', 88, y + 8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(...colors.arrowPurple);
doc.text('⤴', 88, y + 13);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...colors.inkBody);
doc.text('• Export the full decorated board layout exactly as designed.', 88, y + 18);
doc.text('• 2x Retina lossless PNG, compressed JPG, and standalone PDF.', 88, y + 22.5);
doc.text('• Direct "Save to Photos" on iPhone & WhatsApp/Instagram sharing.', 88, y + 27);

// ----------------------------------------------------
// SECTION 6: Bottom Overview Card
// ----------------------------------------------------
y += 42;
doc.setFillColor(255, 255, 255);
doc.setDrawColor(220, 212, 202);
doc.setLineWidth(0.3);
doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

// Left bottom column
doc.setFont('times', 'bold');
doc.setFontSize(9);
doc.setTextColor(42, 36, 48);
doc.text('6. Workspaces & Quick Capture', 18, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(...colors.inkBody);
doc.text('• The Desk: Scratchpad for unfiled memories.', 18, y + 11);
doc.text('• Tasks & Reminders: Minimalist to-do tracker.', 18, y + 15);
doc.text('• Search: Instant live multi-criteria search.', 18, y + 19);

// Right bottom column
doc.setFont('times', 'bold');
doc.setFontSize(9);
doc.setTextColor(42, 36, 48);
doc.text('7. 100% Private Offline Storage', 106, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(...colors.inkBody);
doc.text('• 100% Local: Stored in client-side IndexedDB.', 106, y + 11);
doc.text('• Smart Back Button: Steps back through modals.', 106, y + 15);
doc.text('• PWA Standalone: Zero app store install needed.', 106, y + 19);

// Output paths
const localPath = path.resolve('Commonplace_User_Manual.pdf');
const brainPath = 'C:\\Users\\Harsh Naik\\.gemini\\antigravity-ide\\brain\\a8a55dd6-a165-46f2-8893-63ecd3b04c3e\\Commonplace_User_Manual.pdf';

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(localPath, pdfBuffer);
fs.writeFileSync(brainPath, pdfBuffer);

console.log(`[PDF] Generated standalone user manual at: ${localPath}`);
console.log(`[PDF] Also saved to brain artifacts at: ${brainPath}`);
