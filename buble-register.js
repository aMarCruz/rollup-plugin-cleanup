/**
 * the loading of buble/register fail in node v0.12, fix it here.
 */
/* eslint-disable max-len */
'use strict'

var bubleRegister

try {
  bubleRegister = require.resolve('./node_modules/rollup-plugin-buble/node_modules/buble/register')
} catch (_) {
  bubleRegister = require.resolve('buble/register')
}

module.exports = require(bubleRegister)
