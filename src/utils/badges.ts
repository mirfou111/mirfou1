/**
 * Les deux systèmes de badges du jardin.
 *
 * Source unique : les composants OriginBadge / StatusBadge et la page /legende
 * lisent tous ces définitions, pour qu'un libellé ne puisse jamais diverger
 * entre le badge et son explication.
 *
 * Les deux axes sont indépendants : un texte peut être « authentique » et
 * encore « graine », ou « généré » et « mature ».
 */

export type Origin = 'authentique' | 'assiste' | 'genere';
export type Status = 'graine' | 'pousse' | 'mature';

type Def = {
    label: string;
    symbol: string;
    /** Phrase courte, infobulle du badge */
    short: string;
    /** Explication complète, page /legende */
    long: string;
    /** Couleur : variable CSS, ou null pour le rendu neutre */
    tone: string | null;
};

export const ORIGINS: Record<Origin, Def> = {
    authentique: {
        label: 'Authentique',
        symbol: '✦',
        short: 'Écrit entièrement par mirfou, sans assistance IA',
        long: `Chaque phrase a été écrite à la main. Aucune IA n'est intervenue, ni pour le fond, ni pour la forme.`,
        tone: 'var(--tone-positif)',
    },
    assiste: {
        label: 'Assisté',
        symbol: '◈',
        short: 'Écrit par mirfou avec assistance IA (structure, relecture ou suggestions)',
        long: `Les idées et le texte sont de moi, mais une IA m'a assisté quelque part : structurer le plan, reformuler un passage, relire, ou suggérer un angle.`,
        tone: 'var(--tone-encours)',
    },
    genere: {
        label: 'Généré',
        symbol: '◇',
        short: 'Contenu généré par IA, édité et validé par mirfou',
        long: `Le texte a été produit par une IA à partir de mes consignes, puis relu, corrigé et validé par moi. J'en assume le contenu, mais je ne prétends pas l'avoir écrit.`,
        tone: null,
    },
};

export const STATUSES: Record<Status, Def> = {
    graine: {
        label: 'Graine',
        symbol: '⬡',
        short: 'Idée brute, contenu embryonnaire, notes en vrac',
        long: `Une intuition déposée là pour ne pas l'oublier. Souvent des notes en vrac, parfois une seule phrase. Ça peut être faux, incomplet, ou finir à la corbeille.`,
        tone: 'var(--tone-encours)',
    },
    pousse: {
        label: 'Pousse',
        symbol: '⬡',
        short: 'En cours, contenu incomplet, encore en développement',
        long: `L'idée tient debout mais le texte n'est pas fini. Il manque des exemples, des sources, ou une conclusion. Je continue d'y revenir.`,
        tone: 'var(--tone-positif)',
    },
    mature: {
        label: 'Mature',
        symbol: '⬡',
        short: 'Finalisé, contenu stable et complet',
        long: `Le texte dit ce que je voulais dire. Je peux encore le corriger, mais je ne compte plus le réécrire.`,
        tone: null,
    },
};

/** Ancre de la section correspondante sur /legende */
export const anchor = (kind: 'origine' | 'maturite', key: string) => `/legende#${kind}-${key}`;
