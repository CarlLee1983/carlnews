---
title: "群暉修補 DSM 重大漏洞，NAS 用戶須核對完整更新版本"
description: "群暉 11 月 10 日發布 DSM 安全更新，修補可遠端讀寫檔案等漏洞。不同 DSM 分支的修補門檻不同，僅確認主版本號不足以判斷是否完成更新。"
whatHappened: "群暉發布 SA-26:19 與 SA-26:18 公告，前者列為 Critical，涵蓋 DSM 7.2.1、7.2.2、7.3 與 7.4 的修補版本。"
whyItMatters: "NAS 集中保存檔案與備份，檔案讀寫漏洞會影響資料機密性與完整性；修補是否完成必須比對建置號及更新尾碼。"
whatNext: "依使用中的 DSM 分支核對官方修補門檻，確認更新後版本，並持續留意群暉公告是否補充利用情況。"
category: "產品與生態"
publishDate: 2026-11-17T15:21:00+08:00
draft: false
featured: false
tags:
  - Synology
  - NAS
  - 資安
sources:
  - title: "Synology-SA-26:19 DSM"
    url: "https://www.synology.com/en-global/security/advisory/Synology_SA_26_19"
    publisher: "Synology"
    publishedAt: 2026-11-10T17:06:42+08:00
  - title: "Synology-SA-26:18 DSM"
    url: "https://www.synology.com/en-global/security/advisory/Synology_SA_26_18"
    publisher: "Synology"
    publishedAt: 2026-11-10T17:06:33+08:00
---

**結論先說：群暉已提供 DSM 重大漏洞修補，NAS 用戶應核對完整建置號與更新尾碼。**本文於 11 月 17 日整理 11 月 10 日官方公告；公告的「已解決」狀態表示修補已提供，設備端仍須確認安裝結果。

## 遠端檔案讀寫漏洞使 DSM 更新具有優先性

SA-26:19 涉及 NAS 資料本身的安全。官方列出的 CVE-2026-76954 為 Auth API SQL 注入漏洞，CVSS 3.1 分數為 9.8，可讓遠端攻擊者讀寫任意檔案並造成阻斷服務；另一個 CVE-2026-85101 涉及 rsync 驗證繞過。

本篇判讀是，儲存設備的修補應納入資料保護作業。這份公告未說明已觀察到實際利用，因此不能據此宣稱這兩個漏洞已被用於攻擊。

## 不同 DSM 分支需要比對各自的完整修補版本

保留原 DSM 分支的設備，也有各自的更新門檻。依 SA-26:19，以下為修補版本或以上版本：

- **DSM 7.4**：7.4.1-90080-1。
- **DSM 7.3**：7.3.2-86009-5。
- **DSM 7.2.2**：7.2.2-72806-10。
- **DSM 7.2.1**：7.2.1-69057-13。

同日的 SA-26:18 另列多項不同權限條件的漏洞，影響分支為 DSM 7.3 與 7.4，修補門檻與上述兩個分支相同。兩份公告都未列替代緩解措施；後續驗收應以實際版本與官方適用範圍為準。
