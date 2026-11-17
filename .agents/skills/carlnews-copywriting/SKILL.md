---
name: carlnews-copywriting
description: 撰寫、更新或查核 CarlNews 的繁體中文時事評論、三問速覽、標題與消息來源；處理 src/content/news、docs/news-queue.md 或使用者提供新聞／財報／政策／社群貼文連結時使用。
---

# CarlNews Copywriting

## Workflow

1. **台帳掃描與 URL 去重**：先執行 `pnpm news:ledger` 檢視 7 大版面分佈、既有 `series`（取得正確 `nextSeriesOrder`）與常用 `tags`；再對每個候選來源連結執行 `pnpm news:ledger --check-url "<url>"` 與關鍵字搜尋 `src/content/news`、`docs/news-queue.md`。
   - 同一事件僅有小幅進展時，就地更新既有檔案的 `updatedDate`、`updateNote` 與 `sources`，不建立重複 URL。
   - 同一重大議題出現跨階段結構性轉折時，才新增檔案並以 `series` 與遞增的 `seriesOrder` 串聯事件脈絡，同時補上站內連結。
2. **讀取規範與契約**：讀取 `docs/content-guide.md`、`CONTEXT.md`、`src/content.config.ts` 與同版面最近一篇已發布評論；所有名詞與 frontmatter 欄位以這三份文件為準。`publishDate`（及 `updatedDate`）必須使用含 UTC offset 的 ISO 8601 時間戳（如 `+08:00`），且來源 URL 不得夾帶 `utm_*`、`fbclid`、`gclid` 等追蹤參數。
3. **查核一手事實並區分推論**：從使用者提供連結與一手官方來源（公告、財報、監管原文）核對數字、時間點與原文語境；所有事實對應至 frontmatter `sources` 陣列，作者判讀與推論以明確句子標示。
4. **以金字塔原理起草（Answer → Why → Evidence）**：
   - **頂層答案**：`title` 為具體判斷句；`whatHappened`、`whyItMatters`、`whatNext` 與正文第一段開頭（`**結論先說：...**` 或粗體結論首句）直接亮出核心結論。
   - **章節推演**：至少包含 2 個 `##` 小標，且每個小標必須是完整判斷句（`pnpm content:policy` 會自動擋下「背景介紹」、「事件經過」、「結論」等空泛名詞標籤）。每節依序展開：**首句給答案 → 中段解釋為什麼（利益結構／供應鏈／技術或制度機制）→ 末段擺出具體證據或可追蹤指標**。
5. **版式與文字紀律**：使用繁體中文（台灣用語）與規定之 `> [!NOTE]`／`> [!IMPORTANT]` callout 語法；多維度對照優先使用粗體鍵值清單而非寬版 Markdown 表格；排除 Emoji、Mermaid fence、LaTeX `$...$` 與宣傳式形容詞。
6. **驗證三道 Gate 與交付**：預設輸出 `draft: false`；若從 `docs/news-queue.md` 認領題目，於同次變更移除該項。執行 `pnpm format`，stage 目標檔案，依序通過：
   - `pnpm content:policy -- HEAD`
   - `pnpm check`
   - `pnpm test`
     全數綠燈後提交本次相關檔案至 `main`（自動化排程且已設定遠端時可同步推送）。

## Completion

當所有 `src/content.config.ts` 欄位通過驗證、全篇與各節皆落實「先說答案 → 解釋為什麼 → 提供證據」金字塔結構、所有事實皆可追溯至 `sources`，且三道 Gate 全數綠燈時，工作才算完成。
