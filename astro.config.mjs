// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE_URL } from './site.config.mjs';

export default defineConfig({
    // Domaine défini une seule fois, dans site.config.mjs
    site: SITE_URL,
    integrations: [
        mdx(),
        sitemap({
            // L'interface de recherche n'a pas de contenu propre à indexer.
            // On compare l'URL exacte : une expression trop large excluait
            // aussi la page du tag « Recherche » (/tags/recherche/).
            filter: page => ![`${SITE_URL}/recherche`, `${SITE_URL}/outils`].includes(page.replace(/\/$/, '')),
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
