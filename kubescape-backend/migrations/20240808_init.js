/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
    await knex.schema.createTable('clusters', table => {
      table.increments('id');
      table.string('name').notNullable()
      table.text('kubeconf').notNullable()
      table.float('nsaScore')
      table.float('mitreScore')
      table.json('history').notNullable() // [{data:data, severitySummary: severitySummary}]
      table.index('name')
    });

    await knex.schema.createTable('controls', table => {
      // cluster id, resources
      table.increments('id');
      table.string('controlID').notNullable();
      table.string('name').notNullable();
      table.string('severity').notNullable();
      table.datetime('scanDate').notNullable();
      table.decimal('complianceScore').notNullable();
      table.integer('clusterID').notNullable();
      table.index('controlID')
    });

    await knex.schema.createTable('resources', table => {
      // cluster id
      table.increments('id');
      table.text('resourceID').notNullable();
      table.integer('clusterID').notNullable();
      table.string('name').notNullable();
      table.string('kind').notNullable();
      table.string('namespace').notNullable();
      table.datetime('controlScanDate').notNullable();
      table.json('controlSummary').notNullable();  
      table.json('controlList').notNullable();
      table.dateTime('imageScanDate')
      table.json('imageSummary');
      table.index('resourceID')
    });

    await knex.schema.createTable('vulnerabilities', table => {
      // cluster id
      table.increments('id');
      table.text('resourceID').notNullable()
      table.string('CVE_ID').notNullable();
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
  