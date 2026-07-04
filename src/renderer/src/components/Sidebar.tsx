import { Plus, GearSix, Chats, PushPin, MagnifyingGlass, Folder, Stack, Sparkle } from '@phosphor-icons/react';
import { useApp } from '@/store/app';
import { Logo } from '@/components/ui/Logo';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const threads = useApp((s) => s.threads);
  const activeThreadId = useApp((s) => s.activeThreadId);
  const setActiveThread = useApp((s) => s.setActiveThread);
  const newThread = useApp((s) => s.newThread);
  const setSettingsOpen = useApp((s) => s.setSettingsOpen);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-bg">
      <div className="px-4 pt-4 pb-3">
        <Logo />
      </div>

      <div className="px-3">
        <button
          onClick={() => newThread()}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm text-fg transition hover:bg-bg-2"
        >
          <Plus className="h-4 w-4 text-fg-muted" weight="bold" />
          <span>New thread</span>
        </button>
        <button className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm text-fg-muted transition hover:bg-bg-2">
          <Sparkle className="h-4 w-4" weight="fill" />
          <span>Automations</span>
          <span className="ml-auto rounded-md bg-bg-2 px-1.5 py-0.5 text-2xs text-fg-muted">2</span>
        </button>
        <button className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm text-fg-muted transition hover:bg-bg-2">
          <Stack className="h-4 w-4" weight="fill" />
          <span>Skills</span>
        </button>
        <button className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm text-fg-muted transition hover:bg-bg-2">
          <Folder className="h-4 w-4" weight="fill" />
          <span>Projects</span>
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between px-4 text-2xs font-medium uppercase tracking-wider text-fg-dim">
        <span>Threads</span>
        <div className="flex items-center gap-1">
          <button className="grid h-5 w-5 place-items-center rounded hover:bg-bg-2 hover:text-fg">
            <PushPin className="h-3 w-3" />
          </button>
          <button className="grid h-5 w-5 place-items-center rounded hover:bg-bg-2 hover:text-fg">
            <MagnifyingGlass className="h-3 w-3" />
          </button>
        </div>
      </div>

      <ScrollArea className="mt-1 min-h-0 flex-1">
        <div className="flex flex-col gap-0.5 px-2 py-1">
          {threads.map((t) => {
            const active = t.id === activeThreadId;
            return (
              <button
                key={t.id}
                onClick={() => setActiveThread(t.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-sm transition',
                  active ? 'bg-bg-2 text-fg' : 'text-fg-muted hover:bg-bg-1 hover:text-fg',
                )}
              >
                {t.pinned ? (
                  <PushPin className="h-3.5 w-3.5 shrink-0 text-fg-muted" weight="fill" />
                ) : (
                  <Chats className="h-3.5 w-3.5 shrink-0 text-fg-dim" weight="fill" />
                )}
                <span className="truncate">{t.title}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-line p-3">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm text-fg-muted transition hover:bg-bg-2 hover:text-fg"
        >
          <GearSix className="h-4 w-4" weight="fill" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
