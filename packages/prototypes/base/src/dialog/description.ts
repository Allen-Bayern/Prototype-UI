import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { createDialogPartId, DIALOG_CONTEXT, DIALOG_FAMILY } from './shared';
import type {
  DialogDescriptionAsHookContract,
  DialogDescriptionExposes,
  DialogDescriptionProps,
} from './types';

function setupDialogDescription(
  def: DefHandle<DialogDescriptionProps, DialogDescriptionExposes>
): void {
  // P-BASE-DIALOG-DESCRIPTION-RELATION
  def.anatomy.claim(DIALOG_FAMILY, { role: 'description' });
  const id = def.state.string('dialogDescriptionId', '');
  def.a11y.id(id);
  def.context.subscribe(DIALOG_CONTEXT, (_run, next) => {
    id.set(createDialogPartId(next.rootId, 'description'), 'reason: dialog description id sync');
  });
  def.lifecycle.onCreated((run) => {
    id.set(
      createDialogPartId(run.context.read(DIALOG_CONTEXT).rootId, 'description'),
      'reason: dialog description created id sync'
    );
  });
}

/*
 * TODO(P-BASE-DIALOG-DESCRIPTION-ALERT): enforce the alert-only Description
 * requirement once anatomy can express conditional cardinality. Runtime
 * identity projection cannot synthesize the alert's primary message.
 */

// P-BASE-DIALOG-DESCRIPTION-AUTHORING-ENTRIES
export const asDialogDescription = defineAsHook<
  DialogDescriptionProps,
  DialogDescriptionExposes,
  DialogDescriptionAsHookContract
>({
  name: 'as-dialog-description',
  setup: setupDialogDescription,
});

const dialogDescription = definePrototype({
  name: 'base-dialog-description',
  setup: setupDialogDescription,
});

export default dialogDescription;
