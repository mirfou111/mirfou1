/**
 * Proverbes du hero de la page d'accueil.
 *
 * Un proverbe est tiré au hasard à chaque visite, puis remplacé à chaque fois
 * que le visiteur cesse de regarder le hero (changement d'onglet, défilement
 * hors de l'écran). Pour en ajouter un, il suffit d'ajouter une entrée ici.
 *
 * `wolof` est affiché avec l'attribut lang="wo" : les lecteurs d'écran
 * le prononcent alors correctement, et les moteurs savent de quelle langue il s'agit.
 */

export type Proverbe = {
    /** Le proverbe dans sa langue d'origine */
    wolof: string;
    /** Sa traduction ou son sens en français */
    fr: string;
};

export const PROVERBES: Proverbe[] = [
    {
        wolof: 'Ndank ndank mooy japp golo ci ñaay',
        fr: 'Doucement, doucement, on attrape le singe dans la forêt.',
    },
    {
        wolof: 'Nit nitay garabam',
        fr: "L'homme est le remède de l'homme.",
    },
    {
        wolof: 'Benn loxo du tàcc',
        fr: 'Une seule main ne peut pas applaudir.',
    },
    {
        wolof: 'Ku bëgg lem, ñeme yamb',
        fr: 'Qui veut le miel doit braver les abeilles.',
    },
    {
        wolof: 'Yàlla Yàlla, bey sa tool',
        fr: 'Prie Dieu, mais cultive ton champ.',
    },
];
