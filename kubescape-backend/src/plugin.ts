import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { KubescapeDatabse } from './database/KubescapeDatabase';

/**
 * kubescapePlugin backend plugin
 *
 * @public
 */
export const kubescapePlugin = createBackendPlugin({
  pluginId: 'kubescape',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        database: coreServices.database,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, database, logger, config }) {
        const KubescapeDB = await KubescapeDatabse.create(database);
        httpRouter.use(
          await createRouter({
            logger,
            config,
            database: KubescapeDB,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
