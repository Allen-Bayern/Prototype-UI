import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDefaultWebMetaGetter, resolveWebColorScheme } from '../src';

function setSystemPreferences({
  dark = false,
  reducedMotion = false,
}: {
  dark?: boolean;
  reducedMotion?: boolean;
} = {}): void {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
    const matches =
      query === '(prefers-color-scheme: dark)'
        ? dark
        : query === '(prefers-reduced-motion: reduce)'
          ? reducedMotion
          : false;

    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

afterEach(() => {
  document.documentElement.classList.remove('dark', 'light');
  delete document.documentElement.dataset.theme;
  vi.restoreAllMocks();
});

describe('default Web environment preferences', () => {
  it('follows the system color scheme when the host has no explicit theme', () => {
    setSystemPreferences({ dark: true });

    expect(resolveWebColorScheme()).toBe('dark');
    expect(createDefaultWebMetaGetter()('colorScheme')).toBe('dark');
  });

  it('lets an explicit light host theme override a dark system preference', () => {
    setSystemPreferences({ dark: true });
    document.documentElement.dataset.theme = 'light';

    expect(resolveWebColorScheme()).toBe('light');
  });

  it('lets an explicit dark host theme override a light system preference', () => {
    setSystemPreferences({ dark: false });
    document.documentElement.classList.add('dark');

    expect(resolveWebColorScheme()).toBe('dark');
  });

  it('keeps reduced motion tied to the system preference', () => {
    setSystemPreferences({ reducedMotion: true });

    expect(createDefaultWebMetaGetter()('reducedMotion')).toBe('reduce');
  });
});
