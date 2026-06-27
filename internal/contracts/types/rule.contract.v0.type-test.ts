import { tw, type DefHandle, type OwnedStateHandle, type StyleHandle } from '@proto.ui/core';

type ButtonProps = {
  active: boolean;
  tone: 'primary' | 'secondary';
  count: number;
  nullable: boolean | null;
  data: { label: string };
};

declare const def: DefHandle<ButtonProps>;
declare const open: OwnedStateHandle<boolean>;
declare const tone: OwnedStateHandle<'primary' | 'secondary'>;
declare const style: StyleHandle;

def.rule({
  when: (w) =>
    w.all(
      w.prop('active').eq(true),
      w.prop('tone').eq('primary'),
      w.prop('count').eq(1),
      w.prop('nullable').eq(null),
      w.state(open).eq(false),
      w.state(tone).eq('secondary'),
      w.meta('colorScheme').eq('dark')
    ),
  intent: (i) => {
    i.feedback.style.use(tw('opacity-50'), style);
    i.state(open).be(true);
    i.state(tone).be('primary');
  },
});

def.rule({
  when: (w) => {
    // @ts-expect-error prop keys must come from the prototype props shape
    w.prop('missing');
    // @ts-expect-error boolean prop comparisons reject string literals
    w.prop('active').eq('true');
    // @ts-expect-error string literal prop comparisons preserve the declared union
    w.prop('tone').eq('danger');
    // @ts-expect-error object props are not comparable by v0 rule.eq
    w.prop('data').eq({ label: 'Save' });
    // @ts-expect-error state comparisons preserve the state value type
    w.state(open).eq('false');
    return w.t();
  },
  intent: (i) => {
    // @ts-expect-error feedback.style.use accepts StyleHandle values, not raw strings
    i.feedback.style.use('opacity-50');
    // @ts-expect-error state intent values must match the state handle value type
    i.state(open).be('true');
  },
});
