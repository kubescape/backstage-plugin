import { Router, Request } from 'express';
import { Control, RouterOptions } from '../../util/types';
import { basicScan } from './scan.service';

interface UserQuery {
  cluster_id?: number;
  resource_id?: string;
  control_id?: string;
}

export const scanRoutes = (router: Router, options: RouterOptions) => {
  const { logger, config, database } = options;

  router.get('/scan', (_, response) => {
    logger.info('SCAN!');
    basicScan(database).then(result => {
      response.json({ status: 'scan task received', scanResult: result });
    });
  });

  router.get(
    '/resourceControls',
    (request: Request<{}, {}, {}, UserQuery>, response): [] => {
      const cluster_id = request.query.cluster_id as number;
      const resource_id = request.query.resource_id as string;
      if (cluster_id === undefined || resource_id === undefined) {
        return response.status(400).json({ error: 'Invalid Query Parameter' });
      }
      database.getControlsByResource(cluster_id, resource_id).then(data => {
        response.status(200).json({ result: data });
      });
      return response;
    },
  );
};
