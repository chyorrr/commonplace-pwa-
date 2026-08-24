import fs from 'fs';
import path from 'path';

const uploadedPath = 'C:\\Users\\Harsh Naik\\.gemini\\antigravity-ide\\brain\\a8a55dd6-a165-46f2-8893-63ecd3b04c3e\\.user_uploaded\\media_1787596582063.jpg';
const iconsDir = path.resolve('public/icons');
const publicDir = path.resolve('public');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const imgBuffer = fs.readFileSync(uploadedPath);
const base64Data = imgBuffer.toString('base64');
const dataUri = `data:image/jpeg;base64,${base64Data}`;

// 1. Copy original to public/icons/logo.jpg and public/icons/logo.png
fs.writeFileSync(path.join(iconsDir, 'logo.jpg'), imgBuffer);
fs.writeFileSync(path.join(iconsDir, 'logo.png'), imgBuffer);
fs.writeFileSync(path.join(publicDir, 'logo.jpg'), imgBuffer);

// 2. Create favicon.svg with the uploaded tiger/cat mascot
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#FFFFFF"/>
  <image href="${dataUri}" x="16" y="16" width="480" height="480" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);

// 3. Generate maskable and standard PNG icon wrappers
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), imgBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), imgBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), imgBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), imgBuffer);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), imgBuffer);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), imgBuffer);

console.log('Successfully updated logo and favicon to the uploaded mascot image!');
