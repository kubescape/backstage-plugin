import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { kubescapePlugin, KubescapePage } from '../src/plugin';

createDevApp()
  .registerPlugin(kubescapePlugin)
  .addPage({
    element: <KubescapePage />,
    title: 'Root Page',
    path: '/kubescape',
  })
  .render();
