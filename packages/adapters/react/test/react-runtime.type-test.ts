import * as React from 'react';

import { createReactAdapter } from '../src';

// The public adapter signature must accept the real React module emitted by
// the CLI (`import * as React from 'react'`) without a consumer-side cast.
createReactAdapter(React);
