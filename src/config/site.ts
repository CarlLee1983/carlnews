export const NEWS_CATEGORIES = [
  "科技與商業",
  "AI 與模型",
  "半導體與硬體",
  "產品與生態",
  "政策與監管",
  "國際時事",
  "生活與社會",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const siteConfig = {
  name: "CarlNews",
  subtitle: "李卡爾的科技、產業與國際時事判讀",
  description:
    "聚焦科技業、AI 公司、半導體、產品、政策與國際生活時事，拆解發生什麼事、為什麼重要、後續怎麼看。",
  author: "李卡爾",
  language: "zh-Hant",
  locale: "zh_TW",
  github: "https://github.com/CarlLee1983",
  githubUser: "CarlLee1983",
  defaultSocialImage: "/social-card.png",
} as const;

export const navigation = [
  { href: "/news/", label: "時事" },
  { href: "/category/", label: "版面" },
  { href: "/series/", label: "事件脈絡" },
  { href: "/tags/", label: "標籤" },
  { href: "/about/", label: "關於" },
] as const;
