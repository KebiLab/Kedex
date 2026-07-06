import { useEffect, useState } from 'react';
import {
  Cloud,
  CheckCircle,
  CircleNotch,
  WarningCircle,
  ArrowSquareOut,
  Lock,
  ArrowsClockwise,
  Sparkle,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/app';
import type { McpServer } from '@shared/ipc';

const CLOUD_PRESETS: { id: string; name: string; url: string; description: string; tools: string[] }[] = [
  {
    id: 'mcp_codex_cloud',
    name: 'Codex Cloud',
    url: 'https://mcp.codex.dev/v1',
    description: 'OpenAI Codex cloud tools — search, run, files — proxied via MCP.',
    tools: ['codex_search', 'codex_run', 'codex_files', 'codex_exec'],
  },
  {
    id: 'mcp_anthropic_cloud',
    name: 'Anthropic MCP',
    url: 'https://mcp.anthropic.com/v1',
    description: 'Claude Skills, file search, computer use — accessed through MCP.',
    tools: ['claude_search', 'claude_files', 'claude_code', 'claude_skills'],
  },
];

export function CloudMcpTab() {
  const servers = useApp((s) => s.mcpServers);
  const setMcpServers = useApp((s) => s.setMcpServers);
  const startMcpOAuth = useApp((s) => s.startMcpOAuth);
  const disconnectMcpServer = useApp((s) => s.disconnectMcpServer);
  const pushToast = useApp((s) => s.pushToast);
  const [refreshing, setRefreshing] = useState(false);

  const cloud = servers.filter((s) => s.kind === 'cloud');

  useEffect(() => {
    void window.kedex.invoke({ type: 'mcp/list', payload: {} }).then((list) => {
      setMcpServers(list as McpServer[]);
    }).catch(() => undefined);
  }, [setMcpServers]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const list = (await window.kedex.invoke({ type: 'mcp/list', payload: {} })) as McpServer[];
      setMcpServers(list);
    } catch (err) {
      pushToast({ tone: 'error', text: (err as Error).message });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-fg">Cloud MCP</h2>
        <p className="mt-0.5 text-2xs text-fg-dim">
          Connect to managed MCP servers from OpenAI Codex and Anthropic. Authentication is handled
          through your system browser; tokens are stored in the OS keychain.
        </p>
      </div>

      <div className="space-y-2">
        {CLOUD_PRESETS.map((preset) => {
          const live = cloud.find((s) => s.id === preset.id);
          return (
            <CloudCard
              key={preset.id}
              preset={preset}
              server={live}
              onConnect={() => startMcpOAuth(preset.id)}
              onDisconnect={() => disconnectMcpServer(preset.id)}
              onRefresh={refresh}
            />
          );
        })}
      </div>

      <Button variant="secondary" size="sm" onClick={refresh} disabled={refreshing}>
        {refreshing ? (
          <CircleNotch className="h-3.5 w-3.5 animate-spin" weight="bold" />
        ) : (
          <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
        )}
        Refresh
      </Button>
    </div>
  );
}

function CloudCard({
  preset,
  server,
  onConnect,
  onDisconnect,
  onRefresh,
}: {
  preset: { id: string; name: string; url: string; description: string; tools: string[] };
  server?: McpServer;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}) {
  const connected = server?.status === 'connected';
  const errored = server?.status === 'error';
  const tokenValid = server?.tokenExpiresAt && server.tokenExpiresAt > Date.now();

  return (
    <div className="rounded-xl border border-line bg-bg-1 p-4">
      <div className="flex items-start gap-3">
        <div
          className={
            'grid h-10 w-10 shrink-0 place-items-center rounded-lg ' +
            (connected
              ? 'bg-success/15 text-success'
              : 'bg-info/10 text-info')
          }
        >
          <Cloud className="h-4 w-4" weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-fg">{preset.name}</span>
            {connected && tokenValid && (
              <span className="inline-flex items-center gap-1 text-2xs text-success">
                <CheckCircle className="h-3 w-3" weight="fill" /> Connected
              </span>
            )}
            {errored && (
              <span className="inline-flex items-center gap-1 text-2xs text-danger">
                <WarningCircle className="h-3 w-3" weight="fill" /> Error
              </span>
            )}
            {!connected && !errored && (
              <span className="inline-flex items-center gap-1 text-2xs text-fg-dim">
                <CircleNotch className="h-3 w-3" weight="fill" /> Not connected
              </span>
            )}
          </div>
          <p className="mt-0.5 text-2xs text-fg-dim">{preset.description}</p>
          <div className="mt-0.5 font-mono text-2xs text-fg-faint">{preset.url}</div>

          <div className="mt-2 flex flex-wrap gap-1">
            {preset.tools.map((t) => (
              <span
                key={t}
                className="rounded-md border border-line bg-bg-2 px-1.5 py-0.5 text-2xs text-fg-muted"
              >
                {t}
              </span>
            ))}
          </div>

          {server?.lastError && (
            <div className="mt-2 text-2xs text-danger">{server.lastError}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {connected ? (
            <>
              <Button size="sm" variant="secondary" onClick={onDisconnect}>
                Disconnect
              </Button>
              <Button size="sm" variant="ghost" onClick={onConnect}>
                <ArrowSquareOut className="h-3.5 w-3.5" weight="bold" /> Re-authorize
              </Button>
            </>
          ) : (
            <Button size="sm" variant="primary" onClick={onConnect}>
              <ArrowSquareOut className="h-3.5 w-3.5" weight="bold" /> Sign in with browser
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onRefresh}>
            <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
          </Button>
        </div>
      </div>

      {connected && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-2xs text-fg-dim">
          <Lock className="h-3 w-3" weight="fill" />
          Token stored in OS keychain
          {server?.tokenExpiresAt && (
            <span className="ml-1">
              · expires {new Date(server.tokenExpiresAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
