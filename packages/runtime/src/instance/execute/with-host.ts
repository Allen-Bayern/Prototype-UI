// packages/runtime/src/instance/execute/with-host.ts
import type { Prototype } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import type { RuntimeHost } from '../host';
import { createRuntimeSession } from '../session';
import type { ExecuteWithHostResult } from './types';

/**
 * Legacy eager host entry point.
 *
 * New integrations should own a RuntimeSession and drive mount/unmount/dispose
 * separately. This wrapper preserves the existing adapter surface while the
 * adapters migrate to repeatable host bindings.
 */
export function executeWithHost<P extends PropsBaseType>(
  proto: Prototype<P>,
  host: RuntimeHost<P>
): ExecuteWithHostResult {
  const session = createRuntimeSession(proto, host);
  void session.mount();

  return {
    children: session.children,
    controller: session.controller,
    // Historical callers use invokeUnmounted as their terminal teardown.
    invokeUnmounted: () => session.dispose(),
    caps: session.caps,
    invokeInCallbackScope: session.invokeInCallbackScope,
    kernel: session.kernel,
    session,
  };
}
