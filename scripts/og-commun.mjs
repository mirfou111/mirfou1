/**
 * Gabarit des images de partage, partagé par :
 *   - scripts/generate-og.mjs  (rend les PNG, a besoin de sharp)
 *   - scripts/check-og.mjs     (vérifie qu'ils sont à jour, sans sharp)
 *
 * Le contrôle compare des empreintes de SVG, pas des PNG : le rendu des
 * polices varie d'une machine à l'autre, le SVG source non. Toute modification
 * du titre, de la description, de la signature, du domaine OU de ce gabarit
 * change l'empreinte, et signale donc l'image comme périmée.
 */

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SITE_DOMAIN, SITE_AUTHOR } from '../site.config.mjs';

export const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CONTENU = RACINE + 'src/content/';
export const SORTIE = RACINE + 'public/og/';

const W = 1200;
const H = 630;

// Mêmes valeurs que le thème clair de global.css
const C = {
    bg: '#f7f3ee',
    border: '#d4cdc4',
    text: '#1a1612',
    muted: '#5f574d',
    accent: '#8b4513',
};

// Doit rester aligné sur SECTIONS dans src/utils/garden.ts
export const SECTIONS = {
    articles: { label: 'Articles', color: '#7d593a' },
    contes: { label: 'Contes', color: '#3f694f' },
    tutos: { label: 'Tutos', color: '#456281' },
    reflexions: { label: 'Réflexions', color: '#715780' },
    recherches: { label: 'Recherches', color: '#58644d' },
    labo: { label: 'Labo', color: '#984467' },
};

const echappe = s =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Découpe un titre en lignes, en estimant la largeur des caractères. */
function couper(texte, maxLargeur, tailleFonte) {
    const largeurCar = tailleFonte * 0.52;
    const maxCar = Math.floor(maxLargeur / largeurCar);
    const lignes = [];
    let courante = '';

    for (const mot of texte.split(/\s+/)) {
        const essai = courante ? `${courante} ${mot}` : mot;
        if (essai.length > maxCar && courante) {
            lignes.push(courante);
            courante = mot;
        } else {
            courante = essai;
        }
    }
    if (courante) lignes.push(courante);
    return lignes.slice(0, 3);
}

/** Lit le frontmatter d'un fichier MDX sans dépendance externe. */
export function frontmatter(brut) {
    const m = brut.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return {};
    const data = {};
    for (const ligne of m[1].split(/\r?\n/)) {
        const kv = ligne.match(/^(\w+):\s*(.*)$/);
        if (!kv) continue;
        // Retire un éventuel commentaire YAML en fin de ligne (« draft: true  # … »),
        // mais pas un # contenu dans une valeur entre guillemets (titre « C# … »)
        let valeur = kv[2].trim();
        if (!/^["']/.test(valeur)) valeur = valeur.replace(/\s+#.*$/, '');
        data[kv[1]] = valeur.replace(/^["']|["']$/g, '');
    }
    return data;
}

/** La fourmi du logo, à l'échelle et en filigrane. */
const fourmi = (x, y, echelle, opacite) => `
  <g transform="translate(${x} ${y}) scale(${echelle})" opacity="${opacite}" fill="${C.accent}" stroke="${C.accent}">
    <circle cx="40" cy="18" r="8"/>
    <rect x="35" y="29" width="10" height="10" rx="1" transform="rotate(45 40 34)"/>
    <ellipse cx="40" cy="56" rx="11" ry="14"/>
    <line x1="35" y1="12" x2="26" y2="3" stroke-width="2" stroke-linecap="round"/>
    <line x1="45" y1="12" x2="54" y2="3" stroke-width="2" stroke-linecap="round"/>
    <circle cx="25" cy="2" r="2.5"/><circle cx="55" cy="2" r="2.5"/>
    <path d="M36 31 L20 22" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M36 34 L18 34" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M36 37 L20 46" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M44 31 L60 22" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M44 34 L62 34" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M44 37 L60 46" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </g>`;

export function carte({ titre, section, description }) {
    const meta = SECTIONS[section] ?? { label: 'mirfou', color: C.accent };
    const taille = titre.length > 70 ? 52 : titre.length > 45 ? 62 : 72;
    const lignes = couper(titre, W - 220, taille);
    const hauteurBloc = lignes.length * (taille * 1.22);
    const departY = 300 - hauteurBloc / 2 + taille * 0.85;

    const desc = description
        ? couper(description, W - 240, 26).slice(0, 2)
        : [];

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="${C.border}" stroke-width="1" rx="6"/>
  ${fourmi(900, 285, 3.1, 0.07)}
  <rect x="80" y="${departY - taille}" width="4" height="${hauteurBloc + 10}" fill="${meta.color}" rx="2"/>

  <text x="110" y="120" font-family="DejaVu Sans Mono, Liberation Mono, monospace" font-size="24"
        fill="${meta.color}" letter-spacing="3">${echappe(meta.label.toUpperCase())}</text>

  ${lignes
            .map(
                (l, i) =>
                    `<text x="110" y="${departY + i * taille * 1.22}" font-family="DejaVu Serif, Liberation Serif, Georgia, serif" font-size="${taille}" font-weight="bold" fill="${C.text}">${echappe(l)}</text>`,
            )
            .join('\n  ')}

  ${desc
            .map(
                (l, i) =>
                    `<text x="110" y="${departY + hauteurBloc + 30 + i * 36}" font-family="DejaVu Serif, Liberation Serif, Georgia, serif" font-size="26" fill="${C.muted}">${echappe(l)}</text>`,
            )
            .join('\n  ')}

  <rect x="110" y="524" width="380" height="1" fill="${C.border}"/>
  <text x="110" y="566" font-family="DejaVu Sans Mono, Liberation Mono, monospace" font-size="22"
        fill="${C.muted}" letter-spacing="1">${echappe(SITE_AUTHOR)}</text>
  <text x="${W - 110}" y="566" font-family="DejaVu Sans Mono, Liberation Mono, monospace" font-size="22"
        fill="${C.accent}" text-anchor="end" opacity="0.75">${echappe(SITE_DOMAIN)}</text>
</svg>`;
}

export function couverture() {
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="${C.border}" stroke-width="1" rx="6"/>
  ${fourmi(920, 315, 2.8, 0.08)}
  <rect x="80" y="200" width="4" height="160" fill="${C.accent}" opacity="0.5" rx="2"/>
  <text x="110" y="300" font-family="DejaVu Serif, Liberation Serif, Georgia, serif" font-size="100" font-weight="bold" fill="${C.text}" letter-spacing="10">MIRFOU</text>
  <text x="114" y="348" font-family="DejaVu Serif, Liberation Serif, Georgia, serif" font-size="26" fill="${C.muted}" font-style="italic">Un jardin secret - construit grain par grain.</text>
  <rect x="114" y="382" width="500" height="1" fill="${C.border}"/>
  <text x="114" y="420" font-family="DejaVu Sans Mono, Liberation Mono, monospace" font-size="20" fill="${C.muted}" letter-spacing="1.5">IA · Code · Contes · Réflexions · Thiès, Sénégal</text>
  <text x="${W - 110}" y="566" font-family="DejaVu Sans Mono, Liberation Mono, monospace" font-size="22" fill="${C.accent}" text-anchor="end" opacity="0.75">${echappe(SITE_DOMAIN)}</text>
</svg>`;
}


/** Fichiers MDX d'un dossier, sous-dossiers compris (le Labo range par famille). */
export async function fichiersMdx(dossier, prefixe = '') {
    const sortie = [];
    for (const e of await readdir(dossier, { withFileTypes: true })) {
        if (e.isDirectory()) {
            sortie.push(...(await fichiersMdx(`${dossier}/${e.name}`, `${prefixe}${e.name}/`)));
        } else if (/\.mdx?$/.test(e.name)) {
            sortie.push({ chemin: `${dossier}/${e.name}`, id: prefixe + e.name.replace(/\.mdx?$/, '') });
        }
    }
    return sortie;
}


/** Nom du fichier image d'un contenu — même règle que src/utils/og.ts */
export const nomImage = (ref) => ref.replaceAll('/', '--') + '.png';

/** Empreinte d'un SVG, fins de ligne normalisées */
export const empreinte = (svg) =>
    createHash('sha256').update(svg.replace(/\r\n/g, '\n')).digest('hex').slice(0, 16);

export const COUVERTURE = '_couverture';
export const MANIFESTE = SORTIE + 'manifeste.json';

/**
 * Tous les contenus, publiés ou non, avec le SVG attendu pour les publiés.
 * Renvoie { publies: [{ ref, nom, svg }], brouillons: n, sansTitre: [ref] }.
 */
export async function contenus() {
    const publies = [];
    const sansTitre = [];
    let brouillons = 0;

    for (const section of Object.keys(SECTIONS)) {
        const dossier = CONTENU + section;
        if (!existsSync(dossier)) continue;

        for (const { chemin, id } of await fichiersMdx(dossier)) {
            const data = frontmatter(await readFile(chemin, 'utf-8'));
            const ref = `${section}/${id}`;
            if (data.draft === 'true') { brouillons++; continue; }
            if (!data.title) { sansTitre.push(ref); continue; }
            publies.push({
                ref,
                nom: nomImage(ref),
                svg: carte({ titre: data.title, section, description: data.description }),
            });
        }
    }
    return { publies, brouillons, sansTitre };
}
