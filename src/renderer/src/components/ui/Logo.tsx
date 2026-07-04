import * as React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative h-7 w-7 overflow-hidden rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_50%)]" />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-white">
          K
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight text-fg">Kedex</span>
        <span className="text-2xs text-fg-faint">v0.1 · kebilab</span>
      </div>
    </div>
  );
}
