/**
 * Source unique des constantes du site.
 *
 * Ce fichier est en .mjs pour pouvoir être importé à la fois par
 * astro.config.mjs, par src/consts.ts et par les scripts Node (génération
 * des images de partage). Changer le domaine ici le change partout.
 */

export const SITE_URL = 'https://mirfou.space';
export const SITE_TITLE = 'mirfou';
export const SITE_DESCRIPTION =
    "Le jardin secret d'Ousmane NDIEGUENE — IA, code, contes et réflexions, depuis Thiès.";
export const SITE_AUTHOR = 'Ousmane NDIEGUENE';
export const SITE_ALIAS = 'mirfou';
export const SITE_LOCATION = 'Thiès, Sénégal';

/** Domaine affiché dans les textes et sur les images de partage */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

/** Profils, utilisés par le JSON-LD et le pied de page */
export const SITE_PROFILES = [
    'https://github.com/mirfou111',
    'https://linkedin.com/in/mirfou111',
];

/**
 * Mesure d'audience sans cookie (Umami ou Plausible).
 * Laisser `src` vide désactive complètement le script.
 * Umami     : src = 'https://analytics.exemple.com/script.js', websiteId = '<uuid>'
 * Plausible : src = 'https://plausible.io/js/script.js',        websiteId = ''
 */
export const ANALYTICS = {
    src: '',
    websiteId: '',
};
