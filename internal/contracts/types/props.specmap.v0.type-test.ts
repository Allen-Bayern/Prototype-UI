import type { PropsSnapshot } from '@proto.ui/core';
import type { PropsSpecMap } from '@proto.ui/types';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type IsAny<T> = 0 extends 1 & T ? true : false;
type Expect<T extends true> = T;

type P = { disabled: boolean | null; count: number };

// ✅ should compile
({
  disabled: { type: 'boolean', empty: 'accept' },
  count: { type: 'number' },
}) satisfies PropsSpecMap<P>;

type PEnum = { mode: 'primary' | 'secondary' };

// ✅ enum props use state-style string options
({
  mode: { type: 'enum', options: ['primary', 'secondary'] as const },
}) satisfies PropsSpecMap<PEnum>;

// ❌ enum options are required
({
  // @ts-expect-error type:"enum" requires options
  mode: { type: 'enum' },
}) satisfies PropsSpecMap<PEnum>;

// ❌ legacy enum descriptor field is no longer part of PropsSpecMap
({
  // @ts-expect-error use type:"enum" with options instead
  mode: { type: 'string', enum: ['primary', 'secondary'] as const },
}) satisfies PropsSpecMap<PEnum>;

// ❌ empty:"accept" requires null in declared type
type P2 = { disabled: boolean; count: number };

({
  // @ts-expect-error empty:"accept" would resolve to boolean|null, incompatible with boolean
  disabled: { type: 'boolean', empty: 'accept' },
  count: { type: 'number' },
}) satisfies PropsSpecMap<P2>;

type ResolvedOptional = PropsSnapshot<{ disabled?: boolean; label?: string | null }>;
type ResolvedAny = PropsSnapshot<any>;

type _ResolvedOptionalHasDeclaredKeys = Expect<
  Equal<ResolvedOptional, Readonly<{ disabled: boolean; label: string | null }>>
>;
type _ResolvedOptionalExcludesUndefined = Expect<
  Equal<Extract<ResolvedOptional['disabled'], undefined>, never>
>;
type _ResolvedAnyStaysKeyWide = Expect<IsAny<ResolvedAny['anyKey']>>;

// ❌ kind mismatch

({
  disabled: { type: 'boolean', empty: 'accept' },
  // @ts-expect-error count is number in P, but spec says string
  count: { kind: 'string' },
}) satisfies PropsSpecMap<P>;
