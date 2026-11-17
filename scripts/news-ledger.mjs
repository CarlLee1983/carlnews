import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  buildLedgerSummary,
  checkSourceUrl,
  parseFrontmatterFields,
  splitFrontmatter,
} from "../src/utils/news-ledger.mjs";

const CONTENT_DIR = resolve("src/content/news");

/**
 * Recursively list Markdown/MDX files inside `dir`.
 *
 * @param {string} dir
 * @returns {string[]}
 */
function listMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
    } else if (/\.mdx?$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

/**
 * Load all news entries from `src/content/news`.
 */
function loadNewsEntries() {
  return listMarkdownFiles(CONTENT_DIR).map((filePath) => {
    const raw = readFileSync(filePath, "utf8");
    const split = splitFrontmatter(raw);
    const rel = relative(CONTENT_DIR, filePath).replace(/\\/g, "/");
    const slug = rel.replace(/\.mdx?$/i, "").replace(/\/index$/, "");
    const fields = split
      ? parseFrontmatterFields(split.frontmatter)
      : {
          title: "",
          category: "",
          publishDate: "",
          updatedDate: undefined,
          draft: false,
          featured: false,
          tags: [],
          series: undefined,
          seriesOrder: undefined,
          sources: [],
        };

    return {
      slug,
      title: fields.title,
      category: fields.category,
      publishDate: fields.publishDate,
      updatedDate: fields.updatedDate,
      draft: fields.draft,
      featured: fields.featured,
      tags: fields.tags,
      series: fields.series,
      seriesOrder: fields.seriesOrder,
      sources: fields.sources,
    };
  });
}

/**
 * Parse CLI arguments (`--json`, `--check-url <url>`).
 *
 * @param {string[]} argv
 */
function parseArgs(argv) {
  let asJson = false;
  /** @type {string | null} */
  let checkUrl = null;

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--") continue;
    if (token === "--json") {
      asJson = true;
      continue;
    }
    if (token === "--check-url") {
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        console.error("Usage: pnpm news:ledger [--json] [--check-url <url>]");
        process.exit(1);
      }
      checkUrl = next;
      i += 1;
      continue;
    }
    if (token?.startsWith("--check-url=")) {
      checkUrl = token.slice("--check-url=".length);
      continue;
    }
    console.error(`Unknown argument: ${token}`);
    console.error("Usage: pnpm news:ledger [--json] [--check-url <url>]");
    process.exit(1);
  }

  return { asJson, checkUrl };
}

const { asJson, checkUrl } = parseArgs(process.argv.slice(2));
const entries = loadNewsEntries();

if (checkUrl !== null) {
  const result = checkSourceUrl(entries, checkUrl);
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.matched) {
    console.log(`DUPLICATE MATCH for URL: ${result.candidateUrl}`);
    console.log(`Normalized URL: ${result.normalizedUrl}`);
    for (const match of result.matches) {
      const seriesTag = match.series
        ? ` | series="${match.series}" #${match.seriesOrder ?? "?"}`
        : "";
      console.log(
        `- [${match.slug}] ${match.title} (${match.category}, ${match.publishDate}${seriesTag})`,
      );
      console.log(`  matched source: ${match.matchedSourceUrl}`);
    }
    console.log(
      "Guidance: 小幅進展請就地更新既有檔案的 updatedDate + updateNote；重大結構性轉折才開新篇並設定 series 與遞增 seriesOrder。",
    );
  } else {
    console.log(`NO MATCH for URL: ${result.candidateUrl}`);
    console.log(`Normalized URL: ${result.normalizedUrl}`);
  }
  process.exit(0);
}

const summary = buildLedgerSummary(entries);

if (asJson) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

console.log("# CarlNews Dispatch Ledger");
console.log(
  `Published: ${summary.totalPublished} | Drafts: ${summary.totalDrafts}`,
);

console.log("\n## 7 Desks Coverage");
for (const desk of summary.desks) {
  console.log(
    `- ${desk.category}: ${desk.count} (latest: ${desk.latestPublishDate ?? "none"})`,
  );
}

console.log("\n## Active Storylines (Series)");
if (summary.series.length === 0) {
  console.log("- (none)");
} else {
  for (const item of summary.series) {
    console.log(
      `- ${item.name}: ${item.count} brief(s), maxOrder=${item.maxSeriesOrder}, nextSeriesOrder=${item.nextSeriesOrder} [${item.slugs.join(", ")}]`,
    );
  }
}

console.log("\n## Popular Tags");
if (summary.tags.length === 0) {
  console.log("- (none)");
} else {
  console.log(
    summary.tags
      .slice(0, 20)
      .map((t) => `${t.tag} (${t.count})`)
      .join(", "),
  );
}

console.log("\n## Recent Briefs (Up to 10)");
if (summary.recentBriefs.length === 0) {
  console.log("- (none)");
} else {
  for (const brief of summary.recentBriefs) {
    const seriesInfo = brief.series
      ? ` | series=${brief.series}#${brief.seriesOrder ?? "?"}`
      : "";
    const updatedInfo = brief.updatedDate
      ? ` | updated=${brief.updatedDate}`
      : "";
    console.log(
      `- [${brief.category}] ${brief.slug} — ${brief.title} (pub=${brief.publishDate}${updatedInfo}${seriesInfo})`,
    );
  }
}
