import type { Phase } from '@proto.ui/core';
import { illegalPhase } from './guard';

export type ViewIntentSnapshot = Readonly<{
  present: boolean;
  version: number;
}>;

export type ViewIntentView = {
  getSnapshot(): ViewIntentSnapshot;
  subscribe(listener: (snapshot: ViewIntentSnapshot) => void): () => void;
};

export type RuntimeViewIntent = ViewIntentView & {
  setPresent(present: boolean): void;
  lockTerminal(): void;
};

export function createViewIntent(args: {
  prototypeName: string;
  getPhase(): Phase;
}): RuntimeViewIntent {
  let snapshot: ViewIntentSnapshot = Object.freeze({ present: true, version: 0 });
  let terminal = false;
  const listeners = new Set<(snapshot: ViewIntentSnapshot) => void>();

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      if (terminal) return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setPresent(present) {
      if (terminal) {
        throw new Error(
          `[Lifecycle] cannot update view presence after terminal disposal begins: ${args.prototypeName}`
        );
      }

      const phase = args.getPhase();
      if (phase !== 'callback') {
        illegalPhase(
          'run.lifecycle.setPresent',
          args.prototypeName,
          phase,
          `Call it from a runtime callback that receives 'run'.`
        );
      }

      if (snapshot.present === present) return;
      snapshot = Object.freeze({ present, version: snapshot.version + 1 });
      for (const listener of [...listeners]) listener(snapshot);
    },
    lockTerminal() {
      terminal = true;
      listeners.clear();
    },
  };
}
