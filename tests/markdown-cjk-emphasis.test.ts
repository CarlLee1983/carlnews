import assert from "node:assert/strict";
import test from "node:test";
import { isUnifiedProcessor } from "@astrojs/markdown-remark";
import config from "../astro.config.mjs";

const siteProcessor = config.markdown?.processor;
assert.ok(siteProcessor && isUnifiedProcessor(siteProcessor));
const renderer = await siteProcessor.createRenderer({});
const render = async (source: string): Promise<string> =>
  (await renderer.render(source)).code;

const compileMdx = async (source: string): Promise<string> => {
  const integration = config.integrations
    ?.flat()
    .find((item) => item && item.name === "@astrojs/mdx");
  assert.ok(integration);
  assert.ok(integration.hooks);
  const srcDir = new URL("../src/", import.meta.url);
  const noop = () => {};
  const logger = { warn: noop, info: noop, error: noop, debug: noop };
  let vitePlugin: any;
  await (integration.hooks["astro:config:setup"] as any)({
    config: { srcDir },
    addRenderer: noop,
    addPageExtension: noop,
    addContentEntryType: noop,
    updateConfig: (update: any) => {
      vitePlugin = update.vite.plugins[0];
    },
  });
  await (integration.hooks["astro:config:done"] as any)({
    config: { markdown: config.markdown, srcDir },
    logger,
  });
  vitePlugin.configResolved({ build: {}, plugins: [] });
  const result = await vitePlugin.transform.handler(source, "/fixture.mdx");
  return result.code;
};
const count = (html: string, pattern: RegExp): number =>
  html.match(pattern)?.length ?? 0;

test("全形句號結尾的粗體後接中文仍成為 strong", async () => {
  const html = await render("前文**單季推論成本下降三成。**後文");
  assert.match(html, /<strong>單季推論成本下降三成。<\/strong>/);
  assert.ok(!html.includes("**"));
});

test("粗體包住全形括號引號並緊鄰中文時各自獨立", async () => {
  const html = await render("中文**「先進封裝」**與**「出口管制」**結尾");
  assert.equal(count(html, /<strong>/g), 2);
  assert.match(
    html,
    /<strong>「先進封裝」<\/strong>與<strong>「出口管制」<\/strong>/,
  );
  assert.ok(!html.includes("**"));
});

test("全形括號結尾的粗體後接中文連接詞不吞掉連接詞", async () => {
  const html = await render(
    "**推理時間運算（Test-time Compute）**或**代理流程**",
  );
  assert.equal(count(html, /<strong>/g), 2);
  assert.match(
    html,
    /<strong>推理時間運算（Test-time Compute）<\/strong>或<strong>代理流程<\/strong>/,
  );
});

test("單波浪號不是刪除線", async () => {
  const html = await render("3~4 季的資本支出週期");
  assert.ok(!html.includes("<del>"));
  assert.ok(html.includes("3~4 季的資本支出週期"));
});

test("雙波浪號仍是刪除線", async () => {
  const html = await render("~~刪除~~");
  assert.match(html, /<del>刪除<\/del>/);
});

test("一般英文粗體照常運作", async () => {
  const html = await render("**bold** text");
  assert.match(html, /<strong>bold<\/strong> text/);
});

test("站台 processor 關閉內建 gfm，改由帶選項的 remarkGfm 負責", () => {
  assert.equal(siteProcessor.options.gfm, false);
});

test("MDX 繼承同一份設定：CJK 粗體成立、單波浪號不是刪除線、雙波浪號仍是", async () => {
  const code = await compileMdx(
    "前文**單季推論成本下降三成。**後文\n\n3~4 季週期\n\n~~刪除~~\n",
  );
  assert.match(code, /"strong"/);
  assert.ok(!code.includes("**"));
  assert.ok(code.includes("3~4 季週期"));
  assert.equal(code.match(/"del"/g)?.length, 1);
});
