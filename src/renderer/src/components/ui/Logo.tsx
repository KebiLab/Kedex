import * as React from 'react';
import { cn } from '@/lib/utils';

interface MarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function LogoMark({ size = 30, className, ...rest }: MarkProps) {
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
          <stop offset="0" stopColor="#1A1A1D" />
          <stop offset="1" stopColor="#0F0F10" />
        </linearGradient>
        <linearGradient id={`ring-${size}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>
        <linearGradient id={`spark-${size}`} x1="32" y1="10" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FB923C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#bg-${size})`} />
      <rect x="2" y="2" width="60" height="60" rx="18" stroke={`url(#ring-${size})`} strokeWidth="1.2" />
      <path
        d="M32 12 L 35 29 L 52 32 L 35 35 L 32 52 L 29 35 L 12 32 L 29 29 Z"
        fill={`url(#spark-${size})`}
      />
      <circle cx="32" cy="32" r="3.6" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="1.6" fill="#F97316" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={30} />
      <span className="text-base font-semibold tracking-tight text-fg">Kedex</span>
    </div>
  );
}
