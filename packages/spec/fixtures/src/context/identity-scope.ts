export type ContextIdentityScopeExpectation =
  | 'reference-identity-context-key'
  | 'component-context-channel'
  | 'nearest-scope-owner'
  | 'setup-provider-json-object';

export type ContextIdentityScopeCase = {
  id: string;
  title: string;
  specCase: string;
  covers: readonly string[];
  expectation: ContextIdentityScopeExpectation;
};

export const CONTEXT_IDENTITY_SCOPE_CASES = [
  {
    id: 'context-key-identity',
    title: 'ContextKey identity is created through the core factory and compared by reference',
    specCase: 'T-CONTEXT-0001-CASE-KEY-IDENTITY',
    covers: ['C-CONTEXT-0003-A', 'C-CONTEXT-0003-B', 'C-CONTEXT-0003-C', 'C-CONTEXT-0003-D'],
    expectation: 'reference-identity-context-key',
  },
  {
    id: 'context-channel-scope',
    title: 'Context is the official inter-component channel and provider establishes scope',
    specCase: 'T-CONTEXT-0001-CASE-CHANNEL-SCOPE',
    covers: [
      'C-CONTEXT-0001-A',
      'C-CONTEXT-0001-B',
      'C-CONTEXT-0001-C',
      'C-CONTEXT-0001-D',
      'C-CONTEXT-0002-A',
      'C-CONTEXT-0002-B',
      'C-CONTEXT-0002-C',
      'C-CONTEXT-0002-D',
    ],
    expectation: 'component-context-channel',
  },
  {
    id: 'context-scope-resolution',
    title: 'Context resolution binds participants to the nearest provider or scope owner',
    specCase: 'T-CONTEXT-0001-CASE-SCOPE-RESOLUTION',
    covers: ['C-CONTEXT-0004-A', 'C-CONTEXT-0004-B', 'C-CONTEXT-0004-C', 'C-CONTEXT-0004-D'],
    expectation: 'nearest-scope-owner',
  },
  {
    id: 'context-provide-value',
    title: 'Provide is setup-only and installs a JSON object context value',
    specCase: 'T-CONTEXT-0001-CASE-PROVIDE-VALUE',
    covers: [
      'C-CONTEXT-0005-A',
      'C-CONTEXT-0005-B',
      'C-CONTEXT-0005-C',
      'C-CONTEXT-0005-D',
      'C-CONTEXT-0005-E',
      'C-CONTEXT-0009-A',
      'C-CONTEXT-0009-B',
      'C-CONTEXT-0009-C',
      'C-CONTEXT-0009-D',
      'C-CONTEXT-0009-E',
    ],
    expectation: 'setup-provider-json-object',
  },
] as const satisfies readonly ContextIdentityScopeCase[];

export const CONTEXT_IDENTITY_SCOPE_SPEC_CASES = [
  ...new Set(CONTEXT_IDENTITY_SCOPE_CASES.map((testCase) => testCase.specCase)),
] as const;
