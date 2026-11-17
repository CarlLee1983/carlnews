import { NEWS_CATEGORIES, type NewsCategory } from "../config/site.ts";

export interface NewsDataShape {
  publishDate: Date;
  updatedDate?: Date;
  draft: boolean;
  featured?: boolean;
  featuredUntil?: Date;
  category: NewsCategory;
  tags: string[];
  series?: string;
  seriesOrder?: number;
}

export interface WithNewsData {
  id?: string;
  data: NewsDataShape;
}

/** 列表日期與排序同源；台北日期供讀者閱讀，ISO 時間供 time 與搜尋索引使用。 */
export function getArticleListDate(
  data: Pick<NewsDataShape, "publishDate" | "updatedDate">,
): { datetime: string; text: string } {
  const date = data.updatedDate ?? data.publishDate;
  const formatted = new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Taipei",
  }).format(date);
  return {
    datetime: date.toISOString(),
    text: `${data.updatedDate ? "更新" : "發布"} ${formatted}`,
  };
}

/** 時序清單依最近更新倒序；未更新時使用發布日，同時間以發布日與 ID 穩定排序。 */
export function sortByUpdatedDate<T extends WithNewsData>(entries: T[]): T[] {
  return [...entries].sort((left, right) => {
    const dateOrder =
      lastTouched(right.data) - lastTouched(left.data) ||
      right.data.publishDate.getTime() - left.data.publishDate.getTime();
    if (dateOrder) return dateOrder;
    const leftId = left.id ?? "";
    const rightId = right.id ?? "";
    return leftId < rightId ? -1 : leftId > rightId ? 1 : 0;
  });
}

export function filterDrafts<T extends WithNewsData>(
  entries: T[],
  includeDrafts: boolean,
): T[] {
  return includeDrafts ? entries : entries.filter((entry) => !entry.data.draft);
}

export function normalizeTaxonomy(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("zh-Hant")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function sortSeries<T extends WithNewsData>(entries: T[]): T[] {
  return [...entries].sort((left, right) => {
    const order =
      (left.data.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
      (right.data.seriesOrder ?? Number.MAX_SAFE_INTEGER);
    return (
      order ||
      left.data.publishDate.getTime() - right.data.publishDate.getTime()
    );
  });
}

export function getEntrySlug(id: string): string {
  return id.replace(/\.(md|mdx)$/i, "").replace(/\/index$/i, "");
}

export function estimateReadingMinutes(markdown: string): number {
  const cjkCount = markdown.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  const latinCount = markdown
    .replace(/[\u3400-\u9fff\uf900-\ufaff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(cjkCount / 400 + latinCount / 200));
}

export interface WithPosts {
  name: string;
  posts: unknown[];
}

/** 分類依文章數倒序；同數量時依名稱，讓首頁與標籤頁先露出真正的主題。 */
export function sortByPostCount<T extends WithPosts>(groups: T[]): T[] {
  return [...groups].sort(
    (left, right) =>
      right.posts.length - left.posts.length ||
      left.name.localeCompare(right.name, "zh-Hant"),
  );
}

export interface CategoryGroup<T extends WithNewsData> {
  name: NewsCategory;
  slug: string;
  posts: T[];
}

/** 依 NEWS_CATEGORIES 固定順序分組，保留空版面結構以維持完整版面導覽與靜態路由。 */
export function collectCategories<T extends WithNewsData>(
  posts: readonly T[],
): CategoryGroup<T>[] {
  const buckets = new Map<NewsCategory, T[]>(
    NEWS_CATEGORIES.map((category) => [category, []]),
  );
  for (const post of posts) {
    const list = buckets.get(post.data.category);
    if (list) list.push(post);
  }
  return NEWS_CATEGORIES.map((name) => ({
    name,
    slug: normalizeTaxonomy(name),
    posts: buckets.get(name) ?? [],
  }));
}

const DAY_MS = 24 * 60 * 60 * 1000;

function isActiveFeatured(data: NewsDataShape, now: Date): boolean {
  if (!data.featured || !data.featuredUntil) return false;
  // featuredUntil 是日期，當天整天仍算有效。
  return now.getTime() < data.featuredUntil.getTime() + DAY_MS;
}

function lastTouched(data: NewsDataShape): number {
  return (data.updatedDate ?? data.publishDate).getTime();
}

/**
 * 首頁精選：先取未過期的精選（保留輸入順序），不足 limit 時以最近更新的文章補位。
 * exclude 用來避開同頁已露出的文章（例如最新時事區）。
 */
export function selectFeaturedPosts<T extends WithNewsData>(
  entries: T[],
  options: { now: Date; limit: number; exclude?: T[] },
): T[] {
  const { now, limit, exclude = [] } = options;
  const active = entries
    .filter((entry) => isActiveFeatured(entry.data, now))
    .slice(0, limit);
  const taken = new Set<T>([...active, ...exclude]);
  const fill = sortByUpdatedDate(
    entries.filter((entry) => !taken.has(entry)),
  ).slice(0, limit - active.length);
  return [...active, ...fill];
}
