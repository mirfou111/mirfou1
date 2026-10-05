/**
 * Messages d'attente des rubriques vides.
 *
 * Chaque rubrique affiche son message tant qu'elle ne contient aucun texte
 * publié. Dès le premier texte, le message disparaît de lui-même : il n'y a
 * rien à retirer à la main. Les phrases peuvent être retouchées ici librement.
 */

export type Rubrique =
    | 'articles'
    | 'contes'
    | 'tutos'
    | 'reflexions'
    | 'recherches'
    | 'projets'
    | 'tags'
    | 'jardin'
    | 'labo'
    | 'accueil';

export type Bientot = {
    /** Phrase principale, affichée en grand */
    phrase: string;
    /** Précision, en dessous */
    detail: string;
};

export const BIENTOT: Record<Rubrique, Bientot> = {
    articles: {
        phrase: 'Les premiers articles sont en train de mûrir.',
        detail: "Ils seront publiés quand ils auront vraiment quelque chose à dire — pas avant.",
    },
    contes: {
        phrase: 'Les contes attendent la nuit pour être racontés.',
        detail: "Comme le veut la tradition, ils viendront à leur heure. Les premiers sont en route.",
    },
    tutos: {
        phrase: "J'écris les guides en pratiquant ce qu'ils enseignent.",
        detail: 'Les premiers tutos paraîtront une fois testés de bout en bout.',
    },
    reflexions: {
        phrase: 'Les premières réflexions sont encore dans le carnet.',
        detail: "Des notes courtes, écrites à mesure. Elles sortiront dès qu'elles tiendront debout.",
    },
    recherches: {
        phrase: 'Les travaux de recherche prennent le temps de la rigueur.',
        detail: 'Ils seront publiés une fois relus, sourcés et consolidés.',
    },
    projets: {
        phrase: 'Les projets reviennent bientôt, remis au propre.',
        detail: 'Chacun sera présenté avec son code, ses choix et ses erreurs.',
    },
    tags: {
        phrase: 'Les étiquettes naîtront avec les premiers textes.',
        detail: 'Elles relieront les sujets entre eux à mesure que le jardin repousse.',
    },
    jardin: {
        phrase: "Le réseau n'a pas encore de nœuds.",
        detail: 'Chaque nouveau texte viendra s\'y greffer, et les liens se dessineront ici.',
    },
    labo: {
        phrase: 'Les premières démonstrations sont en cours de montage.',
        detail:
            "Chaque algorithme aura sa page : on le regarde travailler pas à pas, " +
            'puis on comprend pourquoi il marche.',
    },
    accueil: {
        phrase: 'Le jardin se replante.',
        detail:
            "Les anciens textes ont été retirés. Ceux qui viendront seront écrits de ma main, " +
            'un par un, à leur rythme.',
    },
};
