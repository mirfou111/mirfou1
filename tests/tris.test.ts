/**
 * Tests des algorithmes de tri du Labo.
 *
 * Lancés par `npm test`, avec le lanceur de tests intégré à Node
 * (aucune dépendance supplémentaire). Pour chaque tri, chaque jeu de données
 * et chaque taille, on vérifie le résultat ET les invariants de l'animation :
 * c'est l'animation que voient les visiteurs, elle doit dire la vérité.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRIS } from '../src/labo/tris.ts';
import { enregistrer, generer, DONNEES, type Donnees } from '../src/labo/moteur.ts';

const TAILLES = [1, 2, 3, 5, 8, 16, 32];
const ESSAIS = 25;
const croissant = (a: number[]) => a.slice().sort((x, y) => x - y);

for (const [nom, tri] of Object.entries(TRIS)) {
    test(`${tri.nom} : trie correctement, sans tricher dans l'animation`, () => {
        for (const donnees of Object.keys(DONNEES) as Donnees[]) {
            for (const n of TAILLES) {
                for (let essai = 0; essai < ESSAIS; essai++) {
                    const depart = generer(donnees, n);
                    const images = enregistrer(tri.algo, depart);
                    const fin = images[images.length - 1];
                    const cas = `${nom}, ${donnees}, n=${n}, départ=[${depart}]`;

                    assert.deepEqual(fin.valeurs, croissant(depart), `résultat non trié — ${cas}`);
                    assert.equal(new Set(fin.places).size, n, `toutes les cases ne sont pas placées — ${cas}`);

                    // Aucune valeur ne se perd ni n'apparaît en cours de route
                    const signature = croissant(depart).join(',');
                    for (const im of images) {
                        assert.equal(croissant(im.valeurs).join(','), signature, `valeurs altérées — ${cas}`);
                    }

                    // Chaque étape pointe une ligne existante du pseudo-code
                    for (const im of images) {
                        assert.ok(im.etape.ligne >= -1 && im.etape.ligne < tri.lignes.length, `ligne ${im.etape.ligne} hors pseudo-code — ${cas}`);
                    }

                    // Une case déclarée « à sa place » ne bouge plus jamais
                    for (let k = 1; k < images.length - 1; k++) {
                        for (const p of images[k].places) {
                            assert.equal(images[k + 1].valeurs[p], images[k].valeurs[p], `case ${p} placée puis modifiée — ${cas}`);
                        }
                    }
                }
            }
        }
    });
}

// ── Cas d'école : les complexités affichées dans les fiches doivent se vérifier ──
const trie = Array.from({ length: 16 }, (_, k) => k + 1);
const inverse = trie.slice().reverse();
const derniere = (algo: (typeof TRIS)[keyof typeof TRIS], a: number[]) => {
    const images = enregistrer(algo.algo, a);
    return images[images.length - 1];
};

test('tri à bulles : O(n) sur un tableau déjà trié (une seule passe, aucun échange)', () => {
    const fin = derniere(TRIS.bulles, trie);
    assert.equal(fin.comparaisons, 15);
    assert.equal(fin.echanges, 0);
});

test('tri par insertion : n(n−1)/2 échanges sur un tableau inversé', () => {
    assert.equal(derniere(TRIS.insertion, inverse).echanges, 120);
});

test('tri par sélection : n(n−1)/2 comparaisons, quel que soit l’ordre de départ', () => {
    assert.equal(derniere(TRIS.selection, trie).comparaisons, 120);
    assert.equal(derniere(TRIS.selection, inverse).comparaisons, 120);
});

test('tri rapide (pivot en dernière position) : pire cas O(n²) sur un tableau déjà trié', () => {
    assert.equal(derniere(TRIS.rapide, trie).comparaisons, 120);
});

test('générateur de données : tailles respectées, y compris les cas limites', () => {
    for (const donnees of Object.keys(DONNEES) as Donnees[]) {
        for (const n of [0, 1, 2, 32]) {
            const a = generer(donnees, n);
            assert.equal(a.length, n, `${donnees}, n=${n}`);
            assert.ok(a.every((v) => Number.isFinite(v)), `valeur non numérique — ${donnees}, n=${n}`);
        }
    }
});
