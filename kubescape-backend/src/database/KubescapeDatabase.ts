import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

import { Client, Knex } from 'knex';
import { Resource, Control, SeverityItem, Cluster } from '../util/types';
import { config } from 'winston';
import { VulnerabilitiesInfo } from '../service/routes/scan.service';
import { json } from 'express';

export interface SeveritySummary {
  scanDate: Date;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    unknown: number;
  };
}

export interface DBCluster {
  name: string;
  kubeconf: object;
  nsaScore: number;
  mitreScore: number;
  history: SeveritySummary[];
}

export interface DBResource {
  resourceID: string;
  clusterID: string;
  name: string;
  kind: string;
  namespace: string;
  controlScanDate: Date;
  controlSummary: SeveritySummary;
  controlList: string | SeverityItem[];
  imageScanDate?: Date;
  imageSummary?: SeveritySummary;
}

export interface DBControl {
  controlID: string;
  scanDate: Date;
  clusterID: number;
  name: string;
  severity: string;
  complianceScore: number;
}

export interface DBVulnerability {
  CVE_ID: string;
  resourceID: string;
  severity: string;
  package: string;
  version: string;
  fixVersions: string[];
  fixedState: string;
}

export class KubescapeDatabse {
  private readonly db: Knex;

  private constructor(db: Knex) {
    this.db = db;
  }

  static async create(database: DatabaseService): Promise<KubescapeDatabse> {
    const client = await database.getClient();
    const migrationsDir = resolvePackagePath(
      '@internal/backstage-plugin-kubescape-backend',
      'migrations',
    );
    // test code
    await client.migrate.down({
      directory: migrationsDir,
    });

    if (!database.migrations?.skip) {
      try {
        await client.migrate.latest({
          directory: migrationsDir,
        });
        console.log('Migrations completed successfully');
      } catch (error) {
        console.error('Error running migrations:', error);
      }
    }
    return new KubescapeDatabse(client);
  }

  async updateClusterHistory(
    clusterID,
    nsaScore: number,
    mitreScore: number,
    scanDate: Date,
    controlSummary: SeveritySummary | string,
  ) {
    const history = await this.db('clusters')
      .where('name', clusterID)
      .select('history');
    history.push({ scanDate: scanDate, summary: controlSummary });

    await this.db('clusters')
      .where('name', clusterID)
      .update({
        nsaScore: nsaScore,
        mitreScore: mitreScore,
        history: JSON.stringify(history),
      });
  }

  async updateResources(clusterID, newResources: DBResource[]) {
    await this.db('resources').where('clusterID', clusterID).del();
    await this.db.insert(newResources, ['id']).into('resources');
  }

  async updateControls(clusterID, newControls: DBControl[]) {
    await this.db('controls').where('clusterID', clusterID).del();
    await this.db.insert(newControls, ['id']).into('controls');
  }

  async getResourceList(clusterID: number): Promise<DBResource[]> {
    const result: DBResource[] = await this.db('resources')
      .where('clusterID', clusterID)
      .select();
    // console.log(result);
    return result;
  }

  async getClusterSummary(clusterID: number): Promise<DBCluster> {
    const result: DBCluster = await this.db('clusters')
      .where('name', clusterID)
      .first();
    // console.log(result);
    return result;
  }

  async getControlsByResource(
    clusterID: number,
    resourceID: string,
  ): Promise<DBControl[] | undefined> {
    const resource: DBResource = await this.db('resources')
      .where('clusterID', clusterID)
      .where('resourceID', resourceID)
      .first();
    if (resource === undefined) {
      return undefined;
    }
    const controlRows: DBControl[] = await this.db('controls')
      .where('clusterID', clusterID)
      .whereIn(
        'controlID',
        (resource.controlList as SeverityItem[]).map(obj => obj.id),
      );
    return controlRows;
  }

  async getVulnerabilitiesByResource(
    clusterID: number,
    resourceID: string,
  ): Promise<DBVulnerability[] | undefined> {
    console.log(resourceID);
    const resource: DBResource = await this.db('resources')
      .where('clusterID', clusterID)
      .where('resourceID', resourceID)
      .first();
    if (resource === undefined) {
      return undefined;
    }
    const vulnerabilitiesRows: DBVulnerability[] = await this.db(
      'vulnerabilities',
    )
      // .where('clusterID', clusterID)
      .where('resourceID', resourceID);
    return vulnerabilitiesRows;
  }

  async updateVulnerabilities(
    resourceID: string,
    vulnerabilities: DBVulnerability[],
    vulnerabilitySummary: SeveritySummary,
  ) {
    await this.db('vulnerabilities').where('resourceID', resourceID).del();
    await this.db.insert(vulnerabilities, ['id']).into('vulnerabilities');
    await this.db('resources')
      .where('resourceID', resourceID)
      .update({ imageSummary: vulnerabilitySummary }, ['id']);
  }

  async initWorkloadScan(resourceID: string) {
    await this.db('resources')
      .where('resourceID', resourceID)
      .update({ imageScanDate: new Date() }, ['id']);
  }

  async addCluster(
    cluster_name: string,
    cluster_config: string,
    owner: string,
  ): Promise<string> {
    if (
      (await this.db('clusters').where('name', cluster_name).first()) !==
      undefined
    ) {
      return 'Name already used';
    }
    await this.db
      .insert(
        {
          name: cluster_name,
          kubeconf: cluster_config,
          history: JSON.stringify([]),
          ownership: owner,
        },
        ['id'],
      )
      .into('clusters');
    return 'success';
  }

  async getClusterList(user: string): Promise<Cluster[]> {
    return await this.db('clusters').where('ownership', user);
  }

  async getClusterConfig(cluster: string): Promise<Cluster> {
    return await this.db('clusters').first();
    // return await this.db('cluster').where('name', cluster).first();
  }
}
