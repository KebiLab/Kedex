import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { app } from 'electron';
import type { ProviderConfig } from '../shared/ipc';

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
      pinned INTEGER NOT NULL DEFAULT 0
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
      created_at TEXT NOT NULL
    );
  `);
  return db;
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
  const d = initDb();
  d.prepare(
    `INSERT INTO providers (id, label, base_url, default_model, streaming, requires_api_key, api_key)
     VALUES (@id, @label, @baseUrl, @defaultModel, @streaming, @requiresApiKey, @apiKey)
     ON CONFLICT(id) DO UPDATE SET
       label=excluded.label,
       base_url=excluded.base_url,
       default_model=excluded.default_model,
       streaming=excluded.streaming,
       requires_api_key=excluded.requires_api_key,
       api_key=excluded.api_key`,
  ).run({
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

export function getSetting<T = unknown>(key: string, fallback: T): T {
  const row = initDb()
    .prepare(`SELECT value FROM settings WHERE key = ?`)
    .get(key) as { value: string } | undefined;
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export function setSetting(key: string, value: unknown): void {
  initDb()
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    )
    .run(key, JSON.stringify(value));
}
