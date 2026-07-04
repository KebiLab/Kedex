import { useState } from 'react';
import { Paperclip, Square, Microphone, PaperPlaneTilt } from '@phosphor-icons/react';
import { useApp } from '@/store/app';
import { cn, uid } from '@/lib/utils';
import type { AgentMode } from '@shared/ipc';

const MODE_LABEL: Record<AgentMode, string> = {
  plan: 'Plan',
  goal: 'Goal',
  ask: 'Ask',
};

export function PromptArea() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<AgentMode>('plan');
  const addMessage = useApp((s) => s.addMessage);
  const activeThreadId = useApp((s) => s.activeThreadId);
  const setStreaming = useApp((s) => s.setStreaming);
  const isStreaming = useApp((s) => s.isStreaming);
  const appendStream = useApp((s) => s.appendStream);
  const finishStream = useApp((s) => s.finishStream);
  const activeModel = useApp((s) => s.activeModel);
  const activeProviderId = useApp((s) => s.activeProviderId);
  const providers = useApp((s) => s.providers);
  const setActiveProvider = useApp((s) => s.setActiveProvider);

  const submit = () => {
    const value = text.trim();
    if (!value || !activeThreadId) return;
    addMessage(activeThreadId, {
      id: uid('m'),
      role: 'user',
      content: value,
      createdAt: Date.now(),
    });
    setText('');
    setStreaming(true);
    const demo =
      "Got it. I'll start by mapping the current schema, then propose a migration that adds `workspace_id` to every table and rewrites the RLS policies to scope by it.";
    let i = 0;
    const tick = () => {
      i += 4;
      appendStream(demo.slice(0, i));
      if (i < demo.length) requestAnimationFrame(tick);
      else finishStream();
    };
    requestAnimationFrame(tick);
  };

  return (
    <div className="px-6 pb-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-line bg-bg-1 shadow-soft transition focus-within:border-fg/20 focus-within:shadow-pop">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder="Ask Codex Anything…"
            rows={1}
            className="block max-h-[200px] w-full resize-none bg-transparent px-5 pt-4 pb-2 text-sm leading-6 text-fg placeholder:text-fg-dim focus:outline-none"
          />
          <div className="flex items-center gap-1.5 px-3 pb-3">
            <button
              className="grid h-7 w-7 place-items-center rounded-lg text-fg-muted transition hover:bg-bg-2 hover:text-fg"
              aria-label="Attach"
            >
              <Paperclip className="h-4 w-4" weight="bold" />
            </button>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as AgentMode)}
              className="flex h-7 items-center gap-1 rounded-md border border-line bg-bg-2 px-2.5 text-xs text-fg transition hover:border-line-strong focus:outline-none"
            >
              {(Object.keys(MODE_LABEL) as AgentMode[]).map((m) => (
                <option key={m} value={m} className="bg-bg-1 text-fg">
                  {MODE_LABEL[m]}
                </option>
              ))}
            </select>

            <select
              value={activeProviderId ?? ''}
              onChange={(e) =>
                setActiveProvider(e.target.value as never, activeModel)
              }
              className="flex h-7 items-center gap-1 rounded-md border border-line bg-bg-2 px-2.5 text-xs text-fg transition hover:border-line-strong focus:outline-none"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id} className="bg-bg-1 text-fg">
                  {activeModel} · {p.label}
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                className="grid h-7 w-7 place-items-center rounded-lg text-fg-muted transition hover:bg-bg-2 hover:text-fg"
                aria-label="Voice"
                title="Hold to dictate"
              >
                <Microphone className="h-4 w-4" weight="fill" />
              </button>
              {isStreaming ? (
                <button
                  onClick={finishStream}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-fg text-bg-0 transition hover:bg-fg/90"
                  aria-label="Stop"
                >
                  <Square className="h-3 w-3" weight="fill" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!text.trim()}
                  className={cn(
                    'grid h-7 w-7 place-items-center rounded-lg transition',
                    text.trim()
                      ? 'bg-fg text-bg-0 hover:bg-fg/90'
                      : 'bg-bg-2 text-fg-dim',
                  )}
                  aria-label="Send"
                >
                  <PaperPlaneTilt className="h-3.5 w-3.5" weight="fill" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
