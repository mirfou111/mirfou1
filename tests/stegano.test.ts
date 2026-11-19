/**
 * Tests des outils de stéganographie du Labo.
 *
 * Ce que la page montre doit être vrai : les plans de bits doivent
 * reconstituer exactement l'image, l'histogramme doit compter chaque pixel.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    extraireCanal, planDeBits, histogramme, statistiques, partDeUns,
    enBinaire, voisinage, degrade, commentairePlan,
} from '../src/labo/stegano.ts';

/** Une image RGBA au hasard, reproductible. */
function auHasard(largeur: number, hauteur: number, graine = 7): Uint8ClampedArray {
    let s = graine;
    const suivant = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) % 256;
    const rgba = new Uint8ClampedArray(largeur * hauteur * 4);
    for (let q = 0; q < rgba.length; q += 4) {
        rgba[q] = suivant(); rgba[q + 1] = suivant(); rgba[q + 2] = suivant(); rgba[q + 3] = 255;
    }
    return rgba;
}

test('les huit plans de bits reconstituent exactement chaque pixel', () => {
    const { pixels } = extraireCanal(auHasard(31, 17), 31, 17, 'gris');
    const plans = Array.from({ length: 8 }, (_, b) => planDeBits(pixels, b));
    for (let p = 0; p < pixels.length; p++) {
        const somme = plans.reduce((acc, plan, b) => acc + plan[p] * 2 ** b, 0);
        assert.equal(somme, pixels[p]);
    }
});

test('un plan de bits ne contient que des 0 et des 1, et refuse un plan hors limites', () => {
    const { pixels } = extraireCanal(auHasard(8, 8), 8, 8, 'rouge');
    for (const v of planDeBits(pixels, 3)) assert.ok(v === 0 || v === 1);
    assert.throws(() => planDeBits(pixels, 8));
    assert.throws(() => planDeBits(pixels, -1));
});

test('les canaux rouge, vert et bleu sont lus tels quels, le gris suit la luminance', () => {
    const rgba = new Uint8ClampedArray([200, 100, 50, 255, 0, 0, 0, 255]);
    assert.deepEqual([...extraireCanal(rgba, 2, 1, 'rouge').pixels], [200, 0]);
    assert.deepEqual([...extraireCanal(rgba, 2, 1, 'vert').pixels], [100, 0]);
    assert.deepEqual([...extraireCanal(rgba, 2, 1, 'bleu').pixels], [50, 0]);
    assert.deepEqual([...extraireCanal(rgba, 2, 1, 'gris').pixels], [Math.round(0.299 * 200 + 0.587 * 100 + 0.114 * 50), 0]);
    assert.throws(() => extraireCanal(rgba, 3, 1, 'gris'));
});

test("l'histogramme compte chaque pixel une fois", () => {
    const { pixels } = extraireCanal(auHasard(40, 25), 40, 25, 'gris');
    const h = histogramme(pixels);
    assert.equal(h.reduce((a, b) => a + b, 0), pixels.length);
    for (let v = 0; v < 256; v++) assert.equal(h[v], pixels.filter((x) => x === v).length);
});

test("l'entropie vaut 0 pour une image unie et 8 quand chaque valeur apparaît autant", () => {
    assert.equal(statistiques(new Uint8Array(100).fill(42)).entropie, 0);
    const toutes = Uint8Array.from({ length: 256 * 4 }, (_, k) => k % 256);
    assert.ok(Math.abs(statistiques(toutes).entropie - 8) < 1e-9);
    const s = statistiques(Uint8Array.from([10, 20, 30]));
    assert.equal(s.min, 10);
    assert.equal(s.max, 30);
    assert.equal(s.moyenne, 20);
});

test('la part de 1 dans un plan est juste', () => {
    assert.equal(partDeUns(Uint8Array.from([1, 3, 2, 0]), 0), 0.5);
    assert.equal(partDeUns(Uint8Array.from([255, 255]), 7), 1);
    assert.equal(partDeUns(new Uint8Array(0), 0), 0);
});

test('écriture binaire sur huit chiffres', () => {
    assert.equal(enBinaire(173), '10101101');
    assert.equal(enBinaire(0), '00000000');
    assert.equal(enBinaire(255), '11111111');
});

test('le voisinage est centré et marque les cases hors image', () => {
    const image = { largeur: 3, hauteur: 2, pixels: Uint8Array.from([1, 2, 3, 4, 5, 6]) };
    assert.deepEqual(voisinage(image, 0, 0, 3), [
        [null, null, null],
        [null, 1, 2],
        [null, 4, 5],
    ]);
    assert.deepEqual(voisinage(image, 2, 1, 2), [[2, 3], [5, 6]]);
});

test('le dégradé va de 0 à 255, opaque', () => {
    const rgba = degrade(256, 2);
    const { pixels } = extraireCanal(rgba, 256, 2, 'gris');
    assert.equal(pixels[0], 0);
    assert.equal(pixels[255], 255);
    for (let q = 3; q < rgba.length; q += 4) assert.equal(rgba[q], 255);
});

test('chaque plan a son commentaire', () => {
    for (let b = 0; b < 8; b++) assert.match(commentairePlan(b), new RegExp(`Plan ${b}`));
});
