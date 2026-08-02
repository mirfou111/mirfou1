export const SITE_TITLE = 'mirfou';
export const SITE_DESCRIPTION = 'Le jardin secret d\'Ousmane NDIEGUENE — IA, code, contes et réflexions.';
export const SITE_URL = 'https://mirfou111.vercel.app';
export const SITE_AUTHOR = 'mirfou';
export const SITE_LOCATION = 'Thiès, Sénégal';

/**
 * « Par où commencer » — les contenus mis en avant sur la page d'accueil.
 * Format "section/id", même convention que relatedPosts.
 * Une référence introuvable fait échouer le build. Laisser vide masque le bloc.
 */
export const FEATURED: readonly string[] = [
    'articles/autodidacte-fourmi-montagne',
    'articles/ia-afrique-copier-coller',
    'contes/la-fourmi-et-le-serveur-cloud',
];