const mermaidFence = /^```mermaid\b/m;

const codeFence = /^\s*(```|~~~)/;
const inlineCode = /`[^`\n]*`/g;

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
 * Line numbers holding an unrendered LaTeX span, ignoring fenced code blocks
 * and inline code.
 *
 * @param {string} source
 */
function latexLines(source) {
  /** @type {number[]} */
  const hits = [];
  /** @type {string | null} */
  let fence = null;

  source.split("\n").forEach((line, index) => {
    const marker = codeFence.exec(line);
    if (marker) {
      if (fence === null) fence = marker[1] ?? null;
      else if (line.trim().startsWith(fence)) fence = null;
      return;
    }
    if (fence !== null) return;
    if (latexSpan.test(line.replace(inlineCode, ""))) hits.push(index + 1);
  });

  return hits;
}

/**
 * Policy that applies to newly added or changed news source files.
 *
 * @param {string} file
 * @param {string} source
 */
export function changedArticlePolicyViolations(file, source) {
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

  return violations;
}
