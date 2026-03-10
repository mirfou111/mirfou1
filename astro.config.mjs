// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    site: 'https://mirfou111.vercel.app',
    integrations: [mdx(), sitemap()],
    vite: {
        plugins: [tailwindcss()],
        build: {
            rollupOptions: {
                // Ajoutez le fichier CSS ici également
                external: [
                    '/pagefind/pagefind-ui.js', 
                    '/pagefind/pagefind-ui.css'
                ],
            },
        },
    },
});