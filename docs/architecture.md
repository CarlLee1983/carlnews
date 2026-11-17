# CarlNews 架構

CarlNews 是內容優先的靜態時事評論網站：`src/content/news` 的 Markdown／MDX 是唯一資料來源，經 schema 驗證與 Astro build 產生純靜態 HTML，由 Cloudflare Workers Static Assets 提供服務。沒有資料庫、沒有 SSR、沒有常駐後端，執行期不存在應用程式狀態。

本文件定義**邊界**——改動會影響既有時事評論或對外 URL 的檔案。技術選型的理由記在 [`docs/adr/`](adr/)，內容寫作規範記在 [`docs/content-guide.md`](content-guide.md)，領域詞彙記在 [`CONTEXT.md`](../CONTEXT.md)。

## 建置管線

```
src/content/news/*.{md,mdx}
  → src/content.config.ts          schema 驗證（含三問欄位、版面枚舉、sources），失敗即中止 build
  → remark: remark-cjk-friendly, remark-gfm, remark-callout
  → rehype: rehype-table-scroll, rehypeHeadingIds, rehype-heading-anchor
  → src/pages/**                   透過 src/utils/collections.ts 讀取
  → astro build (output: "static") → dist/
  → pagefind --site dist           掃描 dist HTML 產生 dist/pagefind/
  → wrangler deploy                Workers Static Assets
```

`SITE_URL` 在 `astro.config.mjs` 讀入，決定 canonical、RSS、Sitemap、Open Graph 與 robots.txt。未設定時退回保留字 `https://carlnews.example`，讓本地與 CI 在沒有網域時仍能 build；`scripts/validate-site-url.mjs` 在 `pnpm deploy` 阻擋這個 placeholder 進入正式部署。

## 邊界清單

改動以下檔案前先確認影響範圍，並更新對應測試；牽涉權衡時補一則 ADR。

| 邊界             | 檔案                                                                                           | 契約                                                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 內容 schema      | `src/content.config.ts`                                                                        | 時事評論 frontmatter 形狀：強制 `whatHappened`、`whyItMatters`、`whatNext`、`category`、`sources`（至少 1 筆），`cover` 選填。新增必填欄位會讓既有內容失敗；只能新增選填欄位或連同內容遷移                  |
| 發布與排序規則   | `src/utils/content.ts`                                                                         | draft 過濾、更新日倒序（未更新時退回發布日）、taxonomy 正規化、系列排序、slug 推導、閱讀時間估算、首頁精選選取與自動補位。純函式，不碰 Astro API，由 `tests/content.test.ts`、`tests/featured.test.ts` 守住 |
| Collection 存取  | `src/utils/collections.ts`                                                                     | 頁面唯一的內容入口。提供 `getVisiblePosts`、`postHref`、`categoryHref`、`collectCategories`、`collectTaxonomy`、`getSeriesPosts`。頁面不得自行呼叫 `getCollection`                                          |
| URL 形狀         | `getEntrySlug` + `postHref`（`src/utils/content.ts`、`collections.ts`）、`src/pages/**` 的檔名 | `/news/<slug>/`、`/category/<slug>/`、`/series/<slug>/`、`/tags/<slug>/` 發布後不可更名。`trailingSlash: "always"`                                                                                          |
| Taxonomy URL     | `normalizeTaxonomy`（`src/utils/content.ts`）                                                  | NFKC → lowercase → 非文字數字轉連字號。改動會讓所有既有版面、標籤與事件脈絡 URL 失效                                                                                                                        |
| 站址真理來源     | `astro.config.mjs` 的 `site`、`scripts/validate-site-url.mjs`                                  | 唯一站址設定。頁面元件不得硬編網域                                                                                                                                                                          |
| 內容 policy gate | `src/utils/content-policy.mjs`、`scripts/validate-content-policy.mjs`                          | 只檢查新增或修改的時事評論，阻擋 Mermaid fence 與無法渲染的 LaTeX                                                                                                                                           |
| Markdown 管線    | `astro.config.mjs` 的 `markdown.processor`、`src/utils/*.mjs` 外掛                             | `remark-cjk-friendly` 留在 `remarkPlugins`；內建 `gfm` 關閉，改掛 `remark-gfm` 並維持 `singleTilde: false`；`rehype-heading-anchor` 依賴 `rehypeHeadingIds` 先產生 id                                       |
| Design tokens    | `tokens.css`                                                                                   | 全站唯一色彩、間距、字級來源。`:root` 為淺色，`:root[data-theme="dark"]` 與 `@media (prefers-color-scheme: dark) :root:not([data-theme])` 為深色。由 `tests/color-contrast.test.ts` 守住 ≥ 4.5:1 對比度     |
| 主題解析         | `src/layouts/BaseLayout.astro` 的 inline script                                                | `data-theme` 一律是解析後的 `light`／`dark`，localStorage 只存明確選擇（`carlnews-theme`、`carlnews-font-scale`）                                                                                           |
| 站台識別與版面   | `src/config/site.ts`                                                                           | 站名、作者、語系、導覽列與 7 個固定版面 `NEWS_CATEGORIES`                                                                                                                                                   |

## 執行期組成

瀏覽器 JavaScript 依頁面載入：共用版型處理主題與字級偏好，搜尋頁載入 Pagefind，時事評論頁可選載入 Giscus 留言與閱讀進度條，站台可選載入 Cloudflare Web Analytics。無 framework hydration。

## 驗證

`pnpm check`（Prettier + astro check + build）、`pnpm test`（`tests/*.test.ts`）、`pnpm content:policy -- <base>` 三道 gate 都必須綠燈才能 commit，見 [`docs/testing.md`](testing.md)。
