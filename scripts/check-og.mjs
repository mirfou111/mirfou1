/**
 * Vérifie que les images de partage sont présentes et à jour.
 *
 * Lancé par `npm run check:og`, et par la CI avant chaque build.
 * N'utilise pas sharp : il recalcule le SVG attendu de chaque contenu publié
 * et compare son empreinte à celle enregistrée par `npm run og`.
 *
 * Échoue (code 1) si une image manque ou est périmée.
 * Signale sans échouer les images qui ne correspondent plus à aucun contenu.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { RACINE, SORTIE, MANIFESTE, COUVERTURE, couverture, contenus, empreinte } from './og-commun.mjs';

const manifeste = existsSync(MANIFESTE) ? JSON.parse(readFileSync(MANIFESTE, 'utf-8')) : {};
const erreurs = [];
const avertissements = [];

// Image générique
if (!existsSync(RACINE + 'public/og-image.png')) {
    erreurs.push('public/og-image.png est absente');
} else if (manifeste[COUVERTURE] !== empreinte(couverture())) {
    erreurs.push('public/og-image.png est périmée (domaine ou gabarit modifié)');
}

// Une image par contenu publié
const { publies, sansTitre } = await contenus();

for (const { ref, nom, svg } of publies) {
    if (!existsSync(SORTIE + nom)) {
        erreurs.push(`${ref} : image absente (public/og/${nom})`);
    } else if (manifeste[nom] !== empreinte(svg)) {
        erreurs.push(`${ref} : image périmée — titre, description, signature ou gabarit ont changé`);
    }
}

for (const ref of sansTitre) avertissements.push(`${ref} : contenu publié sans titre`);

// Images orphelines
const attendues = new Set(publies.map((p) => p.nom));
if (existsSync(SORTIE)) {
    for (const f of readdirSync(SORTIE)) {
        if (f.endsWith('.png') && !attendues.has(f)) {
            avertissements.push(`public/og/${f} ne correspond plus à aucun contenu publié`);
        }
    }
}

for (const a of avertissements) console.warn(`  ! ${a}`);

if (erreurs.length > 0) {
    console.error(`\n✗ ${erreurs.length} image(s) de partage à régénérer :`);
    for (const e of erreurs) console.error(`  - ${e}`);
    console.error('\nLance « npm run og », puis committe public/og-image.png et public/og/.\n');
    process.exit(1);
}

console.log(`✓ Images de partage à jour (${publies.length} contenu(s) publié(s) + image générique).`);
