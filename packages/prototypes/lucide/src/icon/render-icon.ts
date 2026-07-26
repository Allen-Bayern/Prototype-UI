import type { SvgRenderResult, SvgRendererHandle } from './contracts';
import { LUCIDE_ICON_REGISTRY, type LucideIconName } from './icons';
import { renderLucideShape, type RenderLucideShapeOptions } from './render';

export interface RenderLucideIconOptions extends RenderLucideShapeOptions {
  name: LucideIconName;
}

export function renderLucideIcon(
  renderer: SvgRendererHandle,
  options: RenderLucideIconOptions
): SvgRenderResult {
  const shapeFactory = LUCIDE_ICON_REGISTRY[options.name];
  return renderLucideShape(renderer, shapeFactory, options);
}
