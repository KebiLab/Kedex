import { useState } from 'react';
import {
  Plus,
  Chats,
  PushPin,
  MagnifyingGlass,
  Folder,
  Stack,
  Sparkle,
  Gear,
  Cloud,
  GitBranch,
  Terminal,
  CaretDown,
} from '@phosphor-icons/react';
import { useApp } from '@/store/app';
import { Logo } from '@/components/ui/Logo';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { cn } from '@/lib/utils';

type ProjectEnv = 'worktree' | 'cloud' | 'local';

export function Sidebar() {
  const threads = useApp((s) => s.threads);
  const activeThreadId = useApp((s) => s.activeThreadId);
  const setActiveThread = useApp((s) => s.setActiveThread);
  const newThread = useApp((s) => s.newThread);
  const setSettingsOpen = useApp((s) => s.setSettingsOpen);
  const openSettingsSection = useApp((s) => s.openSettingsSection);
  const projects = useApp((s) => s.projects);
  const [env, setEnv] = useState<ProjectEnv>('worktree');
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [threadsOpen, setThreadsOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  const pinned = threads.filter((t) => t.pinned);
  const recent = threads.filter((t) => !t.pinned);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-bg">
      <div className="px-4 pt-4 pb-3">
        <Logo />
      </div>

      <div className="px-3">
        <button
          onClick={() => newThread()}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-fg transition hover:bg-bg-2"
        >
          <Plus className="h-4 w-4 text-fg-muted" weight="bold" />
          <span>New thread</span>
        </button>
        <button
          onClick={() => {
            openSettingsSection('mcp');
            setSettingsOpen(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-fg-muted transition hover:bg-bg-2"
        >
          <Sparkle className="h-4 w-4" weight="fill" />
          <span>Automations</span>
        </button>
        <button
          onClick={() => {
            openSettingsSection('skills');
            setSettingsOpen(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-fg-muted transition hover:bg-bg-2"
        >
          <Stack className="h-4 w-4" weight="fill" />
          <span>Skills</span>
        </button>
        <button
          onClick={() => {
            openSettingsSection('mcp');
            setSettingsOpen(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-fg-muted transition hover:bg-bg-2"
        >
          <Cloud className="h-4 w-4" weight="fill" />
          <span>Cloud</span>
        </button>
      </div>

      <ScrollArea className="mt-4 min-h-0 flex-1">
        <div className="flex flex-col">
          {pinned.length > 0 && (
            <GroupHeader label="Pinned" open={pinnedOpen} onToggle={() => setPinnedOpen((v) => !v)} count={pinned.length}>
              {pinnedOpen &&
                pinned.map((t) => (
                  <ThreadRow
                    key={t.id}
                    label={t.title}
                    icon={<PushPin className="h-3.5 w-3.5 text-fg-muted" weight="fill" />}
                    active={t.id === activeThreadId}
                    onClick={() => setActiveThread(t.id)}
                    badge="3d"
                  />
                ))}
            </GroupHeader>
          )}

          <GroupHeader label="Threads" open={threadsOpen} onToggle={() => setThreadsOpen((v) => !v)} count={recent.length}>
            {threadsOpen && (
              <>
                {recent.map((t) => (
                  <ThreadRow
                    key={t.id}
                    label={t.title}
                    icon={<Chats className="h-3.5 w-3.5 text-fg-dim" weight="fill" />}
                    active={t.id === activeThreadId}
                    onClick={() => setActiveThread(t.id)}
                    badge="1w"
                  />
                ))}
                <div className="px-2 pb-1">
                  <button className="flex w-full items-center gap-1 px-2 py-1 text-2xs text-fg-dim transition hover:text-fg">
                    Show more
                  </button>
                </div>
              </>
            )}
          </GroupHeader>

          <GroupHeader label="Projects" open={projectsOpen} onToggle={() => setProjectsOpen((v) => !v)} count={projects.length}>
            {projectsOpen &&
              projects.map((p) => (
                <button
                  key={p.id}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-fg-muted transition hover:bg-bg-2 hover:text-fg"
                >
                  <Folder className="h-3.5 w-3.5 text-fg-dim" weight="fill" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
          </GroupHeader>
        </div>
      </ScrollArea>

      <div className="border-t border-line p-3">
        <div className="mb-2 flex items-center gap-1.5 text-2xs text-fg-dim">
          <span>Environment</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-line bg-bg-2 p-0.5 text-2xs">
          {(
            [
              { id: 'worktree' as const, label: 'Worktree', icon: GitBranch },
              { id: 'cloud' as const, label: 'Cloud', icon: Cloud },
              { id: 'local' as const, label: 'Local', icon: Terminal },
            ]
          ).map((e) => {
            const Ico = e.icon;
            const active = env === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setEnv(e.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 transition',
                  active ? 'bg-bg-3 text-fg' : 'text-fg-muted hover:text-fg',
                )}
              >
                <Ico className="h-3 w-3" weight={active ? 'fill' : 'regular'} />
                {e.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="mt-3 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-bg-2"
        >
          <div className="grid h-7 w-7 place-items-center rounded-full bg-accent-warm/20 text-2xs font-semibold text-accent-warm">
            K
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-fg">kebikovyt@gmail.com</div>
            <div className="text-2xs text-fg-dim">Free</div>
          </div>
          <Gear className="h-4 w-4 text-fg-dim" weight="fill" />
        </button>
      </div>
    </aside>
  );
}

function GroupHeader({
  label,
  count,
  open,
  onToggle,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="px-2 pb-1.5">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1 px-2 py-1 text-2xs font-medium uppercase tracking-wider text-fg-dim transition hover:text-fg"
      >
        <CaretDown
          className={cn('h-3 w-3 transition', !open && '-rotate-90')}
          weight="bold"
        />
        <span>{label}</span>
        <span className="ml-auto text-fg-faint">{count}</span>
      </button>
      <div className="mt-0.5 flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function ThreadRow({
  label,
  icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition',
        active ? 'bg-bg-2 text-fg' : 'text-fg-muted hover:bg-bg-2 hover:text-fg',
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
      {badge && (
        <span className="ml-auto text-2xs text-fg-faint">{badge}</span>
      )}
    </button>
  );
}
