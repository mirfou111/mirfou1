/**
 * Les constantes du site vivent dans site.config.mjs à la racine, pour être
 * partagées avec astro.config.mjs et les scripts Node. Ce fichier ne fait
 * que les réexporter au code de l'application.
 */
export {
    SITE_URL,
    SITE_TITLE,
    SITE_DESCRIPTION,
    SITE_AUTHOR,
    SITE_ALIAS,
    SITE_LOCATION,
    SITE_DOMAIN,
    SITE_PROFILES,
    ANALYTICS,
} from '../site.config.mjs';

/**
 * « Par où commencer » — les contenus mis en avant sur la page d'accueil.
 * Format "section/id", même convention que relatedPosts.
 * Une référence introuvable fait échouer le build. Laisser vide masque le bloc.
 */
export const FEATURED: readonly string[] = [
    // Vide tant que le jardin se replante. À remplir au fil des nouveaux textes,
    // jusqu'à 6 entrées (2 lignes de 3 tuiles). Exemple :
    // 'articles/mon-premier-article',
];
