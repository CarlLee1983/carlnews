---
title: "1Password 後端遭入侵，密碼庫未受影響但要提防假邀請與假復原信"
description: "1Password 11 月 25 日揭露，攻擊者透過一名員工的公司 GitHub 帳號推送惡意程式碼，取走部分用戶的姓名、Email 與帳號中繼資料；官方表示密碼庫內容與加密金鑰未受影響。"
whatHappened: "1Password 表示 11 月 19 日開始調查一名員工公司 GitHub 帳號遭入侵的跡象，攻擊者藉此存取原始碼、進入 CI/CD 系統，並推送惡意程式碼到後端服務，下載部分用戶的帳號紀錄。"
whyItMatters: "外洩的是姓名、登入 Email 與邀請、復原信中的權杖，正好是寄出仿冒「1Password 邀請」或「帳號復原」釣魚信所需的材料；密碼管理器本身的零知識架構則讓密碼庫內容不在攻擊者可取得的範圍內。"
whatNext: "官方表示將在未來幾週完整調查後公布根因分析。可追蹤受影響人數、GitHub 帳號最初如何遭入侵，以及是否出現冒用 1Password 名義的釣魚信。"
category: "產品與生態"
publishDate: 2026-11-28T09:01:12+08:00
draft: false
featured: false
tags:
  - 1Password
  - 密碼管理器
  - GitHub
  - 供應鏈攻擊
  - 資安
sources:
  - title: "Update on a security incident involving 1Password's backend systems."
    url: "https://1password.com/blog/update-on-nov-2026-security-incident"
    publisher: "1Password"
    publishedAt: "2026-11-25"
  - title: "1Password customer data stolen after employee GitHub account breach"
    url: "https://www.bleepingcomputer.com/news/security/1password-customer-data-stolen-after-employee-github-account-breach/"
    publisher: "BleepingComputer"
    publishedAt: "2026-11-25"
  - title: "1Password said hackers broke into its internal systems, but customer passwords are safe"
    url: "https://techcrunch.com/2026/11/25/1password-said-hackers-broke-into-its-internal-systems-but-customer-passwords-are-safe/"
    publisher: "TechCrunch"
    publishedAt: "2026-11-25"
---

**結論先說：1Password 後端系統遭入侵，部分用戶的姓名、登入 Email 與帳號中繼資料被取走，但官方表示密碼庫內容與保護密碼庫的金鑰都沒有外洩。** 一般用戶不需要改動帳號設定，真正要防的是接下來可能出現、冒用 1Password 名義的邀請信或帳號復原信。

## 入侵點是員工的 GitHub 帳號，攻擊者一路進到 CI/CD 與後端

這起事件的起點不是 1Password 的產品漏洞，而是開發流程。依 1Password 11 月 25 日的官方說明，公司在 11 月 19 日開始調查一名員工公司 GitHub 帳號遭入侵的跡象；攻擊者用這個帳號存取原始碼，並把惡意程式碼推送到後端服務，再由這段程式下載部分用戶的管理資料。

攻擊者也複製了私有儲存庫的原始碼，並進入 CI/CD 系統。官方說明 CI/CD 內含讓產品運作所需的基礎設施憑證，已全面輪替可能外洩的憑證，服務與產品安全未受影響。這類「取得開發者帳號後改動建置或部署流程」的手法，在作者看來屬於軟體供應鏈攻擊的範疇；這是作者的分類，1Password 公告本身未使用這個詞。

- **調查起始**：2026 年 11 月 19 日。
- **公開揭露**：2026 年 11 月 25 日。
- **官方處置**：停用受影響的 GitHub 帳號、撤銷被竊權杖、還原乾淨版本的後端服務、輪替內部憑證，並委請外部資安專家驗證。

## 外洩資料不能直接登入，但足以拿來做精準釣魚

被取走的資料單獨無法打開密碼庫，風險主要落在社交工程。官方列出外洩項目包括姓名與 Email、帳號與用戶識別碼、建立與最近登入時間、公鑰、SRP 協議參數，以及部分邀請、開通與帳號復原信中的權杖。

官方強調，公鑰本來就是公開的，SRP 參數無法用來登入；1Password 也不保存用戶的帳號密碼與 Secret Key，因此密碼庫、帳號復原金鑰、App 與瀏覽器擴充功能都未受影響。邀請或復原權杖必須搭配 SSO 登入，或寄到註冊信箱的驗證碼才能使用；官方已預防性地把這組驗證碼從 6 位數字延長為 10 位英數字元，並表示少數處於邀請或復原流程中的用戶已個別收到通知。

受影響人數目前沒有公開。TechCrunch 與 BleepingComputer 的報導也指出，官方未說明員工 GitHub 帳號最初是如何被入侵的。

## 用戶該做的是防釣魚，而不是急著改密碼

對一般用戶最實際的動作，是對任何「意外收到」的 1Password 邀請、帳號復原或客服聯繫保持懷疑。官方提醒，1Password 不會主動聯繫用戶索取帳號密碼或 Secret Key；這兩項只應在自行打開的官方 App，或自行輸入網址的官方網站中輸入。

- **不需要做**：官方表示不需要更改 1Password 帳號的任何設定。
- **應該做**：沒有主動申請卻收到邀請或復原信時，不要點信中連結，改從 App 或官網自行登入確認。
- **可回報**：可疑訊息可寄到 support@1password.com。

1Password 表示將在完整調查後的未來幾週公布根因分析。屆時值得關注三件事：受影響人數、GitHub 帳號遭入侵的方式，以及公司在 GitHub 與 CI/CD 權限控管上做了哪些具體調整。
