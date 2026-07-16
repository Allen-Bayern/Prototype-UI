import { describe, expect, it } from 'vitest';

import { renderProtoStyleTokenCss } from '../src/services/proto-style-css';

describe('proto style css renderer', () => {
  it('renders internal negative data selector variants', () => {
    const css = renderProtoStyleTokenCss(['data-[hovered]:not-[data-active]:bg-muted']);

    expect(css).toContain(
      ':where([data-pui-style~="data-[hovered]:not-[data-active]:bg-muted"])[data-hovered]:not([data-active])'
    );
    expect(css).toContain('background-color: var(--pui-muted);');
    expect(css).not.toContain('Unsupported Proto UI style tokens');
  });

  it('renders composable enter and exit animation utilities', () => {
    const css = renderProtoStyleTokenCss([
      'animate-in',
      'fade-in-0',
      'zoom-in-95',
      'animate-out',
      'fade-out-0',
      'zoom-out-95',
      'duration-200',
    ]);

    expect(css).toContain('@keyframes pui-enter');
    expect(css).toContain('@keyframes pui-exit');
    expect(css).toContain('animation-name: pui-enter;');
    expect(css).toContain('animation-name: pui-exit;');
    expect(css).toContain('--pui-enter-opacity: 0;');
    expect(css).toContain('--pui-exit-opacity: 0;');
    expect(css).toContain('--pui-enter-scale: 0.95;');
    expect(css).toContain('--pui-exit-scale: 0.95;');
    expect(css).toContain(
      'transform: translate(var(--pui-translate-x, 0), var(--pui-translate-y, 0)) scale(var(--pui-enter-scale, 1));'
    );
    expect(css).toContain(
      'transform: translate(var(--pui-translate-x, 0), var(--pui-translate-y, 0)) scale(var(--pui-exit-scale, 1));'
    );
    expect(css).not.toContain('scale: var(--pui-enter-scale');
    expect(css).toContain('--pui-animation-duration: 200ms;');
    expect(css).not.toContain('Unsupported Proto UI style tokens');
  });

  it('renders Hover Card positioning, popover, shadow, and directional motion utilities', () => {
    const css = renderProtoStyleTokenCss([
      'bg-popover',
      'text-popover-foreground',
      'w-64',
      'shadow-md',
      'bottom-full',
      'right-full',
      'mb-1',
      'translate-y-0',
      'slide-in-from-left-2',
      'slide-in-from-top-2',
    ]);

    expect(css).toContain('background-color: var(--pui-popover);');
    expect(css).toContain('color: var(--pui-popover-foreground);');
    expect(css).toContain('width: 16rem;');
    expect(css).toContain('bottom: 100%;');
    expect(css).toContain('right: 100%;');
    expect(css).toContain('margin-bottom: 0.25rem;');
    expect(css).toContain('--pui-shadow: 0 4px 6px -1px');
    expect(css).toContain('--pui-translate-x: -0.5rem;');
    expect(css).toContain('--pui-translate-y: -0.5rem;');
    expect(css).not.toContain('Unsupported Proto UI style tokens');
  });
});
