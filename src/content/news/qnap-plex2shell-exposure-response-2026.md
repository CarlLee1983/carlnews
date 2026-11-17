---
title: "QNAP 接獲 Plex2Shell 入侵通報，曾對外開放的舊版 Plex 須進一步檢查"
description: "QNAP 提醒 Plex Media Server 用戶更新至 1.43.3.10861 或以上版本；曾讓受影響版本可從網際網路存取的 NAS，還須檢查入侵、乾淨重裝與重設憑證。"
whatHappened: "QNAP 在 11 月 6 日表示接獲部分用戶疑遭 Plex2Shell 入侵的通報，並提供 Plex Media Server 修補與後續處理說明。"
whyItMatters: "漏洞位於 Plex 應用程式，QTS 與 QuTS hero 本身不受這組漏洞影響；但已入侵的程式或憑證風險，可能在更新後繼續存在。"
whatNext: "先確認 Plex 版本及過往對外開放情況，依 QNAP FAQ 執行適用的檢查與復原程序；需要原廠協助判定是否遭入侵的用戶，移除程式前先保存日誌。"
category: "產品與生態"
publishDate: 2026-11-17T15:21:30+08:00
draft: false
featured: false
tags:
  - QNAP
  - Plex
  - NAS
  - 資安
sources:
  - title: "QNAP Security Notice: Plex Media Server Vulnerabilities (Plex2Shell)"
    url: "https://www.qnap.com/en/security-news/2026/qnap-security-notice-plex-media-server-vulnerabilities-plex2shell-update-to-1-43-3-10861-or-later-immediately-no-data-loss-reported"
    publisher: "QNAP"
    publishedAt: 2026-11-06
  - title: "Plex2Shell: Check and Remediation FAQ for QNAP NAS Users"
    url: "https://www.qnap.com/en/how-to/faq/article/plex2shell-check-and-remediation-faq-for-qnap-nas-users"
    publisher: "QNAP"
    publishedAt: 2026-11-06
---

**結論先說：QNAP 上的舊版 Plex 若曾對外開放，更新後仍須依官方程序檢查入侵與處理憑證。**QNAP 已接獲部分用戶的疑似入侵通報，並於 11 月 6 日發布說明；本文於 11 月 17 日整理，未取得受影響設備總數。

## 這組漏洞位於 Plex，影響範圍須按安裝情況判定

Plex2Shell 影響 Plex Media Server 1.43.2 及更早版本，四個漏洞串聯可讓未經驗證的遠端攻擊者以 Plex 程序權限執行程式碼。QNAP 表示，QTS、QuTS hero 等作業系統本身不受這組漏洞影響，修補版本為 1.43.3.10861 或以上。

QNAP 公告轉述 Plex 已確認存在活躍利用，並稱其支援中的通報個案未發生資料損失。這項說明不能推廣為所有部署都安全，也不能用來判定個別設備是否遭入侵。

## 曾對外開放的受影響版本需要完成更新以外的處理

修補可以關閉漏洞入口，卻無法保證移除先前植入的程式。QNAP FAQ 要求曾讓受影響 Plex 版本從網際網路存取的用戶，進行乾淨重裝、入侵跡象檢查與 Plex、NAS 憑證重設；要請原廠協助判定者，先保存 Plex 日誌。

本篇判讀是，處理完成的標準應同時包含版本、過往暴露情況與復原結果。未使用的遠端存取應關閉；仍需遠端連線的用戶，可依官方建議透過 VPN 降低直接暴露。詳細步驟與條件請依下方 FAQ 執行。
