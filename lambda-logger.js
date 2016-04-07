#!/usr/bin/env node

'use strict'

const yargs = require('yargs')

const util = require('./lib/util')

const cmdListLambdas = require('./lib/cmd-list-lambdas')
const cmdListStreams = require('./lib/cmd-list-streams')
const cmdUpdateStreams = require('./lib/cmd-update-streams')
const cmdPrintEvents = require('./lib/cmd-print-events')

exports.main = main

if (require.main === module) main()

// main entry point
function main () {
  const argv = yargs
    .alias('l', 'list')
    .alias('u', 'update')
    .alias('a', 'all')
    .alias('g', 'grouped')
    .alias('d', 'debug')
    .alias('h', 'help')
    .boolean('list')
    .boolean('update')
    .boolean('all')
    .boolean('grouped')
    .boolean('debug')
    .boolean('help')
    .argv

  if (argv.help) return util.help()

  if (argv.debug) util.debugLog = util.log

  util.debugLog('parsed args: %s', JSON.stringify(argv, null, 2))

  const lambda = argv._[0]

  if (lambda == null) {
    if (argv.list) return listLambdas()
    return util.help()
  }

  var opts = {
    all: argv.all,
    grouped: argv.grouped
  }

  if (argv.list) return listStreams(lambda)
  if (argv.update) return updateStreams(lambda, opts)

  return printEvents(lambda, opts)
}

// list log groups of lambdas
function listLambdas () {
  cmdListLambdas.run(function (err, lambdas) {
    if (err) return logError(err)

    for (let lambda of lambdas) {
      console.log(lambda)
    }
  })
}

// list log streams of a lambda
function listStreams (lambda) {
  cmdListStreams.run(lambda, function (err, streams) {
    if (err) return logError(err)

    for (let stream of streams) {
      console.log(stream)
    }
  })
}

// list log streams of a lambda
function updateStreams (lambda, opts) {
  cmdUpdateStreams.run(lambda, opts, function (err) {
    if (err) return logError(err)
  })
}

// print events
function printEvents (lambda, opts) {
  cmdPrintEvents.run(lambda, opts, function (err) {
    if (err) return logError(err)
  })
}

function logError (err) {
  util.log('error:', err)
}
