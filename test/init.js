// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-connector-dashdb
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

module.exports = require('should');

var DataSource = require('loopback-datasource-juggler').DataSource;

/** these are the env variables in jenkins **/
if (process.env.CI && process.env.ghprbGhRepository &&
  (process.env.BUILD_NUMBER || process.env.BUILD_ID) &&
  (process.env.nodeVersion || process.env.node)) {
  var buildName = process.env.ghprbGhRepository.split('-')[2].toUpperCase();
  var buildNumber = process.env.BUILD_NUMBER || process.env.BUILD_ID;
  var nodeVersion = process.env.nodeVersion || process.env.node;
  var os = process.env.OS || process.platform;
  var schemaName = 'SCHEMA' + buildNumber + '_' + buildName +
    '_' + os.toUpperCase() + '_' + nodeVersion;
}

var config = {
  username: process.env.DASHDB_USERNAME,
  password: process.env.DASHDB_PASSWORD,
  hostname: process.env.DASHDB_HOSTNAME || 'localhost',
  port: process.env.DASHDB_PORTNUM || 60000,
  database: process.env.DASHDB_DATABASE || 'testdb',
  schema: schemaName || process.env.DASHDB_SCHEMA || 'STRONGLOOP',
};

global.config = config;

global.getDataSource = global.getSchema = function(options) {
  var db = new DataSource(require('../'), config);
  return db;
};

global.connectorCapabilities = {
  ilike: false,
  nilike: false,
};

global.sinon = require('sinon');
