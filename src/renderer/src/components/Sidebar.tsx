import { motion } from 'framer-motion';
import { Plus, Search, Pin, MessageSquare, Settings, Bot, Globe } from 'lucide-react';
import { useApp } from '@/store/app';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

export function Sidebar() {
  const threads = useApp((s) => s.threads);
  const activeThreadId = useApp((s) => s.activeThreadId);
  const setActiveThread = useApp((s) => s.setActiveThread);
  const newThread = useApp((s) => s.newThread);
  const setSettingsOpen = useApp((s) => s.setSettingsOpen);
  const setBrowserOpen = useApp((s) => s.setBrowserOpen);
  const workspace = useApp((s) => s.workspace);
  const activeProviderId = useApp((s) => s.activeProviderId);
  const activeModel = useApp((s) => s.activeModel);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-line bg-bg-1/60 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <Logo />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon-sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>

      <div className="px-3 pt-3">
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={() => newThread()}
        >
          <Plus className="h-4 w-4" /> New thread
        </Button>
      </div>

      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-faint" />
          <input
            placeholder="Search threads"
            className="h-8 w-full rounded-md border border-line bg-bg-2 pl-8 pr-2 text-xs text-fg placeholder:text-fg-faint focus:border-accent-500/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-4 text-2xs font-medium uppercase tracking-wider text-fg-faint">
        <span>Threads</span>
        <span className="text-fg-faint">{threads.length}</span>
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
                  'group relative flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-2 text-left transition',
                  active ? 'bg-bg-3' : 'hover:bg-bg-2',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="active-thread-rail"
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent-500"
                  />
                )}
                <div className="flex items-center gap-2">
                  {t.pinned ? (
                    <Pin className="h-3 w-3 text-accent-400" />
                  ) : (
                    <MessageSquare className="h-3 w-3 text-fg-faint" />
                  )}
                  <span
                    className={cn(
                      'truncate text-xs font-medium',
                      active ? 'text-fg' : 'text-fg-muted group-hover:text-fg',
                    )}
                  >
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-5 text-2xs text-fg-faint">
                  <span className="truncate">{t.preview || 'No messages yet'}</span>
                </div>
                <div className="flex items-center gap-2 pl-5 text-2xs text-fg-faint">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded border border-line px-1 py-px text-[9px] uppercase',
                      t.mode === 'goal' && 'border-accent-500/30 text-accent-400',
                      t.mode === 'plan' && 'border-info/30 text-info',
                      t.mode === 'ask' && 'border-fg-faint/30 text-fg-muted',
                    )}
                  >
                    {t.mode}
                  </span>
                  <span>· {formatRelativeTime(t.updatedAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-line p-3">
        <div className="rounded-xl border border-line bg-bg-2 p-3">
          <div className="flex items-center gap-2 text-2xs uppercase tracking-wider text-fg-faint">
            <Bot className="h-3 w-3" /> Active model
          </div>
          <div className="mt-2 flex items-center gap-2">
            <ProviderLogo provider={activeProviderId ?? 'custom'} size={22} />
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-fg">{activeModel}</div>
              <div className="truncate text-2xs text-fg-faint">
                {workspace?.name ?? 'No workspace'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-center"
            onClick={() => setBrowserOpen(true)}
          >
            <Globe className="h-3.5 w-3.5" /> Browser
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-center"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-3.5 w-3.5" /> Settings
          </Button>
        </div>
      </div>
    </aside>
  );
}
