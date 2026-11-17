# CarlNews

李卡爾的科技、產業與國際時事判讀。CarlNews 是內容優先的繁體中文時事評論網站：聚焦科技業、AI 公司、半導體、產品、政策與國際生活時事，拆解每起事件的**「發生什麼事、為什麼重要、後續怎麼看」**。

架構參考 [CarlStack](../CarlStack/README.md)，以 Git repository 儲存 Markdown／MDX，輸出純靜態 HTML 並部署到 Cloudflare Workers Static Assets。

## 技術架構

- Astro 7、TypeScript strict mode、Astro Content Collections
- 強制「三問速覽（`whatHappened` / `whyItMatters` / `whatNext`）」、7 大固定版面（`category`）與結構化消息來源（`sources`）
- Markdown、MDX、Shiki、CJK 友善粗體處理（`remark-cjk-friendly` + `remark-gfm`）、Callout 與響應式表格捲動
- Pagefind build-time 靜態全文索引
- 靜態 HTML + Cloudflare Workers Static Assets
- RSS、Sitemap、robots.txt、Open Graph、Twitter Card 與 `NewsArticle` JSON-LD

## 文件

| 文件                                             | 內容                     |
| ------------------------------------------------ | ------------------------ |
| [`CONTEXT.md`](CONTEXT.md)                       | 領域詞彙定義             |
| [`docs/architecture.md`](docs/architecture.md)   | 建置管線與邊界清單       |
| [`docs/content-guide.md`](docs/content-guide.md) | 時事評論寫作與發布規範   |
| [`docs/testing.md`](docs/testing.md)             | 三道 gate 與測試對應規則 |
| [`docs/adr/`](docs/adr/)                         | 架構決策記錄             |

## 指令

| 指令           | 用途                                                       |
| -------------- | ---------------------------------------------------------- |
| `pnpm dev`     | 啟動 Astro 開發伺服器（`http://localhost:4321`）           |
| `pnpm build`   | 產生靜態網站與 Pagefind 索引                               |
| `pnpm preview` | 重新 build，使用 Astro 本地預覽 production 靜態輸出        |
| `pnpm check`   | Prettier、Astro／TypeScript、內容 schema、production build |
| `pnpm test`    | 執行資料模型、排序、taxonomy、SEO 與外掛測試               |
| `pnpm format`  | 套用 Prettier                                              |

## 本地啟動

```bash
cp .env.example .env
pnpm install
pnpm dev
```
