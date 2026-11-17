# CarlNews repository instructions

## 時事連結預設為發布任務

當使用者提供新聞、官方公告、財報、政策文件或社群貼文連結，且未指定其他交付方式時，將它視為完整的 CarlNews 時事評論發布授權：讀取原文、蒐集一手消息來源查核、遵循 [carlnews-copywriting](.agents/skills/carlnews-copywriting/SKILL.md) 與 [`docs/content-guide.md`](docs/content-guide.md) 採用**金字塔原理（先說答案 → 再解釋為什麼 → 最後提供證據）**與「發生什麼事、為什麼重要、後續怎麼看」完成評論發布。

- 去重檢查必須先於研究：先執行 `pnpm news:ledger`（或 `pnpm news:ledger --json`）掌握現有文章、7 大版面分佈與進行中 `series`，再對候選連結執行 `pnpm news:ledger --check-url "<url>"`；同時以關鍵字搜尋 `src/content/news` 與 [`docs/news-queue.md`](docs/news-queue.md)。所有主來源 URL 必須記錄於 frontmatter `sources` 陣列並移除 `utm_*`、`fbclid`、`gclid` 等追蹤參數。
- 同一事件有小幅進展時，更新既有時事評論的 `updatedDate` 與 `updateNote`，不要建立重複 URL。
- 同一重大議題出現跨階段的結構性轉折時，才新增時事評論，並透過 `series` 與遞增的 `seriesOrder` 串聯事件脈絡，同時互相加入站內連結。
- 預設成品必須是 `draft: false` 的正式時事評論；完成後只提交本次相關檔案，並確認三道 gate 皆為綠燈。
- 只有使用者明確要求加入佇列（記於 `docs/news-queue.md`）、保留草稿、僅分析／審閱、不要發布或指定其他交付物時，才停止在對應階段。

## 每日自動化 Bot 巡檢與發布流程（Daily Bot Playbook）

當自動化 Bot 依排程執行每日時事巡檢與發布時，依以下四步驟運作：

1. **Step 1（台帳與去重）**：先執行 `pnpm news:ledger` 盤點 7 大版面目前覆蓋量、進行中 `series`（含 `nextSeriesOrder`）與熱門 `tags`；對每一個候選來源 URL 執行 `pnpm news:ledger --check-url "<url>"` 確認未重複報導，並檢查 [`docs/news-queue.md`](docs/news-queue.md)。
2. **Step 2（選題配額與來源門檻）**：每次巡檢發布 **1–3 篇**具備結構性訊號的時事評論（寧缺勿濫），優先補齊近期覆蓋較少的版面；每篇至少附上 1 個一手消息來源（官方公告、財報、監管文件、原始訪談或當事人聲明），並清除所有追蹤參數。
3. **Step 3（更新既有評論 vs. 延續事件脈絡）**：若 URL 或主題命中既有評論且屬小幅進展，直接更新原檔 `updatedDate`、`updateNote` 與 `sources`；唯有出現跨階段結構轉折時才建立新評論並串接 `series` 與遞增 `seriesOrder`。
4. **Step 4（金字塔品質與全自動交付）**：預設輸出 `draft: false`、`publishDate` 使用含 UTC offset 的 ISO 8601（例如 `+08:00`）、正文首段以 `**結論先說：...**` 開頭、至少 2 個完整結論句 `##` 副標、禁用 Emoji。完成後執行 `pnpm format`、stage 目標檔案，通過下方三道 gate 後直接 `git commit`（若已設定遠端 `origin` 則推送至 `main`）。

## 內容發布控制

時事評論寫作以 [`docs/content-guide.md`](docs/content-guide.md) 與 [carlnews-copywriting](.agents/skills/carlnews-copywriting/SKILL.md) 為規格；用語以 [`CONTEXT.md`](CONTEXT.md) 為準。發布或更新內容時，先執行 `pnpm format`、再 stage 目標檔案，取得以下三道 gate 綠燈才可 commit：

- `pnpm content:policy -- HEAD`
- `pnpm check`
- `pnpm test`

動到 [`docs/architecture.md`](docs/architecture.md) 邊界清單上的檔案時，先讀該文件與 [`docs/adr/`](docs/adr/)，並回報未決問題。不得以關閉檢查、改成 `draft: true` 或跳過 CI 繞過 gate。
