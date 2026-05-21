import type { HeadingCache } from "obsidian";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildSlugIndex(headings: HeadingCache[]): Map<string, string> {
  const index = new Map<string, string>();
  const seen = new Map<string, number>();

  for (const h of headings) {
    const base = slugify(h.heading);
    const count = seen.get(base) ?? 0;
    const slug = count === 0 ? base : `${base}-${count}`;
    seen.set(base, count + 1);
    if (!index.has(slug)) {
      index.set(slug, h.heading);
    }
  }

  return index;
}
