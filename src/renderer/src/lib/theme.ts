export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'kedex.theme';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

export function storeTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Apply theme to <html> element. Returns the resolved ('light' | 'dark'). */
export function applyTheme(theme: Theme): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark';
  const root = document.documentElement;
  const resolved = theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.dataset.theme = theme;
  return resolved;
}

export function watchSystemTheme(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => onChange();
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
