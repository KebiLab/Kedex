import { Popover, PopoverContent, PopoverTrigger, CaretDown, Check } from '@/components/ui/Popover';
import type { AgentMode } from '@shared/ipc';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/useT';

interface ModeDef {
  id: AgentMode;
  labelKey: string;
  descKey: string;
}

const MODES: ModeDef[] = [
  { id: 'plan', labelKey: 'mode.plan', descKey: 'mode.planDesc' },
  { id: 'goal', labelKey: 'mode.goal', descKey: 'mode.goalDesc' },
  { id: 'ask', labelKey: 'mode.ask', descKey: 'mode.askDesc' },
  { id: 'build', labelKey: 'mode.build', descKey: 'mode.buildDesc' },
];

interface Props {
  value: AgentMode;
  onChange: (m: AgentMode) => void;
}

export function ModeMenu({ value, onChange }: Props) {
  const t = useT();
  const active = MODES.find((m) => m.id === value) ?? MODES[0];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'group inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-bg-2 px-3 text-sm font-semibold transition',
            'hover:border-line-strong hover:bg-bg-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/20',
          )}
        >
          <span className="text-accent-warm">{t(active.labelKey)}</span>
          <CaretDown className="ml-0.5 h-3 w-3 text-fg-dim transition group-data-[state=open]:rotate-180" weight="bold" />
        </button>
      </PopoverTrigger>
      <PopoverContent width={280} align="start">
        <div className="px-2.5 pb-1.5 pt-1.5 text-2xs font-medium uppercase tracking-wider text-fg-dim">
          {t('plan.title')}
        </div>
        {MODES.map((m) => {
          const selected = m.id === value;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={cn(
                'flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition',
                selected ? 'bg-bg-2' : 'hover:bg-bg-2',
              )}
            >
              <Check
                className={cn(
                  'mt-0.5 h-3.5 w-3.5 shrink-0',
                  selected ? 'text-accent-warm' : 'text-transparent',
                )}
                weight="bold"
              />
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    'text-sm font-semibold',
                    selected ? 'text-accent-warm' : 'text-fg',
                  )}
                >
                  {t(m.labelKey)}
                </div>
                <div className="mt-0.5 text-2xs text-fg-dim">{t(m.descKey)}</div>
              </div>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
