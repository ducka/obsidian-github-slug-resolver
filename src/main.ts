import { MarkdownPostProcessorContext, Plugin, TFile } from "obsidian";
import { resolveSlug } from "./resolver";

export default class GithubSlugResolverPlugin extends Plugin {
  private originalOpenLinkText: typeof this.app.workspace.openLinkText | null = null;

  async onload() {
    this.registerMarkdownPostProcessor(this.postProcessor.bind(this));
    this.patchOpenLinkText();
  }

  onunload() {
    this.unpatchOpenLinkText();
  }

  private postProcessor(el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    const links = el.querySelectorAll<HTMLAnchorElement>(
      'a.internal-link[data-href*="#"], a[href^="#"]'
    );

    for (const link of links) {
      const href = link.getAttribute("data-href") ?? link.getAttribute("href") ?? "";
      const hashIdx = href.indexOf("#");
      if (hashIdx === -1) continue;

      const fragment = href.slice(hashIdx + 1);
      if (!fragment) continue;

      link.addEventListener("click", (evt) => {
        const filePart = href.slice(0, hashIdx);
        const sourcePath = ctx.sourcePath;

        const targetFile: TFile | null = filePart
          ? this.app.metadataCache.getFirstLinkpathDest(filePart, sourcePath)
          : (this.app.vault.getAbstractFileByPath(sourcePath) as TFile | null);

        if (!targetFile) return;

        const resolved = resolveSlug(this.app, targetFile, fragment);
        if (!resolved) return;

        evt.preventDefault();
        evt.stopPropagation();

        const linkText = filePart ? `${filePart}#${resolved}` : `#${resolved}`;
        this.app.workspace.openLinkText(linkText, sourcePath, false);
      });
    }
  }

  private patchOpenLinkText() {
    try {
      const original = this.app.workspace.openLinkText.bind(this.app.workspace);
      this.originalOpenLinkText = original;
      const self = this;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.app.workspace as any).openLinkText = async function (
        linktext: string,
        sourcePath: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...rest: any[]
      ) {
        const hashIdx = linktext.indexOf("#");
        if (hashIdx !== -1) {
          const filePart = linktext.slice(0, hashIdx);
          const fragment = linktext.slice(hashIdx + 1);

          if (fragment) {
            const targetFile: TFile | null = filePart
              ? self.app.metadataCache.getFirstLinkpathDest(filePart, sourcePath)
              : (self.app.vault.getAbstractFileByPath(sourcePath) as TFile | null);

            if (targetFile) {
              const resolved = resolveSlug(self.app, targetFile, fragment);
              if (resolved) {
                const resolvedLinktext = filePart
                  ? `${filePart}#${resolved}`
                  : `#${resolved}`;
                return original(resolvedLinktext, sourcePath, ...rest);
              }
            }
          }
        }

        return original(linktext, sourcePath, ...rest);
      };
    } catch (e) {
      console.warn("[github-slug-resolver] failed to patch openLinkText:", e);
    }
  }

  private unpatchOpenLinkText() {
    if (this.originalOpenLinkText) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.app.workspace as any).openLinkText = this.originalOpenLinkText;
      this.originalOpenLinkText = null;
    }
  }
}
