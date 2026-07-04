import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/store/app';
import { Markdown } from './Markdown';
import { LogoMark } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

export function ChatStream() {
  const activeThreadId = useApp((s) => s.activeThreadId);
  const messages = useApp((s) => s.messages);
  const streamBuffer = useApp((s) => s.streamBuffer);
  const isStreaming = useApp((s) => s.isStreaming);
  const ref = useRef<HTMLDivElement>(null);
  const activeProviderId = useApp((s) => s.activeProviderId);
  const activeModel = useApp((s) => s.activeModel);
  const providers = useApp((s) => s.providers);
  const setActiveProvider = useApp((s) => s.setActiveProvider);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamBuffer, activeThreadId]);

  const list = (activeThreadId ? messages[activeThreadId] : undefined) ?? [];
  const showStreaming = isStreaming && streamBuffer.length > 0;

  return (
    <div ref={ref} className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-12">
        {list.length === 0 && (
          <EmptyState
            activeModel={activeModel}
            activeProviderId={activeProviderId}
            providers={providers.map((p) => ({ id: p.id, label: p.label }))}
            onPickProvider={(id) => setActiveProvider(id as never, activeModel)}
          />
        )}

        {list.map((m) => (
          <Bubble key={m.id} role={m.role}>
            {m.toolName ? (
              <div className="text-2xs text-fg-dim">
                <span className="">{m.toolName}</span>
                {m.toolArgs ? <span className="ml-2">{JSON.stringify(m.toolArgs).slice(0, 60)}</span> : null}
              </div>
            ) : (
              <Markdown content={m.content} />
            )}
          </Bubble>
        ))}

        <AnimatePresence>
          {showStreaming && (
            <Bubble role="assistant" streaming>
              <Markdown content={streamBuffer} streaming />
            </Bubble>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({
  activeModel,
  activeProviderId,
  providers,
  onPickProvider,
}: {
  activeModel: string;
  activeProviderId: string | null;
  providers: { id: string; label: string }[];
  onPickProvider: (id: string) => void;
}) {
  const SUGGESTIONS = [
    { icon: '🎮', title: 'Build a classic Snake game in this repo.' },
    { icon: '📄', title: 'Create a one-page PDF that summarizes this app.' },
    { icon: '✏️', title: 'Create a plan to refactor the auth middleware.' },
  ];
  return (
    <div className="mt-12 flex flex-col items-center">
      <div className="animate-spark-pulse">
        <LogoMark size={48} className="text-fg" />
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-fg">Let's build</h1>
      <button
        onClick={() => {
          if (providers[0]) onPickProvider(providers[0].id);
        }}
        className="mt-1 inline-flex items-center gap-1 text-base text-fg-dim transition hover:text-fg"
      >
        <span>{activeModel}</span>
        <span>·</span>
        <span>{providers.find((p) => p.id === activeProviderId)?.label ?? 'Codex'}</span>
        <span>▾</span>
      </button>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-line bg-bg-1 p-4 text-left transition hover:border-line-strong"
          >
            <div className="text-xl">{s.icon}</div>
            <div className="text-xs text-fg-muted transition group-hover:text-fg">
              {s.title}
            </div>
          </button>
        ))}
      </div>
      <button className="mt-3 text-2xs text-fg-dim transition hover:text-fg">
        Explore more
      </button>
    </div>
  );
}

function Bubble({
  role,
  children,
  streaming,
}: {
  role: 'user' | 'assistant' | 'tool' | 'system';
  children: React.ReactNode;
  streaming?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('text-sm leading-6', 'text-fg')}
    >
      {children}
      {streaming && (
        <span className="ml-0.5 inline-block h-3 w-1 animate-pulse-dot rounded-sm bg-fg align-middle" />
      )}
    </motion.div>
  );
}
