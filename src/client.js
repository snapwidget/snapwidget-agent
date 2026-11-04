import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version;

// An error that the CLI prints as {"error": message} and exits with 1.
export class CliError extends Error {}

export function baseUrl() {
  return (process.env.SNAPWIDGET_URL || 'https://snapwidget.com').replace(/\/+$/, '');
}

export function configPath() {
  return join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'snapwidget', 'config.json');
}

function readConfig() {
  try {
    return JSON.parse(readFileSync(configPath(), 'utf8'));
  } catch {
    return {};
  }
}

// The token goes to the server it came from, never to another one (SNAPWIDGET_URL).
export function saveToken(token) {
  const path = configPath();
  mkdirSync(join(path, '..'), { recursive: true, mode: 0o700 });
  writeFileSync(path, JSON.stringify({ url: baseUrl(), token }, null, 2) + '\n', { mode: 0o600 });
  return path;
}

export function forgetToken() {
  rmSync(configPath(), { force: true });
}

function token() {
  if (process.env.SNAPWIDGET_TOKEN) {
    return process.env.SNAPWIDGET_TOKEN;
  }
  const config = readConfig();
  return config.url === baseUrl() ? config.token : undefined;
}

export const SIGN_IN_HELP = 'Sign in first: "snapwidget login" for an existing account, or "snapwidget signup --email <address>" for a new one. Or set SNAPWIDGET_TOKEN.';

async function request(path, { method = 'POST', headers = {}, body } = {}) {
  let response;
  try {
    response = await fetch(baseUrl() + path, {
      method,
      headers: { 'User-Agent': `snapwidget-cli/${VERSION}`, Accept: 'application/json', ...headers },
      body,
    });
  } catch (error) {
    throw new CliError(`Cannot reach ${baseUrl()}: ${error.cause?.message || error.message}`);
  }
  const text = await response.text();
  let data;
  try {
    // A streamed MCP answer: the JSON is on the last "data:" line.
    data = JSON.parse(text.startsWith('event:') || text.startsWith('data:')
      ? text.split('\n').filter((line) => line.startsWith('data:')).pop().slice(5)
      : text);
  } catch {
    data = { message: text.slice(0, 500) };
  }
  return { status: response.status, data };
}

// POST JSON to the REST API (the sign-up needs no token).
export async function post(path, body) {
  const { status, data } = await request(path, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (status >= 400) {
    throw new CliError(errorText(data, status));
  }
  return data;
}

// POST a form, as the OAuth token endpoint wants it.
export async function postForm(path, fields) {
  const { status, data } = await request(path, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });
  if (status >= 400) {
    throw new CliError(errorText(data, status));
  }
  return data;
}

function errorText(data, status) {
  if (data.errors) {
    return Object.values(data.errors).flat().join(' ');
  }
  return data.error_description || data.message || data.error || `HTTP ${status}`;
}

// Calls one tool of the MCP server at /mcp. The answer is the tool's JSON, or its text.
export async function callTool(name, args) {
  const bearer = token();
  if (!bearer) {
    throw new CliError(SIGN_IN_HELP);
  }
  const { status, data } = await request('/mcp', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${bearer}`,
      'MCP-Protocol-Version': '2025-06-18',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
  });
  if (status === 401) {
    throw new CliError(`The token was refused (signed out, or it expired). ${SIGN_IN_HELP}`);
  }
  if (status >= 400) {
    throw new CliError(errorText(data, status) + (data.upgrade_url ? ` Upgrade: ${data.upgrade_url}` : ''));
  }
  if (data.error) {
    throw new CliError(data.error.message);
  }
  const result = data.result;
  const text = (result.content || []).filter((part) => part.type === 'text').map((part) => part.text).join('\n');
  if (result.isError) {
    throw new CliError(text);
  }
  if (result.structuredContent !== undefined) {
    return result.structuredContent;
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
