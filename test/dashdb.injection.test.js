// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: loopback-connector-dashdb
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

/* eslint-env node, mocha */
process.env.NODE_ENV = 'test';

require('./init.js');
require('should');

let db, Customer;

describe('parameterized SQL', function() {
  before(function(done) {
    db = global.getDataSource();
    Customer = db.define('Customer', {
      name: {type: String},
      pass: {type: String},
    });
    db.automigrate('Customer', function(err) {
      if (err) return done(err);
      const samples = [
        {name: 'Zoe', pass: '123'},
        {name: 'John', pass: '456'},
      ];
      Customer.create(samples, done);
    });
  });
  it('does not return result with SQL injection', function(done) {
    // generate injectedSQL as `SELECT * FROM Customer WHERE name ="" or 1=1`
    // 1=1 is always true
    const injectedFilter = {
      where: {or: [{name: ''}, {1: 1}]},
    };
    Customer.find(injectedFilter, function(err, result) {
      if (err) return done(err);
      result.length.should.equal(0);
      done();
    });
  });
});
