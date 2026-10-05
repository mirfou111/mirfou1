import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { getGarden, SECTION_META } from '../utils/garden';

// Toutes les sections, Labo compris, viennent du graphe du jardin :
// une nouvelle section y apparaît sans rien toucher ici.
export async function GET(context: APIContext) {
    const garden = await getGarden();

    return rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site!,
        items: garden.nodes.map((n) => ({
            title: n.title,
            description: n.description,
            pubDate: n.pubDate,
            link: `${n.href}/`,
            categories: [SECTION_META[n.section].label, ...n.tags],
        })),
        customData: `<language>fr-fr</language>`,
    });
}
