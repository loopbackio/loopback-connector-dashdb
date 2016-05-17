// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-connector-dashdb
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

module.exports = require('should');

var DataSource = require('loopback-datasource-juggler').DataSource;

var config = {
  username: process.env.DASHDB_USERNAME,
  password: process.env.DASHDB_PASSWORD,
  hostname: process.env.DASHDB_HOSTNAME || 'localhost',
  port: process.env.DASHDB_PORTNUM || 60000,
  database: process.env.DASHDB_DATABASE || 'testdb',
  schema: process.env.DASHDB_SCHEMA || 'STRONGLOOP',
};

global.config = config;

global.getDataSource = global.getSchema = function(options) {
  var db = new DataSource(require('../'), config);
  return db;
};

global.sinon = require('sinon');
