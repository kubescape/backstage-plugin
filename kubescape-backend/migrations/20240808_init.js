/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
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
      table.string('namespace');
      table.json('control_list');
      table.datetime('created').notNullable();
      table.integer('cluster_id').notNullable();
      table.index('resource_id')
    });
  
  };
  
  /**
   * @param {import('knex').Knex} knex
   */
  exports.down = async function down(knex) {
    await knex.schema.dropTable('controls');
    await knex.schema.dropTable('resources');
  };
  