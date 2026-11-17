import {
  hasTrackingParams,
  parseFrontmatterFields,
  splitFrontmatter,
} from "./news-ledger.mjs";

const mermaidFence = /^```mermaid\b/m;

const codeFence = /^\s*(```|~~~)/;
const inlineCode = /`[^`\n]*`/g;
const emojiPattern = /\p{Extended_Pictographic}/u;
const isoTimestampWithOffset =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;
const blufLeadPattern = /^\*\*(?:結論先說[：:][^*]+|[^*]{6,})\*\*/;
const genericHeadingPattern =
  /^(?:背景|背景介紹|事件背景|事件經過|發生什麼事|為什麼重要|後續怎麼看|結論|總結|摘要|影響分析|未來展望|市場影響|技術分析)$/;

/**
 * A `$…$` span carrying a LaTeX control sequence (`\log`) or a sub/superscript
 * (`RT_1`). The site loads neither remark-math nor KaTeX, so such a span is
 * rendered verbatim and reaches the reader as broken characters.
 */
const latexSpan =
  /\$[^$\n]{0,80}?(?:\\[A-Za-z]+|[_^]\{?[A-Za-z0-9])[^$\n]{0,80}?\$/;

/**
 * Resolve the diff base from a script's CLI arguments.
 *
 * @param {string[]} argv arguments after the script path
 */
export function resolvePolicyBase(argv) {
  return argv.find((arg) => arg !== "--") ?? "HEAD";
}

/**
 * Iterate non-fenced lines in a Markdown/MDX document.
 *
 * @param {string} source
 */
function nonFencedLines(source) {
  /** @type {Array<{ lineNumber: number; text: string }>} */
  const result = [];
  /** @type {string | null} */
  let fence = null;

  source.split(/\r?\n/).forEach((text, index) => {
    const marker = codeFence.exec(text);
    if (marker) {
      if (fence === null) fence = marker[1] ?? null;
      else if (text.trim().startsWith(fence)) fence = null;
      return;
    }
    if (fence === null) {
      result.push({ lineNumber: index + 1, text });
    }
  });

  return result;
}

/**
 * Line numbers holding an unrendered LaTeX span, ignoring fenced code blocks
 * and inline code.
 *
 * @param {string} source
 */
function latexLines(source) {
  /** @type {number[]} */
  const hits = [];

  for (const { lineNumber, text } of nonFencedLines(source)) {
    if (latexSpan.test(text.replace(inlineCode, ""))) {
      hits.push(lineNumber);
    }
  }

  return hits;
}

/**
 * Detect whether frontmatter or non-code prose contains an emoji glyph.
 *
 * @param {string} frontmatter
 * @param {string} body
 */
function containsProseEmoji(frontmatter, body) {
  if (emojiPattern.test(frontmatter)) return true;
  for (const { text } of nonFencedLines(body)) {
    if (emojiPattern.test(text.replace(inlineCode, ""))) {
      return true;
    }
  }
  return false;
}

/**
 * Extract the opening paragraph of a Markdown/MDX body (before any heading,
 * blockquote, or fenced code block, and ignoring HTML comments / MDX imports).
 *
 * @param {string} body
 */
function extractOpeningParagraph(body) {
  const withoutComments = body.replace(/<!--[\s\S]*?-->/g, "");
  /** @type {string[]} */
  const lines = [];
  let collecting = false;

  for (const rawLine of withoutComments.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (codeFence.test(rawLine)) {
      return collecting ? lines.join(" ").trim() : "";
    }

    if (!trimmed) {
      if (collecting) break;
      continue;
    }

    if (!collecting) {
      if (/^(?:import|export)\s+/.test(trimmed)) continue;
      if (/^#{1,6}\s+/.test(trimmed)) return "";
      if (trimmed.startsWith(">")) return "";
      if (/^[-*_]{3,}$/.test(trimmed)) return "";
      collecting = true;
      lines.push(trimmed);
    } else {
      if (/^#{1,6}\s+/.test(trimmed) || trimmed.startsWith(">")) break;
      lines.push(trimmed);
    }
  }

  return lines.join(" ").trim();
}

/**
 * Extract all level-2 (`##`) Markdown headings outside fenced code blocks.
 *
 * @param {string} body
 */
function extractLevel2Headings(body) {
  /** @type {string[]} */
  const headings = [];

  for (const { text } of nonFencedLines(body)) {
    const match = /^##\s+(.+?)\s*#*\s*$/.exec(text.trim());
    if (match?.[1]) {
      headings.push(match[1].trim());
    }
  }

  return headings;
}

/**
 * Normalize a heading title before checking against banned generic labels.
 *
 * @param {string} heading
 */
function normalizeHeadingLabel(heading) {
  return heading
    .replace(/^(?:\d+|[一二三四五六七八九十]+)[、.]\s*/, "")
    .replace(/[？?：:。.!！]+$/g, "")
    .trim();
}

/**
 * Policy that applies to newly added or changed news source files.
 *
 * @param {string} file
 * @param {string} source
 */
export function changedArticlePolicyViolations(file, source) {
  /** @type {string[]} */
  const violations = [];

  if (mermaidFence.test(source)) {
    violations.push(
      `${file}: use a native SVG or an Astro SVG component instead of a Mermaid fence.`,
    );
  }

  const latex = latexLines(source);
  if (latex.length > 0) {
    violations.push(
      `${file}: LaTeX at line ${latex.join(", ")}; the site renders no math, use inline code or Unicode instead.`,
    );
  }

  const parts = splitFrontmatter(source);
  if (!parts) {
    return violations;
  }

  const { frontmatter, body } = parts;
  const fields = parseFrontmatterFields(frontmatter);

  if (containsProseEmoji(frontmatter, body)) {
    violations.push(
      `${file}: emojiNotAllowed — do not use emojis in frontmatter or article prose.`,
    );
  }

  const publishValid = isoTimestampWithOffset.test(fields.publishDate);
  const updatedPresent =
    typeof fields.updatedDate === "string" && fields.updatedDate.trim() !== "";
  const updatedValid =
    !updatedPresent || isoTimestampWithOffset.test(fields.updatedDate ?? "");

  if (!publishValid || !updatedValid) {
    violations.push(
      `${file}: timestampRequiresOffset — publishDate (and updatedDate if set) must use ISO 8601 format with time and timezone offset (e.g. 2026-11-17T09:00:00+08:00).`,
    );
  }

  const dirtyUrls = fields.sources
    .map((item) => item.url)
    .filter((url) => url && hasTrackingParams(url));
  if (dirtyUrls.length > 0) {
    violations.push(
      `${file}: dirtySourceUrl — remove tracking parameters (utm_*, fbclid, gclid, etc.) from source URLs: ${dirtyUrls.join(", ")}.`,
    );
  }

  const leadParagraph = extractOpeningParagraph(body);
  if (!blufLeadPattern.test(leadParagraph)) {
    violations.push(
      `${file}: missingBlufLead — opening paragraph must start with a bold conclusion statement (e.g. **結論先說：...**).`,
    );
  }

  const headings = extractLevel2Headings(body);
  if (headings.length < 2) {
    violations.push(
      `${file}: insufficientPyramidHeadings — include at least 2 conclusion-driven ## headings.`,
    );
  }

  const genericHeadings = headings.filter((heading) =>
    genericHeadingPattern.test(normalizeHeadingLabel(heading)),
  );
  if (genericHeadings.length > 0) {
    violations.push(
      `${file}: genericHeadingNotAllowed — replace generic topic headings (${genericHeadings.join(", ")}) with full conclusion sentences.`,
    );
  }

  return violations;
}
