import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { NEWS_CATEGORIES } from "./config/site";
import { normalizeTaxonomy } from "./utils/content";

const taxonomyName = z
  .string()
  .trim()
  .min(1)
  .refine((value) => normalizeTaxonomy(value).length > 0, {
    message: "標籤或事件脈絡名稱必須包含至少一個字母或數字。",
  });

const sourceSchema = z.object({
  title: z.string().trim().min(1),
  url: z.url(),
  publisher: z.string().trim().min(1).optional(),
  publishedAt: z.coerce.date().optional(),
});

const news = defineCollection({
  loader: glob({ base: "./src/content/news", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
        whatHappened: z.string().trim().min(1),
        whyItMatters: z.string().trim().min(1),
        whatNext: z.string().trim().min(1),
        category: z.enum(NEWS_CATEGORIES),
        publishDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        updateNote: z.string().trim().min(1).optional(),
        draft: z.boolean(),
        featured: z.boolean().default(false),
        featuredUntil: z.coerce.date().optional(),
        tags: z.array(taxonomyName).default([]),
        series: taxonomyName.optional(),
        seriesOrder: z.number().int().positive().optional(),
        sources: z.array(sourceSchema).min(1),
        cover: image().optional(),
        coverAlt: z.string().trim().min(1).optional(),
        canonicalUrl: z.url().optional(),
      })
      .superRefine((data, context) => {
        if (data.cover && !data.coverAlt) {
          context.addIssue({
            code: "custom",
            path: ["coverAlt"],
            message: "設定 cover 時必須提供 coverAlt。",
          });
        }
        if (data.featured && !data.featuredUntil) {
          context.addIssue({
            code: "custom",
            path: ["featuredUntil"],
            message:
              "featured: true 必須設定 featuredUntil，精選到期後自動退場。",
          });
        }
        if (data.seriesOrder && !data.series) {
          context.addIssue({
            code: "custom",
            path: ["seriesOrder"],
            message: "設定 seriesOrder 時必須提供 series。",
          });
        }
        if (data.updateNote && !data.updatedDate) {
          context.addIssue({
            code: "custom",
            path: ["updateNote"],
            message: "設定 updateNote 時必須提供 updatedDate。",
          });
        }
      }),
});

export const collections = { news };
