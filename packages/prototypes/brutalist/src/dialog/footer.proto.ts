import { definePrototype, tw } from '@proto.ui/core';
import { DIALOG_FAMILY } from '@proto.ui/prototypes-base/dialog';

const dialogFooter = definePrototype({
  name: 'brutalist-dialog-footer',
  // P-BRUTALIST-DIALOG-FOOTER-ENTRY: direct entry name `brutalist-dialog-footer`.
  setup(def) {
    // P-BRUTALIST-DIALOG-FOOTER-ANATOMY: claim DIALOG_FAMILY footer role.
    def.anatomy.claim(DIALOG_FAMILY, { role: 'footer' });
    // P-BRUTALIST-DIALOG-FOOTER-VISUAL-GRAMMAR: flex-col-reverse gap border-t-2 layout surface.
    def.feedback.style.use(
      tw('flex flex-col-reverse gap-2 border-t-2 border-black pt-3 justify-end')
    );
    return (renderer) => renderer.r.slot();
  },
});

// P-BRUTALIST-DIALOG-FOOTER-ENTRY: `brutalist-dialog-footer` is the only public Dialog footer entry in this slice (anatomy-only, no Base prototype inherited).

export default dialogFooter;
