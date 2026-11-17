# CarlNews

CarlNews 是以繁體中文發布科技產業、半導體、AI、產品、政策與國際生活時事判讀的靜態內容網站。本文件定義站內領域語言。

## Language

**時事評論（Brief）**：
在 `/news/<slug>/` 發布、針對單一科技或國際生活時事事件進行剖析的正式內容單位。
_Avoid_: 新聞稿、外電翻譯、文章

**三問速覽（Executive Brief）**：
每篇時事評論必備的頂層結構化判斷，固定回答三個問題：`whatHappened`（發生什麼事）、`whyItMatters`（為什麼重要）、`whatNext`（後續怎麼看）。
_Avoid_: 導讀、懶人包、TL;DR

**版面（Category / Desk）**：
網站頂層的 7 個固定主題分區（`科技與商業`、`AI 與模型`、`半導體與硬體`、`產品與生態`、`政策與監管`、`國際時事`、`生活與社會`），每篇時事評論必屬於唯一一個版面，對應 `/category/<slug>/`。
_Avoid_: 頻道、分類目錄

**標籤（Tag）**：
標記具體公司、人物、技術或跨版面議題的自由詞彙（如 `TSMC`、`NVIDIA`、`OpenAI`、`關稅`），對應 `/tags/<tag>/`。

**事件脈絡（Series / Storyline）**：
串聯同一重大事件跨日、跨階段發展的連續追蹤集合，依 `seriesOrder` 排序，對應 `/series/<series>/`。
_Avoid_: 專欄、連載

**消息來源（Source）**：
支撐事實陳述的一手外電、財報、監管文件或官方公告紀錄（含標題、URL、發布機構與日期）。

**後續補充（Update Note）**：
同一事件小幅進展時，於原篇更新 `updatedDate` 並以 `updateNote` 標註本次補充重點。
