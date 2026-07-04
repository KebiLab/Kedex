import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StatusDot({
  tone = 'idle',
  className,
}: {
  tone?: 'idle' | 'running' | 'success' | 'error' | 'pending';
  className?: string;
}) {
  const colors: Record<string, string> = {
    idle: 'bg-fg-faint',
    running: 'bg-accent-500',
    success: 'bg-success',
    error: 'bg-danger',
    pending: 'bg-warn',
  };
  return (
    <span className={cn('relative inline-flex h-2 w-2', className)}>
      {tone === 'running' && (
        <motion.span
          className="absolute inset-0 rounded-full bg-accent-500/60"
          animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <span className={cn('relative h-2 w-2 rounded-full', colors[tone])} />
    </span>
  );
}
