import { PaintBrush, Translate } from '@phosphor-icons/react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useApp } from '@/store/app';

export function AppearanceTab() {
  const setSettings = useApp((s) => s.setSettings);
  const settings = useApp((s) => s.settings);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-fg">
          <PaintBrush className="h-4 w-4 text-fg-muted" weight="fill" />
          Theme
        </div>
        <p className="mb-3 text-2xs text-fg-dim">
          Choose how Kedex looks on your device. System follows your OS appearance.
        </p>
        <ThemeSwitcher />
      </div>

      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-fg">
          <Translate className="h-4 w-4 text-fg-muted" weight="fill" />
          Language
        </div>
        <p className="mb-3 text-2xs text-fg-dim">
          Interface language. Translation is applied immediately across the app.
        </p>
        <LanguageSwitcher
          value={settings.locale}
          onChange={(l) => setSettings({ locale: l })}
        />
      </div>

      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="text-sm font-medium text-fg">Accent color</div>
        <p className="mt-0.5 text-2xs text-fg-dim">Used for the logo spark and active states.</p>
        <div className="mt-3 flex items-center gap-2">
          {['#FB923C', '#F5F5F5', '#3B82F6', '#22C55E', '#A78BFA', '#EF4444'].map((c) => {
            const active = settings.accent === c;
            return (
              <button
                key={c}
                onClick={() => setSettings({ accent: c })}
                className={
                  'h-7 w-7 rounded-full border transition hover:scale-110 ' +
                  (active ? 'border-fg ring-2 ring-fg/30' : 'border-line')
                }
                style={{ background: c }}
                aria-label={`Accent ${c}`}
              />
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-bg-1 p-5">
        <div className="text-sm font-medium text-fg">Density</div>
        <p className="mt-0.5 text-2xs text-fg-dim">Controls spacing and component size across the app.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(['compact', 'default', 'comfortable'] as const).map((d) => {
            const active = settings.density === d;
            return (
              <button
                key={d}
                onClick={() => setSettings({ density: d })}
                className={
                  'rounded-lg border px-3 py-2 text-xs capitalize transition ' +
                  (active
                    ? 'border-fg/40 bg-bg-2 text-fg'
                    : 'border-line bg-bg-0 text-fg-muted hover:border-line-strong hover:text-fg')
                }
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
