/**
 * Algorithmes de tri du Labo.
 *
 * Chaque tri est un générateur (voir moteur.ts) accompagné de son pseudo-code
 * et de sa fiche de complexité. Les numéros de `ligne` émis par le générateur
 * correspondent aux indices du tableau `lignes` : c'est ce qui permet de
 * surligner la ligne en cours d'exécution.
 */
import type { Algorithme } from './moteur';

export type Fiche = {
    meilleur: string;
    moyen: string;
    pire: string;
    memoire: string;
    stable: boolean;
    enPlace: boolean;
};

export type Tri = {
    nom: string;
    lignes: string[];
    fiche: Fiche;
    algo: Algorithme;
};

// ── Tri à bulles ────────────────────────────────────────
const bulles: Algorithme = function* (a) {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
        yield { type: 'info', ligne: 0, message: `Passe ${i + 1} : la plus grande valeur restante va remonter vers la droite.` };
        let echange = false;
        yield { type: 'info', ligne: 1, message: 'Aucun échange pour l’instant dans cette passe.' };

        for (let j = 0; j < n - 1 - i; j++) {
            yield { type: 'compare', ligne: 3, i: j, j: j + 1, message: `Compare ${a[j]} et ${a[j + 1]}.` };
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                echange = true;
                yield { type: 'echange', ligne: 4, i: j, j: j + 1, message: `${a[j + 1]} est plus grand : il passe à droite de ${a[j]}.` };
            }
        }

        if (!echange) {
            yield {
                type: 'place',
                ligne: 5,
                indices: a.map((_, k) => k),
                message: 'Aucun échange pendant toute la passe : le tableau est déjà trié, on s’arrête.',
            };
            return;
        }
        yield { type: 'place', ligne: 6, indices: [n - 1 - i], message: `${a[n - 1 - i]} a atteint sa place définitive.` };
    }
    yield { type: 'place', ligne: 6, indices: [0], message: 'Le dernier élément restant est forcément à sa place.' };
};

// ── Tri par insertion ───────────────────────────────────
const insertion: Algorithme = function* (a) {
    const n = a.length;
    yield { type: 'info', ligne: 0, zone: [0, 0], message: 'Un seul élément : la partie gauche est triée par définition.' };

    for (let i = 1; i < n; i++) {
        yield { type: 'info', ligne: 0, zone: [0, i], marque: i, message: `On insère ${a[i]} dans la partie déjà triée, à sa gauche.` };
        let j = i;
        yield { type: 'info', ligne: 1, message: 'On part de sa position actuelle.' };

        while (j > 0) {
            yield { type: 'compare', ligne: 2, i: j - 1, j, message: `Compare ${a[j - 1]} et ${a[j]}.` };
            if (a[j - 1] <= a[j]) {
                yield { type: 'info', ligne: 2, message: `${a[j - 1]} ≤ ${a[j]} : ${a[j]} est bien placé dans la partie triée.` };
                break;
            }
            [a[j - 1], a[j]] = [a[j], a[j - 1]];
            yield { type: 'echange', ligne: 3, i: j - 1, j, marque: j - 1, message: `${a[j]} est plus grand : ${a[j - 1]} recule d’une case.` };
            j--;
            yield { type: 'info', ligne: 4, message: j === 0 ? 'Arrivé au début du tableau.' : 'On continue vers la gauche.' };
        }
    }
    yield { type: 'info', ligne: 0, zone: null, marque: null, message: 'Tous les éléments ont été insérés.' };
};

// ── Tri par sélection ───────────────────────────────────
const selection: Algorithme = function* (a) {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
        yield { type: 'info', ligne: 0, zone: [i, n - 1], message: `On cherche le plus petit élément entre la case ${i} et la fin.` };
        let min = i;
        yield { type: 'marque', ligne: 1, marque: min, message: `Minimum provisoire : ${a[min]}.` };

        for (let j = i + 1; j < n; j++) {
            yield { type: 'compare', ligne: 3, i: j, j: min, message: `Compare ${a[j]} au minimum actuel ${a[min]}.` };
            if (a[j] < a[min]) {
                min = j;
                yield { type: 'marque', ligne: 3, marque: min, message: `Nouveau minimum : ${a[min]}.` };
            }
        }

        if (min !== i) {
            [a[i], a[min]] = [a[min], a[i]];
            yield { type: 'echange', ligne: 4, i, j: min, marque: i, message: `On place le minimum ${a[i]} en case ${i}.` };
        } else {
            yield { type: 'info', ligne: 4, message: `${a[i]} est déjà le minimum : aucun échange.` };
        }
        yield { type: 'place', ligne: 5, indices: [i], marque: null, message: `${a[i]} est à sa place définitive.` };
    }
    yield { type: 'place', ligne: 5, indices: [n - 1], zone: null, message: 'Le dernier élément est forcément le plus grand.' };
};

// ── Tri rapide (partition de Lomuto, pivot en dernière position) ──
const rapide: Algorithme = function* (a) {
    function* trier(bas: number, haut: number): Generator<any, void, unknown> {
        yield { type: 'info', ligne: 0, zone: [bas, haut], marque: null, message: bas <= haut ? `On trie la zone des cases ${bas} à ${haut}.` : 'Zone vide.' };

        if (bas >= haut) {
            if (bas === haut) {
                yield { type: 'place', ligne: 1, indices: [bas], message: `Un seul élément (${a[bas]}) : il est à sa place.` };
            } else {
                yield { type: 'info', ligne: 1, message: 'Zone vide : rien à faire.' };
            }
            return;
        }

        const pivot = a[haut];
        yield { type: 'marque', ligne: 2, marque: haut, message: `Pivot : ${pivot}, le dernier élément de la zone.` };
        let p = bas;
        yield { type: 'info', ligne: 3, message: `Les éléments plus petits que ${pivot} seront rangés à partir de la case ${p}.` };

        for (let j = bas; j < haut; j++) {
            yield { type: 'compare', ligne: 5, i: j, j: haut, message: `${a[j]} est-il plus petit que le pivot ${pivot} ?` };
            if (a[j] < pivot) {
                if (j !== p) {
                    [a[j], a[p]] = [a[p], a[j]];
                    yield { type: 'echange', ligne: 6, i: j, j: p, message: `Oui : ${a[p]} rejoint le groupe des petits, en case ${p}.` };
                } else {
                    yield { type: 'info', ligne: 6, message: `Oui : ${a[p]} est déjà dans le groupe des petits.` };
                }
                p++;
            }
        }

        if (p !== haut) {
            [a[p], a[haut]] = [a[haut], a[p]];
            yield { type: 'echange', ligne: 7, i: p, j: haut, marque: p, message: `Le pivot ${pivot} vient se placer en case ${p}, entre les petits et les grands.` };
        }
        yield { type: 'place', ligne: 7, indices: [p], marque: null, message: `${pivot} est à sa place définitive.` };

        yield { type: 'info', ligne: 8, message: 'On recommence à gauche du pivot, puis à droite.' };
        yield* trier(bas, p - 1);
        yield* trier(p + 1, haut);
    }

    yield* trier(0, a.length - 1);
    yield { type: 'info', ligne: 8, zone: null, marque: null, message: 'Toutes les zones sont triées.' };
};

// ── Registre ────────────────────────────────────────────

export const TRIS = {
    bulles: {
        nom: 'Tri à bulles',
        lignes: [
            'pour i de 0 à n−2',
            '  échangé ← faux',
            '  pour j de 0 à n−2−i',
            '    si a[j] > a[j+1]',
            '      échanger a[j] et a[j+1] ; échangé ← vrai',
            '  si non échangé : arrêter',
            '  a[n−1−i] est à sa place',
        ],
        fiche: { meilleur: 'O(n)', moyen: 'O(n²)', pire: 'O(n²)', memoire: 'O(1)', stable: true, enPlace: true },
        algo: bulles,
    },
    insertion: {
        nom: 'Tri par insertion',
        lignes: [
            'pour i de 1 à n−1',
            '  j ← i',
            '  tant que j > 0 et a[j−1] > a[j]',
            '    échanger a[j−1] et a[j]',
            '    j ← j − 1',
        ],
        fiche: { meilleur: 'O(n)', moyen: 'O(n²)', pire: 'O(n²)', memoire: 'O(1)', stable: true, enPlace: true },
        algo: insertion,
    },
    selection: {
        nom: 'Tri par sélection',
        lignes: [
            'pour i de 0 à n−2',
            '  min ← i',
            '  pour j de i+1 à n−1',
            '    si a[j] < a[min] : min ← j',
            '  échanger a[i] et a[min]',
            '  a[i] est à sa place',
        ],
        fiche: { meilleur: 'O(n²)', moyen: 'O(n²)', pire: 'O(n²)', memoire: 'O(1)', stable: false, enPlace: true },
        algo: selection,
    },
    rapide: {
        nom: 'Tri rapide',
        lignes: [
            'trier(bas, haut) :',
            '  si bas ≥ haut : terminé',
            '  pivot ← a[haut]',
            '  p ← bas',
            '  pour j de bas à haut−1',
            '    si a[j] < pivot',
            '      échanger a[j] et a[p] ; p ← p + 1',
            '  échanger a[p] et a[haut]',
            '  trier(bas, p−1) ; trier(p+1, haut)',
        ],
        fiche: { meilleur: 'O(n log n)', moyen: 'O(n log n)', pire: 'O(n²)', memoire: 'O(log n)', stable: false, enPlace: true },
        algo: rapide,
    },
} satisfies Record<string, Tri>;

export type NomTri = keyof typeof TRIS;
