import { Router, Request } from 'express';
import { Control, RouterOptions } from '../../util/types';
import { basicScan, workloadScan } from './scan.service';

interface UserQuery {
  cluster_id?: number;
  resource_id?: string;
  control_id?: string;
}

interface WorkloadScan {
  namespace?: string;
  name?: string;
  kind?: string;
  resource_id: string;
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

  router.get(
    '/workloadScan',
    (request: Request<{}, {}, {}, WorkloadScan>, response) => {
      const namespace = request.query.namespace as string;
      const name = request.query.name as string;
      const kind = request.query.kind as string;
      const resource_id = request.query.resource_id as string;
      workloadScan(database, namespace, kind, name, resource_id).then(
        scanResult => {
          database.updateResourceVulnerabilities(
            resource_id,
            scanResult.vulnerabilities,
          );
          response
            .status(200)
            .json({ result: scanResult.totalVulnerabilities });
        },
      );
      return response;
    },
  );
};
