import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Image de partage d'un contenu.
 *
 * Les images sont produites hors build par `npm run og` et déposées dans
 * public/og/. On vérifie leur présence au moment du rendu : si l'image d'un
 * contenu n'a pas encore été générée, on retombe sur l'image générique
 * plutôt que de publier une balise og:image cassée.
 */

const PUBLIC = fileURLToPath(new URL('../../public/', import.meta.url));

export const ogFileName = (ref: string) => `${ref.replaceAll('/', '--')}.png`;

export function ogImage(ref: string): string {
    const chemin = `/og/${ogFileName(ref)}`;
    return existsSync(PUBLIC + chemin.slice(1)) ? chemin : '/og-image.png';
}
