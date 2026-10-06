/**
 * Génère une image de partage (1200×630) par contenu publié, plus l'image générique.
 *
 * Lancé à la main : `npm run og`. Les PNG sont écrits dans public/og/ et
 * versionnés, pour que le déploiement ne dépende pas des polices présentes
 * dans le conteneur de build. Si un contenu n'a pas encore son image, le site
 * retombe automatiquement sur /og-image.png (voir src/utils/og.ts).
 *
 * Écrit aussi public/og/manifeste.json : l'empreinte du SVG de chaque image.
 * `npm run check:og` (lancé par la CI) s'en sert pour repérer une image
 * manquante ou périmée.
 */

import sharp from 'sharp';
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { RACINE, SORTIE, MANIFESTE, COUVERTURE, couverture, contenus, empreinte } from './og-commun.mjs';

async function rendre(svg, chemin) {
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(chemin);
}

await mkdir(SORTIE, { recursive: true });

const manifeste = {};

const svgCouverture = couverture();
await rendre(svgCouverture, RACINE + 'public/og-image.png');
manifeste[COUVERTURE] = empreinte(svgCouverture);
console.log('✓ public/og-image.png');

const { publies, brouillons, sansTitre } = await contenus();

for (const { nom, svg } of publies) {
    await rendre(svg, SORTIE + nom);
    manifeste[nom] = empreinte(svg);
    console.log(`✓ public/og/${nom}`);
}
for (const ref of sansTitre) console.warn(`  ! sans titre, ignoré : ${ref}`);

// Les images de contenus retirés ou dépubliés n'ont plus rien à faire là
const attendues = new Set(publies.map((p) => p.nom));
for (const f of await readdir(SORTIE)) {
    if (f.endsWith('.png') && !attendues.has(f)) {
        await unlink(SORTIE + f);
        console.log(`− public/og/${f} (contenu non publié)`);
    }
}

await writeFile(MANIFESTE, JSON.stringify(manifeste, null, 2) + '\n');

console.log(
    `\n${publies.length} image(s) générée(s)` +
    (brouillons ? `, ${brouillons} brouillon(s) ignoré(s)` : '') +
    (sansTitre.length ? `, ${sansTitre.length} sans titre` : '') + '.'
);
