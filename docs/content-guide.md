# CarlNews 內容指南

## 寫作定位

CarlNews 面向關心科技產業、AI 公司、半導體、產品、政策與國際生活時事的讀者。每一篇**時事評論（Brief）**都不只是翻譯新聞或堆砌細節，而是回答三個問題：

1. **發生什麼事（`whatHappened`）**：以可查核的一手事實交代關鍵事件、數據與時間點。
2. **為什麼重要（`whyItMatters`）**：指出這件事對產業鏈、競爭格局、法規邊界或日常生活的結構性影響。
3. **後續怎麼看（`whatNext`）**：提出可追蹤的觀察指標、時間窗口或風險訊號。

## 檔案與 URL

- 時事評論放在 `src/content/news`，使用小寫 ASCII 檔名與連字號，例如 `ai-inference-compute-shift-2026.md`。
- 檔名會成為 `/news/<slug>/`；發布後不要任意更名。

## Frontmatter 規格

完整欄位由 `src/content.config.ts` 驗證：

| 欄位            | 必填              | 說明                                                                                                              |
| --------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `title`         | 是                | 頁面 h1、搜尋與 SEO title                                                                                         |
| `description`   | 是                | 一到兩句具體摘要                                                                                                  |
| `whatHappened`  | 是                | 三問速覽：發生什麼事                                                                                              |
| `whyItMatters`  | 是                | 三問速覽：為什麼重要                                                                                              |
| `whatNext`      | 是                | 三問速覽：後續怎麼看                                                                                              |
| `category`      | 是                | 7 大固定版面之一：`科技與商業`、`AI 與模型`、`半導體與硬體`、`產品與生態`、`政策與監管`、`國際時事`、`生活與社會` |
| `publishDate`   | 是                | 原始發布時間，必須使用含 UTC offset 的 ISO 8601 時間戳（如 `2026-11-17T09:30:00+08:00`）                          |
| `updatedDate`   | 否                | 有實質後續進展時才設定；時序清單優先依此倒序排列                                                                  |
| `updateNote`    | 否                | 簡述本次更新補充了什麼進展；設定時必須同時提供 `updatedDate`                                                      |
| `draft`         | 是                | production 排除 `true`                                                                                            |
| `featured`      | 是                | 是否進入首頁精選                                                                                                  |
| `featuredUntil` | 精選時必填        | 精選到期日（含當天）；過期自動退場                                                                                |
| `tags`          | 是                | 具體公司、人物或議題標籤（如 `TSMC`、`NVIDIA`、`OpenAI`）                                                         |
| `series`        | 否                | 事件脈絡名稱（跨日或跨階段追蹤重大事件時設定）                                                                    |
| `seriesOrder`   | 否                | 正整數；設定時必須同時有 `series`                                                                                 |
| `sources`       | 是（至少 1 筆）   | 消息來源陣列：`title`、`url` 必填；`publisher`、`publishedAt` 選填                                                |
| `cover`         | 否                | 選填 `src/assets` 相對圖片路徑                                                                                    |
| `coverAlt`      | 有 `cover` 時必填 | 描述圖片傳達的資訊                                                                                                |
| `canonicalUrl`  | 否                | 只有本站不是原始來源時覆寫                                                                                        |

## 消息來源與後續更新

- **事實與判讀分開**：外部事實一律對應到 `sources` 列表與明確日期；作者推論與預判以明確語氣標示，不把推論寫成來源原話。
- **小幅更新原篇**：同一事件有新數據、澄清或延後宣布時，更新原檔的 `updatedDate` 並補上 `updateNote` 與新的 `sources`。
- **重大轉折開新篇**：出現新政策落地、併購拍板或財報季轉折時，建立新檔並以 `series` + `seriesOrder` 串接成同一條事件脈絡。

## Markdown 與 MDX

- 一篇時事評論只使用一個 h1；frontmatter `title` 會輸出 h1，正文從 `##` 開始。
- 禁止使用 Mermaid fence 與 LaTeX `$...$` 語法；數學式改用行內程式碼或 Unicode（如 `≥`、`×`）。
- 提示區塊使用 GitHub alert 語法（`> [!NOTE]`、`> [!TIP]`、`> [!IMPORTANT]`、`> [!WARNING]`、`> [!CAUTION]`）。
- 原則上避免使用寬版 Markdown 表格；必要時僅用於純數值對照。
