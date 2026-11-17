# 測試與驗證

三道 gate，全部綠燈才能 commit：

| 指令                            | 內容                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                    | `prettier --check` → `astro check`（TypeScript strict + Astro 模板）→ `astro build`（含 schema 驗證與 Pagefind 索引） |
| `pnpm test`                     | `node --experimental-strip-types --test tests/*.test.ts`                                                              |
| `pnpm content:policy -- <base>` | 比對 `<base>` 至工作目錄的時事內容 diff，擋下 Mermaid fence 與無法渲染的 LaTeX                                        |

## 測試檔對應的規則

| 規則                                                                                    | 測試                                  |
| --------------------------------------------------------------------------------------- | ------------------------------------- |
| 更新日倒序（未更新退回發布日）、draft 過濾、taxonomy 正規化、系列排序、7 大版面固定順序 | `tests/content.test.ts`               |
| 精選到期退場與最近更新補位邏輯                                                          | `tests/featured.test.ts`              |
| `/news/` 分頁 URL 形狀與邊界處理                                                        | `tests/pagination.test.ts`            |
| 台北時區日期格式與 `ArticleCard.astro`、`Seo.astro` 契約                                | `tests/article-date.test.ts`          |
| canonical 與預設分享圖由 `SITE_URL` 產生、文章可覆寫                                    | `tests/seo.test.ts`                   |
| 部署拒絕 placeholder `SITE_URL`                                                         | `tests/site-url.test.ts`              |
| 新增／修改時事禁用 Mermaid 與 LaTeX                                                     | `tests/content-policy.test.ts`        |
| 深淺色與系統深色 fallback 的文字及主色按鈕對比度至少 4.5:1                              | `tests/color-contrast.test.ts`        |
| CJK 標點旁粗體與 `singleTilde: false` Markdown／MDX 管線                                | `tests/markdown-cjk-emphasis.test.ts` |
| h2–h4 錨點連結與冪等性                                                                  | `tests/rehype-heading-anchor.test.ts` |
| 表格單元格注入 `data-label` 並包裹捲動容器                                              | `tests/rehype-table-scroll.test.ts`   |
| callout 標記轉 `aside`                                                                  | `tests/remark-callout.test.ts`        |
| 目錄只收 h2／h3，孤兒 h3 提升為頂層                                                     | `tests/toc.test.ts`                   |
| 分享網址與剪貼簿複製訊息                                                                | `tests/share.test.ts`                 |
