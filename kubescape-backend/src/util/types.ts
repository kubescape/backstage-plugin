import {
  HttpAuthService,
  LoggerService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { KubescapeDatabse } from '../database/KubescapeDatabase';

export interface RouterOptions {
  userInfo: UserInfoService;
  httpAuth: HttpAuthService;
  logger: LoggerService;
  config: Config;
  database: KubescapeDatabse;
}

export interface Control {
  created: Date;
  name: string;
  control_id: string;
  severity: string;
  compliance_score: number;
  cluster_id: number;
}

export interface Resource {
  resource_id: string;
  name: string;
  kind: string;
  namespace: string;
  control_list: string | SeverityItem[];
  controlScanDate: Date;
  CVE_list: SeverityItem[];
  imageScanDate?: Date;
  cluster_id: number;
}

export interface Cluster {
  name: string;
  kubeconf: string;
}

export interface SeverityItem {
  name: string;
  id: string;
  severity: string;
}
