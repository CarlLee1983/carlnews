import { getCollection, type CollectionEntry } from "astro:content";
import {
  collectCategories as groupCategories,
  filterDrafts,
  getEntrySlug,
  normalizeTaxonomy,
  sortByUpdatedDate,
  sortSeries,
} from "./content";

export async function getVisiblePosts(): Promise<CollectionEntry<"news">[]> {
  const entries = await getCollection("news");
  return sortByUpdatedDate(filterDrafts(entries, import.meta.env.DEV));
}

export function postHref(post: CollectionEntry<"news">): string {
  return `/news/${getEntrySlug(post.id)}/`;
}

export function categoryHref(category: string): string {
  return `/category/${normalizeTaxonomy(category)}/`;
}

export function collectCategories(posts: CollectionEntry<"news">[]) {
  return groupCategories(posts);
}

export function collectTaxonomy(
  posts: CollectionEntry<"news">[],
  key: "tags" | "series",
) {
  const map = new Map<
    string,
    { name: string; slug: string; posts: CollectionEntry<"news">[] }
  >();
  for (const post of posts) {
    const values =
      key === "tags"
        ? post.data.tags
        : post.data.series
          ? [post.data.series]
          : [];
    for (const name of values) {
      const slug = normalizeTaxonomy(name);
      const current = map.get(slug) ?? { name, slug, posts: [] };
      current.posts.push(post);
      map.set(slug, current);
    }
  }
  return [...map.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "zh-Hant"),
  );
}

export function getSeriesPosts(
  posts: CollectionEntry<"news">[],
  series: string,
) {
  const slug = normalizeTaxonomy(series);
  return sortSeries(
    posts.filter(
      (post) =>
        post.data.series && normalizeTaxonomy(post.data.series) === slug,
    ),
  );
}
