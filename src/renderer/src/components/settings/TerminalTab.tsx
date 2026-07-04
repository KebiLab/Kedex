import { Terminal } from '@phosphor-icons/react';

export function TerminalTab() {
  return (
    <div className="space-y-3">
      <Row label="Default shell" value="zsh · /bin/zsh" />
      <Row label="Working directory" value="Use active workspace" />
      <Row label="Environment" value="Inherit from Electron" />
      <Row label="PTY columns × rows" value="120 × 30" />
      <Row label="Approval for shell commands" value="Always ask" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-bg-1 px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs text-fg-muted">
        <Terminal className="h-3.5 w-3.5 text-fg-dim" weight="fill" />
        {label}
      </div>
      <span className="text-xs text-fg">{value}</span>
    </div>
  );
}
