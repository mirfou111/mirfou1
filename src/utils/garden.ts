import { getCollection } from 'astro:content';
import { tagSlug } from './tags';
import type { Origin, Status } from './badges';

/**
 * Le jardin — graphe des contenus.
 *
 * Principe : un lien ne se déclare qu'UNE seule fois, dans un seul sens,
 * via `relatedPosts` dans le frontmatter. Le sens inverse (le rétrolien)
 * est calculé au build. Personne n'a à maintenir la réciprocité à la main.
 */

export const SECTIONS = ['articles', 'contes', 'tutos', 'reflexions', 'recherches'] as const;
export type Section = (typeof SECTIONS)[number];

/**
 * Couleurs de section : on référence les variables CSS définies dans global.css,
 * qui ont une valeur distincte en thème clair et en thème sombre. Aucune couleur
 * en dur ici — sinon elle ne suivrait pas le thème.
 */
export const SECTION_META: Record<Section, { label: string; cssVar: string; color: string }> = {
    articles: { label: 'Articles', cssVar: '--section-articles', color: 'var(--section-articles)' },
    contes: { label: 'Contes', cssVar: '--section-contes', color: 'var(--section-contes)' },
    tutos: { label: 'Tutos', cssVar: '--section-tutos', color: 'var(--section-tutos)' },
    reflexions: { label: 'Réflexions', cssVar: '--section-reflexions', color: 'var(--section-reflexions)' },
    recherches: { label: 'Recherches', cssVar: '--section-recherches', color: 'var(--section-recherches)' },
};

export type GardenNode = {
    /** Identifiant global, ex. "articles/mon-article" */
    ref: string;
    id: string;
    section: Section;
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
    tagSlugs: string[];
    href: string;
    origin: Origin;
    status: Status;
    heroImage?: any;
    /** Corps brut — sert au calcul du temps de lecture */
    body?: string;
    /** Liens déclarés dans le frontmatter (sens sortant) */
    outgoing: string[];
};

export type Garden = {
    nodes: GardenNode[];
    byRef: Map<string, GardenNode>;
    /** ref -> refs cités par ce contenu */
    outgoing: Map<string, string[]>;
    /** ref -> refs qui citent ce contenu (calculé) */
    incoming: Map<string, string[]>;
};

let cache: Promise<Garden> | null = null;

/** Construit le graphe une seule fois par build. */
export function getGarden(): Promise<Garden> {
    cache ??= build();
    return cache;
}

async function build(): Promise<Garden> {
    const collections = await Promise.all(
        SECTIONS.map(section =>
            getCollection(section as any, ({ data }: any) => !data.draft)
                .then(entries => ({ section, entries }))
        )
    );

    const nodes: GardenNode[] = [];

    for (const { section, entries } of collections) {
        for (const entry of entries as any[]) {
            const tags: string[] = entry.data.tags ?? [];
            nodes.push({
                ref: `${section}/${entry.id}`,
                id: entry.id,
                section: section as Section,
                title: entry.data.title,
                description: entry.data.description,
                pubDate: entry.data.pubDate,
                tags,
                tagSlugs: [...new Set(tags.map(tagSlug).filter(Boolean))],
                href: `/${section}/${entry.id}`,
                origin: entry.data.origin ?? 'authentique',
                status: entry.data.status ?? 'mature',
                heroImage: entry.data.heroImage,
                body: entry.body,
                outgoing: entry.data.relatedPosts ?? [],
            });
        }
    }

    nodes.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

    const byRef = new Map(nodes.map(n => [n.ref, n]));
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();
    for (const n of nodes) {
        outgoing.set(n.ref, []);
        incoming.set(n.ref, []);
    }

    // Résolution + validation : une référence cassée fait échouer le build,
    // au lieu de disparaître en silence.
    const broken: string[] = [];

    for (const node of nodes) {
        for (const ref of node.outgoing) {
            if (ref === node.ref) continue;              // auto-référence ignorée
            if (!byRef.has(ref)) {
                broken.push(`  « ${ref} » cité par ${node.ref}`);
                continue;
            }
            if (!outgoing.get(node.ref)!.includes(ref)) {
                outgoing.get(node.ref)!.push(ref);
            }
            if (!incoming.get(ref)!.includes(node.ref)) {
                incoming.get(ref)!.push(node.ref);
            }
        }
    }

    if (broken.length > 0) {
        throw new Error(
            `[jardin] ${broken.length} référence(s) relatedPosts introuvable(s) :\n` +
            broken.join('\n') +
            `\n\nFormat attendu : "section/id", par exemple "reflexions/le-bug-est-un-maitre".` +
            `\nSections valides : ${SECTIONS.join(', ')}.`
        );
    }

    return { nodes, byRef, outgoing, incoming };
}

/**
 * Résout une liste de refs en nœuds, en conservant l'ordre demandé.
 * Une ref introuvable fait échouer le build, avec le contexte fourni.
 */
export function pick(garden: Garden, refs: readonly string[], contexte: string): GardenNode[] {
    const manquantes = refs.filter(r => !garden.byRef.has(r));
    if (manquantes.length > 0) {
        throw new Error(
            `[jardin] ${contexte} : référence(s) introuvable(s) — ${manquantes.map(r => `« ${r} »`).join(', ')}.\n` +
            `Format attendu : "section/id". Sections valides : ${SECTIONS.join(', ')}.`
        );
    }
    return refs.map(r => garden.byRef.get(r)!);
}

/** Les n contenus les plus récents, toutes sections confondues. */
export function recent(garden: Garden, n: number, exclure: readonly string[] = []): GardenNode[] {
    const skip = new Set(exclure);
    return garden.nodes.filter(node => !skip.has(node.ref)).slice(0, n);
}

/** Résout une liste de refs en nœuds, du plus récent au plus ancien. */
export function resolve(garden: Garden, refs: string[]): GardenNode[] {
    return refs
        .map(ref => garden.byRef.get(ref))
        .filter((n): n is GardenNode => Boolean(n))
        .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

export type SuggestionReason = 'tag' | 'section' | 'recent';

export type Suggestion = {
    node: GardenNode;
    reason: SuggestionReason;
    /** Tags partagés, uniquement pour reason === 'tag' */
    shared: string[];
};

export const REASON_LABEL: Record<SuggestionReason, string> = {
    tag: 'tags communs',
    section: 'même section',
    recent: 'récent',
};

/**
 * Contenus à suggérer, hors liens déjà établis dans un sens ou dans l'autre.
 * Trois niveaux, du plus pertinent au plus générique :
 *   1. tags partagés  2. même section  3. plus récents
 * Garantit qu'aucun contenu ne reste sans porte de sortie.
 */
export function suggestRelated(garden: Garden, ref: string, limit = 3): Suggestion[] {
    const node = garden.byRef.get(ref);
    if (!node || limit <= 0) return [];

    const taken = new Set([
        ref,
        ...(garden.outgoing.get(ref) ?? []),
        ...(garden.incoming.get(ref) ?? []),
    ]);

    const out: Suggestion[] = [];
    const push = (n: GardenNode, reason: SuggestionReason, shared: string[] = []) => {
        if (taken.has(n.ref) || out.length >= limit) return;
        taken.add(n.ref);
        out.push({ node: n, reason, shared });
    };

    const candidates = garden.nodes.filter(n => !taken.has(n.ref));

    // 1. Tags partagés — le plus de tags communs d'abord, puis le plus récent
    const mine = new Set(node.tagSlugs);
    if (mine.size > 0) {
        candidates
            .map(other => ({ other, shared: other.tags.filter(t => mine.has(tagSlug(t))) }))
            .filter(c => c.shared.length > 0)
            .sort((a, b) =>
                b.shared.length - a.shared.length ||
                b.other.pubDate.valueOf() - a.other.pubDate.valueOf()
            )
            .forEach(c => push(c.other, 'tag', c.shared));
    }

    // 2. Même section
    candidates
        .filter(n => n.section === node.section)
        .forEach(n => push(n, 'section'));

    // 3. Le reste, du plus récent au plus ancien (garden.nodes est déjà trié)
    candidates.forEach(n => push(n, 'recent'));

    return out;
}

export type GardenLink = {
    source: string;
    target: string;
    /** "explicite" = déclaré dans relatedPosts, "tag" = déduit d'un tag commun */
    kind: 'explicite' | 'tag';
    /** Tags partagés, pour les liens de type "tag" */
    shared?: string[];
};

/** Toutes les arêtes du graphe, pour la page de visualisation. */
export function getLinks(garden: Garden): GardenLink[] {
    const links: GardenLink[] = [];
    const seen = new Set<string>();

    const pairKey = (a: string, b: string) => [a, b].sort().join('|');

    for (const [source, targets] of garden.outgoing) {
        for (const target of targets) {
            links.push({ source, target, kind: 'explicite' });
            seen.add(pairKey(source, target));
        }
    }

    for (let i = 0; i < garden.nodes.length; i++) {
        for (let j = i + 1; j < garden.nodes.length; j++) {
            const a = garden.nodes[i];
            const b = garden.nodes[j];
            if (seen.has(pairKey(a.ref, b.ref))) continue;

            const setB = new Set(b.tagSlugs);
            const shared = a.tags.filter(t => setB.has(tagSlug(t)));
            if (shared.length === 0) continue;

            links.push({ source: a.ref, target: b.ref, kind: 'tag', shared });
            seen.add(pairKey(a.ref, b.ref));
        }
    }

    return links;
}

/** Contenus sans aucune connexion — ni lien explicite, ni tag partagé. */
export function getOrphans(garden: Garden, links: GardenLink[]): GardenNode[] {
    const connected = new Set<string>();
    for (const l of links) {
        connected.add(l.source);
        connected.add(l.target);
    }
    return garden.nodes.filter(n => !connected.has(n.ref));
}
