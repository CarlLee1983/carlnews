import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLedgerSummary,
  checkSourceUrl,
  hasTrackingParams,
  NEWS_DESKS,
  normalizeSourceUrl,
} from "../src/utils/news-ledger.mjs";

test("normalizeSourceUrl 移除追蹤參數與 hash 並保留內容識別參數", () => {
  assert.equal(
    normalizeSourceUrl(
      "https://WWW.Example.com/news/post/?utm_source=x&id=42&utm_medium=social&ref=home#top",
    ),
    "https://www.example.com/news/post?id=42",
  );

  assert.equal(
    normalizeSourceUrl("https://x.com/user/status/123456789?s=20&t=abc"),
    "https://x.com/user/status/123456789?t=abc",
  );

  assert.equal(
    normalizeSourceUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=xyz"),
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  );
});

test("hasTrackingParams 嚴格攔截 utm_*、fbclid 與 gclid 等追蹤參數", () => {
  assert.equal(
    hasTrackingParams("https://example.com/report?utm_source=bot"),
    true,
  );
  assert.equal(
    hasTrackingParams("https://example.com/report?fbclid=IwAR0123"),
    true,
  );
  assert.equal(
    hasTrackingParams("https://example.com/report?gclid=CjwKCA"),
    true,
  );
  assert.equal(
    hasTrackingParams("https://example.com/report?id=99&page=2"),
    false,
  );
});

test("buildLedgerSummary 正確統計七大版面、專題脈絡 nextSeriesOrder 與標籤", () => {
  const summary = buildLedgerSummary([
    {
      slug: "ai-brief-1",
      title: "AI Brief 1",
      category: "AI 與模型",
      publishDate: "2026-11-16T09:00:00+08:00",
      draft: false,
      tags: ["OpenAI", "AI 推論"],
      series: "AI 算力結構轉折",
      seriesOrder: 1,
      sources: [{ title: "OpenAI", url: "https://openai.com/research/" }],
    },
    {
      slug: "semi-brief-2",
      title: "Semi Brief 2",
      category: "半導體與硬體",
      publishDate: "2026-11-17T09:00:00+08:00",
      draft: false,
      tags: ["TSMC", "AI 推論"],
      series: "AI 算力結構轉折",
      seriesOrder: 2,
      sources: [{ title: "TSMC", url: "https://investor.tsmc.com/" }],
    },
    {
      slug: "draft-brief",
      title: "Draft Brief",
      category: "政策與監管",
      publishDate: "2026-11-17T10:00:00+08:00",
      draft: true,
      tags: ["EU"],
      sources: [{ title: "EU", url: "https://ec.europa.eu/" }],
    },
  ]);

  assert.equal(summary.totalPublished, 2);
  assert.equal(summary.totalDrafts, 1);
  assert.equal(summary.desks.length, NEWS_DESKS.length);
  assert.equal(summary.desks.find((d) => d.category === "AI 與模型")?.count, 1);
  assert.equal(
    summary.desks.find((d) => d.category === "政策與監管")?.count,
    0,
  );

  assert.deepEqual(summary.series, [
    {
      name: "AI 算力結構轉折",
      count: 2,
      maxSeriesOrder: 2,
      nextSeriesOrder: 3,
      slugs: ["semi-brief-2", "ai-brief-1"],
    },
  ]);

  assert.equal(summary.tags[0]?.tag, "AI 推論");
  assert.equal(summary.tags[0]?.count, 2);
});

test("checkSourceUrl 忽略追蹤參數與結尾斜線差異，準確命中既有時事評論", () => {
  const entries = [
    {
      slug: "advanced-packaging-cowos-supply-2026",
      title: "先進封裝產能仍是 AI 算力擴張的關鍵瓶頸",
      category: "半導體與硬體",
      publishDate: "2026-11-17T08:30:00+08:00",
      series: "AI 算力結構轉折",
      seriesOrder: 2,
      sources: [
        {
          title: "TSMC 3DFabric",
          url: "https://www.tsmc.com/english/dedicatedFoundry/technology/platform_3DFabric",
        },
      ],
    },
  ];

  const hit = checkSourceUrl(
    entries,
    "https://www.tsmc.com/english/dedicatedFoundry/technology/platform_3DFabric/?utm_source=bot&fbclid=xyz#overview",
  );
  assert.equal(hit.matched, true);
  assert.equal(hit.matches.length, 1);
  assert.equal(hit.matches[0]?.slug, "advanced-packaging-cowos-supply-2026");

  const miss = checkSourceUrl(
    entries,
    "https://www.tsmc.com/chinese/dedicatedFoundry/technology/cowos",
  );
  assert.equal(miss.matched, false);
  assert.equal(miss.matches.length, 0);
});
