import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { ShadcnButton } from '../proto-ui/components/react';

const container = document.getElementById('root');
if (!container) throw new Error('missing #root');

createRoot(container).render(createElement(ShadcnButton, null, 'Family boundary'));
