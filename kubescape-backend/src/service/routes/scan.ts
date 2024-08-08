import { Router } from 'express';
import { RouterOptions } from '../../util/types';
import { basicScan } from './scan.service';

export const scanRoutes = (router: Router, options: RouterOptions) => {
  const { logger, config, database } = options;

  router.get('/scan', (_, response) => {
    logger.info('SCAN!');
    const result = basicScan(database);
    // database.updateFailedResource([
    //   {
    //     created: new Date(),
    //     resource_id: 'testresource',
    //     name: 'test',
    //     kind: 'test',
    //     namespace: 'na',
    //     control_list: [],
    //     cluster_id: 0,
    //   },
    //   {
    //     created: new Date(),
    //     resource_id: 'testresource2',
    //     name: 'test',
    //     kind: 'test',
    //     namespace: 'na',
    //     control_list: [],
    //     cluster_id: 0,
    //   },
    // ]);
    response.json({ status: 'scan task received', scanResult: '' });
  });
};
