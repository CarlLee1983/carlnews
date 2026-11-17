import assert from "node:assert/strict";
import test from "node:test";
import { buildShareUrls, copyShareUrl } from "../src/utils/share.ts";

test("分享連結優先使用 canonical 並正確編碼標題與網址", () => {
  const urls = buildShareUrls({
    title: "半導體出口管制更新：三項關鍵影響",
    pageUrl: "https://carlnews.example/news/chip-export-update/",
    canonicalUrl: "https://source.example/posts/chip?lang=zh-TW",
  });

  assert.equal(urls.shareUrl, "https://source.example/posts/chip?lang=zh-TW");
  assert.equal(
    new URL(urls.x).searchParams.get("text"),
    "半導體出口管制更新：三項關鍵影響",
  );
  assert.equal(
    new URL(urls.x).searchParams.get("url"),
    "https://source.example/posts/chip?lang=zh-TW",
  );
  assert.equal(new URL(urls.linkedIn).searchParams.get("url"), urls.shareUrl);
  assert.equal(new URL(urls.facebook).searchParams.get("u"), urls.shareUrl);
});

test("沒有 canonical 時分享本站時事評論網址", () => {
  const urls = buildShareUrls({
    title: "時事評論",
    pageUrl: "https://carlnews.example/news/brief/",
  });

  assert.equal(urls.shareUrl, "https://carlnews.example/news/brief/");
});

test("複製連結回報成功或失敗", async () => {
  const copied: string[] = [];
  const clipboard = { writeText: async (url: string) => void copied.push(url) };

  assert.equal(
    await copyShareUrl(clipboard, "https://carlnews.example/news/brief/"),
    "文章連結已複製",
  );
  assert.deepEqual(copied, ["https://carlnews.example/news/brief/"]);
  assert.equal(
    await copyShareUrl(
      { writeText: async () => Promise.reject(new Error("denied")) },
      "https://carlnews.example/news/brief/",
    ),
    "無法複製連結，請手動複製網址",
  );
  assert.equal(
    await copyShareUrl(undefined, "https://carlnews.example/news/brief/"),
    "無法複製連結，請手動複製網址",
  );
});
