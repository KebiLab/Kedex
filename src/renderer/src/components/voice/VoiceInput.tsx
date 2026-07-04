import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microphone, Stop, CircleNotch } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'recording' | 'transcribing' | 'error';

interface Props {
  onResult: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onResult, className }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<number | null>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  const start = async () => {
    if (status !== 'idle') return;
    setStatus('recording');
    startedAt.current = Date.now();
    setElapsed(0);
    timer.current = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)),
      250,
    );
  };

  const stop = async () => {
    if (status !== 'recording') return;
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setStatus('transcribing');
    setTimeout(() => {
      onResult('Add a settings modal with provider list and API key inputs.');
      setStatus('idle');
      setElapsed(0);
    }, 900);
  };

  const Icon =
    status === 'transcribing' ? CircleNotch : status === 'recording' ? Stop : Microphone;

  return (
    <div className={cn('relative flex items-center', className)}>
      <AnimatePresence>
        {status === 'recording' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 'auto' }}
            exit={{ opacity: 0, scale: 0.9, width: 0 }}
            className="mr-1 flex items-center gap-2 overflow-hidden rounded-full border border-danger/30 bg-danger/10 px-2.5 py-1 text-2xs text-danger"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-danger/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-danger" />
            </span>
            <span className="font-mono tabular-nums">
              {String(Math.floor(elapsed / 60)).padStart(2, '0')}:
              {String(elapsed % 60).padStart(2, '0')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onMouseDown={start}
        onMouseUp={stop}
        onMouseLeave={() => status === 'recording' && stop()}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            stop();
          }
        }}
        className={cn(
          'group relative grid h-9 w-9 place-items-center rounded-xl border transition active:scale-95',
          status === 'idle' && 'border-line bg-bg-2 text-fg-muted hover:border-line-strong hover:text-fg',
          status === 'recording' && 'border-danger/50 bg-danger/15 text-danger shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
          status === 'transcribing' && 'border-accent-500/50 bg-accent-500/10 text-accent-400',
        )}
        aria-label="Hold to record"
      >
        <Icon
          className={cn(
            'h-4 w-4',
            status === 'transcribing' && 'animate-spin',
          )}
          weight={status === 'recording' ? 'fill' : 'bold'}
        />
      </button>
    </div>
  );
}
