export const NEWS_DESKS = /** @type {const} */ ([
  "科技與商業",
  "AI 與模型",
  "半導體與硬體",
  "產品與生態",
  "政策與監管",
  "國際時事",
  "生活與社會",
]);

/**
 * Query parameters strictly flagged as dirty tracking URLs by content policy.
 */
export const DIRTY_TRACKING_PARAM_NAMES = new Set([
  "fbclid",
  "gclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "igshid",
]);

/**
 * Query parameters stripped during URL canonicalization for deduplication.
 * Preserves meaningful content identifiers such as `id`, `v`, `p`, `page`, etc.
 */
export const TRACKING_PARAM_NAMES = new Set([
  ...DIRTY_TRACKING_PARAM_NAMES,
  "si",
  "s",
  "ref",
  "ref_src",
  "spm",
]);

/**
 * @typedef {{
 *   title?: string;
 *   url: string;
 *   publisher?: string;
 *   publishedAt?: string;
 * }} LedgerSource
 *
 * @typedef {{
 *   slug: string;
 *   title: string;
 *   category: string;
 *   publishDate: string;
 *   updatedDate?: string;
 *   draft?: boolean;
 *   featured?: boolean;
 *   tags?: string[];
 *   series?: string;
 *   seriesOrder?: number;
 *   sources?: LedgerSource[];
 * }} LedgerEntry
 */

/**
 * Check whether a query parameter key is a tracking parameter.
 *
 * @param {string} key
 * @param {boolean} [strictDirtyOnly]
 */
function isTrackingKey(key, strictDirtyOnly = false) {
  const lower = key.toLowerCase();
  if (/^utm_/i.test(lower)) return true;
  return strictDirtyOnly
    ? DIRTY_TRACKING_PARAM_NAMES.has(lower)
    : TRACKING_PARAM_NAMES.has(lower);
}

/**
 * Return true if a URL carries dirty tracking parameters such as `utm_*`,
 * `fbclid`, `gclid`, `msclkid`, `mc_cid`, `mc_eid`, or `igshid`.
 *
 * @param {string} rawUrl
 */
export function hasTrackingParams(rawUrl) {
  try {
    const url = new URL(String(rawUrl).trim());
    for (const key of url.searchParams.keys()) {
      if (isTrackingKey(key, true)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Normalize a source URL by stripping known tracking parameters and URL hash,
 * sorting remaining meaningful query parameters, lowercasing scheme/host, and
 * normalizing trailing slashes on non-root paths.
 *
 * @param {string} rawUrl
 */
export function normalizeSourceUrl(rawUrl) {
  const trimmed = String(rawUrl).trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    url.hostname = url.hostname.toLowerCase();
    url.hash = "";

    /** @type {Array<[string, string]>} */
    const kept = [];
    for (const [key, value] of url.searchParams.entries()) {
      if (!isTrackingKey(key, false)) {
        kept.push([key, value]);
      }
    }
    kept.sort((a, b) =>
      a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]),
    );

    const rebuilt = new URLSearchParams();
    for (const [key, value] of kept) {
      rebuilt.append(key, value);
    }
    const query = rebuilt.toString();
    url.search = query ? `?${query}` : "";

    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch {
    return trimmed;
  }
}

/**
 * Parse a quoted or unquoted scalar YAML token.
 *
 * @param {string} raw
 */
function parseYamlScalar(raw) {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
  ) {
    const quote = trimmed[0];
    const inner = trimmed.slice(1, -1);
    if (quote === '"') {
      return inner.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    return inner.replace(/''/g, "'");
  }

  return trimmed;
}

/**
 * Strip surrounding single/double quotes from a raw YAML value as string.
 *
 * @param {string} raw
 */
function parseYamlString(raw) {
  const parsed = parseYamlScalar(raw);
  return String(parsed).trim();
}

/**
 * Parse a simple YAML inline array like `["AI", "Semiconductor"]`.
 *
 * @param {string} raw
 * @returns {string[]}
 */
function parseInlineArray(raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];
  return inner
    .split(",")
    .map((item) => parseYamlString(item))
    .filter(Boolean);
}

/**
 * Parse YAML frontmatter from a Markdown/MDX news file without external YAML deps.
 *
 * @param {string} yamlText
 */
export function parseFrontmatterFields(yamlText) {
  const lines = yamlText.split(/\r?\n/);
  /** @type {Record<string, unknown>} */
  const data = {};
  /** @type {string[]} */
  const tags = [];
  /** @type {LedgerSource[]} */
  const sources = [];

  /** @type {string | null} */
  let currentListKey = null;
  /** @type {Partial<LedgerSource> | null} */
  let currentSource = null;
  /** @type {string | null} */
  let blockScalarKey = null;
  /** @type {string[]} */
  let blockScalarLines = [];

  const flushBlockScalar = () => {
    if (blockScalarKey) {
      data[blockScalarKey] = blockScalarLines.join(" ").trim();
      blockScalarKey = null;
      blockScalarLines = [];
    }
  };

  const flushSource = () => {
    if (currentSource && typeof currentSource.url === "string") {
      sources.push(/** @type {LedgerSource} */ (currentSource));
    }
    currentSource = null;
  };

  for (const line of lines) {
    if (blockScalarKey) {
      if (/^\s+/.test(line) || line.trim() === "") {
        if (line.trim()) blockScalarLines.push(line.trim());
        continue;
      }
      flushBlockScalar();
    }

    if (!line.trim() || /^\s*#/.test(line)) continue;

    const topMatch = /^([A-Za-z0-9_]+):(?:\s*(.*))?$/.exec(line);
    if (topMatch) {
      flushSource();
      currentListKey = null;

      const key = topMatch[1] ?? "";
      const rest = (topMatch[2] ?? "").trim();

      if (rest === ">" || rest === ">-" || rest === "|" || rest === "|-") {
        blockScalarKey = key;
        blockScalarLines = [];
      } else if (rest === "") {
        currentListKey = key;
      } else if (rest.startsWith("[") && rest.endsWith("]")) {
        const arr = parseInlineArray(rest);
        if (key === "tags") tags.push(...arr);
        data[key] = arr;
      } else {
        data[key] = parseYamlScalar(rest);
      }
      continue;
    }

    if (currentListKey === "tags") {
      const itemMatch = /^\s+-\s+(.+)$/.exec(line);
      if (itemMatch?.[1]) {
        tags.push(parseYamlString(itemMatch[1]));
      }
      continue;
    }

    if (currentListKey === "sources") {
      if (/^\s+-\s*$/.test(line)) {
        flushSource();
        currentSource = {};
        continue;
      }

      const itemStartMatch = /^\s+-\s+([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
      if (itemStartMatch?.[1]) {
        flushSource();
        currentSource = {};
        const subKey = itemStartMatch[1];
        const subVal = parseYamlString(itemStartMatch[2] ?? "");
        if (
          subKey === "title" ||
          subKey === "url" ||
          subKey === "publisher" ||
          subKey === "publishedAt"
        ) {
          currentSource[subKey] = subVal;
        }
        continue;
      }

      const itemPropMatch = /^\s{2,}([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
      if (itemPropMatch?.[1] && currentSource) {
        const subKey = itemPropMatch[1];
        const subVal = parseYamlString(itemPropMatch[2] ?? "");
        if (
          subKey === "title" ||
          subKey === "url" ||
          subKey === "publisher" ||
          subKey === "publishedAt"
        ) {
          currentSource[subKey] = subVal;
        }
      }
    }
  }

  flushBlockScalar();
  flushSource();

  return {
    title: typeof data.title === "string" ? data.title : "",
    category: typeof data.category === "string" ? data.category : "",
    publishDate: typeof data.publishDate === "string" ? data.publishDate : "",
    updatedDate:
      typeof data.updatedDate === "string" ? data.updatedDate : undefined,
    updateNote:
      typeof data.updateNote === "string" ? data.updateNote : undefined,
    draft: data.draft === true,
    featured: data.featured === true,
    tags,
    series: typeof data.series === "string" ? data.series : undefined,
    seriesOrder:
      typeof data.seriesOrder === "number" ? data.seriesOrder : undefined,
    sources,
    rawFields: data,
  };
}

/**
 * Split a Markdown/MDX document into frontmatter text and body.
 *
 * @param {string} source
 */
export function splitFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/.exec(source);
  if (!match) return null;
  return {
    frontmatter: match[1] ?? "",
    body: match[2] ?? "",
  };
}

/**
 * @param {LedgerEntry} entry
 */
function effectiveTimestamp(entry) {
  const target = entry.updatedDate || entry.publishDate;
  const ms = Date.parse(target);
  if (!Number.isNaN(ms)) return ms;
  const pubMs = Date.parse(entry.publishDate);
  return Number.isNaN(pubMs) ? 0 : pubMs;
}

/**
 * @param {LedgerEntry} a
 * @param {LedgerEntry} b
 */
function compareEntriesDesc(a, b) {
  const diff = effectiveTimestamp(b) - effectiveTimestamp(a);
  if (diff !== 0) return diff;
  const pubDiff =
    (Date.parse(b.publishDate) || 0) - (Date.parse(a.publishDate) || 0);
  if (pubDiff !== 0) return pubDiff;
  return a.slug.localeCompare(b.slug);
}

/**
 * Aggregate a ledger summary from parsed news entries.
 *
 * @param {LedgerEntry[]} entries
 */
export function buildLedgerSummary(entries) {
  const published = entries
    .filter((entry) => entry.draft !== true)
    .slice()
    .sort(compareEntriesDesc);

  const desks = NEWS_DESKS.map((category) => {
    const items = published.filter((entry) => entry.category === category);
    let latestPublishDate = /** @type {string | null} */ (null);
    let latestPublishMs = -Infinity;
    for (const item of items) {
      const ms = Date.parse(item.publishDate);
      const rank = Number.isNaN(ms) ? 0 : ms;
      if (rank >= latestPublishMs) {
        latestPublishMs = rank;
        latestPublishDate = item.publishDate;
      }
    }
    return {
      category,
      count: items.length,
      latestPublishDate,
    };
  });

  /**
   * @type {Map<
   *   string,
   *   { count: number; maxSeriesOrder: number; slugs: string[] }
   * >}
   */
  const seriesMap = new Map();
  /** @type {Map<string, number>} */
  const tagMap = new Map();

  for (const entry of published) {
    if (entry.series) {
      const current = seriesMap.get(entry.series) ?? {
        count: 0,
        maxSeriesOrder: 0,
        slugs: [],
      };
      current.count += 1;
      if (
        typeof entry.seriesOrder === "number" &&
        Number.isFinite(entry.seriesOrder) &&
        entry.seriesOrder > current.maxSeriesOrder
      ) {
        current.maxSeriesOrder = entry.seriesOrder;
      }
      current.slugs.push(entry.slug);
      seriesMap.set(entry.series, current);
    }

    for (const tag of entry.tags ?? []) {
      const normalized = tag.trim();
      if (!normalized) continue;
      tagMap.set(normalized, (tagMap.get(normalized) ?? 0) + 1);
    }
  }

  const series = [...seriesMap.entries()]
    .map(([name, info]) => ({
      name,
      count: info.count,
      maxSeriesOrder: info.maxSeriesOrder,
      nextSeriesOrder: info.maxSeriesOrder + 1,
      slugs: info.slugs,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));

  const tags = [...tagMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) =>
      b.count !== a.count
        ? b.count - a.count
        : a.tag.localeCompare(b.tag, "zh-Hant"),
    );

  const recentBriefs = published.slice(0, 10).map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    publishDate: entry.publishDate,
    updatedDate: entry.updatedDate ?? null,
    series: entry.series ?? null,
    seriesOrder: entry.seriesOrder ?? null,
    sourceUrls: (entry.sources ?? []).map((s) => s.url).filter(Boolean),
  }));

  return {
    totalPublished: published.length,
    totalDrafts: entries.length - published.length,
    desks,
    series,
    tags,
    recentBriefs,
  };
}

/**
 * Check whether a candidate news source URL already exists in any entry's `sources`.
 *
 * @param {LedgerEntry[]} entries
 * @param {string} candidateUrl
 */
export function checkSourceUrl(entries, candidateUrl) {
  const normalizedUrl = normalizeSourceUrl(candidateUrl);
  /**
   * @type {Array<{
   *   slug: string;
   *   title: string;
   *   category: string;
   *   publishDate: string;
   *   draft: boolean;
   *   series: string | null;
   *   seriesOrder: number | null;
   *   matchedSourceUrl: string;
   * }>}
   */
  const matches = [];

  if (normalizedUrl) {
    for (const entry of entries) {
      for (const source of entry.sources ?? []) {
        if (!source.url) continue;
        if (normalizeSourceUrl(source.url) === normalizedUrl) {
          matches.push({
            slug: entry.slug,
            title: entry.title,
            category: entry.category,
            publishDate: entry.publishDate,
            draft: entry.draft === true,
            series: entry.series ?? null,
            seriesOrder: entry.seriesOrder ?? null,
            matchedSourceUrl: source.url,
          });
          break;
        }
      }
    }
  }

  return {
    matched: matches.length > 0,
    candidateUrl,
    normalizedUrl,
    matches,
  };
}
