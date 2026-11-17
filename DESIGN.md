# CarlNews 設計系統規範 (Design System & Guidelines)

本文檔定義 CarlNews 的視覺哲學、Design Tokens、字體排印契約與核心報刊元件規範，作為所有前端開發、樣式調整與 AI Agent 協作的**單一視覺真理來源（Single Source of Truth）**。

---

## 1. 設計哲學與風格基調 (Design Philosophy)

**核心風格：當代財經電訊與情報社論風 (Modern Financial Dispatch)**

- **銳利與高密度秩序 (Crisp, High-density Order)**：採用冷調新聞紙白與深石墨墨水，取代鬆散的圓角部落格卡片與大面積陰影，讓標題、時間戳、版面歸屬與三問摘要一目了然。
- **報刊結構格線 (Masthead Rules & Hairlines)**：以頂部主色粗線（`--rule-masthead: 3px`）、雙線報頭（Double Rule）與 1px 結構髮絲格線建立版面層次，圓角收斂至 `4px`–`8px`。
- **冷靜權威與長文閱讀舒適度 (Authoritative Readability)**：18px 基準字級搭配 1.9 行高、等寬等距數據排印（`tabular-nums`）與即時 4 段字級縮放，兼顧快訊掃讀與深入判讀。

---

## 2. Design Tokens 色彩與雙模式系統

所有色彩、圓角、框線與字級變數集中定義於 [`tokens.css`](tokens.css)。

### 2.1 淺色模式 (Light Mode / Cold Newsprint)

- **畫布底色 (`--color-paper`)**：`#f7f8fa`（冷調新聞紙白）
- **卡片底色 (`--color-card`)**：`#ffffff`
- **次級背景 (`--color-paper-2`)**：`#eef1f5`
- **主文字色 (`--color-ink`)**：`#0f1419`（深石墨黑）
- **內文文字 (`--color-ink-2`)**：`#242b35`
- **次要文字 (`--color-muted`)**：`#525b68`
- **社論深緋紅 (`--color-accent`)**：`#b4232a`（Hover: `#961c22`；強調按鈕字色 `--color-accent-ink`: `#ffffff`）
- **情報深藍 (`--color-secondary`)**：`#1e40af`（Soft: `#eff4ff`）

### 2.2 深色模式 (Dark Mode / Midnight Terminal Slate)

- **畫布底色 (`--color-paper`)**：`#0d1015`（午夜石板黑）
- **卡片底色 (`--color-card`)**：`#151921`
- **卡片懸浮 (`--color-card-hover`)**：`#1c212b`
- **次級背景 (`--color-paper-2`)**：`#12161d`
- **主文字色 (`--color-ink`)**：`#f3f5f8`
- **內文文字 (`--color-ink-2`)**：`#d5dbe3`
- **次要文字 (`--color-muted`)**：`#9aa4b2`
- **高對比緋紅 (`--color-accent`)**：`#f87171`（Hover: `#fca5a5`；強調按鈕字色 `--color-accent-ink`: `#0d1015`）
- **冷青情報藍 (`--color-secondary`)**：`#60a5fa`

### 2.3 對比度與框線契約

- **WCAG AA 對比度底線**：`ink-2`/`paper`、`muted`/`paper`、`accent`/`paper`、`accent-ink`/`accent` 於淺色、深色及系統深色 fallback 三組區塊均須維持 `>= 4.5:1`，並由 `tests/color-contrast.test.ts` 自動守住。
- **圓角與結構線**：
  - `--radius-sm: 4px`、`--radius-md: 6px`、`--radius-lg: 8px`、`--radius-pill: 9999px`
  - `--rule-hair: 1px`、`--rule-strong: 2px`、`--rule-masthead: 3px`

---

## 3. 排版與硬性規則 (Typography & Hard Rules)

1. **嚴格禁用 Emoji**：全站任何標題、按鈕、版面標籤、卡片或來源註記皆不得出現 Emoji；所有圖標採用 `viewBox="0 0 24 24"` 幾何向量線條 SVG。
2. **標題禁止斜體**：`h1`–`h4` 與顯示字體一律維持正體（`font-style: normal`），以字重、主色或頂線表達強調。
3. **數據等寬對齊**：所有日期、時事篇數、版面計數、章節編號與索引序號（`[01]`、`01 / 02 / 03`）皆使用 `--font-mono` 與 `font-variant-numeric: tabular-nums`。
4. **字體族系與動態縮放**：
   - 標題／內文：`--font-display` / `--font-body`（`"Plus Jakarta Sans Variable"` + 繁體中文系統字型）。
   - 等寬代碼與電訊標籤：`--font-mono`（`"Fira Code Variable"`）。
   - 四段動態字級縮放（`sm: 0.9`、`md: 1.0`、`lg: 1.15`、`xl: 1.3`），持久化於 `localStorage` 的 `"carlnews-font-scale"`。

---

## 4. 核心組件規範 (Core Components)

### 4.1 報頭導覽列 (`Header.astro`)

- 頂部帶 `--rule-masthead`（3px）主色頂線，品牌章 `CN` 採方形報刊章（`--radius-sm`），與膠囊搜尋按鈕（`⌘ K`）、日月模式切換並置。

### 4.2 首頁報刊頭版結構 (`src/pages/index.astro`)

1. **編輯室報頭（`.masthead`）**：雙線框界定刊名、副標、當日台北日期與即時統計；下方接 **7 大固定版面快選列（Desk Strip）**。
2. **頭條判讀雙欄（`.frontpage-grid`）**：
   - 左主欄（`.lead-dossier`）：直接展開最新頭條標題、導言與完整三問（`01 發生什麼事` / `02 為什麼重要` / `03 後續怎麼看`）。
   - 右副欄（`.dispatch-rail`）：近期時事快訊流與「為什麼重要」核心摘要。
3. **精選判讀、版面矩陣與事件脈絡追蹤**：依序提供精選卡片、7 大版面預覽索引與跨期事件脈絡卡片。

### 4.3 內頁編號情報檔案卡與查核檔案夾 (`ArticleLayout.astro`)

- **三問速覽（`.executive-brief`）**：頂部 3px 主色粗線與 `DISPATCH BRIEF // 三問速覽` 標頭，內部三格固定編號：`01 · WHAT HAPPENED（發生什麼事）`、`02 · WHY IT MATTERS（為什麼重要）`、`03 · WHAT TO WATCH（後續怎麼看）`。寬螢幕採三欄並排並以垂直髮絲線區隔，窄螢幕轉緊湊直列。
- **消息來源（`.article-sources`）**：`SOURCE PROVENANCE // 消息來源與查核依據` 樣式，展示 `[01]` 等寬序號、發布機構徽章、日期與外部連結。
