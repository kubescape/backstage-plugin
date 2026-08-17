import { createFrontendPlugin, FrontendPlugin } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

const kubescapeEntityContent = EntityContentBlueprint.make({
  name: 'kubescape',
  params: {
    path: '/kubescape',
    title: 'Kubescape',
    loader: () =>
      import('./components/KubescapeTab').then(m => <m.KubescapeTab />),
  },
});

export const kubescapePlugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'kubescape',
  extensions: [kubescapeEntityContent],
});
