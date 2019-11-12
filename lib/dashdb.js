// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-connector-dashdb
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

const g = require('./globalize');

/*!
 * DASHDB connector for LoopBack
 */
const IBMDB = require('loopback-ibmdb').IBMDB;
const SqlConnector = require('loopback-connector').SqlConnector;
const ParameterizedSQL = SqlConnector.ParameterizedSQL;
const util = require('util');
const debug = require('debug')('loopback:connector:dashdb');
const async = require('async');

/**
 * Initialize the IBMDB connector for the given data source
 *
 * @param {DataSource} ds The data source instance
 * @param {Function} [cb] The cb function
 */
exports.initialize = function(ds, cb) {
  ds.connector = new DASHDB(ds.settings);
  ds.connector.dataSource = ds;

  cb();
};

function DASHDB(settings) {
  debug('DASHDB constructor settings: %j', settings);
  IBMDB.call(this, 'dashdb', settings);
}

util.inherits(DASHDB, IBMDB);

/**
 * Create the data model in DASHDB
 *
 * @param {string} model The model name
 * @param {Object} data The model instance data
 * @param {Object} options Options object
 * @param {Function} [callback] The callback function
 */
DASHDB.prototype.create = function(model, data, options, callback) {
  const self = this;
  const stmt = self.buildInsert(model, data, options);
  const idName = self.idColumn(model);
  const sql = new ParameterizedSQL('SELECT \"' + idName +
    '\" FROM FINAL TABLE (');
  sql.merge(stmt, '');
  sql.merge(new ParameterizedSQL(')'), '');
  self.execute(sql.sql, stmt.params, options, function(err, info) {
    if (err) {
      callback(err);
    } else {
      callback(err, info[0][idName]);
    }
  });
};

/**
 * Update all instances that match the where clause with the given data
 *
 * @param {string} model The model name
 * @param {Object} where The where object
 * @param {Object} data The property/value object representing changes
 * to be made
 * @param {Object} options The options object
 * @param {Function} cb The callback function
 */
DASHDB.prototype.update = function(model, where, data, options, cb) {
  const self = this;
  const stmt = self.buildUpdate(model, where, data, options);
  const idName = self.idColumn(model);

  const sql = new ParameterizedSQL('SELECT COUNT(\"' + idName +
    '\") AS \"affectedRows\" ' + 'FROM FINAL TABLE (');
  sql.merge(stmt);
  sql.merge(new ParameterizedSQL(')'));
  self.execute(sql.sql, stmt.params, options, function(err, info) {
    if (cb) {
      cb(err, {count: parseInt(info[0] ? info[0].affectedRows : 0)});
    }
  });
};

/**
 * Delete all matching model instances
 *
 * @param {string} model The model name
 * @param {Object} where The where object
 * @param {Object} options The options object
 * @param {Function} cb The callback function
 */
DASHDB.prototype.destroyAll = function(model, where, options, cb) {
  const self = this;
  const stmt = self.buildDelete(model, where, options);
  const idName = self.idColumn(model);

  const sql = new ParameterizedSQL('SELECT COUNT(\"' + idName +
    '\") AS \"affectedRows\" ' + 'FROM OLD TABLE (');
  sql.merge(stmt);
  sql.merge(new ParameterizedSQL(')'));
  self.execute(sql.sql, stmt.params, options, function(err, info) {
    if (cb) {
      cb(err, {count: parseInt(info[0].affectedRows)});
    }
  });
};

DASHDB.prototype.createTable = function(model, cb) {
  const self = this;
  const tableName = self.tableEscaped(model);
  const tableSchema = self.schema;
  const columnDefinitions = self.buildColumnDefinitions(model);
  const tasks = [];

  if (self.supportColumnStore && self.supportColumnStore === true) {
    return cb(new Error(g.f('Column organized tables are not ' +
                        'currently supported')));
  } else {
    tasks.push(function(callback) {
      const sql = new ParameterizedSQL('CREATE TABLE ' + tableSchema + '.' +
        tableName + ' (' + columnDefinitions + ') ORGANIZE BY ROW;');
      self.execute(sql.sql, sql.params, callback);
    });
  }

  const indexes = self.buildIndexes(model);
  indexes.forEach(function(i) {
    tasks.push(function(callback) {
      self.execute(i, callback);
    });
  });

  async.series(tasks, cb);
};

require('./discovery')(DASHDB);
require('./transaction')(DASHDB);
