import type { App, TFile } from "obsidian";
import { buildSlugIndex } from "./slugify";

export function resolveSlug(app: App, file: TFile, slug: string): string | null {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache?.headings?.length) return null;
  return buildSlugIndex(cache.headings).get(slug) ?? null;
}
