import * as React from 'react';
import { cn } from '@/lib/utils';

interface MarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function LogoMark({ size = 28, className, ...rest }: MarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      {...rest}
    >
      <defs>
        <linearGradient id={`bg-${size}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F0F12" />
          <stop offset="1" stopColor="#0A0A0B" />
        </linearGradient>
        <linearGradient id={`stroke-${size}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="0.55" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id={`ribbonA-${size}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#C4B5FD" />
        </linearGradient>
        <linearGradient id={`ribbonB-${size}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <radialGradient id={`hl-${size}`} cx="0.32" cy="0.22" r="0.85">
          <stop offset="0" stopColor="white" stopOpacity="0.35" />
          <stop offset="0.55" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#bg-${size})`} />
      <rect x="2" y="2" width="60" height="60" rx="16" stroke={`url(#stroke-${size})`} strokeWidth="1.4" />
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#hl-${size})`} />
      <path
        d="M18 14 C 17.2 14 16.6 14.7 16.6 15.5 L 16.6 48.5 C 16.6 49.3 17.2 50 18 50 L 20.4 50 C 21.2 50 21.8 49.3 21.8 48.5 L 21.8 15.5 C 21.8 14.7 21.2 14 20.4 14 Z"
        fill={`url(#ribbonA-${size})`}
      />
      <path
        d="M21 32.4 C 20.6 32 20.6 31.4 21 31.0 L 39.0 16.6 C 39.6 16.1 40.4 16.1 41.0 16.6 L 42.6 17.9 C 43.2 18.4 43.2 19.3 42.6 19.8 L 26.8 32.5 Z"
        fill={`url(#ribbonB-${size})`}
      />
      <path
        d="M26.8 32.5 L 42.6 45.2 C 43.2 45.7 43.2 46.6 42.6 47.1 L 41.0 48.4 C 40.4 48.9 39.6 48.9 39.0 48.4 L 21 33.0 C 20.6 32.6 20.6 32.0 21 31.6 Z"
        fill={`url(#ribbonB-${size})`}
      />
      <circle cx="24" cy="32" r="1.6" fill="white" fillOpacity="0.55" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={compact ? 24 : 28} />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-fg">Kedex</span>
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-fg-faint">
            code · agent · core
          </span>
        </div>
      )}
    </div>
  );
}
