export type ShadcnDocFamily = 'base' | 'radix';

export interface ProtoUiTheoryLink {
  slug: string;
  title: {
    'zh-CN': string;
    en: string;
  };
  description: {
    'zh-CN': string;
    en: string;
  };
}

const DEFAULT_SHADCN_DOCS_BASE_URL = 'https://ui.shadcn.com/docs/components';

export const DEFAULT_PROTO_UI_THEORY_LINKS: ProtoUiTheoryLink[] = [
  {
    slug: 'whitepaper/component-as-protocol',
    title: {
      'zh-CN': '组件作为协议',
      en: 'Component as Protocol',
    },
    description: {
      'zh-CN': '理解 Proto UI 为什么把组件视为协议，而不只是一次渲染结果。',
      en: 'Understand why Proto UI treats a component as a protocol instead of a one-off render result.',
    },
  },
  {
    slug: 'whitepaper/prototype-boundary',
    title: {
      'zh-CN': '原型边界',
      en: 'Prototype Boundary',
    },
    description: {
      'zh-CN': '查看 Base 原型与上层风格化原型之间应该如何分层和继承。',
      en: 'See how Base prototypes and upper-layer styled prototypes should divide and inherit responsibilities.',
    },
  },
  {
    slug: 'build/prototypes/building-a-styled-library-on-top-of-base',
    title: {
      'zh-CN': '基于 Base 长出一个带风格的原型库',
      en: 'Building a Styled Library on Top of Base',
    },
    description: {
      'zh-CN': '对应当前 shadcn 风格库的构建路径，适合继续看 styled library 的设计方法。',
      en: 'Matches the current shadcn-style library path and is the best next read for styled library design.',
    },
  },
];

export function getShadcnDocsBaseUrl(): string {
  const configured = import.meta.env.PUBLIC_SHADCN_DOCS_BASE_URL || DEFAULT_SHADCN_DOCS_BASE_URL;
  return configured.replace(/\/+$/, '');
}

export function getShadcnComponentDocUrl(
  componentSlug: string,
  family: ShadcnDocFamily = 'base'
): string {
  return `${getShadcnDocsBaseUrl()}/${family}/${componentSlug}`;
}
