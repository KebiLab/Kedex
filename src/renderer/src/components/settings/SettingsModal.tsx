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
import { Key, Gear, Microphone, Terminal, Keyboard } from '@phosphor-icons/react';
import { ShortcutsTab } from './ShortcutsTab';

export function SettingsModal() {
  const open = useApp((s) => s.settingsOpen);
  const setOpen = useApp((s) => s.setSettingsOpen);
  const providers = useApp((s) => s.providers);
  const setProviders = useApp((s) => s.setProviders);
  const activeProviderId = useApp((s) => s.activeProviderId);
  const setActiveProvider = useApp((s) => s.setActiveProvider);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {open && (
        <DialogContent size="xl" className="overflow-hidden">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage providers, defaults and how the agent works on your machine.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-0">
            <Tabs defaultValue="providers" className="flex flex-col">
              <div className="border-b border-line px-5 py-2">
                <TabsList>
                  <TabsTrigger value="providers">
                    <Key className="h-3.5 w-3.5" weight="fill" /> Providers
                  </TabsTrigger>
                  <TabsTrigger value="general">
                    <Gear className="h-3.5 w-3.5" weight="fill" /> General
                  </TabsTrigger>
                  <TabsTrigger value="voice">
                    <Microphone className="h-3.5 w-3.5" weight="fill" /> Voice
                  </TabsTrigger>
                  <TabsTrigger value="terminal">
                    <Terminal className="h-3.5 w-3.5" weight="fill" /> Terminal
                  </TabsTrigger>
                  <TabsTrigger value="shortcuts">
                    <Keyboard className="h-3.5 w-3.5" weight="fill" /> Shortcuts
                  </TabsTrigger>
                </TabsList>
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
                  <Placeholder>Voice settings — coming soon.</Placeholder>
                </TabsContent>
                <TabsContent value="terminal" className="mt-0">
                  <Placeholder>Terminal settings — coming soon.</Placeholder>
                </TabsContent>
                <TabsContent value="shortcuts" className="mt-0">
                  <ShortcutsTab />
                </TabsContent>
              </div>
            </Tabs>
          </DialogBody>
        </DialogContent>
      )}
    </Dialog>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line py-12 text-sm text-fg-dim">
      {children}
    </div>
  );
}
