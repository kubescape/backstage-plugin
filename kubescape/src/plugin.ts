import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const kubescapePlugin = createPlugin({
  id: 'kubescape',
  routes: {
    root: rootRouteRef,
  },
});

export const KubescapePage = kubescapePlugin.provide(
  createRoutableExtension({
    name: 'KubescapePage',
    component: () =>
      import('./components/RootPageComponent').then(m => m.RootPageComponent),
    mountPoint: rootRouteRef,
  }),
);
