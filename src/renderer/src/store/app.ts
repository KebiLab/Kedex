import { create } from 'zustand';
import type {
  AgentMode,
  ChatMessage,
  McpServer,
  Plan,
  ProviderConfig,
  ProviderId,
} from '@shared/ipc';

export interface Thread {
  id: string;
  title: string;
  preview: string;
  createdAt: number;
  updatedAt: number;
  mode: AgentMode;
  pinned?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  path: string;
  open: boolean;
}

export interface ApprovalRequest {
  id: string;
  command: string;
  tool: string;
  args: unknown;
  createdAt: number;
}

interface AppState {
  workspace: Workspace | null;
  threads: Thread[];
  activeThreadId: string | null;
  messages: Record<string, ChatMessage[]>;
  plans: Plan[];
  activePlanId: string | null;
  providers: ProviderConfig[];
  activeProviderId: ProviderId | null;
  activeModel: string;
  mcpServers: McpServer[];
  isStreaming: boolean;
  streamBuffer: string;
  pendingApproval: ApprovalRequest | null;
  settingsOpen: boolean;
  browserOpen: boolean;
  toasts: { id: string; tone: 'info' | 'success' | 'error'; text: string }[];

  setWorkspace: (w: Workspace | null) => void;
  setActiveThread: (id: string) => void;
  newThread: () => string;
  addMessage: (threadId: string, msg: ChatMessage) => void;
  updateMessage: (threadId: string, id: string, patch: Partial<ChatMessage>) => void;
  appendStream: (chunk: string) => void;
  finishStream: () => void;
  setStreaming: (b: boolean) => void;
  setActivePlan: (id: string | null) => void;
  upsertPlan: (plan: Plan) => void;
  setProviders: (p: ProviderConfig[]) => void;
  setActiveProvider: (id: ProviderId, model?: string) => void;
  setMcpServers: (s: McpServer[]) => void;
  addMcpServer: (s: McpServer) => void;
  removeMcpServer: (id: string) => void;
  toggleMcpServer: (id: string, enabled: boolean) => void;
  setActiveModel: (m: string) => void;
  setSettingsOpen: (b: boolean) => void;
  setBrowserOpen: (b: boolean) => void;
  setPendingApproval: (a: ApprovalRequest | null) => void;
  pushToast: (t: { tone: 'info' | 'success' | 'error'; text: string }) => void;
  dismissToast: (id: string) => void;
}

const seedThreads: Thread[] = [
  {
    id: 't_welcome',
    title: 'Welcome to Kedex',
    preview: 'Get started by configuring a provider and opening a workspace.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 30,
    mode: 'plan',
    pinned: true,
  },
  {
    id: 't_refactor_auth',
    title: 'Refactor auth middleware',
    preview: 'Plan: 5 steps · in progress',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
    mode: 'goal',
  },
  {
    id: 't_add_tests',
    title: 'Add tests for the diff parser',
    preview: 'Plan approved, running…',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now() - 1000 * 60 * 50,
    mode: 'goal',
  },
];

const seedMessages: Record<string, ChatMessage[]> = {
  t_welcome: [
    {
      id: 'm1',
      role: 'assistant',
      content:
        "Hi — I'm Kedex. Pick a provider, open a workspace, and tell me what to build. I'll plan, get your approval, and execute.",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
  ],
};

export const useApp = create<AppState>((set, get) => ({
  workspace: { id: 'ws_demo', name: 'kedex-app', path: 'D:\\Projects\\kedex-app', open: true },
  threads: seedThreads,
  activeThreadId: 't_welcome',
  messages: seedMessages,
  plans: [],
  activePlanId: null,
  providers: [
    { id: 'openai', label: 'OpenAI', defaultModel: 'gpt-5.3-codex', requiresApiKey: true, streaming: 'sse' },
    { id: 'anthropic', label: 'Anthropic', defaultModel: 'claude-3-5-sonnet', requiresApiKey: true, streaming: 'sse' },
    { id: 'gemini', label: 'Google Gemini', defaultModel: 'gemini-1.5-pro', requiresApiKey: true, streaming: 'sse' },
    { id: 'deepseek', label: 'DeepSeek', defaultModel: 'deepseek-chat', baseUrl: 'https://api.deepseek.com/v1', requiresApiKey: true, streaming: 'sse' },
    { id: 'ollama', label: 'Ollama (local)', defaultModel: 'llama3.1', baseUrl: 'http://localhost:11434', requiresApiKey: false, streaming: 'ollama' },
    { id: 'custom', label: 'Custom Endpoint', defaultModel: 'my-model', requiresApiKey: true, streaming: 'sse' },
  ],
  activeProviderId: 'openai',
  activeModel: 'gpt-5.3-codex',
  mcpServers: [
    {
      id: 'mcp_github',
      name: 'GitHub',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_TOKEN: '••••••••' } as Record<string, string>,
      enabled: true,
      status: 'connected',
      tools: ['create_issue', 'list_repos', 'search_code', 'get_file'],
    },
    {
      id: 'mcp_postgres',
      name: 'Postgres',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      env: { DATABASE_URL: '••••••••' } as Record<string, string>,
      enabled: true,
      status: 'connected',
      tools: ['query', 'list_tables', 'describe_table'],
    },
    {
      id: 'mcp_puppeteer',
      name: 'Puppeteer',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
      env: {} as Record<string, string>,
      enabled: false,
      status: 'disconnected',
      tools: ['screenshot', 'navigate', 'click'],
    },
  ],
  isStreaming: false,
  streamBuffer: '',
  pendingApproval: null,
  settingsOpen: false,
  browserOpen: false,
  toasts: [],

  setWorkspace: (w) => set({ workspace: w }),
  setActiveThread: (id) => set({ activeThreadId: id }),
  newThread: () => {
    const id = `t_${Math.random().toString(36).slice(2, 9)}`;
    const t: Thread = {
      id,
      title: 'New thread',
      preview: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: 'plan',
    };
    set((s) => ({ threads: [t, ...s.threads], activeThreadId: id, messages: { ...s.messages, [id]: [] } }));
    return id;
  },
  addMessage: (threadId, msg) =>
    set((s) => ({
      messages: { ...s.messages, [threadId]: [...(s.messages[threadId] ?? []), msg] },
    })),
  updateMessage: (threadId, id, patch) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [threadId]: (s.messages[threadId] ?? []).map((m) => (m.id === id ? { ...m, ...patch } : m)),
      },
    })),
  appendStream: (chunk) => set((s) => ({ streamBuffer: s.streamBuffer + chunk })),
  finishStream: () => {
    const { streamBuffer, activeThreadId } = get();
    if (activeThreadId && streamBuffer) {
      get().addMessage(activeThreadId, {
        id: `m_${Date.now()}`,
        role: 'assistant',
        content: streamBuffer,
        createdAt: Date.now(),
      });
    }
    set({ streamBuffer: '', isStreaming: false });
  },
  setStreaming: (b) => set({ isStreaming: b, streamBuffer: b ? '' : get().streamBuffer }),
  setActivePlan: (id) => set({ activePlanId: id }),
  upsertPlan: (plan) =>
    set((s) => {
      const idx = s.plans.findIndex((p) => p.id === plan.id);
      const plans = idx >= 0 ? s.plans.map((p, i) => (i === idx ? plan : p)) : [plan, ...s.plans];
      return { plans, activePlanId: plan.id };
    }),
  setProviders: (p) => set({ providers: p }),
  setMcpServers: (mcpServers) => set({ mcpServers }),
  addMcpServer: (s) => set((cur) => ({ mcpServers: [s, ...cur.mcpServers] })),
  removeMcpServer: (id) =>
    set((cur) => ({ mcpServers: cur.mcpServers.filter((s) => s.id !== id) })),
  toggleMcpServer: (id, enabled) =>
    set((cur) => ({
      mcpServers: cur.mcpServers.map((s) =>
        s.id === id ? { ...s, enabled, status: enabled ? 'connecting' : 'disconnected' } : s,
      ),
    })),
  setActiveProvider: (id, model) =>
    set((s) => ({
      activeProviderId: id,
      activeModel: model ?? s.providers.find((p) => p.id === id)?.defaultModel ?? s.activeModel,
    })),
  setActiveModel: (m) => set({ activeModel: m }),
  setSettingsOpen: (b) => set({ settingsOpen: b }),
  setBrowserOpen: (b) => set({ browserOpen: b }),
  setPendingApproval: (a) => set({ pendingApproval: a }),
  pushToast: (t) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { id, ...t }] }));
    setTimeout(() => get().dismissToast(id), 3500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
