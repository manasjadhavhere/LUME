/**
 * Generates a clean URL slug from an artist's name.
 * e.g., "Humera Hala" -> "humera-hala"
 * e.g., "Disha & Prachi" -> "disha-and-prachi"
 */
export function getArtistSlug(name?: string, fallbackId?: string): string {
  if (!name) return fallbackId || '';
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallbackId || '';
}
