import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

import { Knex } from 'knex';

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

  //   async postFailedResource();
}
