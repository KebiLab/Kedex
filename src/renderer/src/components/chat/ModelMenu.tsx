import { Popover, PopoverContent, PopoverTrigger, CaretDown, Check } from '@/components/ui/Popover';
import type { ProviderId } from '@shared/ipc';
import { cn } from '@/lib/utils';

interface ProviderLite {
  id: ProviderId;
  label: string;
  defaultModel: string;
}

interface Props {
  value: ProviderId | null;
  onChange: (id: ProviderId) => void;
  providers: ProviderLite[];
  activeModel: string;
}

export function ModelMenu({ value, onChange, providers, activeModel }: Props) {
  const active = providers.find((p) => p.id === value) ?? providers[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'group inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-bg-2 pl-3 pr-2.5 text-sm font-medium text-fg transition',
            'hover:border-line-strong hover:bg-bg-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/20',
          )}
        >
          <span className="truncate">{activeModel}</span>
          <span className="text-fg-dim">·</span>
          <span className="truncate text-fg-muted">{active?.label}</span>
          <CaretDown className="ml-1 h-3 w-3 text-fg-dim transition group-data-[state=open]:rotate-180" weight="bold" />
        </button>
      </PopoverTrigger>
      <PopoverContent width={320} align="start">
        <div className="px-2.5 pb-1.5 pt-1.5 text-2xs font-medium uppercase tracking-wider text-fg-dim">
          Model
        </div>
        <div className="max-h-80 overflow-y-auto">
          {providers.map((p) => {
            const selected = p.id === value;
            return (
              <button
                key={p.id}
                onClick={() => onChange(p.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition',
                  selected ? 'bg-bg-2 text-fg' : 'text-fg-muted hover:bg-bg-2 hover:text-fg',
                )}
              >
                <Check
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    selected ? 'text-fg' : 'text-transparent',
                  )}
                  weight="bold"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-fg">{p.defaultModel}</div>
                  <div className="truncate text-2xs text-fg-dim">{p.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
