import * as React from 'react';
import { cn } from '@/lib/utils';

export type ProviderTone = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'mistral' | 'ollama' | 'custom';

const toneClass: Record<ProviderTone, string> = {
  openai: 'bg-[#10A37F]/15 text-[#10A37F] border-[#10A37F]/30',
  anthropic: 'bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30',
  gemini: 'bg-[#4A8AF4]/15 text-[#4A8AF4] border-[#4A8AF4]/30',
  deepseek: 'bg-[#4D6BFE]/15 text-[#4D6BFE] border-[#4D6BFE]/30',
  mistral: 'bg-[#FF7000]/15 text-[#FF7000] border-[#FF7000]/30',
  ollama: 'bg-white/10 text-white border-white/20',
  custom: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
};

export function ProviderLogo({
  provider,
  size = 18,
  className,
}: {
  provider: ProviderTone;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-semibold uppercase',
        toneClass[provider],
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={provider}
    >
      {provider === 'openai' && 'O'}
      {provider === 'anthropic' && 'A'}
      {provider === 'gemini' && 'G'}
      {provider === 'deepseek' && 'D'}
      {provider === 'mistral' && 'M'}
      {provider === 'ollama' && 'OL'}
      {provider === 'custom' && '✦'}
    </span>
  );
}
