import { Router, Request } from 'express';
import { Control, RouterOptions } from '../../util/types';

export const clusterRoutes = (router: Router, options: RouterOptions) => {
  const { logger, config, database } = options;

  router.get('/clusters', (_, response) => {
    database.getClusterList().then(clustetInfo => {
      return response.status(200).json(clustetInfo);
    });
    return response;
  });

  router.post('/addCluster', (request, response) => {
    const name = request.body.name;
    const clusterConfig = request.body.config;
    console.log(request);
    database.addCluster(name, clusterConfig).then(clusterId => {
      return response.status(200).json({ result: clusterId });
    });
  });
};
