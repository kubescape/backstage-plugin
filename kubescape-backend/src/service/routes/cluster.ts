import { execSync } from 'child_process';
import { Router, Request } from 'express';
import { Control, RouterOptions } from '../../util/types';
import * as fs from 'fs';

export const clusterRoutes = (router: Router, options: RouterOptions) => {
  const { httpAuth, userInfo, logger, config, database } = options;

  router.get('/clusters', async (request, response) => {
    const credentials = await httpAuth.credentials(request, {
      allow: ['user'],
    });
    const info = await userInfo.getUserInfo(credentials);
    database.getClusterList(info.userEntityRef).then(clustetInfo => {
      return response.status(200).json(clustetInfo);
    });
    return response;
  });

  router.post('/addCluster', async (request, response) => {
    const credentials = await httpAuth.credentials(request, {
      allow: ['user'],
    });
    const info = await userInfo.getUserInfo(credentials);
    const name = request.body.name;
    const clusterConfig = request.body.config;
    fs.writeFileSync('./config.yml', clusterConfig);

    console.log(`Current directory: `);
    let connection: string;
    try {
      connection = execSync(
        `kubectl --kubeconfig=\'./config.yml\' get all -A`,
        { encoding: 'utf8', stdio: 'inherit' },
      );
    } catch (e) {
      console.log(e);
      return response
        .status(500)
        .json({ result: 'failed to connect with provided config' });
    }

    database
      .addCluster(name, clusterConfig, info.userEntityRef)
      .then(clusterId => {
        return response.status(200).json({ result: clusterId });
      });
  });
};
