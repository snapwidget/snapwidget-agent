// Makes skills/snapwidget/references/<builder>.md from the install guides of the SnapWidget docs
// (https://snapwidget.com/docs/install/*). Run: npm run references
import { writeFileSync } from 'node:fs';

const DOCS = 'https://snapwidget.com/docs';
const OUT = new URL('../skills/snapwidget/references/', import.meta.url);

const index = await (await fetch(`${DOCS}/llms.txt`)).text();
const pages = [...new Set(index.match(/https:\/\/snapwidget\.com\/docs\/install\/[a-z0-9-]+\.md/g))].sort();

for (const url of pages) {
  const text = await (await fetch(url)).text();
  // The docs put a "Documentation Index" note above each page.
  const body = text.replace(/^(>.*\n)+\n/, '').trim();
  const slug = url.match(/install\/([a-z0-9-]+)\.md/)[1];
  writeFileSync(new URL(`${slug}.md`, OUT), `<!-- From ${url.replace(/\.md$/, '')}. To change it, change the docs and run npm run references. -->

Get the code with \`snapwidget embed <widget_id> --format html\` (the MCP tool get_embed_code). It is the same code as **Copy Code** in the steps below, so skip the steps in SnapWidget.

${body}
`);
  console.log(slug);
}
console.log(`${pages.length} guides`);
