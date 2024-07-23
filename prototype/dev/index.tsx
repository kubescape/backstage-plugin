import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { prototypePlugin, PrototypePage } from '../src/plugin';

createDevApp()
  .registerPlugin(prototypePlugin)
  .addPage({
    element: <PrototypePage />,
    title: 'Root Page',
    path: '/prototype',
  })
  .render();
