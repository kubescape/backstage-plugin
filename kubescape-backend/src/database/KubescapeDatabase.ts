import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

import { Client, Knex } from 'knex';
import { Resource, Control, SeverityItem, Cluster } from '../util/types';
import { config } from 'winston';
import { VulnerabilitiesInfo } from '../service/routes/scan.service';

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

  async updateFailedResource(newResources: Resource[]) {
    await this.db('resources').where('cluster_id', 0).del();
    await this.db.insert(newResources, ['id']).into('resources');
  }

  async updateControls(newControls: Control[]) {
    await this.db('controls').where('cluster_id', 0).del();
    await this.db.insert(newControls, ['id']).into('controls');
  }

  async getResourceList(cluster_id: number): Promise<Resource[]> {
    const result: Resource[] = await this.db('resources')
      .where('cluster_id', cluster_id)
      .select();
    return result;
  }

  async getControlsByResource(
    cluster_id: number,
    resource_id: string,
  ): Promise<Control[] | undefined> {
    const resource: Resource = await this.db('resources')
      .where('cluster_id', cluster_id)
      .where('resource_id', resource_id)
      .first();
    if (resource === undefined) {
      return undefined;
    }
    const controlRows: Control[] = await this.db('controls')
      .where('cluster_id', cluster_id)
      .whereIn(
        'control_id',
        (resource.control_list as SeverityItem[]).map(obj => obj.id),
      );
    return controlRows;
  }

  async updateResourceVulnerabilities(
    resource_id: string,
    vulnerabilities: VulnerabilitiesInfo[],
  ) {
    await this.db('vulnerabilities').where('resource_id', resource_id).del();
    // console.log(vulnerabilities);s
    await this.db.insert(vulnerabilities, ['id']).into('vulnerabilities');
  }

  async addCluster(
    cluster_name: string,
    cluster_config: string,
  ): Promise<string> {
    if (
      (await this.db('clusters').where('name', cluster_name).first()) !==
      undefined
    ) {
      return 'Name already used';
    }
    await this.db
      .insert({ name: cluster_name, kubeconf: cluster_config }, ['id'])
      .into('clusters');
    return 'success';
  }

  async getClusterList(): Promise<Cluster[]> {
    return await this.db('clusters').select();
  }
}
