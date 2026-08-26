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
const margin = 16;
const contentWidth = pageWidth - margin * 2;

// Color Palette Constants
const c = {
  bg: [255, 248, 244],         // Warm cream
  sakura: [255, 215, 228],     // Sakura pink
  lilac: [234, 217, 255],      // Lilac
  matcha: [218, 245, 230],     // Matcha green
  inkPrimary: [42, 36, 48],    // Deep ink purple
  inkSecondary: [90, 80, 100], // Muted ink
  inkFaded: [140, 130, 150],   // Faded ink
  cardBg: [255, 253, 250],     // Card white
  brandPurple: [124, 58, 237], // Purple
  brandDark: [76, 29, 149],
};

function drawBackground(pageNum) {
  // Base cream wash
  doc.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top header watercolor wash
  doc.setFillColor(c.sakura[0], c.sakura[1], c.sakura[2]);
  doc.circle(pageWidth * 0.85, 20, 45, 'F');

  doc.setFillColor(c.lilac[0], c.lilac[1], c.lilac[2]);
  doc.circle(20, pageHeight * 0.45, 35, 'F');

  doc.setFillColor(c.matcha[0], c.matcha[1], c.matcha[2]);
  doc.circle(pageWidth * 0.9, pageHeight * 0.85, 40, 'F');

  // Page frame border
  doc.setDrawColor(230, 220, 210);
  doc.setLineWidth(0.5);
  doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, 'S');

  // Running footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(c.inkFaded[0], c.inkFaded[1], c.inkFaded[2]);
  doc.text('COMMONPLACE — AESTHETIC SCRAPBOOK & PERSONAL JOURNAL', margin, pageHeight - 11);
  doc.text(`Page ${pageNum} of 4`, pageWidth - margin - 15, pageHeight - 11);
}

function drawSectionHeader(title, y, washiColor = c.lilac) {
  // Washi tape bar
  doc.setFillColor(washiColor[0], washiColor[1], washiColor[2]);
  doc.roundedRect(margin, y - 4.5, 38, 5.5, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(c.inkPrimary[0], c.inkPrimary[1], c.inkPrimary[2]);
  doc.text(title, margin, y);

  doc.setDrawColor(210, 195, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);
}

function drawCard(x, y, w, h, title, washiColor = c.sakura) {
  // Card container
  doc.setFillColor(c.cardBg[0], c.cardBg[1], c.cardBg[2]);
  doc.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
  doc.setDrawColor(220, 210, 205);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2.5, 2.5, 'S');

  // Top washi tape
  doc.setFillColor(washiColor[0], washiColor[1], washiColor[2]);
  doc.roundedRect(x + w / 2 - 12, y - 2, 24, 3.5, 0.5, 0.5, 'F');

  // Card title
  if (title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(c.brandDark[0], c.brandDark[1], c.brandDark[2]);
    doc.text(title, x + 4, y + 6);
  }
}

// ==========================================
// PAGE 1: TITLE & INSTALLATION & NAVIGATION
// ==========================================
drawBackground(1);

// App Title & Brand Header
doc.setFont('times', 'bold');
doc.setFontSize(22);
doc.setTextColor(c.inkPrimary[0], c.inkPrimary[1], c.inkPrimary[2]);
doc.text('COMMONPLACE', margin, 24);

doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(c.brandPurple[0], c.brandPurple[1], c.brandPurple[2]);
doc.text('OFFICIAL USER MANUAL & COMPREHENSIVE FEATURE GUIDE', margin, 30);

doc.setFont('helvetica', 'italic');
doc.setFontSize(8.5);
doc.setTextColor(c.inkSecondary[0], c.inkSecondary[1], c.inkSecondary[2]);
doc.text('Aesthetic Tactile Digital Scrapbook · Audio Voice Memos · Spotify Embeds · Private Offline Journal', margin, 35);

// SECTION 1: QUICK INSTALLATION (PWA)
let y = 46;
drawSectionHeader('1. Quick Installation & Setup (PWA)', y, c.sakura);
y += 8;

drawCard(margin, y, (contentWidth - 6) / 2, 42, 'iOS (iPhone / iPad) Safari', c.sakura);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(c.inkSecondary[0], c.inkSecondary[1], c.inkSecondary[2]);
const iosText = [
  '1. Open your Commonplace link in Safari.',
  '2. Tap the Share button (square with arrow up).',
  '3. Scroll down and tap "Add to Home Screen".',
  '4. Tap "Add" in top-right corner.',
  '✓ Launches in full-screen standalone mode.',
  '✓ Offline storage & instant Home Screen icon.',
];
let textY = y + 12;
iosText.forEach(line => { doc.text(line, margin + 4, textY); textY += 4.5; });

drawCard(margin + (contentWidth - 6) / 2 + 6, y, (contentWidth - 6) / 2, 42, 'Android (Google Chrome)', c.matcha);
const androidText = [
  '1. Open your link in Google Chrome.',
  '2. Tap the 3 dots menu in top-right.',
  '3. Tap "Install App" or "Add to Home Screen".',
  '4. Confirm to install.',
  '✓ Zero app store download needed.',
  '✓ 100% offline functionality & auto-updates.',
];
textY = y + 12;
androidText.forEach(line => { doc.text(line, margin + (contentWidth - 6) / 2 + 10, textY); textY += 4.5; });

y += 48;

// SECTION 2: WORKSPACES & WORKFLOW
drawSectionHeader('2. Workspaces & Core Navigation', y, c.lilac);
y += 8;

const spaces = [
  { title: 'The Scrapbook Shelf (Home)', desc: 'View all your themed boards, covers, item counts, and daily inspirational memory prompts.' },
  { title: 'The Desk (Quick-Capture Inbox)', desc: 'A scratchpad for unfiled ideas, photos, or voice memos. Move items into boards anytime.' },
  { title: 'Tasks & Reminders', desc: 'Minimalist to-do tracker with completion toggles, timestamps, and priority tags.' },
  { title: 'Saved (Favorites Shelf)', desc: 'Instant gallery of all memories you double-tapped or favorited across all boards.' },
  { title: 'Instant Search', desc: 'Real-time multi-criteria search across notes, voice transcripts, hashtags, dates, and links.' },
];

spaces.forEach(sp => {
  drawCard(margin, y, contentWidth, 14, sp.title, c.lilac);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(c.inkSecondary[0], c.inkSecondary[1], c.inkSecondary[2]);
  doc.text(sp.desc, margin + 4, y + 10.5);
  y += 16;
});

// ==========================================
// PAGE 2: PINS & MEMORY CREATION
// ==========================================
doc.addPage();
drawBackground(2);

y = 22;
drawSectionHeader('3. Handcrafted Pin Types & Memory Creation', y, c.matcha);
y += 8;

const pins = [
  {
    title: '1. Photo & Polaroid Pins',
    color: c.sakura,
    points: [
      '• Upload photos or camera snapshots with realistic paper Polaroid frames.',
      '• Add handwritten date stamps, location tags, and heartfelt paper captions.',
      '• Adorned with realistic semi-transparent washi tape in pastel tones.',
    ]
  },
  {
    title: '2. Journal & Thought Notes',
    color: c.lilac,
    points: [
      '• Choose from 6 curated stationery tones: Sakura, Lilac, Matcha, Butter, Peach, Sky.',
      '• Toggle between clean sans-serif and elegant editorial serif typography.',
      '• Includes subtle paper grain texture and handcrafted drop shadows.',
    ]
  },
  {
    title: '3. Voice Memo Pins (Microphone Audio)',
    color: c.matcha,
    points: [
      '• Real microphone audio recording with live waveform frequency visualization.',
      '• High-fidelity playback on phone speakers (iOS Safari MP4 + Android WebM).',
      '• Instant 1-tap play/pause with persistent Base64 offline audio storage.',
    ]
  },
  {
    title: '4. Spotify Music Pins (Embedded Previews)',
    color: c.sakura,
    points: [
      '• Paste any Spotify track link (e.g. spotify.com/track/...) to embed automatically.',
      '• Play official 30-second Spotify preview songs directly inside the scrapbook.',
      '• Interactive spinning vinyl record design with 1-tap "Open in Spotify" button.',
    ]
  },
  {
    title: '5. Interactive Checklists',
    color: c.lilac,
    points: [
      '• Create packing lists, daily intentions, or bucket list trackers.',
      '• Tap items to scratch them off with interactive checkmark styling.',
    ]
  },
  {
    title: '6. Editorial Quote Pins',
    color: c.matcha,
    points: [
      '• Preserve book highlights, quotes, and meaningful overheard thoughts.',
      '• Formatted with serif quotation styling, author attribution, and source links.',
    ]
  },
  {
    title: '7. Visual Web Links',
    color: c.sakura,
    points: [
      '• Visual bookmarks for recipes, design inspiration, and articles.',
      '• Includes thumbnail previews, domain tags, and personal commentary.',
    ]
  },
];

pins.forEach(pin => {
  drawCard(margin, y, contentWidth, 27, pin.title, pin.color);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(c.inkSecondary[0], c.inkSecondary[1], c.inkSecondary[2]);
  let py = y + 10;
  pin.points.forEach(pt => {
    doc.text(pt, margin + 4, py);
    py += 4.2;
  });
  y += 30;
});

// ==========================================
// PAGE 3: GESTURES, THEMES & PASSCODES
// ==========================================
doc.addPage();
drawBackground(3);

y = 22;
drawSectionHeader('4. Interactive Gestures & Power Features', y, c.sakura);
y += 8;

const gestures = [
  {
    title: 'Double-Tap / Double-Click to Favorite',
    desc: 'Double-tap any pin on a board to instantly favorite it with an animated heart pop. A discreet heart badge marks favorited items, which automatically populate your Saved shelf.'
  },
  {
    title: 'Instant Pin Reader Modal',
    desc: 'Tap any pin once to view high-resolution photos, listen to audio, read transcripts, or open links without layout delays.'
  },
  {
    title: 'Sticker Studio & Pin Badges',
    desc: 'Create personalized stickers and affix them directly onto any pin card for a personalized collage scrapbook feel.'
  },
  {
    title: 'Privacy Passcode Locks',
    desc: 'Protect personal journals or sensitive boards with a private 4-digit PIN. Locked boards blur their contents until unlocked.'
  },
  {
    title: '7 Ambient Color Themes',
    desc: 'Customize the entire app with tailored pastel aesthetics: Sakura (Soft Pink), Lilac (Lavender), Matcha (Sage Green), Butter (Warm Cream), Peach (Coral), Sky (Airy Blue), and Midnight Noir (Sleek Dark Mode).'
  },
  {
    title: 'Smart Phone Back Button & Navigation Stack',
    desc: 'Using your Android back button, Android gesture swipe, or browser back button smoothly closes open sheets first, exits boards, and steps back through your tab history without accidentally quitting the app.'
  }
];

gestures.forEach(g => {
  drawCard(margin, y, contentWidth, 24, g.title, c.sakura);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(c.inkSecondary[0], c.inkSecondary[1], c.inkSecondary[2]);
  const lines = doc.splitTextToSize(g.desc, contentWidth - 8);
  doc.text(lines, margin + 4, y + 10.5);
  y += 28;
});

// ==========================================
// PAGE 4: SHARING, EXPORT & PRIVACY
// ==========================================
doc.addPage();
drawBackground(4);

y = 22;
drawSectionHeader('5. Direct Social Sharing & Board Export', y, c.lilac);
y += 8;

const sharingFeatures = [
  {
    title: 'Direct WhatsApp Sharing',
    desc: 'Tap Share on any board or pin to send formatted text summaries, memory details, and titles directly into WhatsApp chats.'
  },
  {
    title: 'Instagram DM & Story Sharing',
    desc: 'Quickly share formatted memories directly to Instagram Direct Messages or generate aesthetic cards for Instagram Stories.'
  },
  {
    title: 'iOS Native Share Sheet (AirDrop & Messages)',
    desc: 'On iPhone and iPad, tap Share to trigger the native iOS Share Sheet for AirDrop, iMessage, Mail, or quick clipboard copying.'
  }
];

sharingFeatures.forEach(sf => {
  drawCard(margin, y, contentWidth, 22, sf.title, c.lilac);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(c.inkSecondary[0], c.inkSecondary[1], c.inkSecondary[2]);
  const lines = doc.splitTextToSize(sf.desc, contentWidth - 8);
  doc.text(lines, margin + 4, y + 10);
  y += 25;
});

y += 4;
drawSectionHeader('6. Export Entire Board (PNG, JPG, PDF)', y, c.matcha);
y += 8;

const exportFormats = [
  {
    title: 'Save as High-Res PNG (2x Retina)',
    desc: 'Captures your full decorated board with exact pastel background colors, washi tape, custom stickers, and pin layout into a crisp lossless .png image.'
  },
  {
    title: 'Save as Compressed JPG',
    desc: 'Generates a lightweight, high-quality .jpg image of your board that automatically downloads to your device.'
  },
  {
    title: 'Download Standalone PDF',
    desc: 'Compiles your decorated board into a standalone .pdf document sized for digital archiving or printing as an editorial journal sheet.'
  },
  {
    title: 'Save Directly to iPhone Photos',
    desc: 'On iOS Safari PWA, the export options allow saving the rendered board image directly into your Apple Photos camera roll with one tap.'
  }
];

exportFormats.forEach(ef => {
  drawCard(margin, y, contentWidth, 22, ef.title, c.matcha);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(c.inkSecondary[0], c.inkSecondary[1], c.inkSecondary[2]);
  const lines = doc.splitTextToSize(ef.desc, contentWidth - 8);
  doc.text(lines, margin + 4, y + 10);
  y += 25;
});

// Final Privacy & Offline Stamp
y += 2;
doc.setFillColor(c.cardBg[0], c.cardBg[1], c.cardBg[2]);
doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
doc.setDrawColor(200, 190, 185);
doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(c.brandDark[0], c.brandDark[1], c.brandDark[2]);
doc.text('🔒 100% PRIVATE, OFFLINE & SECURE', margin + 4, y + 6.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(c.inkSecondary[0], c.inkSecondary[1], c.inkSecondary[2]);
doc.text('All your scrapbook boards, voice memos, photos, checklists, and notes are stored locally on your device in client-side IndexedDB.', margin + 4, y + 11.5);
doc.text('No tracking, no external cloud scanning — your personal memories remain completely yours.', margin + 4, y + 15.5);

// Save PDF
const outputDir = path.resolve('public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const outputPath = path.join(outputDir, 'Commonplace_User_Manual.pdf');
const pdfData = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfData));

console.log(`[PDF] Successfully generated User Manual PDF at: ${outputPath}`);
