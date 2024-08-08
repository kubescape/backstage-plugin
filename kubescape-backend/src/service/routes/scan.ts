import { Router } from 'express';
import { RouterOptions } from '../../util/types';
import { basicScan } from './scan.service';

export const scanRoutes = (router: Router, options: RouterOptions) => {
  const { logger, config } = options;

  router.get('/scan', (_, response) => {
    logger.info('SCAN!');
    const result = basicScan();
    response.json({ status: 'scan task received', scanResult: '' });
  });
};
