---
title: "亞馬遜擬收購 Decart 的 AI 推論最佳化技術"
description: "亞馬遜已簽約收購 Decart 的最佳化技術並延攬研發團隊。兩家公司自 2025 年起已在 Trainium 合作，交易仍待監管許可等交割條件。"
whatHappened: "亞馬遜 11 月 23 日宣布簽約買下 Decart Optimization Stack 背後的專有技術，並計畫延攬三位共同創辦人與研發團隊。"
whyItMatters: "這筆交易讓 AWS 有機會把晶片與推論軟體一起調整。對客戶來說，能不能用較低的成本達到同樣的回應速度，比單看晶片峰值算力更有用。"
whatNext: "先看交易能否交割，再看 AWS 是否公開支援的模型、部署方式，以及同一工作負載下的延遲與成本。"
category: "半導體與硬體"
publishDate: 2026-11-25T10:41:16+08:00
draft: false
featured: false
tags:
  - Amazon
  - AWS
  - Decart
  - Trainium
  - AI 推論
series: "AI 算力結構轉折"
seriesOrder: 4
sources:
  - title: "亞馬遜宣布簽約收購 Decart 的最佳化技術"
    url: "https://www.aboutamazon.com/news/company-news/amazon-decart-ai-optimization"
    publisher: "Amazon"
    publishedAt: "2026-11-23"
  - title: "AWS Neuron 開發工具與推論支援"
    url: "https://aws.amazon.com/ai/machine-learning/neuron/"
    publisher: "Amazon Web Services"
  - title: "路透社報導亞馬遜與 Decart 的技術及人才交易"
    url: "https://www.reuters.com/business/retail-consumer/amazon-buy-decarts-ai-chip-optimization-tech-latest-ai-talent-grab-2026-11-23/"
    publisher: "Reuters"
    publishedAt: "2026-11-23"
---

**結論先說：亞馬遜宣布簽約收購 Decart 的 AI 最佳化技術，希望讓自家 Trainium 晶片更有效率地執行推論。** 交易也包括延攬 Decart 的共同創辦人與研發團隊，但仍待監管許可等交割條件。現階段可以確認的是簽約範圍，還不能算出 AWS 客戶會省下多少錢。

## 亞馬遜買的是技術，並計畫延攬研發團隊

亞馬遜 11 月 23 日的公告列出兩項安排：買下 Decart Optimization Stack（DOS）背後的專有技術，以及延攬三位共同創辦人和 AI 研發團隊。路透社同日也依這個範圍報導。亞馬遜沒有公布交易金額，也沒有宣布買下 Decart 整家公司。兩方自 2025 年便已在 Trainium 合作，這次才宣布簽下技術收購協議。

## Trainium 能省多少成本，要看模型實際怎麼跑

AWS 已經有支援 Trainium 的 Neuron 工具組，涵蓋編譯器、執行環境和推論工具，也提供 vLLM 整合。這筆交易的產業意義在於，AWS 有機會縮短晶片和推論軟體之間的調整週期。但既有工具支援某個框架，不代表換到 Trainium 後每個模型都會變快；收購公告也沒有列出哪些新能力會開放給客戶、何時開放。

要比較文字模型的部署成本，可用同一模型、相同的輸入與輸出長度分布及請求量，先訂出首字等待時間和整段回覆時間的上限，再比較每百萬輸出 token 的成本。延遲應一起列出第 95 百分位，避免平均值掩蓋尖峰時的慢請求。這是評估方法，不是已完成的效能測試。相關背景見[推論工作負載和算力採購的變化](/news/ai-inference-compute-shift-2026/)。

## 交割和客戶用得到，是兩個不同的時間點

下一步先看亞馬遜是否宣布完成交割。若技術後續整合進 AWS 服務，再看哪些模型與執行個體獲得支援，以及官方是否公布可重現的基準和配置。到了那一步，才能判斷這筆交易是改善特定模型的部署，還是讓更多客戶換平台也划算。
