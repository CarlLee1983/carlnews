# CarlNews repository instructions

## 時事連結預設為發布任務

當使用者提供新聞、官方公告、財報、政策文件或社群貼文連結，且未指定其他交付方式時，將它視為完整的 CarlNews 時事評論發布授權：讀取原文、蒐集一手消息來源查核、遵循 [carlnews-copywriting](.agents/skills/carlnews-copywriting/SKILL.md) 與 [`docs/content-guide.md`](docs/content-guide.md) 採用**金字塔原理（先說答案 → 再解釋為什麼 → 最後提供證據）**與「發生什麼事、為什麼重要、後續怎麼看」完成評論發布。

- 去重檢查必須先於研究：保留平台的穩定內容 ID 與有識別作用的 query 參數，只移除 `utm_*`、`s` 等追蹤參數；再以原始 URL、正規化 URL、標題與實體關鍵字搜尋 `src/content/news` 與 [`docs/news-queue.md`](docs/news-queue.md)。所有主來源 URL 必須記錄於 frontmatter `sources` 陣列中，讓 repository 搜尋結果能直接對應發布頁面。
- 同一事件有小幅進展時，更新既有時事評論的 `updatedDate` 與 `updateNote`，不要建立重複 URL。
- 同一重大議題出現跨階段的結構性轉折時，才新增時事評論，並透過 `series` 與遞增的 `seriesOrder` 串聯事件脈絡，同時互相加入站內連結。
- 預設成品必須是 `draft: false` 的正式時事評論；完成後只提交本次相關檔案，並確認三道 gate 皆為綠燈。
- 只有使用者明確要求加入佇列（記於 `docs/news-queue.md`）、保留草稿、僅分析／審閱、不要發布或指定其他交付物時，才停止在對應階段。

## 內容發布控制

時事評論寫作以 [`docs/content-guide.md`](docs/content-guide.md) 與 [carlnews-copywriting](.agents/skills/carlnews-copywriting/SKILL.md) 為規格；用語以 [`CONTEXT.md`](CONTEXT.md) 為準。發布或更新內容時，先執行 `pnpm format`、再 stage 目標檔案，取得以下三道 gate 綠燈才可 commit：

- `pnpm content:policy -- HEAD`
- `pnpm check`
- `pnpm test`

動到 [`docs/architecture.md`](docs/architecture.md) 邊界清單上的檔案時，先讀該文件與 [`docs/adr/`](docs/adr/)，並回報未決問題。不得以關閉檢查、改成 `draft: true` 或跳過 CI 繞過 gate。
