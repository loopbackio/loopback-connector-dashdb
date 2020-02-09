// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-connector-dashdb
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

const g = require('./globalize');
const debug = require('debug')('loopback:connector:dashdb:transaction');
const Transaction = require('loopback-connector').Transaction;

module.exports = mixinTransaction;

const mapIsolationLevel = function(isolationLevelString) {
  let ret = 2;
  switch (isolationLevelString) {
    case Transaction.READ_UNCOMMITTED:
      ret = 1;
      break;
    case Transaction.SERIALIZABLE:
      ret = 4;
      break;
    case Transaction.REPEATABLE_READ:
      ret = 8;
      break;
    case Transaction.READ_COMMITTED:
    default:
      ret = 2;
      break;
  }

  return ret;
};

/*!
 * @param {DASHDB} DASHDB connector class
 */
function mixinTransaction(DASHDB, dashdb) {
  /**
   * Begin a new transaction

   * @param {Integer} isolationLevel
   * @param {Function} cb
   */
  DASHDB.prototype.beginTransaction = function(isolationLevel, cb) {
    debug('Begin a transaction with isolation level: %s', isolationLevel);

    const self = this;

    self.client.open(self.connStr, function(err, connection) {
      if (err) return cb(err);
      connection.beginTransaction(function(err) {
        if (isolationLevel) {
          connection.setIsolationLevel(mapIsolationLevel(isolationLevel));
        }

        cb(err, connection);
      });
    });
  };

  /**
   * Commit a transaction
   *
   * @param {Object} connection
   * @param {Function} cb
   */
  DASHDB.prototype.commit = function(connection, cb) {
    debug('Commit a transaction');
    connection.commitTransaction(function(err) {
      if (err) return cb(err);
      connection.close(cb);
    });
  };

  /**
   * Roll back a transaction
   *
   * @param {Object} connection
   * @param {Function} cb
   */
  DASHDB.prototype.rollback = function(connection, cb) {
    debug('Rollback a transaction');
    connection.rollbackTransaction(function(err) {
      if (err) return cb(err);
      // connection.setAutoCommit(true);
      connection.close(cb);
    });
  };
}
