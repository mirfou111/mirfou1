/**
 * Familles du Labo et feuille de route.
 *
 * `prevus` liste les démonstrations envisagées : elles s'affichent comme
 * « à venir » sur la page /labo tant qu'aucune page ne porte ce titre.
 * Les textes se retouchent librement ici.
 */

export type Famille = 'tris' | 'graphes' | 'combinatoire' | 'steganographie';

export const FAMILLES: Record<Famille, { nom: string; intro: string; prevus: string[] }> = {
    tris: {
        nom: 'Tris',
        intro: "Ordonner une liste, et voir ce que chaque méthode coûte.",
        prevus: [
            'Tri à bulles',
            'Tri par insertion',
            'Tri par sélection',
            'Tri rapide',
            'Tri fusion',
            'Tri par tas',
        ],
    },
    graphes: {
        nom: 'Graphes',
        intro: 'Parcourir, chercher un chemin, relier au moindre coût.',
        prevus: [
            'Parcours en largeur',
            'Parcours en profondeur',
            'Dijkstra',
            'A*',
            'Kruskal',
            'Prim',
            'Tri topologique',
            'Mariage stable',
        ],
    },
    combinatoire: {
        nom: 'Combinatoire',
        intro: 'Compter, énumérer et explorer les possibilités.',
        prevus: [
            'Permutations',
            'Combinaisons',
            'Sous-ensembles',
            'Triangle de Pascal',
            'N reines',
        ],
    },
    steganographie: {
        nom: 'Stéganographie',
        intro: 'Cacher un message dans une image, puis tenter de le débusquer.',
        prevus: [
            "Anatomie d'une image",
            'Cacher un message',
            'Révéler un message',
            'Détecter un message',
        ],
    },
};

export const ORDRE_FAMILLES: Famille[] = ['tris', 'graphes', 'combinatoire', 'steganographie'];
