import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { ChatStream } from '@/components/chat/ChatStream';
import { PromptArea } from '@/components/chat/PromptArea';
import { PlanViewer, buildSamplePlan } from '@/components/plan/PlanViewer';
import { DiffViewer } from '@/components/diff/DiffViewer';
import { Toaster } from '@/components/Toaster';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { BrowserView } from '@/components/browser/BrowserView';
import { ApprovalBar } from '@/components/ApprovalBar';
import { useIpcEvents } from '@/hooks/useIpcEvents';
import { useApp } from '@/store/app';
import { LayoutGrid, GitCompare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Center = 'chat' | 'plan' | 'diff';

export function App() {
  useIpcEvents();
  const [center, setCenter] = useState<Center>('chat');
  const [plan, setPlan] = useState(() => buildSamplePlan());
  const upsertPlan = useApp((s) => s.upsertPlan);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-0 text-fg">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <ApprovalBar />
        <CenterSwitch center={center} setCenter={setCenter} />
        <div className="flex min-h-0 flex-1 flex-col">
          <AnimatePresence mode="wait">
            {center === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <ChatStream />
                <PromptArea />
              </motion.div>
            )}
            {center === 'plan' && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="min-h-0 flex-1 overflow-y-auto p-4"
              >
                <div className="mx-auto w-full max-w-3xl">
                  <PlanViewer
                    plan={plan}
                    onChange={setPlan}
                    onApprove={() => {
                      upsertPlan(plan);
                      setCenter('plan');
                    }}
                    onReject={() => setCenter('chat')}
                    onAddStep={() =>
                      setPlan({
                        ...plan,
                        steps: [
                          ...plan.steps,
                          {
                            id: `s_${Math.random().toString(36).slice(2, 8)}`,
                            title: 'New step',
                            status: 'pending',
                            priority: 1,
                            dependsOn: [],
                          },
                        ],
                      })
                    }
                  />
                </div>
              </motion.div>
            )}
            {center === 'diff' && (
              <motion.div
                key="diff"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="min-h-0 flex-1 p-4"
              >
                <div className="mx-auto h-full max-w-4xl">
                  <DiffViewer />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <SettingsModal />
      <BrowserView />
      <Toaster />
    </div>
  );
}

function CenterSwitch({ center, setCenter }: { center: Center; setCenter: (c: Center) => void }) {
  const items: { id: Center; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'plan', label: 'Plan', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
    { id: 'diff', label: 'Diff', icon: <GitCompare className="h-3.5 w-3.5" /> },
  ];
  return (
    <div className="flex items-center gap-1 border-b border-line bg-bg-0/40 px-3 py-1.5">
      {items.map((it) => {
        const active = it.id === center;
        return (
          <button
            key={it.id}
            onClick={() => setCenter(it.id)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition',
              active ? 'text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {active && (
              <motion.span
                layoutId="center-active"
                className="absolute inset-0 -z-0 rounded-md bg-bg-2 shadow-soft"
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {it.icon}
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
