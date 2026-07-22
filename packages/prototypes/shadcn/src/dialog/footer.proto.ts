import { definePrototype, tw } from '@proto.ui/core';
import { DIALOG_FAMILY } from '@proto.ui/prototypes-base/dialog';

const dialogFooter = definePrototype({
  name: 'shadcn-dialog-footer',
  setup(def) {
    def.anatomy.claim(DIALOG_FAMILY, { role: 'footer' });
    def.feedback.style.use(tw('flex gap-2 items-center'));
    return (renderer) => renderer.r.slot();
  },
});

export default dialogFooter;
