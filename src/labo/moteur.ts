/**
 * Moteur commun des démonstrations du Labo.
 *
 * Un algorithme est écrit comme un générateur : il travaille sur un tableau
 * et émet une « étape » à chaque action notable (comparer, échanger, placer…).
 * Le moteur exécute l'algorithme une fois, en entier, et photographie l'état
 * après chaque étape. Le lecteur n'a plus qu'à se déplacer dans cette liste
 * d'images : avancer, reculer, sauter à la fin ou glisser sur la frise.
 *
 * Ajouter un algorithme = écrire un générateur. Rien d'autre à toucher.
 */

export type TypeEtape =
    | 'debut'
    | 'info'      // explication, aucun changement
    | 'compare'   // i et j sont comparés
    | 'echange'   // i et j viennent d'être échangés
    | 'marque'    // un indice est mis en évidence (minimum courant, pivot…)
    | 'place'     // un ou plusieurs indices sont à leur place définitive
    | 'fin';

export type Etape = {
    type: TypeEtape;
    /** Ligne du pseudo-code à surligner (index à partir de 0) */
    ligne: number;
    /** Phrase affichée dans le journal et lue par les lecteurs d'écran */
    message: string;
    i?: number;
    j?: number;
    /** Indices placés définitivement (étape « place ») */
    indices?: number[];
    /** Sous-tableau actif. `null` efface la zone. */
    zone?: [number, number] | null;
    /** Indice mis en évidence (pivot, minimum…). `null` l'efface. */
    marque?: number | null;
};

export type Image = {
    valeurs: number[];
    etape: Etape;
    places: number[];
    zone: [number, number] | null;
    marque: number | null;
    comparaisons: number;
    echanges: number;
};

export type Algorithme = (a: number[]) => Generator<Etape, void, unknown>;

/** Garde-fou : au-delà, on considère que l'algorithme boucle. */
const MAX_IMAGES = 25_000;

export function enregistrer(algo: Algorithme, depart: number[]): Image[] {
    const a = depart.slice();
    const places = new Set<number>();
    let zone: [number, number] | null = null;
    let marque: number | null = null;
    let comparaisons = 0;
    let echanges = 0;

    const photo = (etape: Etape): Image => ({
        valeurs: a.slice(),
        etape,
        places: [...places],
        zone,
        marque,
        comparaisons,
        echanges,
    });

    const images: Image[] = [
        photo({
            type: 'debut',
            ligne: -1,
            message: 'Tableau de départ. Lance la lecture, ou avance pas à pas.',
        }),
    ];

    for (const etape of algo(a)) {
        if (etape.type === 'compare') comparaisons++;
        if (etape.type === 'echange') echanges++;
        if (etape.type === 'place') (etape.indices ?? []).forEach(k => places.add(k));
        if (etape.zone !== undefined) zone = etape.zone;
        if (etape.marque !== undefined) marque = etape.marque;

        images.push(photo(etape));
        if (images.length > MAX_IMAGES) {
            throw new Error(`[labo] Plus de ${MAX_IMAGES} étapes : l'algorithme boucle-t-il ?`);
        }
    }

    a.forEach((_, k) => places.add(k));
    zone = null;
    marque = null;
    images.push(
        photo({
            type: 'fin',
            ligne: -1,
            message: `Trié en ${comparaisons} comparaison${comparaisons > 1 ? 's' : ''} et ${echanges} échange${echanges > 1 ? 's' : ''}.`,
        }),
    );

    return images;
}

// ── Jeux de données ─────────────────────────────────────

export type Donnees = 'aleatoire' | 'presque-trie' | 'inverse' | 'repetitions';

export const DONNEES: Record<Donnees, string> = {
    aleatoire: 'Aléatoire',
    'presque-trie': 'Presque trié',
    inverse: 'Ordre inverse',
    repetitions: 'Valeurs répétées',
};

const entre = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

export function generer(type: Donnees, n: number): number[] {
    switch (type) {
        case 'presque-trie': {
            const a = Array.from({ length: n }, (_, k) => Math.round(8 + (k * 90) / Math.max(1, n - 1)));
            // Il faut au moins deux cases pour échanger deux voisins
            if (n < 2) return a;
            for (let s = 0; s < Math.max(1, Math.floor(n / 8)); s++) {
                const k = entre(0, n - 2);
                [a[k], a[k + 1]] = [a[k + 1], a[k]];
            }
            return a;
        }
        case 'inverse':
            return Array.from({ length: n }, (_, k) => Math.round(98 - (k * 90) / Math.max(1, n - 1)));
        case 'repetitions': {
            const paliers = [20, 45, 70, 95];
            return Array.from({ length: n }, () => paliers[entre(0, paliers.length - 1)]);
        }
        default:
            return Array.from({ length: n }, () => entre(8, 98));
    }
}
