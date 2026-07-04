import { useKbd, type Platform } from '@/lib/platform';
import { CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Item {
  keys: string[];
  label: string;
  hint?: string;
}

function buildGroups(k: { mod: string; alt: string; shift: string; enter: string }): {
  title: string;
  items: Item[];
}[] {
  return [
    {
      title: 'Global',
      items: [
        { keys: [k.mod, ','], label: 'Open settings' },
        { keys: [k.mod, 'K'], label: 'Quick switcher' },
        { keys: [k.mod, k.shift, 'P'], label: 'Command palette' },
      ],
    },
    {
      title: 'Agent',
      items: [
        { keys: [k.mod, k.enter], label: 'Run agent' },
        { keys: [k.mod, '.'], label: 'Cancel run' },
        { keys: [k.mod, 'M'], label: 'Toggle voice input' },
      ],
    },
    {
      title: 'Editor',
      items: [
        { keys: [k.mod, 'S'], label: 'Save file' },
        { keys: [k.mod, 'D'], label: 'Toggle diff' },
        { keys: [k.mod, 'B'], label: 'Toggle sidebar' },
      ],
    },
  ];
}

export function ShortcutsTab() {
  const kbd = useKbd();
  const platform: Platform = kbd.mod === '⌘' ? 'mac' : 'win';
  const groups = buildGroups(kbd);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {groups.map((g) => (
        <div key={g.title} className="rounded-2xl border border-line bg-bg p-4">
          <div className="mb-3 text-sm font-medium text-fg">{g.title}</div>
          <div className="space-y-1.5">
            {g.items.map((it) => (
              <Row key={it.label} item={it} />
            ))}
          </div>
        </div>
      ))}
      <div className="md:col-span-3">
        <div className="flex items-center justify-between rounded-2xl border border-line bg-bg-1 px-4 py-3 text-2xs text-fg-dim">
          <span>
            Showing <span className="font-medium text-fg-muted">{platform === 'mac' ? 'macOS' : 'Windows'}</span> shortcuts.
          </span>
          <span className="inline-flex items-center gap-1">
            <span>Switch layout</span>
            <CaretRight className="h-3 w-3" weight="bold" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ item }: { item: Item }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-line bg-bg-1 px-2.5 py-1.5">
      <span className="truncate text-xs text-fg-muted">{item.label}</span>
      <div className="flex shrink-0 items-center gap-1">
        {item.keys.map((k, i) => (
          <span
            key={i}
            className={cn(
              'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-line bg-bg-2 px-1.5 font-mono text-[10px] text-fg-muted',
              k.length > 1 && 'min-w-[2rem] text-[9px]',
            )}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
