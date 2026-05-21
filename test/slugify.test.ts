import { describe, it, expect } from "vitest";
import { slugify, buildSlugIndex } from "../src/slugify";
import type { HeadingCache } from "obsidian";

function h(heading: string, level = 1): HeadingCache {
  return { heading, level, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } };
}

describe("slugify", () => {
  it("lowercases text", () => {
    expect(slugify("My Heading")).toBe("my-heading");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  it("strips punctuation", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("preserves hyphens", () => {
    expect(slugify("already-slugged")).toBe("already-slugged");
  });

  it("preserves underscores", () => {
    expect(slugify("snake_case")).toBe("snake_case");
  });

  it("preserves multiple hyphens from adjacent spaces", () => {
    // GitHub replaces each space individually — two spaces → "--"
    expect(slugify("hello  world")).toBe("hello--world");
  });

  it("preserves existing multiple hyphens", () => {
    // GitHub does not collapse -- in slugs
    expect(slugify("hello--world")).toBe("hello--world");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  heading  ")).toBe("heading");
  });

  it("em dash separator produces double hyphen", () => {
    // " — " → remove em dash → "  " (two spaces) → "--"
    // This matches GitHub's behavior for doc-style timeline headings
    expect(slugify("2026-05-21 1200 — My Decision")).toBe("2026-05-21-1200--my-decision");
  });

  it("em dash timeline heading matches link anchor", () => {
    // Full reproduction of the vault:doc-style heading format
    expect(slugify("2026-05-21 1200 — decision Add back-reference rule to vaultdoc-style"))
      .toBe("2026-05-21-1200--decision-add-back-reference-rule-to-vaultdoc-style");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles heading with numbers", () => {
    expect(slugify("Step 1: Install")).toBe("step-1-install");
  });
});

describe("buildSlugIndex", () => {
  it("maps slug to heading text", () => {
    const index = buildSlugIndex([h("My Heading")]);
    expect(index.get("my-heading")).toBe("My Heading");
  });

  it("handles duplicate headings with suffix", () => {
    const index = buildSlugIndex([h("Duplicate"), h("Duplicate"), h("Duplicate")]);
    expect(index.get("duplicate")).toBe("Duplicate");
    expect(index.get("duplicate-1")).toBe("Duplicate");
    expect(index.get("duplicate-2")).toBe("Duplicate");
  });

  it("first duplicate keeps the base slug, not -0", () => {
    const index = buildSlugIndex([h("Hello"), h("Hello")]);
    expect(index.has("hello-0")).toBe(false);
    expect(index.get("hello")).toBe("Hello");
    expect(index.get("hello-1")).toBe("Hello");
  });

  it("returns null for unknown slug", () => {
    const index = buildSlugIndex([h("My Heading")]);
    expect(index.get("not-a-heading")).toBeUndefined();
  });

  it("handles empty headings array", () => {
    const index = buildSlugIndex([]);
    expect(index.size).toBe(0);
  });

  it("mixed headings and duplicates", () => {
    const index = buildSlugIndex([
      h("Introduction"),
      h("Setup"),
      h("Setup"),
      h("Usage"),
    ]);
    expect(index.get("introduction")).toBe("Introduction");
    expect(index.get("setup")).toBe("Setup");
    expect(index.get("setup-1")).toBe("Setup");
    expect(index.get("usage")).toBe("Usage");
  });
});
