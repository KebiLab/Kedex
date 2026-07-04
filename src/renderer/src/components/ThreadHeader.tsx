import { GitBranch, ClockCounterClockwise, GitPullRequest, ChatCircleDots, Plus } from '@phosphor-icons/react';
import { useApp } from '@/store/app';
import { Button } from '@/components/ui/Button';

export function ThreadHeader() {
  const workspace = useApp((s) => s.workspace);
  const activeThreadId = useApp((s) => s.activeThreadId);
  const threads = useApp((s) => s.threads);
  const thread = threads.find((t) => t.id === activeThreadId);
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-bg px-5">
      <span className="text-sm font-medium text-fg">{thread?.title ?? 'New thread'}</span>
      {workspace && (
        <span className="ml-1 text-sm text-fg-dim">· {workspace.name}</span>
      )}
      <div className="ml-auto flex items-center gap-0.5">
        <Button variant="ghost" size="sm">
          <GitBranch className="h-3.5 w-3.5" weight="fill" />
          main
        </Button>
        <Button variant="ghost" size="icon">
          <ClockCounterClockwise className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <GitPullRequest className="h-4 w-4" weight="fill" />
        </Button>
        <Button variant="primary" size="sm">
          <ChatCircleDots className="h-3.5 w-3.5" weight="fill" />
          Review
          <Plus className="h-3.5 w-3.5" weight="bold" />
        </Button>
      </div>
    </header>
  );
}
