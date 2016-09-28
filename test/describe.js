'use strict';
if (process.env.CI) {
  return;
}

module.exports = process.env.CI ? describe.skip.bind(describe) : describe;
