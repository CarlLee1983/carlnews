import assert from "node:assert/strict";
import test from "node:test";
import {
  changedArticlePolicyViolations,
  resolvePolicyBase,
} from "../src/utils/content-policy.mjs";

test("新或修改時事評論接受原生 SVG 圖解", () => {
  const source =
    '<svg viewBox="0 0 10 10" role="img"><title>流程</title></svg>';

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/news/example.mdx", source),
    [],
  );
});

test("新或修改時事評論拒絕 Mermaid fence", () => {
  const source = "```mermaid\nflowchart LR\n  A --> B\n```";

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/news/example.md", source),
    [
      "src/content/news/example.md: use a native SVG or an Astro SVG component instead of a Mermaid fence.",
    ],
  );
});

test("pnpm 轉發的 -- 分隔符不會被當成 diff base", () => {
  assert.equal(resolvePolicyBase(["--", "HEAD"]), "HEAD");
  assert.equal(resolvePolicyBase(["--", "0f1e2d3"]), "0f1e2d3");
});

test("未傳 base 時退回 HEAD", () => {
  assert.equal(resolvePolicyBase([]), "HEAD");
  assert.equal(resolvePolicyBase(["--"]), "HEAD");
});

test("直接傳 base 時照用", () => {
  assert.equal(resolvePolicyBase(["main"]), "main");
});

test("新或修改時事評論拒絕無法渲染的 LaTeX", () => {
  const source = "參數 $RT_1$ 換取 $RT_2$。\n複雜度為 $O(\\log N)$。";

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/news/example.mdx", source),
    [
      "src/content/news/example.mdx: LaTeX at line 1, 2; the site renders no math, use inline code or Unicode instead.",
    ],
  );
});

test("code fence 與行內程式碼裡的 $ 不算 LaTeX", () => {
  const source = [
    "```bash",
    '$ echo "$PROJECT_ROOT/work"',
    "```",
    "模板字串寫成 `${user_id}` 時不應觸發。",
  ].join("\n");

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/news/example.mdx", source),
    [],
  );
});

test("表格裡的金額與價位符號不算 LaTeX", () => {
  const source = [
    "| 成本等級 | $$$ (最高) | $$ (中等) | $ (最低) |",
    "誤差小於 $0.01 時忽略。",
  ].join("\n");

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/news/example.mdx", source),
    [],
  );
});

test("同時違反兩條規則時各報一次", () => {
  const source =
    "```mermaid\nflowchart LR\n  A --> B\n```\n\n複雜度 $O(\\log N)$。";

  assert.deepEqual(
    changedArticlePolicyViolations("src/content/news/example.mdx", source),
    [
      "src/content/news/example.mdx: use a native SVG or an Astro SVG component instead of a Mermaid fence.",
      "src/content/news/example.mdx: LaTeX at line 6; the site renders no math, use inline code or Unicode instead.",
    ],
  );
});

const validPyramidBrief = [
  "---",
  'title: "雲端推論晶片採購轉向客製化設計，單位 Token 成本成為勝負線"',
  'description: "推論工作負載比重超越訓練後，雲端服務商正重估 ASIC 與通用 GPU 的採購比例。"',
  'whatHappened: "多家雲端大廠於本季公開自研推論晶片部署進度。"',
  'whyItMatters: "推論階段決定 AI 產品商業化後的毛利空間。"',
  'whatNext: "觀察未來兩季資料中心資本支出與快取定價變化。"',
  'category: "半導體與硬體"',
  "publishDate: 2026-11-17T09:00:00+08:00",
  "draft: false",
  "featured: false",
  "tags:",
  "  - ASIC",
  "sources:",
  '  - title: "Official Investor Briefing"',
  '    url: "https://investor.example.com/briefing?id=2026q4"',
  "---",
  "",
  "**結論先說：推論成本正在取代訓練參數規模，成為決定雲端晶片採購優先順序的核心指標。**企業代理流程上線後，推論算力佔比快速上升。",
  "",
  "## 代理型工作負載倍增頻寬消耗，迫使雲端商調整機櫃架構",
  "",
  "多步驟推理需要大量高頻寬記憶體容量與低延遲互連。",
  "",
  "## 接下來兩季從毛利率與先進封裝交期驗證替代速度",
  "",
  "關注法說會對高階封裝產能配額的更新口徑。",
].join("\n");

test("完整合法的金字塔原理時事評論通過全部 policy gate", () => {
  assert.deepEqual(
    changedArticlePolicyViolations(
      "src/content/news/valid-brief.md",
      validPyramidBrief,
    ),
    [],
  );
});

test("完整文章若缺少首段粗體結論則觸發 missingBlufLead", () => {
  const source = validPyramidBrief.replace(
    "**結論先說：推論成本正在取代訓練參數規模，成為決定雲端晶片採購優先順序的核心指標。**",
    "近年隨著生成式 AI 發展，各大雲端廠持續擴張資料中心。",
  );

  const violations = changedArticlePolicyViolations(
    "src/content/news/no-bluf.md",
    source,
  );
  assert.equal(
    violations.some((v) => v.includes("missingBlufLead")),
    true,
  );
});

test("使用空泛名詞小標或小標不足兩段時分別觸發 genericHeadingNotAllowed 與 insufficientPyramidHeadings", () => {
  const genericSource = validPyramidBrief.replace(
    "## 代理型工作負載倍增頻寬消耗，迫使雲端商調整機櫃架構",
    "## 背景介紹",
  );
  const genericViolations = changedArticlePolicyViolations(
    "src/content/news/generic-heading.md",
    genericSource,
  );
  assert.equal(
    genericViolations.some((v) => v.includes("genericHeadingNotAllowed")),
    true,
  );

  const singleHeadingSource = validPyramidBrief.replace(
    "\n## 接下來兩季從毛利率與先進封裝交期驗證替代速度\n",
    "\n",
  );
  const countViolations = changedArticlePolicyViolations(
    "src/content/news/single-heading.md",
    singleHeadingSource,
  );
  assert.equal(
    countViolations.some((v) => v.includes("insufficientPyramidHeadings")),
    true,
  );
});

test("內文或 frontmatter 含 Emoji、純日期無時區、追蹤參數 URL 皆會被攔截", () => {
  const dirty = validPyramidBrief
    .replace(
      'category: "半導體與硬體"',
      'category: "半導體與硬體"\nupdatedDate: 2026-11-18',
    )
    .replace(
      "publishDate: 2026-11-17T09:00:00+08:00",
      "publishDate: 2026-11-17",
    )
    .replace(
      'url: "https://investor.example.com/briefing?id=2026q4"',
      'url: "https://investor.example.com/briefing?id=2026q4&utm_source=bot"',
    )
    .replace("關注法說會對高階封裝產能配額的更新口徑。", "關注法說會配額 🚀。");

  const violations = changedArticlePolicyViolations(
    "src/content/news/dirty-brief.md",
    dirty,
  );
  assert.equal(
    violations.some((v) => v.includes("emojiNotAllowed")),
    true,
  );
  assert.equal(
    violations.some((v) => v.includes("timestampRequiresOffset")),
    true,
  );
  assert.equal(
    violations.some((v) => v.includes("dirtySourceUrl")),
    true,
  );
});
