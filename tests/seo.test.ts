import assert from "node:assert/strict";
import test from "node:test";
import { buildSeoMetadata } from "../src/utils/seo.ts";

test("SEO metadata 由 SITE_URL 產生 canonical 與預設分享圖", () => {
  const metadata = buildSeoMetadata({
    site: new URL("https://carlnews.example"),
    path: "/news/hello/",
    title: "時事評論",
    description: "摘要",
  });
  assert.equal(metadata.canonical, "https://carlnews.example/news/hello/");
  assert.equal(metadata.image, "https://carlnews.example/social-card.png");
  assert.equal(metadata.imageAlt, "時事評論");
  assert.equal(metadata.type, "website");
});

test("時事評論可覆寫 canonical、分享圖與內容類型", () => {
  const metadata = buildSeoMetadata({
    site: new URL("https://carlnews.example"),
    path: "/ignored/",
    title: "時事評論",
    description: "摘要",
    canonicalUrl: "https://source.example/news",
    image: "/covers/news.png",
    imageAlt: "產業新聞示意圖",
    type: "article",
  });
  assert.equal(metadata.canonical, "https://source.example/news");
  assert.equal(metadata.image, "https://carlnews.example/covers/news.png");
  assert.equal(metadata.imageAlt, "產業新聞示意圖");
  assert.equal(metadata.type, "article");
});
