import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
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

type Center = 'chat' | 'plan' | 'diff';

export function App() {
  useIpcEvents();
  const [center, setCenter] = useState<Center>('chat');
  const [plan, setPlan] = useState(() => buildSamplePlan());
  const upsertPlan = useApp((s) => s.upsertPlan);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-fg">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <ApprovalBar />
        <div className="flex min-h-0 flex-1 flex-col">
          <AnimatePresence mode="wait">
            {center === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <ChatStream />
                <PromptArea />
              </motion.div>
            )}
            {center === 'plan' && (
              <motion.div
                key="plan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="min-h-0 flex-1 overflow-y-auto p-6"
              >
                <div className="mx-auto w-full max-w-2xl">
                  <PlanViewer
                    plan={plan}
                    onChange={setPlan}
                    onApprove={() => upsertPlan(plan)}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="min-h-0 flex-1"
              >
                <DiffViewer />
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
