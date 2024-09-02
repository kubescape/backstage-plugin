/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
    await knex.schema.createTable('clusters', table => {
      table.increments('id');
      table.string('name').notNullable()
      table.text('kubeconf').notNullable()
      table.index('name')
    });

    await knex.schema.createTable('controls', table => {
      // cluster id, resources
      table.increments('id');
      table.string('control_id').notNullable();
      table.string('name').notNullable();
      table.string('severity').notNullable();
      table.datetime('created').notNullable();
      table.decimal('compliance_score').notNullable();
      table.integer('cluster_id').notNullable();
      table.index('control_id')
    });

    await knex.schema.createTable('resources', table => {
      // cluster id
      table.increments('id');
      table.text('resource_id').notNullable();
      table.string('name').notNullable();
      table.string('kind').notNullable();
      table.string('namespace').notNullable();
      table.json('control_list').notNullable();
      table.datetime('controlScanDate').notNullable();
      table.json('CVE_list').notNullable();
      table.dateTime('imageScanDate')
      table.integer('cluster_id').notNullable();
      table.index('resource_id')
    });

    await knex.schema.createTable('vulnerabilities', table => {
      // cluster id
      table.increments('id');
      table.text('resource_id').notNullable()
      table.string('vulnerabilities_id').notNullable();
      table.string('severity').notNullable();
      table.string('package').notNullable();
      table.string('version').notNullable();
      table.json('fixVersions').notNullable();
      table.string('fixedState').notNullable();
    });
  };
  
  /**
   * @param {import('knex').Knex} knex
   */
  exports.down = async function down(knex) {
    await knex.schema.dropTable('controls');
    await knex.schema.dropTable('resources');
    await knex.schema.dropTable('clusters');
    await knex.schema.dropTable('vulnerabilities');
  };
  