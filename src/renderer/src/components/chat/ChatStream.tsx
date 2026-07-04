import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '@/store/app';
import { StatusDot } from '@/components/ui/StatusDot';
import { cn } from '@/lib/utils';
import { Markdown } from './Markdown';

export function ChatStream() {
  const activeThreadId = useApp((s) => s.activeThreadId);
  const messages = useApp((s) => s.messages);
  const streamBuffer = useApp((s) => s.streamBuffer);
  const isStreaming = useApp((s) => s.isStreaming);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamBuffer, activeThreadId]);

  const list = (activeThreadId ? messages[activeThreadId] : undefined) ?? [];
  const showStreaming = isStreaming && streamBuffer.length > 0;

  return (
    <div ref={ref} className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        {list.length === 0 && (
          <EmptyState />
        )}

        {list.map((m, i) => (
          <Bubble key={m.id} role={m.role} index={i}>
            {m.toolName ? (
              <ToolBubble name={m.toolName} args={m.toolArgs} result={m.toolResult} />
            ) : (
              <Markdown content={m.content} />
            )}
          </Bubble>
        ))}

        <AnimatePresence>
          {showStreaming && (
            <Bubble role="assistant" index={list.length} streaming>
              <Markdown content={streamBuffer} streaming />
            </Bubble>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 grid place-items-center text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 shadow-glow">
        <Bot className="h-5 w-5 text-white" />
      </div>
      <h2 className="text-balance text-lg font-semibold text-fg">Start a new thread</h2>
      <p className="mt-1 max-w-sm text-balance text-sm text-fg-muted">
        Tell Kedex what to build. It will draft a plan, you approve the steps, then it executes — with your approval on every shell command.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          'Add a Postgres users table with RLS',
          'Refactor the auth middleware to use async/await',
          'Write tests for the diff parser',
          'Set up CI on GitHub Actions',
        ].map((s) => (
          <button
            key={s}
            className="rounded-lg border border-line bg-bg-1/60 px-3 py-2 text-left text-xs text-fg-muted transition hover:border-line-strong hover:text-fg"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({
  role,
  children,
  index,
  streaming,
}: {
  role: 'user' | 'assistant' | 'tool' | 'system';
  children: React.ReactNode;
  index: number;
  streaming?: boolean;
}) {
  const isUser = role === 'user';
  const isTool = role === 'tool';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-fg-muted',
          isUser
            ? 'border-line bg-bg-2'
            : isTool
              ? 'border-warn/30 bg-warn/10 text-warn'
              : 'border-accent-500/30 bg-accent-500/10 text-accent-400',
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : isTool ? <Wrench className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className={cn('min-w-0 flex-1', isUser && 'flex justify-end')}>
        <div
          className={cn(
            'inline-block max-w-full rounded-2xl border px-4 py-2.5 text-sm leading-6 shadow-soft',
            isUser
              ? 'border-line bg-bg-3 text-fg'
              : isTool
                ? 'border-warn/30 bg-warn/5 text-fg'
                : 'border-line bg-bg-1/80 text-fg backdrop-blur',
          )}
        >
          {children}
          {streaming && (
            <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse-dot rounded-sm bg-accent-400 align-middle" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ToolBubble({ name, args, result }: { name: string; args?: unknown; result?: unknown }) {
  const ok = !(result && typeof result === 'object' && (result as { error?: string }).error);
  return (
    <div className="flex items-center gap-2 text-2xs text-fg-muted">
      {ok ? <CheckCircle2 className="h-3 w-3 text-success" /> : <AlertCircle className="h-3 w-3 text-danger" />}
      <span className="font-mono text-fg">{name}</span>
      <span className="text-fg-faint">·</span>
      <span className="text-fg-faint">{args ? JSON.stringify(args).slice(0, 60) : ''}</span>
      <StatusDot tone={ok ? 'success' : 'error'} />
    </div>
  );
}
