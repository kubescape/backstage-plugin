import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const prototypePlugin = createPlugin({
  id: 'prototype',
  routes: {
    root: rootRouteRef,
  },
});

export const PrototypePage = prototypePlugin.provide(
  createRoutableExtension({
    name: 'PrototypePage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
