export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek'
  | 'mistral'
  | 'ollama'
  | 'custom';

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
}

export type AgentMode = 'plan' | 'goal' | 'ask';

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

export type IpcRequest =
  | { type: 'agent/run'; payload: { prompt: string; mode: AgentMode; threadId: string } }
  | { type: 'agent/cancel'; payload: { runId: string } }
  | { type: 'plan/create'; payload: { title: string } }
  | { type: 'plan/list' }
  | { type: 'pty/spawn'; payload: { cwd: string; cols: number; rows: number } }
  | { type: 'pty/write'; payload: { id: string; data: string } }
  | { type: 'pty/resize'; payload: { id: string; cols: number; rows: number } }
  | { type: 'pty/kill'; payload: { id: string } }
  | { type: 'shell/approve'; payload: { id: string; allow: boolean; remember?: 'once' | 'session' | 'always' } }
  | { type: 'fs/readFile'; payload: { path: string } }
  | { type: 'fs/writeFile'; payload: { path: string; content: string } }
  | { type: 'fs/listDir'; payload: { path: string } }
  | { type: 'git/status' }
  | { type: 'git/diff'; payload: { path?: string } }
  | { type: 'git/commit'; payload: { message: string } }
  | { type: 'git/push' }
  | { type: 'settings/get' }
  | { type: 'settings/set'; payload: Record<string, unknown> }
  | { type: 'providers/list' }
  | { type: 'providers/save'; payload: ProviderConfig }
  | { type: 'providers/remove'; payload: { id: ProviderId } }
  | { type: 'secrets/set'; payload: { providerId: ProviderId; apiKey: string } }
  | { type: 'secrets/get'; payload: { providerId: ProviderId } }
  | { type: 'voice/transcribe'; payload: { audioBase64: string; mime: string } };

export type IpcResponse =
  | { type: 'ok'; payload?: unknown }
  | { type: 'error'; error: { code: string; message: string } }
  | { type: 'event'; event: IpcEvent };

export type IpcEvent =
  | { kind: 'stream:chunk'; runId: string; delta: string }
  | { kind: 'stream:done'; runId: string; usage?: { prompt: number; completion: number } }
  | { kind: 'plan:updated'; plan: Plan }
  | { kind: 'tool:started'; tool: string; args: unknown }
  | { kind: 'tool:finished'; tool: string; ok: boolean; output: unknown }
  | { kind: 'shell:approval'; id: string; command: string }
  | { kind: 'log'; level: 'info' | 'warn' | 'error'; message: string }
  | { kind: 'pty:data'; id: string; data: string }
  | { kind: 'pty:exit'; id: string; code: number };

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
