import { Microphone, Cloud, Desktop, HouseSimple, type Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Option {
  id: string;
  label: string;
  description: string;
  icon: Icon;
}

const OPTIONS: Option[] = [
  { id: 'whisper', label: 'OpenAI Whisper', description: 'Best quality, requires an API key.', icon: Cloud },
  { id: 'local', label: 'Local Whisper.cpp', description: 'Runs on-device, slower.', icon: HouseSimple },
  { id: 'ollama', label: 'Ollama (Whisper)', description: 'Connects to local Ollama instance.', icon: Desktop },
];

export function VoiceTab() {
  const [active, setActive] = useState('whisper');
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="text-sm font-medium text-fg">Transcription provider</div>
        <p className="mt-0.5 text-2xs text-fg-dim">
          Where your voice recordings are sent for speech-to-text.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            const selected = o.id === active;
            return (
              <button
                key={o.id}
                onClick={() => setActive(o.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition',
                  selected
                    ? 'border-fg/40 bg-bg-2'
                    : 'border-line bg-bg-0 hover:border-line-strong',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                    selected ? 'border-fg bg-fg' : 'border-line-strong',
                  )}
                >
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-bg-0" />}
                </span>
                <Icon className="mt-0.5 h-4 w-4 text-fg-muted" weight="fill" />
                <div>
                  <div className="text-xs font-medium text-fg">{o.label}</div>
                  <div className="mt-0.5 text-2xs text-fg-dim">{o.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="text-sm font-medium text-fg">Push-to-talk</div>
        <p className="mt-0.5 text-2xs text-fg-dim">
          Hold the microphone icon in the prompt area to dictate.
        </p>
        <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-line bg-bg-0 py-6">
          <div className="text-center">
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-accent-warm/15 text-accent-warm">
              <Microphone className="h-5 w-5" weight="fill" />
            </div>
            <div className="text-sm font-medium text-fg">Hold to record</div>
          </div>
        </div>
      </div>
    </div>
  );
}
