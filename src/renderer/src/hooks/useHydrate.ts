import { useEffect } from 'react';
import { useApp } from '@/store/app';
import { applyTheme, storeTheme } from '@/lib/theme';
import type { AppSettings } from '@shared/ipc';

/**
 * Loads real settings from main process on first render, applies theme
 * to <html>, and seeds providers/workspace/worktrees lists.
 */
export function useHydrate() {
  const setSettings = useApp((s) => s.setSettings);
  const setProviders = useApp((s) => s.setProviders);
  const setWorktrees = useApp((s) => s.setWorktrees);
  const setHydrated = useApp((s) => s.setHydrated);
  const pushToast = useApp((s) => s.pushToast);
  const isHydrated = useApp((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated) return;
    let cancelled = false;
    (async () => {
      try {
        const settings = (await window.kedex.invoke<AppSettings>({ type: 'settings/get' })) as AppSettings;
        if (cancelled) return;
        setSettings(settings);
        applyTheme(settings.theme);
        storeTheme(settings.theme);

        const providers = (await window.kedex.invoke({ type: 'providers/list' })) as any[];
        if (cancelled) return;
        setProviders(providers);

        const wt = (await window.kedex.invoke({ type: 'worktree/list', payload: {} })) as any[];
        if (cancelled) return;
        setWorktrees(wt);
      } catch (err) {
        pushToast({ tone: 'error', text: `Hydration failed: ${(err as Error).message}` });
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, setSettings, setProviders, setWorktrees, setHydrated, pushToast]);
}
