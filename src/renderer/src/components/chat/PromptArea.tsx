import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Square, Paperclip, AtSign, Cpu, Sparkles, ListChecks, MessageCircle } from 'lucide-react';
import { useApp } from '@/store/app';
import { Button } from '@/components/ui/Button';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { cn, uid } from '@/lib/utils';
import type { AgentMode } from '@shared/ipc';

const PLACEHOLDERS: Record<AgentMode, string> = {
  plan: 'Describe what to build — Kedex will draft a plan for approval…',
  goal: 'Define a goal. The agent will execute it autonomously…',
  ask: 'Ask anything about your codebase…',
};

export function PromptArea() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<AgentMode>('plan');
  const ref = useRef<HTMLTextAreaElement>(null);
  const addMessage = useApp((s) => s.addMessage);
  const activeThreadId = useApp((s) => s.activeThreadId);
  const setStreaming = useApp((s) => s.setStreaming);
  const isStreaming = useApp((s) => s.isStreaming);
  const appendStream = useApp((s) => s.appendStream);
  const finishStream = useApp((s) => s.finishStream);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 220) + 'px';
  }, [text]);

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
      "I'll start by inspecting the route table, then propose a Postgres schema with `users` and `sessions` tables, a RLS policy, and a TypeScript service module.";
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
    <div className="px-4 pb-4">
      <div className="mx-auto w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-line bg-bg-1/90 shadow-soft backdrop-blur-xl"
        >
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder={PLACEHOLDERS[mode]}
            rows={1}
            className="block max-h-[220px] w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-sm leading-6 text-fg placeholder:text-fg-faint focus:outline-none"
          />

          <div className="flex items-center gap-1 border-t border-line bg-bg-0/40 px-2 py-1.5">
            <ModePill mode={mode} onChange={setMode} />

            <div className="mx-1 h-4 w-px bg-line" />

            <Button variant="ghost" size="icon-sm" title="Attach file">
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" title="Reference file">
              <AtSign className="h-3.5 w-3.5" />
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1 text-2xs text-fg-faint sm:flex">
                <span className="kbd">⌘</span>
                <span className="kbd">⏎</span>
                <span>to run</span>
              </span>
              <VoiceInput
                onResult={(t) => setText((cur) => (cur ? cur + ' ' + t : t))}
              />
              {isStreaming ? (
                <Button variant="secondary" size="md" onClick={finishStream}>
                  <Square className="h-3.5 w-3.5" /> Stop
                </Button>
              ) : (
                <Button variant="primary" size="md" onClick={submit} disabled={!text.trim()}>
                  <Send className="h-3.5 w-3.5" /> Run
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-2 flex items-center justify-center gap-3 text-2xs text-fg-faint">
          <span className="inline-flex items-center gap-1">
            <Cpu className="h-3 w-3" /> Runs locally · Rust core
          </span>
          <span>·</span>
          <span>Press</span>
          <span className="kbd">⌘</span>
          <span className="kbd">M</span>
          <span>to dictate</span>
        </div>
      </div>
    </div>
  );
}

function ModePill({ mode, onChange }: { mode: AgentMode; onChange: (m: AgentMode) => void }) {
  const items: { id: AgentMode; label: string; icon: React.ReactNode; hint: string }[] = [
    { id: 'plan', label: 'Plan', icon: <ListChecks className="h-3 w-3" />, hint: 'Draft steps' },
    { id: 'goal', label: 'Goal', icon: <Sparkles className="h-3 w-3" />, hint: 'Run autonomously' },
    { id: 'ask', label: 'Ask', icon: <MessageCircle className="h-3 w-3" />, hint: 'Just answer' },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-line bg-bg-2/60 p-0.5">
      {items.map((it) => {
        const active = it.id === mode;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={cn(
              'flex items-center gap-1.5 rounded px-2 py-0.5 text-2xs font-medium transition',
              active
                ? 'bg-bg-4 text-fg shadow-soft'
                : 'text-fg-muted hover:text-fg',
            )}
            title={it.hint}
          >
            {it.icon}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
