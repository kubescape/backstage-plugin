import { Router, Request } from 'express';
import { Control, RouterOptions } from '../../util/types';
import {
  // basicScan,
  complianceScan,
  getControlListByResourceID,
  getResourceList,
  getVulnerabilityListByResourceID,
  workloadScan,
} from './scan.service';
import { KubescapeDatabse } from '../../database/KubescapeDatabase';

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

  router.get('/complianceScan', (request, response) => {
    const clusterID = request.query.clusterID;
    logger.info(`Compliance scan cluster ${clusterID}`);
    try {
      complianceScan(database, clusterID).then(() => {
        response.json({ status: 'success', scanResult: 'scan successful' });
      });
    } catch {
      response.json({ status: 'error', scanResult: 'scan failed' });
    }
    return response;
  });

  router.get('/getResourceList', (request, response) => {
    const clusterID = request.query.clusterID;
    logger.info(`get resources from cluster ${clusterID}`);
    try {
      getResourceList(database, clusterID as number).then(resources => {
        response.json({ status: 'success', scanResult: resources });
      });
    } catch {
      response.json({ status: 'error', scanResult: 'scan failed' });
    }
    return response;
  });

  router.get(
    '/resourceControls',
    (request: Request<{}, {}, {}, UserQuery>, response) => {
      const cluster_id = request.query.cluster_id as number;
      const resource_id = request.query.resource_id as string;
      if (cluster_id === undefined || resource_id === undefined) {
        return response.status(400).json({ error: 'Invalid Query Parameter' });
      }
      getControlListByResourceID(database, cluster_id, resource_id).then(
        data => {
          response.status(200).json({ result: data });
        },
      );
      return response;
    },
  );

  router.get(
    '/resourceVulnerabilities',
    (request: Request<{}, {}, {}, UserQuery>, response) => {
      const cluster_id = request.query.cluster_id as number;
      const resource_id = request.query.resource_id as string;
      if (cluster_id === undefined || resource_id === undefined) {
        return response.status(400).json({ error: 'Invalid Query Parameter' });
      }
      getVulnerabilityListByResourceID(database, cluster_id, resource_id).then(
        data => {
          console.log(`data is ${data}`);
          response.status(200).json({ result: data });
        },
      );
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
          database.updateVulnerabilities(
            resource_id,
            scanResult.vulnerabilities,
            scanResult.totalVulnerabilities,
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

function getClusterSummary(database: KubescapeDatabse, arg1: number) {
  throw new Error('Function not implemented.');
}
