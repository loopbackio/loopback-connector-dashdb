// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-connector-dashdb
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

/*!
 * dashDB connector for LoopBack
 */
var DB2 = require('loopback-connector-db2').DB2;
var util = require('util');
var debug = require('debug')('loopback:connector:dashdb');
var async = require('async');

/**
 * Initialize the IBMDB connector for the given data source
 *
 * @param {DataSource} ds The data source instance
 * @param {Function} [cb] The cb function
 */
exports.initialize = function(ds, cb) {
  ds.connector = new DB2(ds.settings);
  ds.connector.dataSource = ds;
  if (cb) {
    if (ds.settings.lazyConnect) {
      process.nextTick(function() {
        cb();
      });
    } else {
      ds.connector.connect(cb);
    }
  }
};

function DASHDB(settings) {
  debug('DB2 constructor settings: %j', settings);
  DB2.call(this, settings);
}

util.inherits(DASHDB, DB2);

DASHDB.prototype.createTable = function(model, cb) {
  var self = this;
  var tableName = self.tableEscaped(model);
  var tableSchema = self.schema;
  var columnDefinitions = self.buildColumnDefinitions(model);
  var tasks = [];

  if (self.supportColumnStore && self.supportColumnStore === true) {
    return cb(new Error('Column organized tables are not ' +
                        'currently supported'));
  } else {
    tasks.push(function(callback) {
      var sql = 'CREATE TABLE ' + tableSchema + '.' + tableName +
          ' (' + columnDefinitions + ') ORGANIZE BY ROW;';
      self.execute(sql, callback);
    });
  }

  var indexes = self.buildIndexes(model);
  indexes.forEach(function(i) {
    tasks.push(function(callback) {
      self.execute(i, callback);
    });
  });

  async.series(tasks, cb);
};
