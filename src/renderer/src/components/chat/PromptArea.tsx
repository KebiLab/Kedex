import { useState } from 'react';
import { Paperclip, Square, Microphone, PaperPlaneTilt } from '@phosphor-icons/react';
import { useApp } from '@/store/app';
import { cn, uid } from '@/lib/utils';
import type { AgentMode, ProviderConfig } from '@shared/ipc';
import { ModeMenu } from './ModeMenu';
import { ModelMenu } from './ModelMenu';

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

  const liteProviders: { id: ProviderConfig['id']; label: string; defaultModel: string }[] =
    providers.map((p) => ({ id: p.id, label: p.label, defaultModel: p.defaultModel }));

  return (
    <div className="px-6 pb-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-line bg-bg-1 shadow-soft transition focus-within:border-fg/20 focus-within:shadow-pop">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder="Ask Codex Anything…"
            rows={2}
            className="block max-h-[280px] min-h-[80px] w-full resize-none bg-transparent px-6 pt-5 pb-3 text-[15px] leading-7 text-fg placeholder:text-fg-dim focus:outline-none"
          />
          <div className="flex items-center gap-1.5 px-3 pb-3">
            <button
              className="grid h-8 w-8 place-items-center rounded-lg text-fg-muted transition hover:bg-bg-2 hover:text-fg"
              aria-label="Attach"
            >
              <Paperclip className="h-4 w-4" weight="bold" />
            </button>

            <ModeMenu value={mode} onChange={setMode} />

            <ModelMenu
              value={activeProviderId}
              onChange={(id) => setActiveProvider(id, activeModel)}
              providers={liteProviders}
              activeModel={activeModel}
            />

            <div className="ml-auto flex items-center gap-1.5">
              <button
                className="grid h-8 w-8 place-items-center rounded-lg text-fg-muted transition hover:bg-bg-2 hover:text-fg"
                aria-label="Voice"
                title="Hold to dictate"
              >
                <Microphone className="h-4 w-4" weight="fill" />
              </button>
              {isStreaming ? (
                <button
                  onClick={finishStream}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-fg text-bg-0 transition hover:bg-fg/90"
                  aria-label="Stop"
                >
                  <Square className="h-3 w-3" weight="fill" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!text.trim()}
                  className={cn(
                    'grid h-8 w-8 place-items-center rounded-lg transition',
                    text.trim()
                      ? 'bg-fg text-bg-0 hover:bg-fg/90'
                      : 'bg-bg-2 text-fg-dim',
                  )}
                  aria-label="Send"
                >
                  <PaperPlaneTilt className="h-4 w-4" weight="fill" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
