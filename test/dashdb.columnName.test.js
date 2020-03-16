// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-connector-dashdb
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

/* eslint-env node, mocha */
process.env.NODE_ENV = 'test';

require('./init.js');
const assert = require('assert');

let bookId, db, Book;
const BOOK_TITLE = 'Rocky I';
const REVISED_BOOK_TITLE = 'Rocky II';

/*
   This test suite is to test the changes surrounding the fixes
   in loopback-ibmdb related to issues :
   https://github.com/strongloop/loopback-ibmdb/issues/79
   https://github.com/strongloop/loopback-ibmdb/issues/84
*/

describe('replaceById with custom column name for bookId', () => {
  // 'table' option specified since we want a table 'BOOK'
  // to be created for model 'Book'
  const BOOK_TABLE_OPTIONS = {
    dashdb: {
      table: 'BOOK',
    },
  };
    // 'columnName' options specified since  want columns 'BOOK_ID' and 'TITLE'
    // to be created instead of 'bookId' and 'title'
  const BOOK_PROPERTIES = {
    bookId: {
      type: Number,
      id: true,
      generated: true,
      dashdb: {
        columnName: 'BOOK_ID',
      },
    },
    title: {
      type: String,
      dashdb: {
        columnName: 'TITLE',
      },
    },
  };
  before(() => {
    db = global.getDataSource();
    Book = db.define('Book', BOOK_PROPERTIES, BOOK_TABLE_OPTIONS);
  });
  it('create and replace a book', async () => {
    await db.automigrate('Book');
    const newBook = await Book.create({title: BOOK_TITLE});
    assert(newBook);
    assert.equal(newBook.title, BOOK_TITLE);
    // use the bookId (id property) to ensure
    // replaceById and find return same value
    bookId = newBook.bookId;
    // eslint-disable-next-line max-len
    const updatedBook = await Book.replaceById(bookId, {title: REVISED_BOOK_TITLE});
    assert(updatedBook);
    assert.equal(updatedBook.bookId, bookId);
    assert.equal(updatedBook.title, REVISED_BOOK_TITLE);
    // perform a get and see if bookId is still same.
    const foundBooks = await Book.find({where: {content: {like: 'Rocky%'}}});
    assert(foundBooks);
    assert.equal(foundBooks.length, 1);
    assert.equal(foundBooks[0].bookId, bookId);
  });
});

describe('replaceById with model name for bookId', () => {
  // No 'table' option specified since we want a table 'Book'
  // to be created for model 'Book'

  // No 'columnName' options specified since we want columns 'bookId' and 'title'
  // to be created for properties 'bookId' and 'title'
  const BOOK_PROPERTIES = {
    bookId: {
      type: Number,
      id: true,
      generated: true,
    },
    title: {
      type: String,
    },
  };
  before(() => {
    db = global.getDataSource();
    Book = db.define('Book', BOOK_PROPERTIES);
  });
  it('create and replace a book', async () => {
    await db.automigrate('Book');
    const newBook = await Book.create({title: BOOK_TITLE});
    assert(newBook);
    assert.equal(newBook.title, BOOK_TITLE);
    // use the bookId (id property) to ensure
    // replaceById and find return same value
    bookId = newBook.bookId;
    // eslint-disable-next-line max-len
    const updatedBook = await Book.replaceById(bookId, {title: REVISED_BOOK_TITLE});
    assert(updatedBook);
    assert.equal(updatedBook.bookId, bookId);
    assert.equal(updatedBook.title, REVISED_BOOK_TITLE);
    // perform a get and see if bookId is still same.
    const foundBooks = await Book.find({where: {content: {like: 'Rocky%'}}});
    assert(foundBooks);
    assert.equal(foundBooks.length, 1);
    assert.equal(foundBooks[0].bookId, bookId);
  });
});
