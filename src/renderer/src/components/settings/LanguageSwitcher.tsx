import type { Locale } from '@shared/ipc';
import { LOCALES } from '@/lib/i18n';

interface Props {
  value: Locale;
  onChange: (l: Locale) => void;
  compact?: boolean;
}

export function LanguageSwitcher({ value, onChange, compact }: Props) {
  if (compact) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Locale)}
        className="h-7 rounded-md border border-line bg-bg-2 px-2 text-xs text-fg focus:outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l.id} value={l.id} className="bg-bg-1 text-fg">
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {LOCALES.map((l) => {
        const active = value === l.id;
        return (
          <button
            key={l.id}
            onClick={() => onChange(l.id)}
            className={
              'flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ' +
              (active
                ? 'border-fg/40 bg-bg-1 text-fg'
                : 'border-line bg-bg-0 text-fg-muted hover:border-line-strong hover:text-fg')
            }
          >
            <span className="text-xl">{l.flag}</span>
            <span>{l.label}</span>
            <span className="ml-auto font-mono text-2xs text-fg-dim">{l.id.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
