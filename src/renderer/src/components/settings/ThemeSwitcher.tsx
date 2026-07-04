import { Sun, Moon, Monitor, type Icon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import {
  applyTheme,
  getStoredTheme,
  storeTheme,
  watchSystemTheme,
  type Theme,
} from '@/lib/theme';
import { cn } from '@/lib/utils';

const OPTIONS: { id: Theme; label: string; icon: Icon }[] = [
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
];

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    storeTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    return watchSystemTheme(() => applyTheme('system'));
  }, [theme]);

  if (compact) {
    return (
      <div className="inline-flex items-center rounded-lg border border-line bg-bg-1 p-0.5">
        {OPTIONS.map((o) => {
          const Ico = o.icon;
          const active = theme === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setTheme(o.id)}
              className={cn(
                'grid h-7 w-7 place-items-center rounded-md text-fg-muted transition',
                active ? 'bg-bg-2 text-fg' : 'hover:text-fg',
              )}
              title={o.label}
              aria-label={o.label}
            >
              <Ico className="h-3.5 w-3.5" weight={active ? 'fill' : 'regular'} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((o) => {
        const Ico = o.icon;
        const active = theme === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs transition',
              active
                ? 'border-fg/40 bg-bg-1 text-fg'
                : 'border-line bg-bg-0 text-fg-muted hover:border-line-strong hover:text-fg',
            )}
          >
            <Ico className="h-4 w-4" weight={active ? 'fill' : 'regular'} />
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
