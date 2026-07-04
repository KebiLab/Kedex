import { useEffect, useState } from 'react';

export type Platform = 'mac' | 'win' | 'linux';

export interface KbdMeta {
  mod: string; // ⌘ on mac, Ctrl on win/linux
  alt: string; // ⌥ on mac, Alt on win/linux
  shift: string; // ⇧
  enter: string; // Return
  backspace: string; // Del
}

const META: Record<Platform, KbdMeta> = {
  mac: { mod: '⌘', alt: '⌥', shift: '⇧', enter: 'Return', backspace: 'Del' },
  win: { mod: 'Ctrl', alt: 'Alt', shift: 'Shift', enter: 'Enter', backspace: 'Backspace' },
  linux: { mod: 'Ctrl', alt: 'Alt', shift: 'Shift', enter: 'Enter', backspace: 'Backspace' },
};

let cachedPlatform: Platform | null = null;

export function detectPlatform(): Platform {
  if (cachedPlatform) return cachedPlatform;
  const nav =
    typeof navigator !== 'undefined'
      ? (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
        navigator.platform ||
        ''
      : '';
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/Mac|iPhone|iPad/i.test(nav) || /Mac/i.test(ua)) cachedPlatform = 'mac';
  else if (/Win/i.test(nav) || /Windows/i.test(ua)) cachedPlatform = 'win';
  else cachedPlatform = 'linux';
  return cachedPlatform;
}

export function usePlatform(): Platform {
  const [p, setP] = useState<Platform>('mac');
  useEffect(() => {
    setP(detectPlatform());
  }, []);
  return p;
}

export function useKbd(): KbdMeta {
  return META[usePlatform()];
}

export function isMac(): boolean {
  return detectPlatform() === 'mac';
}
