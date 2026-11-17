# ADR 0001：以「三問速覽」與結構化來源作為時事評論的一等公民契約

- **狀態**：accepted

## 背景

CarlNews 的內容聚焦在科技業、AI 公司、半導體、產品、政策與國際生活時事，寫作核心是回答「發生什麼事、為什麼重要、後續怎麼看」。若僅沿用一般部落格的 `description` 欄位，列表卡片、文章頂部速覽與結構化資料無法穩定萃取這三項核心判讀；同時若依賴固定 H2 標題檢查，會限制長文正文的敘事節奏。此外，時事評論依賴可查證的一手來源，而突發新聞不宜因強制製作 AI 封面圖而延誤發布。

## 決策

1. 在 `src/content.config.ts` 的 `news` collection 強制定義 `whatHappened`、`whyItMatters`、`whatNext` 三個字串欄位，於 `ArticleLayout.astro` 頂部自動渲染為「三問速覽（Executive Brief）」。
2. 引入必填單選的 7 大版面 `category` 枚舉（`NEWS_CATEGORIES`）與至少 1 筆的結構化 `sources` 陣列。
3. 將 `cover` 改為選填（僅於提供 `cover` 時要求 `coverAlt`），並移除 `CarlStack` 的 `projects`、`lab` 與 `echarts-wordcloud`。

## 影響

- **正面**：每篇時事評論皆有統一的判讀錨點與來源清單，且能直接支援列表預覽與未來的跨頁摘要呈現；文章發布流程不被封面繪製阻塞。
- **權衡**：既有寫作工具與新文章草稿必須明確填寫三問欄位、版面與至少一筆來源，否則會在 `astro check` 與 `astro build` 階段中止。
