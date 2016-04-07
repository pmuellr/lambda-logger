'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')

const pkg = require('../package.json')

const PROGRAM = pkg.name

const DEBUG = process.env.DEBUG || process.env.NODE_DEBUG

// exports
exports.PROGRAM = PROGRAM
exports.log = log
exports.help = help
exports.debugLog = DEBUG ? log : function () {}
exports.onlyCallOnce = onlyCallOnce

// log a message with our program name
function log () {
  var message = util.format.apply(util, [].slice.call(arguments))

  console.error(`${PROGRAM}: ${message}`)
}

// ensure funciton (callback) is only called once
function onlyCallOnce (fn) {
  var called = false
  return function onlyCallOnceWrapper () {
    if (called) return
    called = true
    return fn.apply(this, [].slice.call(arguments))
  }
}

function help () {
  const helpFile = path.join(__dirname, '..', 'README.md')
  const help = fs.readFileSync(helpFile, 'utf8')
    .replace(/`/g, '')
    .replace(/\*\*/g, '')

  console.log(help)
  process.exit(0)
}
