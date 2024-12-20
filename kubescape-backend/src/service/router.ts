import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { basicScan } from './routes/scan.service';
import { scanRoutes } from './routes/scan';
import { RouterOptions } from '../util/types';
import { clusterRoutes } from './routes/cluster';

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { httpAuth, userInfo, logger, config, database } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  scanRoutes(router, options);
  clusterRoutes(router, options);

  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error());
  return router;
}
