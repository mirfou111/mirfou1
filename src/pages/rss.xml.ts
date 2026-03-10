import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: APIContext) {
    const [articles, contes, tutos, reflexions, recherches] = await Promise.all([
        getCollection('articles', ({ data }) => !data.draft),
        getCollection('contes', ({ data }) => !data.draft),
        getCollection('tutos', ({ data }) => !data.draft),
        getCollection('reflexions', ({ data }) => !data.draft),
        getCollection('recherches', ({ data }) => !data.draft),
    ]);

    const allPosts = [
        ...articles.map(p => ({ ...p, section: 'articles' })),
        ...contes.map(p => ({ ...p, section: 'contes' })),
        ...tutos.map(p => ({ ...p, section: 'tutos' })),
        ...reflexions.map(p => ({ ...p, section: 'reflexions' })),
        ...recherches.map(p => ({ ...p, section: 'recherches' })),
    ].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

    return rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site!,
        items: allPosts.map(post => ({
            title: post.data.title,
            description: post.data.description,
            pubDate: post.data.pubDate,
            link: `/${post.section}/${post.id}/`,
        })),
        customData: `<language>fr-fr</language>`,
    });
}