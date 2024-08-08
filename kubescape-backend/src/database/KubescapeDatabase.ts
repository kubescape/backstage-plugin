import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

import { Client, Knex } from 'knex';

export interface Control {
  created: Date;
  name: string;
  control_id: string;
  severity: string;
  compliance_score: number;
  cluster_id: number;
}

export interface Resource {
  created: Date;
  resource_id: string;
  name: string;
  kind: string;
  namespace: string;
  cluster_id?: number;
  control_list?: string[];
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

  async updateFailedResource(newResources: Resource[]) {
    await this.db('resources').where('cluster_id', 0).del();
    await this.db.insert(newResources, ['id']).into('resources');
  }

  async updateControls(newControls: Control[]) {
    await this.db('controls').where('cluster_id', 0).del();
    await this.db.insert(newControls, ['id']).into('controls');
  }
}
