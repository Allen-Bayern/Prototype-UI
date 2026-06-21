export type ContextRuntimeSurfaceExpectation =
  | 'required-subscription-intent'
  | 'optional-subscription-intent'
  | 'explicit-runtime-update'
  | 'deterministic-callback-delivery'
  | 'render-read-context-surface'
  | 'scope-rebind-and-cleanup';

export type ContextRuntimeSurfaceCase = {
  id: string;
  title: string;
  specCase: string;
  covers: readonly string[];
  expectation: ContextRuntimeSurfaceExpectation;
};

export const CONTEXT_RUNTIME_SURFACE_CASES = [
  {
    id: 'context-required-subscribe',
    title: 'Required subscribe declares a required context dependency and gates required reads',
    specCase: 'T-CONTEXT-0002-CASE-REQUIRED-SUBSCRIBE',
    covers: [
      'C-CONTEXT-0006-A',
      'C-CONTEXT-0006-C',
      'C-CONTEXT-0006-D',
      'C-CONTEXT-0007-A',
      'C-CONTEXT-0007-B',
      'C-CONTEXT-0007-C',
    ],
    expectation: 'required-subscription-intent',
  },
  {
    id: 'context-optional-subscribe',
    title: 'Optional trySubscribe allows autonomous operation and gates optional reads',
    specCase: 'T-CONTEXT-0002-CASE-OPTIONAL-SUBSCRIBE',
    covers: ['C-CONTEXT-0006-B', 'C-CONTEXT-0006-E', 'C-CONTEXT-0007-D', 'C-CONTEXT-0007-E'],
    expectation: 'optional-subscription-intent',
  },
  {
    id: 'context-runtime-update',
    title:
      'Runtime update and tryUpdate explicitly name the ContextKey and follow subscription intent',
    specCase: 'T-CONTEXT-0002-CASE-RUNTIME-UPDATE',
    covers: [
      'C-CONTEXT-0008-A',
      'C-CONTEXT-0008-B',
      'C-CONTEXT-0008-C',
      'C-CONTEXT-0008-D',
      'C-CONTEXT-0008-E',
    ],
    expectation: 'explicit-runtime-update',
  },
  {
    id: 'context-callback-delivery',
    title: 'Context callbacks observe semantic updates with next and previous values',
    specCase: 'T-CONTEXT-0002-CASE-CALLBACK-DELIVERY',
    covers: [
      'C-CONTEXT-0010-A',
      'C-CONTEXT-0010-B',
      'C-CONTEXT-0010-C',
      'C-CONTEXT-0010-D',
      'C-CONTEXT-0010-E',
    ],
    expectation: 'deterministic-callback-delivery',
  },
  {
    id: 'context-render-read',
    title: 'Render read exposes context read and tryRead without context write APIs',
    specCase: 'T-CONTEXT-0002-CASE-RENDER-READ',
    covers: ['C-CONTEXT-0007-A', 'C-CONTEXT-0007-D', 'C-CONTEXT-0007-E'],
    expectation: 'render-read-context-surface',
  },
  {
    id: 'context-reconnect-cleanup',
    title:
      'Context reads and updates resolve current scope availability after rebinding or cleanup',
    specCase: 'T-CONTEXT-0002-CASE-RECONNECT-CLEANUP',
    covers: [
      'C-CONTEXT-0011-A',
      'C-CONTEXT-0011-B',
      'C-CONTEXT-0011-C',
      'C-CONTEXT-0011-D',
      'C-CONTEXT-0011-E',
      'C-CONTEXT-0012-A',
      'C-CONTEXT-0012-B',
      'C-CONTEXT-0012-C',
      'C-CONTEXT-0012-D',
      'C-CONTEXT-0012-E',
    ],
    expectation: 'scope-rebind-and-cleanup',
  },
] as const satisfies readonly ContextRuntimeSurfaceCase[];

export const CONTEXT_RUNTIME_SURFACE_SPEC_CASES = [
  ...new Set(CONTEXT_RUNTIME_SURFACE_CASES.map((testCase) => testCase.specCase)),
] as const;
