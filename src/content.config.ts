import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const originEnum = z.enum(['authentique', 'assiste', 'genere']).default('authentique');
const statusEnum = z.enum(['graine', 'pousse', 'mature']).default('mature');

const baseSchema = ({ image }: any) =>
    z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: image().optional(),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().default(false),
        origin: originEnum,
        status: statusEnum,
        relatedPosts: z.array(z.string()).default([]),
    });

export const collections = {
    articles: defineCollection({
        loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
        schema: baseSchema,
    }),
    tutos: defineCollection({
        loader: glob({ base: './src/content/tutos', pattern: '**/*.{md,mdx}' }),
        schema: baseSchema,
    }),
    contes: defineCollection({
        loader: glob({ base: './src/content/contes', pattern: '**/*.{md,mdx}' }),
        schema: baseSchema,
    }),
    reflexions: defineCollection({
        loader: glob({ base: './src/content/reflexions', pattern: '**/*.{md,mdx}' }),
        schema: baseSchema,
    }),
    recherches: defineCollection({
        loader: glob({ base: './src/content/recherches', pattern: '**/*.{md,mdx}' }),
        schema: ({ image }) => baseSchema({ image }).extend({
            annee: z.number().optional(),
            domaine: z.string().optional(),
            institution: z.string().optional(),
        }),
    }),
};