import { useState } from 'react';
import {
  Plus,
  Trash,
  ArrowsClockwise,
  Power,
  CircleNotch,
  CheckCircle,
  WarningCircle,
  Plugs,
  Cloud,
  Lock,
  ArrowSquareOut,
  Terminal,
  type Icon,
} from '@phosphor-icons/react';
import { useApp } from '@/store/app';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { cn, uid } from '@/lib/utils';
import type { McpServer } from '@shared/ipc';

const STATUS_META: Record<
  McpServer['status'],
  { label: string; icon: Icon; tone: string }
> = {
  connected: { label: 'Connected', icon: CheckCircle, tone: 'text-success' },
  connecting: { label: 'Connecting…', icon: CircleNotch, tone: 'text-info' },
  disconnected: { label: 'Disconnected', icon: Power, tone: 'text-fg-dim' },
  error: { label: 'Error', icon: WarningCircle, tone: 'text-danger' },
};

const KIND_META: Record<McpServer['kind'], { label: string; icon: Icon; tone: string }> = {
  local: { label: 'Local stdio', icon: Terminal, tone: 'text-fg' },
  cloud: { label: 'Cloud MCP', icon: Cloud, tone: 'text-info' },
};

export function McpTab() {
  const servers = useApp((s) => s.mcpServers);
  const setMcpServers = useApp((s) => s.setMcpServers);
  const addMcpServer = useApp((s) => s.addMcpServer);
  const removeMcpServer = useApp((s) => s.removeMcpServer);
  const toggleMcpServer = useApp((s) => s.toggleMcpServer);
  const connectMcpServer = useApp((s) => s.connectMcpServer);
  const disconnectMcpServer = useApp((s) => s.disconnectMcpServer);
  const startMcpOAuth = useApp((s) => s.startMcpOAuth);
  const pushToast = useApp((s) => s.pushToast);
  const [adding, setAdding] = useState<'local' | 'cloud' | null>(null);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-warm/15 text-accent-warm">
            <Plugs className="h-4 w-4" weight="fill" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-fg">Model Context Protocol</div>
            <p className="mt-1 text-2xs text-fg-dim">
              Connect <span className="font-medium text-fg-muted">local</span> stdio servers and{' '}
              <span className="font-medium text-fg-muted">cloud</span> MCP endpoints (Codex, Anthropic).
              The agent calls MCP tools alongside built-in ones.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setAdding('local')}>
            <Plus className="h-3.5 w-3.5" weight="bold" /> Local server
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAdding('cloud')}>
            <Cloud className="h-3.5 w-3.5" weight="fill" /> Cloud MCP
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const list = (await window.kedex.invoke({ type: 'mcp/list', payload: {} })) as McpServer[];
                setMcpServers(list);
              } catch (err) {
                pushToast({ tone: 'error', text: (err as Error).message });
              }
            }}
          >
            <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" /> Reload all
          </Button>
        </div>
      </div>

      {adding === 'local' && (
        <AddLocalServerCard
          onCancel={() => setAdding(null)}
          onAdd={(s) => {
            addMcpServer(s);
            setAdding(null);
            pushToast({ tone: 'success', text: `Local server "${s.name}" added` });
          }}
        />
      )}
      {adding === 'cloud' && (
        <AddCloudServerCard
          onCancel={() => setAdding(null)}
          onAdd={(s) => {
            addMcpServer(s);
            setAdding(null);
            pushToast({ tone: 'success', text: `Cloud MCP "${s.name}" added` });
          }}
        />
      )}

      <div className="space-y-2">
        {servers.map((s) => (
          <ServerCard
            key={s.id}
            server={s}
            onToggle={() => toggleMcpServer(s.id, !s.enabled)}
            onConnect={() => connectMcpServer(s.id)}
            onDisconnect={() => disconnectMcpServer(s.id)}
            onOAuth={() => startMcpOAuth(s.id)}
            onRemove={() => removeMcpServer(s.id)}
          />
        ))}
        {servers.length === 0 && (
          <div className="grid place-items-center rounded-xl border border-dashed border-line py-10 text-sm text-fg-dim">
            No MCP servers yet.
          </div>
        )}
      </div>
    </div>
  );
}

function ServerCard({
  server,
  onToggle,
  onConnect,
  onDisconnect,
  onOAuth,
  onRemove,
}: {
  server: McpServer;
  onToggle: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onOAuth: () => void;
  onRemove: () => void;
}) {
  const meta = STATUS_META[server.status];
  const kind = KIND_META[server.kind];
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-bg-1 p-4 transition',
        server.enabled ? '' : 'opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bg-2 text-fg-muted">
          {server.kind === 'cloud' ? (
            <Cloud className="h-4 w-4" weight="fill" />
          ) : (
            <Plugs className="h-4 w-4" weight="fill" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-fg">{server.name}</span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md border border-line bg-bg-2 px-1.5 py-0.5 text-2xs',
                kind.tone,
              )}
            >
              <kind.icon className="h-3 w-3" weight="fill" />
              {kind.label}
            </span>
            <span className={cn('inline-flex items-center gap-1 text-2xs', meta.tone)}>
              <meta.icon
                className="h-3.5 w-3.5"
                weight={meta.icon === CircleNotch ? 'bold' : 'fill'}
              />
              {meta.label}
            </span>
          </div>
          <div className="mt-0.5 truncate font-mono text-2xs text-fg-dim">
            {server.kind === 'local'
              ? `${server.command ?? '?'} ${(server.args ?? []).join(' ')}`
              : server.url ?? '—'}
          </div>
          {server.tools.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {server.tools.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-line bg-bg-2 px-1.5 py-0.5 text-2xs text-fg-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {server.tokenExpiresAt && server.tokenExpiresAt < Date.now() && (
            <div className="mt-1.5 flex items-center gap-1 text-2xs text-warn">
              <Lock className="h-3 w-3" weight="fill" />
              Token expired
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {server.kind === 'cloud' && server.requiresAuth && !server.tokenExpiresAt && (
            <Button size="sm" variant="secondary" onClick={onOAuth}>
              <ArrowSquareOut className="h-3.5 w-3.5" weight="bold" /> Sign in
            </Button>
          )}
          {server.status === 'connected' ? (
            <Button size="sm" variant="ghost" onClick={onDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={onConnect}>
              Connect
            </Button>
          )}
          <Switch checked={server.enabled} onCheckedChange={onToggle} />
          <Button size="icon" variant="ghost" onClick={onRemove} aria-label="Remove">
            <Trash className="h-3.5 w-3.5" weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddLocalServerCard({
  onCancel,
  onAdd,
}: {
  onCancel: () => void;
  onAdd: (s: McpServer) => void;
}) {
  const [name, setName] = useState('');
  const [command, setCommand] = useState('npx');
  const [args, setArgs] = useState('-y @modelcontextprotocol/server-example');

  const submit = () => {
    if (!name.trim() || !command.trim()) return;
    onAdd({
      id: uid('mcp'),
      name: name.trim(),
      kind: 'local',
      command: command.trim(),
      args: args.split(/\s+/).filter(Boolean),
      env: {},
      enabled: true,
      status: 'connecting',
      tools: [],
    });
  };

  return (
    <div className="rounded-xl border border-line bg-bg-1 p-4">
      <div className="text-sm font-medium text-fg">New local stdio server</div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label>
          <div className="mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My server"
            className="input"
          />
        </label>
        <label>
          <div className="mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">Command</div>
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="npx"
            className="input"
          />
        </label>
        <label className="md:col-span-2">
          <div className="mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">Arguments</div>
          <input
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            placeholder="-y @org/server"
            className="input"
          />
        </label>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={submit}>
          Add server
        </Button>
      </div>
    </div>
  );
}

function AddCloudServerCard({
  onCancel,
  onAdd,
}: {
  onCancel: () => void;
  onAdd: (s: McpServer) => void;
}) {
  const PRESETS: { id: string; name: string; url: string; tools: string[] }[] = [
    {
      id: 'mcp_codex_cloud',
      name: 'Codex Cloud',
      url: 'https://mcp.codex.dev/v1',
      tools: ['codex_search', 'codex_run', 'codex_files'],
    },
    {
      id: 'mcp_anthropic_cloud',
      name: 'Anthropic MCP',
      url: 'https://mcp.anthropic.com/v1',
      tools: ['claude_search', 'claude_files', 'claude_code'],
    },
  ];
  const [name, setName] = useState('Codex Cloud');
  const [url, setUrl] = useState('https://mcp.codex.dev/v1');

  const submit = () => {
    if (!name.trim() || !url.trim()) return;
    onAdd({
      id: uid('mcp'),
      name: name.trim(),
      kind: 'cloud',
      url: url.trim(),
      requiresAuth: true,
      enabled: true,
      status: 'connecting',
      args: [],
      env: {},
      tools: [],
    });
  };

  return (
    <div className="rounded-xl border border-line bg-bg-1 p-4">
      <div className="text-sm font-medium text-fg">New cloud MCP endpoint</div>
      <p className="mt-0.5 mb-3 text-2xs text-fg-dim">
        You'll be redirected to the provider to sign in. Tokens are stored in the OS keychain.
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setName(p.name);
              setUrl(p.url);
            }}
            className="rounded-full border border-line bg-bg-2 px-2.5 py-0.5 text-2xs text-fg-muted transition hover:border-line-strong hover:text-fg"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <label>
          <div className="mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Codex Cloud"
            className="input"
          />
        </label>
        <label>
          <div className="mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">Endpoint URL</div>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://mcp.provider.com/v1"
            className="input font-mono text-xs"
          />
        </label>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={submit}>
          Add cloud MCP
        </Button>
      </div>
    </div>
  );
}
