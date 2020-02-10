// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: loopback-connector-dashdb
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

/* eslint-env node, mocha */
process.env.NODE_ENV = 'test';
require('./init.js');
const assert = require('assert');
const DataSource = require('loopback-datasource-juggler').DataSource;

let db, config, SimplePost;

describe('query test', function() {
  before(function(done) {
    db = global.getDataSource();
    config = global.config;
    SimplePost = db.define('SimplePost', {
      title: {type: String},
      content: {type: String},
    });
    db.automigrate(function(err) {
      assert(!err);
      SimplePost.create(data, done);
    });
  });

  after(function(done) {
    SimplePost.destroyAll(done);
  });

  it('find all data', function(done) {
    SimplePost.find(function(err, posts) {
      assert(!err);
      assert(posts);
      assert.equal(posts.length, data.length);
      done();
    });
  });

  context('regexp operator', function() {
    before(function makeData(done) {
      db.automigrate(function(err) {
        assert(!err);
        SimplePost.create(data, done);
      });
    });
    after(function cleanUpData(done) {
      SimplePost.destroyAll(done);
    });

    context('using no flags', function() {
      it('as regex string', function(done) {
        SimplePost.find({where: {content: {regexp: '^H'}}},
          function(err, posts) {
            assert(!err);
            assert(posts);
            assert.equal(posts.length, 1);
            assert.equal(posts[0].content, data[0].content);
            done();
          });
      });

      it('as regex literal', function(done) {
        SimplePost.find({where: {content: {regexp: /^H/}}},
          function(err, posts) {
            assert(!err);
            assert(posts);
            assert.equal(posts.length, 1);
            assert.equal(posts[0].content, data[0].content);
            done();
          });
      });

      it('as regex object', function(done) {
        SimplePost.find({where: {content: {regexp: new RegExp(/^H/)}}},
          function(err, posts) {
            assert(!err);
            assert(posts);
            assert.equal(posts.length, 1);
            assert.equal(posts[0].content, data[0].content);
            done();
          });
      });
    });

    context('using flags', function() {
      it('as regex string', function(done) {
        SimplePost.find({where: {content: {regexp: '^h/i'}}},
          function(err, posts) {
            assert(!err);
            assert(posts);
            assert.equal(posts.length, 1);
            assert.equal(posts[0].content, data[0].content);
            done();
          });
      });

      it('as regex literal', function(done) {
        SimplePost.find({where: {content: {regexp: /^h/i}}},
          function(err, posts) {
            assert(!err);
            assert(posts);
            assert.equal(posts.length, 1);
            assert.equal(posts[0].content, data[0].content);
            done();
          });
      });

      it('as regex object', function(done) {
        SimplePost.find({where: {content: {regexp: new RegExp(/^h/i)}}},
          function(err, posts) {
            assert(!err);
            assert(posts);
            assert.equal(posts.length, 1);
            assert.equal(posts[0].content, data[0].content);
            done();
          });
      });
    });
  });

  context('like operator', function() {
    before(function makeData(done) {
      db.automigrate(function(err) {
        assert(!err);
        SimplePost.create(data, done);
      });
    });
    after(function cleanUpData(done) {
      SimplePost.destroyAll(done);
    });

    it('find using like operator', function(done) {
      SimplePost.find({where: {content: {like: 'He%w%'}}},
        function(err, posts) {
          assert(!err);
          assert(posts);
          assert.equal(posts.length, 1);
          assert.equal(posts[0].content, data[0].content);
          done();
        });
    });
  });

  context('nlike operator', function() {
    before(function makeData(done) {
      db.automigrate(function(err) {
        assert(!err);
        SimplePost.create(data, done);
      });
    });
    after(function cleanUpData(done) {
      SimplePost.destroyAll(done);
    });

    it('find using nlike operator', function(done) {
      SimplePost.find({where: {content: {nlike: 'He%w%'}}},
        function(err, posts) {
          assert(!err);
          assert(posts);
          assert.equal(posts.length, 2);
          done();
        });
    });
  });
});

const data = [{
  title: 'Post1',
  content: 'Hello world!',
}, {
  title: 'Post2',
  content: 'Foo',
}, {
  title: 'Post3',
  content: 'baz',
}];
