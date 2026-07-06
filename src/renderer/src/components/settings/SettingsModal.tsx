import { useState, useEffect } from 'react';
import {
  PaintBrush,
  Key,
  Gear,
  Microphone,
  Terminal,
  Keyboard,
  Plugs,
  Globe,
  Cpu,
  Stack,
  GitBranch,
  GitFork,
  TreeStructure,
  BookmarkSimple,
  ArrowSquareOut,
  CaretLeft,
  CreditCard,
  type Icon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { AppearanceTab } from './AppearanceTab';
import { ProvidersTab } from './ProvidersTab';
import { GeneralTab } from './GeneralTab';
import { VoiceTab } from './VoiceTab';
import { TerminalTab } from './TerminalTab';
import { ShortcutsTab } from './ShortcutsTab';
import { McpTab } from './McpTab';
import { SkillsTab } from './SkillsTab';
import { WorktreesTab } from './WorktreesTab';
import { useApp } from '@/store/app';
import type { ProviderConfig, ProviderId } from '@shared/ipc';

type SectionId =
  | 'appearance'
  | 'providers'
  | 'general'
  | 'voice'
  | 'terminal'
  | 'shortcuts'
  | 'skills'
  | 'mcp'
  | 'browser'
  | 'computer'
  | 'hooks'
  | 'connectors'
  | 'git'
  | 'environments'
  | 'worktrees'
  | 'archive'
  | 'usage'
  | 'profile';

interface Section {
  id: SectionId;
  label: string;
  icon: Icon;
  group: 'personal' | 'integrations' | 'code' | 'archive';
}

const SECTIONS: Section[] = [
  { id: 'general', label: 'General', icon: Gear, group: 'personal' },
  { id: 'profile', label: 'Profile', icon: CreditCard, group: 'personal' },
  { id: 'appearance', label: 'Appearance', icon: PaintBrush, group: 'personal' },
  { id: 'voice', label: 'Voice', icon: Microphone, group: 'personal' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, group: 'personal' },
  { id: 'usage', label: 'Usage & billing', icon: CreditCard, group: 'personal' },
  { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard, group: 'personal' },

  { id: 'skills', label: 'Skills', icon: Stack, group: 'integrations' },
  { id: 'mcp', label: 'MCP servers', icon: Plugs, group: 'integrations' },
  { id: 'browser', label: 'Browser', icon: Globe, group: 'integrations' },
  { id: 'computer', label: 'Computer use', icon: Cpu, group: 'integrations' },

  { id: 'hooks', label: 'Hooks', icon: GitFork, group: 'code' },
  { id: 'connectors', label: 'Connectors', icon: Stack, group: 'code' },
  { id: 'git', label: 'Git', icon: GitBranch, group: 'code' },
  { id: 'environments', label: 'Environments', icon: TreeStructure, group: 'code' },
  { id: 'worktrees', label: 'Worktrees', icon: GitBranch, group: 'code' },

  { id: 'archive', label: 'Chat archive', icon: BookmarkSimple, group: 'archive' },
];

const GROUPS: { id: Section['group']; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'code', label: 'Code' },
  { id: 'archive', label: 'Archive' },
];

export function SettingsModal() {
  const open = useApp((s) => s.settingsOpen);
  const setOpen = useApp((s) => s.setSettingsOpen);
  const providers = useApp((s) => s.providers);
  const setProviders = useApp((s) => s.setProviders);
  const activeProviderId = useApp((s) => s.activeProviderId);
  const setActiveProvider = useApp((s) => s.setActiveProvider);
  const [section, setSection] = useState<SectionId>('appearance');
  const settingsSection = useApp((s) => s.settingsSection);
  useEffect(() => {
    if (open && settingsSection) {
      setSection(settingsSection as SectionId);
    }
  }, [open, settingsSection]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="m-auto flex h-[88vh] w-[min(1100px,95vw)] overflow-hidden rounded-2xl border border-line bg-bg shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left nav */}
            <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-bg-1">
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-6 w-6 place-items-center rounded-md text-fg-muted transition hover:bg-bg-2 hover:text-fg"
                  aria-label="Back to app"
                  title="Back to app"
                >
                  <CaretLeft className="h-3.5 w-3.5" weight="bold" />
                </button>
                <span className="text-sm font-medium text-fg">Settings</span>
              </div>

              <div className="border-b border-line px-3 pb-3">
                <div className="relative">
                  <input
                    placeholder="Search settings…"
                    className="h-8 w-full rounded-md border border-line bg-bg-2 px-2.5 pr-7 text-xs text-fg placeholder:text-fg-faint focus:border-line-strong focus:outline-none"
                  />
                  <Keyboard className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-faint" />
                </div>
              </div>

              <nav className="min-h-0 flex-1 overflow-y-auto py-2">
                {GROUPS.map((g) => {
                  const items = SECTIONS.filter((s) => s.group === g.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={g.id} className="mb-1">
                      <div className="px-4 py-1.5 text-2xs font-medium uppercase tracking-wider text-fg-faint">
                        {g.label}
                      </div>
                      <div className="space-y-0.5 px-2">
                        {items.map((s) => {
                          const Icon = s.icon;
                          const active = s.id === section;
                          return (
                            <button
                              key={s.id}
                              onClick={() => setSection(s.id)}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition',
                                active
                                  ? 'bg-bg-2 text-fg'
                                  : 'text-fg-muted hover:bg-bg-2 hover:text-fg',
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-4 w-4 shrink-0',
                                  active ? 'text-fg' : 'text-fg-dim',
                                )}
                                weight={active ? 'fill' : 'regular'}
                              />
                              <span className="truncate">{s.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>

              <div className="border-t border-line p-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-fg-muted transition hover:bg-bg-2 hover:text-fg"
                >
                  <ArrowSquareOut className="h-3.5 w-3.5" weight="bold" />
                  Back to app
                </button>
              </div>
            </aside>

            {/* Right content */}
            <main className="min-w-0 flex-1 overflow-y-auto bg-bg">
              <SectionView
                section={section}
                providers={providers}
                setProviders={setProviders}
                activeProviderId={activeProviderId}
                setActiveProvider={setActiveProvider}
              />
            </main>
          </div>
        </div>
      )}
    </>
  );
}

function SectionView({
  section,
  providers,
  setProviders,
  activeProviderId,
  setActiveProvider,
}: {
  section: SectionId;
  providers: ProviderConfig[];
  setProviders: (p: ProviderConfig[]) => void;
  activeProviderId: ProviderId | null;
  setActiveProvider: (id: ProviderId, model?: string) => void;
}) {
  const meta = SECTIONS.find((s) => s.id === section);

  const Header = (
    <div className="border-b border-line px-8 py-5">
      <h2 className="text-xl font-semibold tracking-tight text-fg">{meta?.label}</h2>
    </div>
  );

  const Body = (
    <div className="px-8 py-6">
      {section === 'appearance' && <AppearanceTab />}
      {section === 'providers' && (
        <ProvidersTab
          providers={providers}
          activeProviderId={activeProviderId}
          onActivate={(id) => setActiveProvider(id)}
          onSave={(p: ProviderConfig) =>
            setProviders(providers.map((x) => (x.id === p.id ? { ...x, ...p } : x)))
          }
          onRemove={(id: ProviderId) => setProviders(providers.filter((p) => p.id !== id))}
        />
      )}
      {section === 'general' && <GeneralTab />}
      {section === 'voice' && <VoiceTab />}
      {section === 'terminal' && <TerminalTab />}
      {section === 'shortcuts' && <ShortcutsTab />}
      {section === 'mcp' && <McpTab />}
      {section === 'skills' && <SkillsTab />}
      {section === 'worktrees' && <WorktreesTab />}
      {(section === 'browser' ||
        section === 'computer' ||
        section === 'hooks' ||
        section === 'connectors' ||
        section === 'git' ||
        section === 'environments' ||
        section === 'archive' ||
        section === 'usage' ||
        section === 'profile') && <Placeholder label={meta?.label ?? 'Section'} />}
    </div>
  );

  return (
    <>
      {Header}
      {Body}
    </>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line py-16">
      <div className="text-center">
        <div className="text-sm text-fg-muted">{label}</div>
        <p className="mt-1 text-2xs text-fg-dim">Coming soon.</p>
      </div>
    </div>
  );
}
