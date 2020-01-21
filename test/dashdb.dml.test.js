// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: loopback-connector-dashdb
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

/* eslint-env node, mocha */
process.env.NODE_ENV = 'test';

require('should');

let db, FloatingPoint;

describe('dml', function() {
  before(function() {
    require('./init.js');
  });

  describe('insert and patch', function() {
    before(function(done) {
      db = global.getDataSource();

      FloatingPoint = db.define('FLOATING_POINT', {
        id: {type: String, length: 20, index: true},
        aFloat: {type: Number, dashdb: {dataType: 'double'}},
      });
      db.automigrate('FLOATING_POINT', done);
    });

    // Return an async function create a record in floating_point table
    function createRecInFP(rec) {
      return function(done) {
        FloatingPoint.create(rec,
          function(err, p) {
            if (err) {
              done(err);
            } else {
              done();
            }
          });
      };
    }

    describe('patch', function() {
      const rec = {aFloat: 42.234567};
      before(createRecInFP(rec));

      it('should fail with a specific SQL error', async function() {
        await FloatingPoint.updateAll(rec, {aFloat: 42.234567890123456789})
          .should.be.rejectedWith(
            '[IBM][CLI Driver] CLI0135E  Invalid scale value. SQLSTATE=HY094',
          );
      });
    });
  });
});
