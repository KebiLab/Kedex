import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Key, Settings2, Mic, Terminal, Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from '@/components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ProvidersTab } from './ProvidersTab';
import { GeneralTab } from './GeneralTab';
import { useApp } from '@/store/app';
import type { ProviderConfig, ProviderId } from '@shared/ipc';

export function SettingsModal() {
  const open = useApp((s) => s.settingsOpen);
  const setOpen = useApp((s) => s.setSettingsOpen);
  const providers = useApp((s) => s.providers);
  const setProviders = useApp((s) => s.setProviders);
  const activeProviderId = useApp((s) => s.activeProviderId);
  const setActiveProvider = useApp((s) => s.setActiveProvider);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <DialogContent size="xl" className="overflow-hidden">
            <DialogHeader>
              <div className="flex items-center gap-2 text-2xs text-fg-faint">
                <Sparkles className="h-3 w-3 text-accent-400" />
                Kedex configuration
              </div>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage providers, defaults and how the agent works on your machine.
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="p-0">
              <Tabs defaultValue="providers" className="flex flex-col">
                <div className="flex items-center justify-between border-b border-line bg-bg-0/60 px-5 py-3">
                  <TabsList>
                    <TabsTrigger value="providers">
                      <Key className="h-3.5 w-3.5" /> Providers
                    </TabsTrigger>
                    <TabsTrigger value="general">
                      <Settings2 className="h-3.5 w-3.5" /> General
                    </TabsTrigger>
                    <TabsTrigger value="voice">
                      <Mic className="h-3.5 w-3.5" /> Voice
                    </TabsTrigger>
                    <TabsTrigger value="terminal">
                      <Terminal className="h-3.5 w-3.5" /> Terminal
                    </TabsTrigger>
                    <TabsTrigger value="shortcuts">
                      <Keyboard className="h-3.5 w-3.5" /> Shortcuts
                    </TabsTrigger>
                  </TabsList>
                  <div className="hidden items-center gap-2 text-2xs text-fg-faint md:flex">
                    <span>Press</span>
                    <span className="kbd">⌘</span>
                    <span className="kbd">,</span>
                    <span>to open settings</span>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
                  <TabsContent value="providers" className="mt-0">
                    <ProvidersTab
                      providers={providers}
                      activeProviderId={activeProviderId}
                      onActivate={(id) => setActiveProvider(id)}
                      onSave={(p: ProviderConfig) =>
                        setProviders(
                          providers.map((x) => (x.id === p.id ? { ...x, ...p } : x)),
                        )
                      }
                      onRemove={(id: ProviderId) =>
                        setProviders(providers.filter((p) => p.id !== id))
                      }
                    />
                  </TabsContent>
                  <TabsContent value="general" className="mt-0">
                    <GeneralTab />
                  </TabsContent>
                  <TabsContent value="voice" className="mt-0">
                    <VoiceTab />
                  </TabsContent>
                  <TabsContent value="terminal" className="mt-0">
                    <TerminalTab />
                  </TabsContent>
                  <TabsContent value="shortcuts" className="mt-0">
                    <ShortcutsTab />
                  </TabsContent>
                </div>
              </Tabs>
            </DialogBody>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

function VoiceTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Transcription provider">
        <Choice
          options={[
            { id: 'whisper', label: 'OpenAI Whisper', desc: 'Best quality, requires an API key.' },
            { id: 'local', label: 'Local Whisper.cpp', desc: 'Runs on-device, slower.' },
            { id: 'ollama', label: 'Ollama (Whisper model)', desc: 'Connects to local Ollama instance.' },
          ]}
        />
      </Panel>
      <Panel title="Push-to-talk">
        <div className="rounded-lg border border-dashed border-line bg-bg-2/40 p-4 text-center">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-accent-500/15 text-accent-400">
            <Mic className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-fg">Hold to record</div>
          <div className="mt-1 text-2xs text-fg-faint">Click the mic icon in the prompt area</div>
        </div>
      </Panel>
    </div>
  );
}

function TerminalTab() {
  return (
    <Panel title="Shell defaults">
      <Row label="Shell" value="zsh · /bin/zsh" />
      <Row label="Working directory" value="Use active workspace" />
      <Row label="Environment" value="Inherit from Electron" />
      <Row label="PTY columns × rows" value="120 × 30" />
    </Panel>
  );
}

function ShortcutsTab() {
  const groups: { title: string; items: { keys: string[]; label: string }[] }[] = [
    {
      title: 'Global',
      items: [
        { keys: ['⌘', ','], label: 'Open settings' },
        { keys: ['⌘', 'K'], label: 'Quick switcher' },
        { keys: ['⌘', '⇧', 'P'], label: 'Command palette' },
      ],
    },
    {
      title: 'Agent',
      items: [
        { keys: ['⌘', '⏎'], label: 'Run agent' },
        { keys: ['⌘', '.'], label: 'Cancel run' },
        { keys: ['⌘', 'M'], label: 'Toggle voice input' },
      ],
    },
    {
      title: 'Editor',
      items: [
        { keys: ['⌘', 'S'], label: 'Save file' },
        { keys: ['⌘', 'D'], label: 'Toggle diff' },
        { keys: ['⌘', 'B'], label: 'Toggle sidebar' },
      ],
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {groups.map((g) => (
        <Panel key={g.title} title={g.title}>
          <div className="space-y-1.5">
            {g.items.map((it) => (
              <div
                key={it.label}
                className="flex items-center justify-between rounded-md border border-line bg-bg-2/40 px-2.5 py-1.5"
              >
                <span className="text-xs text-fg">{it.label}</span>
                <div className="flex items-center gap-1">
                  {it.keys.map((k) => (
                    <span key={k} className="kbd">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-bg-1/60 p-4">
      <div className="mb-3 text-sm font-semibold text-fg">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-bg-2/40 px-3 py-2">
      <span className="text-xs text-fg-muted">{label}</span>
      <span className="font-mono text-2xs text-fg">{value}</span>
    </div>
  );
}

function Choice({ options }: { options: { id: string; label: string; desc: string }[] }) {
  const [active, setActive] = useState(options[0].id);
  return (
    <div className="grid gap-2">
      {options.map((o) => {
        const sel = o.id === active;
        return (
          <button
            key={o.id}
            onClick={() => setActive(o.id)}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition ${
              sel ? 'border-accent-500/40 bg-accent-500/5' : 'border-line bg-bg-2/40 hover:border-line-strong'
            }`}
          >
            <span
              className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                sel ? 'border-accent-500 bg-accent-500' : 'border-line-strong'
              }`}
            >
              {sel && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <div>
              <div className="text-xs font-medium text-fg">{o.label}</div>
              <div className="text-2xs text-fg-faint">{o.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
