export function readingTime(body: string | undefined): string {
    if (!body) return '1 min';
    const words = body.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
}