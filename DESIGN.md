# CarlNews 設計系統規範 (Design System & Guidelines)

本文檔定義 CarlNews 的視覺哲學、Design Tokens、字體排印契約與核心報刊元件規範，作為所有前端開發、樣式調整與 AI Agent 協作的**單一視覺真理來源（Single Source of Truth）**。

---

## 1. 設計哲學與風格基調 (Design Philosophy)

**核心風格：以閱讀層次為主的現代新聞刊物**

- **節制的分類識別色**：保留 7 大固定版面的專屬色（`[data-desk]`）。首頁與共用文章／事件脈絡卡片以中性文字、留白與細分隔線建立層次，分類色僅用於小標記，不鋪成大面積底色或容器頂線。文章內頁的三問與來源區同樣以中性文字及分隔線呈現；色彩保留給分類識別、連結與必要狀態。
- **平面閱讀層次**：沿用現有深淺色 tokens。首頁報頭、頭條、近期評論與共用文章／事件脈絡卡片融入畫布，不使用漸層、浮起陰影或卡片位移；主次由欄寬、間距與分隔線呈現。文章內頁的三問、首段結論與來源區採相同的平面閱讀層次；其他頁面容器維持原樣。
- **一致的現代黑體排印 (Unified Modern Sans)**：標題、內文與介面統一採用現代無襯線黑體（`Plus Jakarta Sans Variable` + 繁體中文黑體），搭配 `44rem` 閱讀行寬、`1.95` 行高、首段導言強調與即時 4 段字級縮放。

---

## 2. Design Tokens 色彩與雙模式系統

所有色彩、圓角、框線與字級變數集中定義於 [`tokens.css`](tokens.css)。

### 2.1 淺色模式 (Light Mode / Stone Paper)

- **畫布底色 (`--color-paper`)**：`#f3f4f6`
- **卡片底色 (`--color-card`)**：`#ffffff`
- **次級背景 (`--color-paper-2`)**：`#e8ecf1`
- **主文字色 (`--color-ink`)**：`#0f172a`
- **內文文字 (`--color-ink-2`)**：`#1e293b`
- **次要文字 (`--color-muted`)**：`#475569`
- **社論深緋紅 (`--color-accent`)**：`#be123c`（Hover: `#9f1239`；強調按鈕字色 `--color-accent-ink`: `#ffffff`）
- **情報深海藍 (`--color-secondary`)**：`#1d4ed8`（Soft: `#dbeafe`）
- **三問語意色**：`--color-q1: #1d4ed8`、`--color-q2: #be123c`、`--color-q3: #0f766e`
- **七大版面專屬色**：`--desk-biz`（`#1d4ed8`）、`--desk-ai`（`#6d28d9`）、`--desk-semi`（`#b45309`）、`--desk-prod`（`#0f766e`）、`--desk-policy`（`#be123c`）、`--desk-world`（`#0369a1`）、`--desk-life`（`#c2410c`）

### 2.2 深色模式 (Dark Mode / Deep Midnight Navy Slate)

- **畫布底色 (`--color-paper`)**：`#0b0f17`
- **卡片底色 (`--color-card`)**：`#131b2e`
- **卡片懸浮 (`--color-card-hover`)**：`#19233c`
- **次級背景 (`--color-paper-2`)**：`#111827`
- **主文字色 (`--color-ink`)**：`#f8fafc`
- **內文文字 (`--color-ink-2`)**：`#e2e8f0`
- **次要文字 (`--color-muted`)**：`#94a3b8`
- **高對比玫瑰紅 (`--color-accent`)**：`#fb7185`（Hover: `#fda4af`；強調按鈕字色 `--color-accent-ink`: `#0b0f17`）
- **亮情報藍 (`--color-secondary`)**：`#60a5fa`

### 2.3 對比度與框線契約

- **WCAG AA 對比度底線**：`ink-2`/`paper`、`muted`/`paper`、`accent`/`paper`、`accent-ink`/`accent` 於淺色、深色及系統深色 fallback 三組區塊均須維持 `>= 4.5:1`，並由 `tests/color-contrast.test.ts` 自動守住。
- **圓角與結構線**：
  - `--radius-sm: 4px`、`--radius-md: 6px`、`--radius-lg: 8px`、`--radius-pill: 9999px`
  - `--rule-hair: 1px`、`--rule-strong: 2px`、`--rule-masthead: 3px`

---

## 3. 排版與硬性規則 (Typography & Hard Rules)

1. **嚴格禁用 Emoji**：全站任何標題、按鈕、版面標籤、卡片或來源註記皆不得出現 Emoji；所有圖標採用幾何向量線條 SVG。
2. **標題禁止斜體**：`h1`–`h4` 與顯示字體一律維持正體（`font-style: normal`），以字重、字級與留白表達強調。
3. **數據等寬對齊**：日期、計數與索引序號使用 `font-variant-numeric: tabular-nums` 或 `--font-mono`。
4. **字體族系與動態縮放**：
   - 標題／內文／介面：`--font-display` / `--font-body`（`--font-sans`，`"Plus Jakarta Sans Variable"` + 繁體中文系統黑體）。
   - 等寬代碼：`--font-mono`（`"Fira Code Variable"`）。
   - 四段動態字級縮放（`sm: 0.9`、`md: 1.0`、`lg: 1.15`、`xl: 1.3`），持久化於 `localStorage` 的 `"carlnews-font-scale"`。

---

## 4. 核心組件規範 (Core Components)

### 4.1 報頭導覽列 (`Header.astro`)

- 頂部帶 `3px` 主色頂線與半透明卡片背景，刊名左側附主副雙色標記，與搜尋按鈕（`⌘ K`）及深淺色切換並列。

### 4.2 首頁報刊頭版結構 (`src/pages/index.astro`)

1. **編輯室報頭（`.masthead`）**：無漸層或卡片外框，保留台北日期、刊名、簡介與帶小型分類色點的 **7 大版面快選列（Desk Strip）**。
2. **頭條判讀雙欄（`.frontpage-grid`）**：
   - 左主欄（`.lead-dossier`）：以原有黑體標題、導言與中性三問摘要呈現頭條；移除巢狀彩色框，保留完整三問文字。
   - 右副欄（`.dispatch-rail`）：以細線與較緊湊的列表呈現近期評論，不使用藍色標頭底板。
3. **精選判讀、七大版面與事件脈絡追蹤**：沿用既有網格與資訊，使用中性分隔線與留白，移除彩色卡片頂線、陰影與懸浮位移。`ArticleCard.astro` 與 `SeriesCard.astro` 的共用樣式同步套用至索引與分類等使用頁。

### 4.3 內頁寬版導讀與查核依據 (`ArticleLayout.astro`)

- **三問速覽（`.executive-brief`）**：以中性標籤與細分隔線呈現「發生什麼事」、「為什麼重要」、「後續怎麼看」，不使用漸層、陰影或彩色底板。採 **01／02／03 的連續摘要**：問題標題在上、完整內文在下。桌面以窄序號欄建立閱讀順序，手機讓內文使用完整欄寬；保留字級縮放，不折疊或截斷摘要。
- **正文閱讀區（`.prose`）**：維持 `44rem` 行寬、`1.95` 行高與既有字型字級；首段結論直接融入正文，以既有字重強調，`h2` 依留白與細線分節，不加左側色槓。保留右側懸浮目錄（TOC）。
- **消息來源（`.article-sources`）**：以中性標頭、純文字序號與細分隔線列出發布機構、日期及可辨識的外部連結，不使用藍色容器或序號色塊。
