import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { app } from 'electron';
import type { AppSettings, DEFAULT_SETTINGS, ProviderConfig } from '../shared/ipc';
import { DEFAULT_SETTINGS as DEFAULTS } from '../shared/ipc';

let db: Database.Database | null = null;

export function initDb(): Database.Database {
  if (db) return db;
  const dir = path.join(app.getPath('userData'), 'kedex');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'kedex.db');
  db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      base_url TEXT,
      default_model TEXT NOT NULL,
      streaming TEXT NOT NULL DEFAULT 'sse',
      requires_api_key INTEGER NOT NULL DEFAULT 1,
      api_key TEXT
    );
    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      preview TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      mode TEXT NOT NULL DEFAULT 'plan',
      pinned INTEGER NOT NULL DEFAULT 0,
      project_id TEXT,
      branch TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      tool_name TEXT,
      tool_args TEXT,
      tool_result TEXT,
      FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      data TEXT NOT NULL,
      thread_id TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS mcp_servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'local',
      command TEXT,
      args TEXT NOT NULL DEFAULT '[]',
      env TEXT NOT NULL DEFAULT '{}',
      url TEXT,
      requires_auth INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'disconnected',
      tools TEXT NOT NULL DEFAULT '[]',
      last_error TEXT,
      token_expires_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      source TEXT NOT NULL DEFAULT 'openai',
      installed INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
}

export function getSettings(): AppSettings {
  const d = initDb();
  const row = d.prepare(`SELECT value FROM settings WHERE key = ?`).get('app') as { value: string } | undefined;
  if (!row) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(row.value) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function setSettings(patch: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const next = { ...current, ...patch };
  initDb()
    .prepare(
      `INSERT INTO settings (key, value) VALUES ('app', ?)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    )
    .run(JSON.stringify(next));
  return next;
}

export function getProviders(): ProviderConfig[] {
  const d = initDb();
  const rows = d
    .prepare(
      `SELECT id, label, base_url, default_model, streaming, requires_api_key, api_key FROM providers`,
    )
    .all() as Array<{
    id: string;
    label: string;
    base_url: string | null;
    default_model: string;
    streaming: string;
    requires_api_key: number;
    api_key: string | null;
  }>;
  return rows.map((r) => ({
    id: r.id as ProviderConfig['id'],
    label: r.label,
    baseUrl: r.base_url ?? undefined,
    defaultModel: r.default_model,
    streaming: r.streaming as ProviderConfig['streaming'],
    requiresApiKey: !!r.requires_api_key,
    apiKey: r.api_key ?? undefined,
  }));
}

export function saveProvider(p: ProviderConfig): void {
  initDb()
    .prepare(
      `INSERT INTO providers (id, label, base_url, default_model, streaming, requires_api_key, api_key)
       VALUES (@id, @label, @baseUrl, @defaultModel, @streaming, @requiresApiKey, @apiKey)
       ON CONFLICT(id) DO UPDATE SET
         label=excluded.label,
         base_url=excluded.base_url,
         default_model=excluded.default_model,
         streaming=excluded.streaming,
         requires_api_key=excluded.requires_api_key,
         api_key=excluded.api_key`,
    )
    .run({
      id: p.id,
      label: p.label,
      baseUrl: p.baseUrl ?? null,
      defaultModel: p.defaultModel,
      streaming: p.streaming,
      requiresApiKey: p.requiresApiKey ? 1 : 0,
      apiKey: p.apiKey ?? null,
    });
}

export function removeProvider(id: string): void {
  initDb().prepare(`DELETE FROM providers WHERE id = ?`).run(id);
}

export function getMcpServers(): {
  id: string;
  name: string;
  kind: 'local' | 'cloud';
  command: string | null;
  args: string[];
  env: Record<string, string>;
  url: string | null;
  requiresAuth: boolean;
  enabled: boolean;
  status: string;
  tools: string[];
  lastError: string | null;
  tokenExpiresAt: number | null;
}[] {
  const d = initDb();
  const rows = d
    .prepare(
      `SELECT id, name, kind, command, args, env, url, requires_auth, enabled, status, tools, last_error, token_expires_at
       FROM mcp_servers ORDER BY rowid DESC`,
    )
    .all() as Array<{
    id: string;
    name: string;
    kind: string;
    command: string | null;
    args: string;
    env: string;
    url: string | null;
    requires_auth: number;
    enabled: number;
    status: string;
    tools: string;
    last_error: string | null;
    token_expires_at: number | null;
  }>;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    kind: (r.kind === 'cloud' ? 'cloud' : 'local') as 'local' | 'cloud',
    command: r.command,
    args: JSON.parse(r.args || '[]'),
    env: JSON.parse(r.env || '{}'),
    url: r.url,
    requiresAuth: !!r.requires_auth,
    enabled: !!r.enabled,
    status: r.status,
    tools: JSON.parse(r.tools || '[]'),
    lastError: r.last_error,
    tokenExpiresAt: r.token_expires_at,
  }));
}

export function saveMcpServer(s: {
  id: string;
  name: string;
  kind: 'local' | 'cloud';
  command?: string;
  args: string[];
  env: Record<string, string>;
  url?: string;
  requiresAuth?: boolean;
  enabled: boolean;
  status: string;
  tools: string[];
  lastError: string | null;
  tokenExpiresAt?: number | null;
}): void {
  initDb()
    .prepare(
      `INSERT INTO mcp_servers (id, name, kind, command, args, env, url, requires_auth, enabled, status, tools, last_error, token_expires_at)
       VALUES (@id, @name, @kind, @command, @args, @env, @url, @requiresAuth, @enabled, @status, @tools, @lastError, @tokenExpiresAt)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name,
         kind=excluded.kind,
         command=excluded.command,
         args=excluded.args,
         env=excluded.env,
         url=excluded.url,
         requires_auth=excluded.requires_auth,
         enabled=excluded.enabled,
         status=excluded.status,
         tools=excluded.tools,
         last_error=excluded.last_error,
         token_expires_at=excluded.token_expires_at`,
    )
    .run({
      id: s.id,
      name: s.name,
      kind: s.kind,
      command: s.command ?? null,
      args: JSON.stringify(s.args),
      env: JSON.stringify(s.env),
      url: s.url ?? null,
      requiresAuth: s.requiresAuth ? 1 : 0,
      enabled: s.enabled ? 1 : 0,
      status: s.status,
      tools: JSON.stringify(s.tools),
      lastError: s.lastError,
      tokenExpiresAt: s.tokenExpiresAt ?? null,
    });
}

export function deleteMcpServer(id: string): void {
  initDb().prepare(`DELETE FROM mcp_servers WHERE id = ?`).run(id);
}

export function savePlan(plan: { id: string; title: string; data: unknown; threadId?: string; createdAt: string }): void {
  initDb()
    .prepare(
      `INSERT INTO plans (id, title, data, thread_id, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title=excluded.title, data=excluded.data, thread_id=excluded.thread_id`,
    )
    .run(plan.id, plan.title, JSON.stringify(plan.data), plan.threadId ?? null, plan.createdAt);
}

export function getPlans(): { id: string; title: string; data: unknown; createdAt: string }[] {
  const rows = initDb()
    .prepare(`SELECT id, title, data, created_at FROM plans ORDER BY created_at DESC`)
    .all() as Array<{ id: string; title: string; data: string; created_at: string }>;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    data: JSON.parse(r.data),
    createdAt: r.created_at,
  }));
}

export function getPlan(id: string): { id: string; title: string; data: unknown; createdAt: string } | null {
  const row = initDb()
    .prepare(`SELECT id, title, data, created_at FROM plans WHERE id = ?`)
    .get(id) as { id: string; title: string; data: string; created_at: string } | undefined;
  if (!row) return null;
  return { id: row.id, title: row.title, data: JSON.parse(row.data), createdAt: row.created_at };
}
