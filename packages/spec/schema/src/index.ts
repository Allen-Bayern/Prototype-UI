import { z } from 'zod';

export const SPEC_ENTITY_TYPES = [
  'contract',
  'prototype',
  'module',
  'decision',
  'host-cap',
  'test',
  'version',
  'knowledge',
] as const;

export const SPEC_ENTITY_PREFIXES = {
  contract: 'C',
  prototype: 'P',
  module: 'M',
  decision: 'D',
  'host-cap': 'HC',
  test: 'T',
  version: 'V',
  knowledge: 'K',
} as const satisfies Record<SpecEntityType, string>;

export const SPEC_ENTITY_STATUSES = ['draft', 'active', 'deprecated', 'removed'] as const;
export const SPEC_RELATION_KINDS = [
  'relates',
  'dependsOn',
  'inherits',
  'references',
  'refines',
  'satisfies',
  'verifies',
  'explains',
  'exercises',
  'requires',
  'owns',
] as const;
export const SPEC_RELATION_ROLES = [
  'value-boundary',
  'phase-boundary',
  'api-surface',
  'lifecycle-model',
  'portability-rationale',
  'execution-order',
  'diagnostic-policy',
  'test-surface',
  'test-entrypoint',
] as const;
export const SPEC_COVERAGE_IMPACTS = [
  'expands-test-surface',
  'exercises-test-surface',
  'no-direct-test-surface',
  'review-test-surface',
] as const;
export const SPEC_TEST_IMPLEMENTATION_KINDS = [
  'fixture',
  'module-test',
  'adapter-test',
  'runtime-test',
  'workspace-check',
] as const;
export const SPEC_TEST_IMPLEMENTATION_STATUSES = [
  'missing',
  'planned',
  'active',
  'passing',
  'failing',
  'needs-review',
  'skipped',
] as const;

export type SpecEntityType = (typeof SPEC_ENTITY_TYPES)[number];
export type SpecEntityStatus = (typeof SPEC_ENTITY_STATUSES)[number];
export type SpecRelationKind = (typeof SPEC_RELATION_KINDS)[number];
export type SpecRelationRole = (typeof SPEC_RELATION_ROLES)[number];
export type SpecCoverageImpact = (typeof SPEC_COVERAGE_IMPACTS)[number];
export type SpecTestImplementationKind = (typeof SPEC_TEST_IMPLEMENTATION_KINDS)[number];
export type SpecTestImplementationStatus = (typeof SPEC_TEST_IMPLEMENTATION_STATUSES)[number];

export type SpecIdParts = {
  id: string;
  prefix: string;
  domain: string;
  number?: number;
};

const specIdPattern =
  /^(?:(P)-([A-Z0-9]+(?:-[A-Z0-9]+)*)|((?:C|M|D|HC|T|V|K)-([A-Z0-9]+(?:-[A-Z0-9]+)*)-(\d{4})))$/;
const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export const specVersionSchema = z.string().regex(semverPattern, 'Expected a semver version.');
export const specLocalizedTextSchema = z.union([
  z.string().min(1),
  z.object({
    en: z.string().min(1).optional(),
    'zh-CN': z.string().min(1).optional(),
  }),
]);

export const specRelationTargetSchema = z
  .union([
    z.string(),
    z.object({
      id: z.string(),
      since: specVersionSchema.optional(),
      until: specVersionSchema.optional(),
      anchors: z.array(z.string().min(1)).optional(),
      role: z.enum(SPEC_RELATION_ROLES).optional(),
      coverageImpact: z.enum(SPEC_COVERAGE_IMPACTS).optional(),
      note: z.string().optional(),
    }),
  ])
  .transform((value) => (typeof value === 'string' ? { id: value } : value));

export const specRelationsSchema = z
  .object({
    contracts: z.array(specRelationTargetSchema).optional(),
    prototypes: z.array(specRelationTargetSchema).optional(),
    modules: z.array(specRelationTargetSchema).optional(),
    decisions: z.array(specRelationTargetSchema).optional(),
    hostCaps: z.array(specRelationTargetSchema).optional(),
    tests: z.array(specRelationTargetSchema).optional(),
    knowledge: z.array(specRelationTargetSchema).optional(),
  })
  .partial()
  .optional();

export const specPrototypeInheritanceSchema = z
  .object({
    prototypes: z.array(specRelationTargetSchema).min(1),
  })
  .strict()
  .optional();

export const specRevisionSchema = z.object({
  version: specVersionSchema,
  change: z.string().min(1),
  summary: z.string().optional(),
  breaking: z.boolean().optional(),
});

export const specSourceRefSchema = z.object({
  path: z.string().min(1),
  label: z.string().optional(),
  sections: z.array(z.string()).optional(),
});

export const specAnatomyCardinalityMaxSchema = z.union([
  z.number().int().nonnegative(),
  z.literal('*'),
]);

export const specAnatomyCardinalitySchema = z.object({
  min: z.number().int().nonnegative(),
  max: specAnatomyCardinalityMaxSchema,
});

export const specAnatomyRequirementSchema = z.object({
  kind: z.literal('hook'),
  name: z.string().min(1),
});

export const specAnatomyRoleSchema = z.object({
  cardinality: specAnatomyCardinalitySchema,
  requires: z.array(specAnatomyRequirementSchema).default([]),
  summary: specLocalizedTextSchema.optional(),
});

export const specAnatomyRelationSchema = z.object({
  kind: z.literal('contains'),
  parent: z.string().min(1),
  child: z.string().min(1),
});

export const specAnatomyProfileRoleSchema = z.object({
  cardinality: specAnatomyCardinalitySchema.partial().optional(),
  requires: z.array(specAnatomyRequirementSchema).optional(),
  summary: specLocalizedTextSchema.optional(),
});

export const specAnatomyProfileSchema = z.object({
  roles: z.record(z.string().min(1), specAnatomyProfileRoleSchema).default({}),
  relations: z.array(specAnatomyRelationSchema).default([]),
});

export const specAnatomySchema = z
  .object({
    family: z.string().min(1),
    roles: z.record(z.string().min(1), specAnatomyRoleSchema),
    relations: z.array(specAnatomyRelationSchema).default([]),
    profiles: z.record(z.string().min(1), specAnatomyProfileSchema).default({}),
  })
  .superRefine((anatomy, context) => {
    if (!anatomy.roles.root) {
      context.addIssue({
        code: 'custom',
        path: ['roles'],
        message: 'Anatomy family must declare a root role.',
      });
    }

    for (const [roleName, role] of Object.entries(anatomy.roles)) {
      validateAnatomyCardinality(context, ['roles', roleName, 'cardinality'], role.cardinality);
    }

    for (const [index, relation] of anatomy.relations.entries()) {
      validateAnatomyRelationRoles(context, ['relations', index], anatomy.roles, relation);
    }

    for (const [profileName, profile] of Object.entries(anatomy.profiles)) {
      for (const [roleName, role] of Object.entries(profile.roles)) {
        if (!anatomy.roles[roleName]) {
          context.addIssue({
            code: 'custom',
            path: ['profiles', profileName, 'roles', roleName],
            message: `Anatomy profile ${profileName} references unknown role ${roleName}.`,
          });
        }

        if (role.cardinality) {
          validateAnatomyCardinality(
            context,
            ['profiles', profileName, 'roles', roleName, 'cardinality'],
            role.cardinality
          );
        }
      }

      for (const [index, relation] of profile.relations.entries()) {
        validateAnatomyRelationRoles(
          context,
          ['profiles', profileName, 'relations', index],
          anatomy.roles,
          relation
        );
      }
    }
  });

function validateAnatomyCardinality(
  context: z.RefinementCtx,
  path: Array<string | number>,
  cardinality: { min?: number; max?: number | '*' }
): void {
  if (cardinality.min === undefined || cardinality.max === undefined) return;
  if (cardinality.max === '*') return;
  if (cardinality.max >= cardinality.min) return;

  context.addIssue({
    code: 'custom',
    path,
    message: `Anatomy cardinality max ${cardinality.max} must be greater than or equal to min ${cardinality.min}.`,
  });
}

function validateAnatomyRelationRoles(
  context: z.RefinementCtx,
  path: Array<string | number>,
  roles: Record<string, unknown>,
  relation: { parent: string; child: string }
): void {
  if (!roles[relation.parent]) {
    context.addIssue({
      code: 'custom',
      path: [...path, 'parent'],
      message: `Anatomy relation parent role does not exist: ${relation.parent}.`,
    });
  }

  if (!roles[relation.child]) {
    context.addIssue({
      code: 'custom',
      path: [...path, 'child'],
      message: `Anatomy relation child role does not exist: ${relation.child}.`,
    });
  }
}

export const specCriterionSchema = z.object({
  id: z.string().min(1),
  text: specLocalizedTextSchema,
  rationale: specLocalizedTextSchema.optional(),
  dependsOn: specRelationsSchema,
  references: specRelationsSchema,
});

export const specOpenQuestionSchema = z.object({
  id: z.string().min(1),
  question: specLocalizedTextSchema,
  context: specLocalizedTextSchema.optional(),
  blocks: z.array(z.string().min(1)).default([]),
});

export const specTestCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  covers: z.array(z.string().min(1)).default([]),
  valueKind: z.string().optional(),
  expectation: z.string().min(1),
  notes: z.array(z.string().min(1)).default([]),
});

export const specTestImplementationSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(SPEC_TEST_IMPLEMENTATION_KINDS),
  status: z.enum(SPEC_TEST_IMPLEMENTATION_STATUSES),
  path: z.string().min(1).optional(),
  required: z.boolean().default(false),
  consumesCases: z.array(z.string().min(1)).default([]),
  exercises: z.array(z.string().min(1)).default([]),
  notes: z.array(z.string().min(1)).default([]),
});

export const specEntitySchema = z
  .object({
    id: z.string().regex(specIdPattern, 'Expected a Proto UI spec ID.'),
    type: z.enum(SPEC_ENTITY_TYPES),
    title: z.string().min(1),
    status: z.enum(SPEC_ENTITY_STATUSES).default('draft'),
    since: specVersionSchema,
    deprecatedSince: specVersionSchema.optional(),
    removedSince: specVersionSchema.optional(),
    replacedBy: z.string().optional(),
    summary: z.string().optional(),
    statement: specLocalizedTextSchema.optional(),
    anatomy: specAnatomySchema.optional(),
    criteria: z.array(specCriterionSchema).default([]),
    openQuestions: z.array(specOpenQuestionSchema).default([]),
    cases: z.array(specTestCaseSchema).default([]),
    implementations: z.array(specTestImplementationSchema).default([]),
    notes: z.string().optional(),
    sources: z.array(specSourceRefSchema).default([]),
    relates: specRelationsSchema,
    dependsOn: specRelationsSchema,
    inherits: specPrototypeInheritanceSchema,
    references: specRelationsSchema,
    refines: specRelationsSchema,
    satisfies: specRelationsSchema,
    requires: specRelationsSchema,
    verifies: specRelationsSchema,
    explains: specRelationsSchema,
    exercises: specRelationsSchema,
    owns: specRelationsSchema,
    revisions: z.array(specRevisionSchema).default([]),
    tags: z.array(z.string()).default([]),
  })
  .superRefine((entity, context) => {
    const parts = parseSpecId(entity.id);
    const expectedPrefix = SPEC_ENTITY_PREFIXES[entity.type];

    if (parts.prefix !== expectedPrefix) {
      context.addIssue({
        code: 'custom',
        path: ['id'],
        message: `ID prefix ${parts.prefix} does not match entity type ${entity.type}.`,
      });
    }

    if (entity.status === 'deprecated' && !entity.deprecatedSince) {
      context.addIssue({
        code: 'custom',
        path: ['deprecatedSince'],
        message: 'Deprecated entities must set deprecatedSince.',
      });
    }

    if (entity.status === 'removed' && !entity.removedSince) {
      context.addIssue({
        code: 'custom',
        path: ['removedSince'],
        message: 'Removed entities must set removedSince.',
      });
    }

    if (entity.inherits && entity.type !== 'prototype') {
      context.addIssue({
        code: 'custom',
        path: ['inherits'],
        message: 'Only prototype entities may declare prototype inheritance.',
      });
    }

    const criteriaIds = new Set<string>();

    for (const criterion of entity.criteria) {
      if (!criterion.id.startsWith(`${entity.id}-`)) {
        context.addIssue({
          code: 'custom',
          path: ['criteria'],
          message: `Criterion ID ${criterion.id} must start with ${entity.id}-.`,
        });
      }

      if (criteriaIds.has(criterion.id)) {
        context.addIssue({
          code: 'custom',
          path: ['criteria'],
          message: `Duplicate criterion ID ${criterion.id}.`,
        });
      }

      criteriaIds.add(criterion.id);
    }

    const openQuestionIds = new Set<string>();

    for (const question of entity.openQuestions) {
      if (!question.id.startsWith(`${entity.id}-Q`)) {
        context.addIssue({
          code: 'custom',
          path: ['openQuestions'],
          message: `Open question ID ${question.id} must start with ${entity.id}-Q.`,
        });
      }

      if (openQuestionIds.has(question.id)) {
        context.addIssue({
          code: 'custom',
          path: ['openQuestions'],
          message: `Duplicate open question ID ${question.id}.`,
        });
      }

      openQuestionIds.add(question.id);
    }

    const testCaseIds = new Set<string>();

    for (const testCase of entity.cases) {
      if (!testCase.id.startsWith(`${entity.id}-CASE-`)) {
        context.addIssue({
          code: 'custom',
          path: ['cases'],
          message: `Test case ID ${testCase.id} must start with ${entity.id}-CASE-.`,
        });
      }

      if (testCaseIds.has(testCase.id)) {
        context.addIssue({
          code: 'custom',
          path: ['cases'],
          message: `Duplicate test case ID ${testCase.id}.`,
        });
      }

      testCaseIds.add(testCase.id);
    }

    const implementationIds = new Set<string>();

    for (const implementation of entity.implementations) {
      if (implementationIds.has(implementation.id)) {
        context.addIssue({
          code: 'custom',
          path: ['implementations'],
          message: `Duplicate test implementation ID ${implementation.id}.`,
        });
      }

      implementationIds.add(implementation.id);

      for (const caseId of implementation.consumesCases) {
        if (!testCaseIds.has(caseId)) {
          context.addIssue({
            code: 'custom',
            path: ['implementations'],
            message: `Test implementation ${implementation.id} consumes unknown case ${caseId}.`,
          });
        }
      }
    }
  });

export type SpecRelationTarget = z.infer<typeof specRelationTargetSchema>;
export type SpecRelations = z.infer<typeof specRelationsSchema>;
export type SpecPrototypeInheritance = z.infer<typeof specPrototypeInheritanceSchema>;
export type SpecRevision = z.infer<typeof specRevisionSchema>;
export type SpecSourceRef = z.infer<typeof specSourceRefSchema>;
export type SpecAnatomy = z.infer<typeof specAnatomySchema>;
export type SpecCriterion = z.infer<typeof specCriterionSchema>;
export type SpecOpenQuestion = z.infer<typeof specOpenQuestionSchema>;
export type SpecTestCase = z.infer<typeof specTestCaseSchema>;
export type SpecTestImplementation = z.infer<typeof specTestImplementationSchema>;
export type SpecEntity = z.infer<typeof specEntitySchema>;

export type SpecValidationIssue = {
  filePath?: string;
  message: string;
};

export function parseSpecId(id: string): SpecIdParts {
  const match = specIdPattern.exec(id);

  if (!match) {
    throw new Error(`Invalid Proto UI spec ID: ${id}`);
  }

  return {
    id,
    prefix: match[1] ?? match[3].split('-', 1)[0],
    domain: match[2] ?? match[4],
    number: match[5] ? Number(match[5]) : undefined,
  };
}

export function getSpecDomain(id: string): string {
  return parseSpecId(id).domain;
}

export function validateSpecEntity(input: unknown): SpecEntity {
  return specEntitySchema.parse(input);
}

export function compareSpecVersions(a: string, b: string): number {
  const [aCore, aPre] = a.split('-', 2);
  const [bCore, bPre] = b.split('-', 2);
  const aParts = aCore.split('.').map(Number);
  const bParts = bCore.split('.').map(Number);

  for (let index = 0; index < 3; index += 1) {
    const diff = aParts[index] - bParts[index];
    if (diff !== 0) return diff;
  }

  if (!aPre && bPre) return 1;
  if (aPre && !bPre) return -1;
  if (!aPre && !bPre) return 0;

  return aPre.localeCompare(bPre);
}

export function isVersionInRange(
  version: string,
  range: { since?: string; until?: string }
): boolean {
  if (range.since && compareSpecVersions(version, range.since) < 0) return false;
  if (range.until && compareSpecVersions(version, range.until) >= 0) return false;
  return true;
}

export function isSpecEntityAvailableAt(entity: SpecEntity, version: string): boolean {
  if (compareSpecVersions(version, entity.since) < 0) return false;
  if (entity.removedSince && compareSpecVersions(version, entity.removedSince) >= 0) return false;
  return true;
}
