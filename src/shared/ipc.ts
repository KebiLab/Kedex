export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek'
  | 'mistral'
  | 'ollama'
  | 'custom';

export type Locale = 'en' | 'ru' | 'es' | 'de' | 'fr' | 'ja' | 'zh';

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  baseUrl?: string;
  defaultModel: string;
  apiKey?: string;
  requiresApiKey: boolean;
  streaming: 'sse' | 'json' | 'ollama';
}

export interface ModelSettings {
  temperature: number;
  contextWindow: number;
  maxOutputTokens: number;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  createdAt: number;
  toolName?: string;
  toolArgs?: unknown;
  toolResult?: unknown;
  attachments?: { name: string; mime: string; size: number; preview: string }[];
}

export type AgentMode = 'plan' | 'goal' | 'ask' | 'build';

export interface PlanStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  priority: number;
  dependsOn: string[];
}

export interface Plan {
  id: string;
  title: string;
  steps: PlanStep[];
  createdAt: string;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  kind: 'context' | 'add' | 'del';
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface FileDiff {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
  hunks: DiffHunk[];
}

export interface McpServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  tools: string[];
  lastError?: string;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  files: { path: string; status: 'M' | 'A' | 'D' | '?' | 'R'; additions?: number; deletions?: number }[];
  isRepo: boolean;
  error?: string;
}

export interface WorktreeInfo {
  path: string;
  branch: string;
  commit: string;
  isMain: boolean;
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  locale: 'en' | 'ru' | 'es' | 'de' | 'fr' | 'ja' | 'zh';
  density: 'compact' | 'default' | 'comfortable';
  accent: string;
  temperature: number;
  contextWindow: number;
  maxOutputTokens: number;
  autoCommit: boolean;
  autoPush: boolean;
  autoUpdate: boolean;
  telemetry: boolean;
  requireShellApproval: boolean;
  allowReadOnly: boolean;
  worktreeIsolation: boolean;
  defaultShell: string;
  env: 'worktree' | 'cloud' | 'local';
  whisperProvider: 'openai' | 'local' | 'ollama';
  autoDetectModels: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  locale: 'en',
  density: 'default',
  accent: '#FB923C',
  temperature: 0.7,
  contextWindow: 128000,
  maxOutputTokens: 8192,
  autoCommit: true,
  autoPush: false,
  autoUpdate: true,
  telemetry: false,
  requireShellApproval: true,
  allowReadOnly: true,
  worktreeIsolation: true,
  defaultShell: '',
  env: 'worktree',
  whisperProvider: 'openai',
  autoDetectModels: false,
};

export type IpcRequest =
  | { type: 'agent/run'; payload: { prompt: string; mode: AgentMode; threadId: string; attachments?: { name: string; mime: string; dataBase64: string }[] } }
  | { type: 'agent/cancel'; payload: { runId: string } }
  | { type: 'plan/create'; payload: { title: string; threadId: string } }
  | { type: 'plan/list' }
  | { type: 'plan/get'; payload: { id: string } }
  | { type: 'plan/save'; payload: { plan: Plan } }
  | { type: 'pty/spawn'; payload: { cwd?: string; cols: number; rows: number; shell?: string } }
  | { type: 'pty/write'; payload: { id: string; data: string } }
  | { type: 'pty/resize'; payload: { id: string; cols: number; rows: number } }
  | { type: 'pty/kill'; payload: { id: string } }
  | { type: 'pty/run'; payload: { command: string; cwd?: string } }
  | { type: 'shell/approve'; payload: { id: string; allow: boolean; remember?: 'once' | 'session' | 'always' } }
  | { type: 'fs/readFile'; payload: { path: string } }
  | { type: 'fs/writeFile'; payload: { path: string; content: string } }
  | { type: 'fs/listDir'; payload: { path: string } }
  | { type: 'fs/exists'; payload: { path: string } }
  | { type: 'git/status'; payload: { cwd?: string } }
  | { type: 'git/diff'; payload: { path?: string; cwd?: string } }
  | { type: 'git/commit'; payload: { message: string; cwd?: string } }
  | { type: 'git/push'; payload: { cwd?: string } }
  | { type: 'git/log'; payload: { limit?: number; cwd?: string } }
  | { type: 'git/checkIsRepo'; payload: { cwd?: string } }
  | { type: 'worktree/list'; payload: { cwd?: string } }
  | { type: 'worktree/create'; payload: { branch: string; base?: string; cwd?: string } }
  | { type: 'worktree/remove'; payload: { path: string; force?: boolean } }
  | { type: 'settings/get' }
  | { type: 'settings/set'; payload: Partial<AppSettings> }
  | { type: 'providers/list' }
  | { type: 'providers/save'; payload: ProviderConfig }
  | { type: 'providers/remove'; payload: { id: ProviderId } }
  | { type: 'secrets/set'; payload: { providerId: ProviderId; apiKey: string } }
  | { type: 'secrets/get'; payload: { providerId: ProviderId } }
  | { type: 'secrets/has'; payload: { providerId: ProviderId } }
  | { type: 'mcp/list' }
  | { type: 'mcp/add'; payload: Omit<McpServer, 'id' | 'status' | 'tools'> }
  | { type: 'mcp/remove'; payload: { id: string } }
  | { type: 'mcp/toggle'; payload: { id: string; enabled: boolean } }
  | { type: 'mcp/restart'; payload: { id: string } }
  | { type: 'voice/transcribe'; payload: { audioBase64: string; mime: string; provider?: string } }
  | { type: 'app/openExternal'; payload: { url: string } }
  | { type: 'app/openPath'; payload: { path: string } }
  | { type: 'window/minimize' | 'window/maximize' | 'window/close' };

export type IpcResponse =
  | { type: 'ok'; payload?: unknown }
  | { type: 'error'; error: { code: string; message: string } }
  | { type: 'event'; event: IpcEvent };

export type IpcEvent =
  | { kind: 'stream:chunk'; runId: string; delta: string }
  | { kind: 'stream:done'; runId: string; usage?: { prompt: number; completion: number } }
  | { kind: 'stream:error'; runId: string; error: string }
  | { kind: 'plan:updated'; plan: Plan }
  | { kind: 'plan:created'; plan: Plan }
  | { kind: 'tool:started'; tool: string; args: unknown }
  | { kind: 'tool:finished'; tool: string; ok: boolean; output: unknown }
  | { kind: 'shell:approval'; id: string; command: string }
  | { kind: 'shell:output'; id: string; data: string; exitCode?: number }
  | { kind: 'log'; level: 'info' | 'warn' | 'error'; message: string }
  | { kind: 'pty:data'; id: string; data: string }
  | { kind: 'pty:exit'; id: string; code: number }
  | { kind: 'voice:level'; level: number };

export interface KedexApi {
  invoke<T = unknown>(req: IpcRequest): Promise<T>;
  onEvent(listener: (e: IpcEvent) => void): () => void;
  platform: NodeJS.Platform;
  version: string;
}

declare global {
  interface Window {
    kedex: KedexApi;
  }
}
