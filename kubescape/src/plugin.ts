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
      import('./components/LandingPageComponent').then(
        m => m.LandingPageComponent,
      ),
    // component: () =>
    //   import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
