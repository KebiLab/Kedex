import { Folder, GitBranch, Play, Square, ChevronDown, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { useApp } from '@/store/app';
import { shortPath } from '@/lib/utils';
import { StatusDot } from '@/components/ui/StatusDot';
import { motion } from 'framer-motion';

export function TopBar() {
  const workspace = useApp((s) => s.workspace);
  const activeProviderId = useApp((s) => s.activeProviderId);
  const activeModel = useApp((s) => s.activeModel);
  const providers = useApp((s) => s.providers);
  const setActiveProvider = useApp((s) => s.setActiveProvider);
  const isStreaming = useApp((s) => s.isStreaming);
  const activeProvider = providers.find((p) => p.id === activeProviderId);

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-bg-0/80 px-3 backdrop-blur-xl">
      <div className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-fg-muted transition hover:bg-bg-2">
        <Folder className="h-3.5 w-3.5 text-fg-faint" />
        <span className="font-medium text-fg">{workspace?.name ?? 'No workspace'}</span>
        <span className="text-fg-faint">·</span>
        <span className="font-mono text-2xs text-fg-faint">
          {shortPath(workspace?.path ?? '—', 42)}
        </span>
        <ChevronDown className="h-3 w-3 text-fg-faint" />
      </div>

      <div className="h-5 w-px bg-line" />

      <div className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-fg-muted">
        <GitBranch className="h-3.5 w-3.5 text-fg-faint" />
        <span className="font-medium text-fg">main</span>
        <span className="pill"><StatusDot tone="success" />clean</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-md border border-line bg-bg-2 px-2 py-1 text-xs text-fg-muted">
          <Cpu className="h-3.5 w-3.5 text-fg-faint" />
          <span className="text-fg-faint">model</span>
          <ProviderLogo provider={activeProviderId ?? 'custom'} size={16} />
          <span className="font-medium text-fg">{activeModel}</span>
          <span className="text-fg-faint">·</span>
          <select
            value={activeProviderId ?? ''}
            onChange={(e) => setActiveProvider(e.target.value as never, activeModel)}
            className="bg-transparent text-2xs text-fg-muted focus:outline-none"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id} className="bg-bg-2 text-fg">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {isStreaming ? (
          <Button variant="secondary" size="sm">
            <Square className="h-3.5 w-3.5" /> Stop
          </Button>
        ) : (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button variant="primary" size="sm">
              <Play className="h-3.5 w-3.5" /> Run
            </Button>
          </motion.div>
        )}
      </div>
    </header>
  );
}
