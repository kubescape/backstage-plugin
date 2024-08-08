import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { KubescapeDatabse } from '../database/KubescapeDatabase';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  database: KubescapeDatabse;
}
