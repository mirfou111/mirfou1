/**
 * Slug URL-safe pour un tag.
 * "Software Engineering" -> "software-engineering"
 * "Éthique"              -> "ethique"
 * "Développement"        -> "developpement"
 */
export function tagSlug(tag: string): string {
    return tag
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // retire les diacritiques
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export type TagEntry = {
    /** Slug utilisé dans l'URL */
    slug: string;
    /** Libellé affiché (la variante la plus fréquente) */
    label: string;
    /** Nombre de contenus portant ce tag */
    count: number;
};

/**
 * Regroupe des tags bruts par slug.
 * Fusionne les variantes de casse et d'accentuation ("IA" / "ia", "Éthique" / "ethique")
 * et retient comme libellé la variante la plus fréquente.
 */
export function groupTags(rawTags: string[]): TagEntry[] {
    const bySlug = new Map<string, { count: number; labels: Map<string, number> }>();

    for (const raw of rawTags) {
        const slug = tagSlug(raw);
        if (!slug) continue;

        let entry = bySlug.get(slug);
        if (!entry) {
            entry = { count: 0, labels: new Map() };
            bySlug.set(slug, entry);
        }
        entry.count += 1;
        entry.labels.set(raw, (entry.labels.get(raw) ?? 0) + 1);
    }

    return [...bySlug.entries()]
        .map(([slug, { count, labels }]) => {
            const label = [...labels.entries()]
                .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
            return { slug, label, count };
        })
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fr'));
}
