/**
 * Stéganographie : outils de base pour regarder une image de près.
 *
 * Tout se calcule dans le navigateur, sur des tableaux de pixels.
 * Aucune image ne quitte la machine du visiteur.
 *
 * Une image en niveaux de gris est un tableau d'octets : chaque pixel vaut
 * de 0 (noir) à 255 (blanc), et s'écrit avec 8 bits. Le bit de poids faible
 * (plan 0) pèse 1, le bit de poids fort (plan 7) pèse 128.
 */

export type Canal = 'gris' | 'rouge' | 'vert' | 'bleu';

export const CANAUX: Record<Canal, string> = {
    gris: 'Niveaux de gris',
    rouge: 'Rouge',
    vert: 'Vert',
    bleu: 'Bleu',
};

/** Une image réduite à un seul canal : un octet par pixel. */
export interface ImageCanal {
    largeur: number;
    hauteur: number;
    pixels: Uint8Array;
}

/**
 * Extrait un canal d'une image RGBA (le format des canvas).
 * Le gris suit la pondération classique de la luminance (ITU-R BT.601).
 */
export function extraireCanal(rgba: ArrayLike<number>, largeur: number, hauteur: number, canal: Canal): ImageCanal {
    const n = largeur * hauteur;
    if (rgba.length < n * 4) throw new Error(`[stegano] ${rgba.length} valeurs pour ${n} pixels RGBA`);
    const pixels = new Uint8Array(n);
    for (let p = 0, q = 0; p < n; p++, q += 4) {
        const r = rgba[q], v = rgba[q + 1], b = rgba[q + 2];
        pixels[p] =
            canal === 'rouge' ? r :
            canal === 'vert' ? v :
            canal === 'bleu' ? b :
            Math.round(0.299 * r + 0.587 * v + 0.114 * b);
    }
    return { largeur, hauteur, pixels };
}

/** Le plan de bits `bit` (0 à 7) : 1 si ce bit vaut 1 dans le pixel, 0 sinon. */
export function planDeBits(pixels: Uint8Array, bit: number): Uint8Array {
    if (!Number.isInteger(bit) || bit < 0 || bit > 7) throw new Error(`[stegano] plan ${bit} : attendu 0 à 7`);
    const plan = new Uint8Array(pixels.length);
    for (let p = 0; p < pixels.length; p++) plan[p] = (pixels[p] >> bit) & 1;
    return plan;
}

/** Combien de pixels prennent chaque valeur de 0 à 255. */
export function histogramme(pixels: Uint8Array): Uint32Array {
    const h = new Uint32Array(256);
    for (let p = 0; p < pixels.length; p++) h[pixels[p]]++;
    return h;
}

export interface Statistiques {
    moyenne: number;
    min: number;
    max: number;
    /** Entropie de Shannon en bits par pixel : 0 pour une image unie, 8 au plus. */
    entropie: number;
}

export function statistiques(pixels: Uint8Array): Statistiques {
    const n = pixels.length;
    if (n === 0) return { moyenne: 0, min: 0, max: 0, entropie: 0 };
    const h = histogramme(pixels);
    let somme = 0, min = 255, max = 0, entropie = 0;
    for (let v = 0; v < 256; v++) {
        if (h[v] === 0) continue;
        somme += v * h[v];
        if (v < min) min = v;
        if (v > max) max = v;
        const f = h[v] / n;
        entropie -= f * Math.log2(f);
    }
    return { moyenne: somme / n, min, max, entropie: entropie + 0 };
}

/** Part des pixels dont le bit `bit` vaut 1 (proche de 0,5 dans un plan qui ressemble à du bruit). */
export function partDeUns(pixels: Uint8Array, bit: number): number {
    if (pixels.length === 0) return 0;
    let uns = 0;
    for (let p = 0; p < pixels.length; p++) uns += (pixels[p] >> bit) & 1;
    return uns / pixels.length;
}

/** Un octet écrit en binaire sur 8 chiffres, du plan 7 au plan 0 : 173 → "10101101". */
export function enBinaire(valeur: number): string {
    return (valeur & 255).toString(2).padStart(8, '0');
}

/**
 * Le voisinage d'un pixel : un carré de `cote` × `cote` valeurs centré sur (x, y).
 * Les cases hors de l'image valent null.
 */
export function voisinage(image: ImageCanal, x: number, y: number, cote: number): (number | null)[][] {
    const r = Math.floor(cote / 2);
    const lignes: (number | null)[][] = [];
    for (let dy = -r; dy < cote - r; dy++) {
        const ligne: (number | null)[] = [];
        for (let dx = -r; dx < cote - r; dx++) {
            const xx = x + dx, yy = y + dy;
            ligne.push(xx >= 0 && yy >= 0 && xx < image.largeur && yy < image.hauteur
                ? image.pixels[yy * image.largeur + xx]
                : null);
        }
        lignes.push(ligne);
    }
    return lignes;
}

/** Un dégradé horizontal de 0 à 255 : l'image la plus lisse possible, utile pour comparer. */
export function degrade(largeur: number, hauteur: number): Uint8ClampedArray {
    const rgba = new Uint8ClampedArray(largeur * hauteur * 4);
    for (let y = 0; y < hauteur; y++) {
        for (let x = 0; x < largeur; x++) {
            const v = Math.round((x * 255) / Math.max(1, largeur - 1));
            const q = (y * largeur + x) * 4;
            rgba[q] = rgba[q + 1] = rgba[q + 2] = v;
            rgba[q + 3] = 255;
        }
    }
    return rgba;
}

/** Une phrase pour chaque plan, affichée sous l'image. */
export function commentairePlan(bit: number): string {
    const poids = 2 ** bit;
    if (bit === 7) return `Plan 7, le bit qui pèse ${poids}. Il dit seulement si le pixel est plutôt clair ou plutôt sombre : on reconnaît déjà l'image.`;
    if (bit >= 4) return `Plan ${bit}, le bit qui pèse ${poids}. Les formes restent nettes : ces bits portent l'essentiel de ce que l'œil voit.`;
    if (bit >= 2) return `Plan ${bit}, le bit qui pèse ${poids}. Les formes se dissolvent, seules les zones lisses gardent un dessin.`;
    if (bit === 1) return `Plan 1, le bit qui pèse 2. Presque du bruit : le changer ne modifie le pixel que de 2 sur 255.`;
    return `Plan 0, le bit de poids faible, qui pèse 1. Dans une photo, il ressemble à du bruit ; dans une image très lisse, il garde un dessin régulier. Le changer ne modifie le pixel que d'une unité, invisible à l'œil : c'est là qu'on cache un message.`;
}
