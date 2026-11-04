// Copies the tool list of the SnapWidget MCP server into src/tools.json, for --help and the
// option types. Run after a server change: SNAPWIDGET_TOKEN=<token> npm run tools
// (SNAPWIDGET_URL for another server). Any account's token works: the list is the same.
import { writeFileSync } from 'node:fs';

const url = (process.env.SNAPWIDGET_URL || 'https://snapwidget.com').replace(/\/+$/, '') + '/mcp';
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
    Authorization: `Bearer ${process.env.SNAPWIDGET_TOKEN}`,
  },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
});
if (!response.ok) {
  throw new Error(`${url}: HTTP ${response.status}`);
}
const tools = (await response.json()).result.tools.map(({ name, title, description, inputSchema, annotations }) => ({ name, title, description, inputSchema, annotations }));
writeFileSync(new URL('../src/tools.json', import.meta.url), JSON.stringify(tools, null, 1) + '\n');
console.log(`${tools.length} tools`);
