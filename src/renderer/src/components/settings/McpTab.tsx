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

export function McpTab() {
  const servers = useApp((s) => s.mcpServers);
  const addMcpServer = useApp((s) => s.addMcpServer);
  const removeMcpServer = useApp((s) => s.removeMcpServer);
  const toggleMcpServer = useApp((s) => s.toggleMcpServer);
  const [adding, setAdding] = useState(false);

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
              Connect external tools and data sources. The agent can call MCP tools alongside
              the built-in ones. Servers run as separate processes and communicate over stdio.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" weight="bold" /> Add server
          </Button>
          <Button variant="secondary" size="sm">
            <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" /> Reload all
          </Button>
        </div>
      </div>

      {adding && <AddServerCard onCancel={() => setAdding(false)} onAdd={(s) => { addMcpServer(s); setAdding(false); }} />}

      <div className="space-y-2">
        {servers.map((s) => (
          <ServerCard
            key={s.id}
            server={s}
            onToggle={() => toggleMcpServer(s.id, !s.enabled)}
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
  onRemove,
}: {
  server: McpServer;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const meta = STATUS_META[server.status];
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-bg-1 p-4 transition',
        server.enabled ? '' : 'opacity-60',
      )}
    >
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bg-2 text-fg-muted">
            <Plugs className="h-4 w-4" weight="fill" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-fg">{server.name}</span>
              <span className={cn('inline-flex items-center gap-1 text-2xs', meta.tone)}>
                <meta.icon className="h-3.5 w-3.5" weight={meta.icon === CircleNotch ? 'bold' : 'fill'} />
                {meta.label}
              </span>
            </div>
          <div className="mt-0.5 truncate text-2xs text-fg-dim">
            {server.command} {server.args.join(' ')}
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
        </div>
        <div className="flex items-center gap-1">
          <Switch checked={server.enabled} onCheckedChange={onToggle} />
          <Button size="icon" variant="ghost" aria-label="Restart" title="Restart">
            <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="Remove" onClick={onRemove}>
            <Trash className="h-3.5 w-3.5" weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddServerCard({
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
      <div className="text-sm font-medium text-fg">New MCP server</div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label>
          <div className="mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My server" className="input" />
        </label>
        <label>
          <div className="mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">Command</div>
          <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="npx" className="input" />
        </label>
        <label className="md:col-span-2">
          <div className="mb-1 text-2xs font-medium uppercase tracking-wider text-fg-dim">Arguments</div>
          <input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="-y @org/server" className="input" />
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
