import sharp from 'sharp';

const W = 1200;
const H = 630;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#f7f3ee"/>
  <rect x="24" y="24" width="${W-48}" height="${H-48}" fill="none" stroke="#d4cdc4" stroke-width="1" rx="4"/>
  <g transform="translate(920, 315) scale(2.8)" opacity="0.08">
    <circle cx="0" cy="-97" r="32" fill="#8b4513"/>
    <rect x="-20" y="-62" width="40" height="40" rx="4" transform="rotate(45 0 -42)" fill="#8b4513"/>
    <ellipse cx="0" cy="14" rx="44" ry="56" fill="#8b4513"/>
    <line x1="-20" y1="-117" x2="-56" y2="-153" stroke="#8b4513" stroke-width="8" stroke-linecap="round"/>
    <line x1="20" y1="-117" x2="56" y2="-153" stroke="#8b4513" stroke-width="8" stroke-linecap="round"/>
    <circle cx="-66" cy="-163" r="10" fill="#8b4513"/>
    <circle cx="66" cy="-163" r="10" fill="#8b4513"/>
    <path d="M-16 -58 L-80 -92" stroke="#8b4513" stroke-width="6" stroke-linecap="round"/>
    <path d="M-16 -42 L-88 -42" stroke="#8b4513" stroke-width="6" stroke-linecap="round"/>
    <path d="M-16 -26 L-80 8" stroke="#8b4513" stroke-width="6" stroke-linecap="round"/>
    <path d="M16 -58 L80 -92" stroke="#8b4513" stroke-width="6" stroke-linecap="round"/>
    <path d="M16 -42 L88 -42" stroke="#8b4513" stroke-width="6" stroke-linecap="round"/>
    <path d="M16 -26 L80 8" stroke="#8b4513" stroke-width="6" stroke-linecap="round"/>
  </g>
  <rect x="80" y="200" width="3" height="160" fill="#8b4513" opacity="0.35" rx="2"/>
  <text x="110" y="300" font-family="Georgia, serif" font-size="100" font-weight="700" fill="#1a1612" letter-spacing="10">MIRFOU</text>
  <text x="114" y="348" font-family="Georgia, serif" font-size="24" fill="#8a7e72" font-style="italic">Un jardin secret — construit grain par grain.</text>
  <rect x="114" y="378" width="500" height="1" fill="#d4cdc4"/>
  <text x="114" y="415" font-family="monospace" font-size="17" fill="#8a7e72" letter-spacing="1.5">IA · Code · Contes · Réflexions · Thiès, Sénégal</text>
  <text x="1120" y="585" font-family="monospace" font-size="18" fill="#8b4513" text-anchor="end" opacity="0.6">mirfou.space</text>
  <circle cx="80" cy="415" r="5" fill="#8b4513" opacity="0.5"/>
</svg>
`;

await sharp(Buffer.from(svg))
  .png()
  .toFile('public/og-image.png');

console.log('✅ public/og-image.png généré');