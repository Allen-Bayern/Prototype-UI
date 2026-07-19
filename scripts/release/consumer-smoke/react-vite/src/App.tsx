import { useEffect, useState } from 'react';

import {
  ShadcnButton,
  ShadcnDialogClose,
  ShadcnDialogContent,
  ShadcnDialogDescription,
  ShadcnDialogMask,
  ShadcnDialogRoot,
  ShadcnDialogTitle,
  ShadcnDialogTrigger,
  ShadcnSelectContent,
  ShadcnSelectItem,
  ShadcnSelectRoot,
  ShadcnSelectTrigger,
  ShadcnSelectValue,
  ShadcnSwitchRoot,
  ShadcnSwitchThumb,
} from '../proto-ui/components/react';

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setReady(true));
  }, []);

  return (
    <main data-consumer-ready={ready ? 'true' : 'false'}>
      <ShadcnButton disabled={!ready} className="consumer-button">
        Save preference
      </ShadcnButton>

      <ShadcnSwitchRoot defaultChecked className="consumer-switch">
        <ShadcnSwitchThumb />
      </ShadcnSwitchRoot>

      <ShadcnSelectRoot defaultOpen defaultValue="comfortable">
        <ShadcnSelectTrigger className="consumer-select-trigger">
          <ShadcnSelectValue placeholder="Choose density" />
        </ShadcnSelectTrigger>
        <ShadcnSelectContent position="popper" className="consumer-select-content">
          <ShadcnSelectItem value="compact" textValue="Compact">
            Compact
          </ShadcnSelectItem>
          <ShadcnSelectItem value="comfortable" textValue="Comfortable">
            Comfortable
          </ShadcnSelectItem>
        </ShadcnSelectContent>
      </ShadcnSelectRoot>

      <ShadcnDialogRoot defaultOpen a11yLabel="Preference details">
        <ShadcnDialogTrigger>Open details</ShadcnDialogTrigger>
        <ShadcnDialogMask />
        <ShadcnDialogContent className="consumer-dialog-content">
          <ShadcnDialogTitle>Preference details</ShadcnDialogTitle>
          <ShadcnDialogDescription>Review the selected preference.</ShadcnDialogDescription>
          <ShadcnDialogClose>Close</ShadcnDialogClose>
        </ShadcnDialogContent>
      </ShadcnDialogRoot>
    </main>
  );
}
