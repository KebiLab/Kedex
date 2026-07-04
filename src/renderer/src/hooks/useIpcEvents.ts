import { useEffect, useRef } from 'react';
import { useApp } from '@/store/app';
import type { IpcEvent } from '@shared/ipc';

export function useIpcEvents() {
  const setStreaming = useApp((s) => s.setStreaming);
  const appendStream = useApp((s) => s.appendStream);
  const finishStream = useApp((s) => s.finishStream);
  const upsertPlan = useApp((s) => s.upsertPlan);
  const setPendingApproval = useApp((s) => s.setPendingApproval);
  const pushToast = useApp((s) => s.pushToast);
  const listenerRef = useRef<((e: IpcEvent) => void) | null>(null);

  useEffect(() => {
    if (!window.kedex) return;
    const handler = (e: IpcEvent) => {
      switch (e.kind) {
        case 'stream:chunk':
          setStreaming(true);
          appendStream(e.delta);
          break;
        case 'stream:done':
          finishStream();
          break;
        case 'plan:updated':
          upsertPlan(e.plan);
          break;
        case 'shell:approval':
          setPendingApproval({
            id: e.id,
            command: e.command,
            tool: 'shell',
            args: { command: e.command },
            createdAt: Date.now(),
          });
          break;
        case 'log':
          if (e.level === 'error') pushToast({ tone: 'error', text: e.message });
          break;
      }
    };
    listenerRef.current = handler;
    const off = window.kedex.onEvent(handler);
    return () => {
      off();
      listenerRef.current = null;
    };
  }, [setStreaming, appendStream, finishStream, upsertPlan, setPendingApproval, pushToast]);
}
