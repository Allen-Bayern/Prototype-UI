// packages/modules/rule/src/compile.ts
import type { RuleIR, RuleSpec, RuleOp } from './types';
import { createWhenBuilder } from './when-builder';
import { createIntentBuilder } from './intent-builder';
import type { PropsBaseType } from '@proto.ui/types';

function attachDefaultReasons<Props extends PropsBaseType>(
  ops: RuleOp<Props>[],
  spec: RuleSpec<Props>
): RuleOp<Props>[] {
  return ops.map((op, idx) => {
    if (op.kind !== 'state.set') return op;
    if (op.reason !== undefined) return op;
    return {
      ...op,
      reason: {
        kind: 'rule',
        label: spec.label,
        note: spec.note,
        opIndex: idx,
      },
    };
  });
}

/**
 * Compile a RuleSpec into pure-data RuleIR.
 * v0: must be called during setup by runtime's def.rule.
 */
export function compileRule<Props extends PropsBaseType>(
  spec: RuleSpec<Props>,
  opt?: {
    registerStateHandle?: (id: any, handle: any) => void;
  }
): Omit<RuleIR<Props>, 'id'> {
  const { w, getDeps } = createWhenBuilder<Props>({
    onStateHandle: opt?.registerStateHandle,
  });
  const when = spec.when(w);

  const { builder, exportIntent } = createIntentBuilder<Props>();
  spec.intent(builder);

  const intent = exportIntent();
  const ops = attachDefaultReasons(intent.ops, spec);

  return {
    label: spec.label,
    note: spec.note,
    deps: getDeps(),
    when,
    intent: { kind: 'ops', ops },
  };
}
